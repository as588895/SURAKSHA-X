import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

function Map({ hazards, safeLocations }) {
  const mapContainer = useRef(null);
  const map = useRef(null);

  const markers = useRef([]);
  const sourceIds = useRef([]);

  const getRiskColor = (riskLevel) => {
    switch (riskLevel?.toUpperCase()) {
      case "LOW":
        return "#22c55e";

      case "MODERATE":
        return "#eab308";

      case "HIGH":
        return "#f97316";

      case "CRITICAL":
        return "#ef4444";

      default:
        return "#6b7280";
    }
  };

  const getRiskRadius = (riskLevel) => {
    switch (riskLevel?.toUpperCase()) {
      case "LOW":
        return 1000;

      case "MODERATE":
        return 2000;

      case "HIGH":
        return 5000;

      case "CRITICAL":
        return 10000;

      default:
        return 1000;
    }
  };

  const createCircle = (center, radiusInKm, points = 64) => {
    const coordinates = [];

    const [longitude, latitude] = center;

    const earthRadius = 6371;

    const radius = radiusInKm / earthRadius;

    const lat1 = (latitude * Math.PI) / 180;

    const lon1 = (longitude * Math.PI) / 180;

    for (let i = 0; i <= points; i++) {
      const angle = (i / points) * 2 * Math.PI;

      const lat2 = Math.asin(
        Math.sin(lat1) * Math.cos(radius) +
          Math.cos(lat1) * Math.sin(radius) * Math.cos(angle),
      );

      const lon2 =
        lon1 +
        Math.atan2(
          Math.sin(angle) * Math.sin(radius) * Math.cos(lat1),
          Math.cos(radius) - Math.sin(lat1) * Math.sin(lat2),
        );

      coordinates.push([(lon2 * 180) / Math.PI, (lat2 * 180) / Math.PI]);
    }

    return {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [coordinates],
      },
    };
  };

  useEffect(() => {
    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [78.9629, 22.5937],
      zoom: 4.5,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");
  }, []);

  useEffect(() => {
    if (!map.current) return;

    const renderMapData = () => {
      markers.current.forEach((marker) => marker.remove());

      markers.current = [];

      sourceIds.current.forEach((sourceId) => {
        if (map.current.getLayer(`${sourceId}-fill`)) {
          map.current.removeLayer(`${sourceId}-fill`);
        }

        if (map.current.getLayer(`${sourceId}-border`)) {
          map.current.removeLayer(`${sourceId}-border`);
        }

        if (map.current.getSource(sourceId)) {
          map.current.removeSource(sourceId);
        }
      });

      sourceIds.current = [];

      /* -------------------------
         HAZARDS
      ------------------------- */

      hazards.forEach((hazard, index) => {
        if (hazard.latitude === undefined || hazard.longitude === undefined) {
          return;
        }

        const latitude = Number(hazard.latitude);

        const longitude = Number(hazard.longitude);

        const riskLevel = hazard.riskLevel?.toUpperCase();

        const color = getRiskColor(riskLevel);

        const radiusMeters = getRiskRadius(riskLevel);

        const radiusKm = radiusMeters / 1000;

        const markerElement = document.createElement("div");

        markerElement.style.width = "22px";

        markerElement.style.height = "22px";

        markerElement.style.borderRadius = "50%";

        markerElement.style.backgroundColor = color;

        markerElement.style.border = "3px solid white";

        markerElement.style.boxShadow = `0 0 12px ${color}`;

        const popup = new mapboxgl.Popup({
          offset: 25,
        }).setHTML(`
              <div>
                <h3>${hazard.name}</h3>

                <p>
                  Type: ${hazard.type}
                </p>

                <p>
                  Severity:
                  ${hazard.severity}
                </p>

                <p>
                  Population:
                  ${hazard.population}
                </p>

                <p>
                  Risk Score:
                  ${hazard.riskScore}
                </p>

                <p>
                  Risk Level:
                  ${riskLevel}
                </p>

                <p>
                  Risk Zone:
                  ${radiusKm} km
                </p>
              </div>
            `);

        const marker = new mapboxgl.Marker({
          element: markerElement,
        })
          .setLngLat([longitude, latitude])
          .setPopup(popup)
          .addTo(map.current);

        markers.current.push(marker);

        const sourceId = `risk-zone-${index}`;

        const circle = createCircle([longitude, latitude], radiusKm);

        map.current.addSource(sourceId, {
          type: "geojson",
          data: circle,
        });

        map.current.addLayer({
          id: `${sourceId}-fill`,
          type: "fill",
          source: sourceId,
          paint: {
            "fill-color": color,
            "fill-opacity": 0.18,
          },
        });

        map.current.addLayer({
          id: `${sourceId}-border`,
          type: "line",
          source: sourceId,
          paint: {
            "line-color": color,
            "line-width": 2,
          },
        });

        sourceIds.current.push(sourceId);
      });

      /* -------------------------
         SAFE LOCATIONS
      ------------------------- */

      safeLocations.forEach((location) => {
        const latitude = Number(location.latitude);

        const longitude = Number(location.longitude);

        const safeMarker = document.createElement("div");

        safeMarker.innerHTML = "🏠";

        safeMarker.style.fontSize = "28px";

        safeMarker.style.cursor = "pointer";

        const popup = new mapboxgl.Popup({
          offset: 25,
        }).setHTML(`
              <div>
                <h3>
                  ${location.name}
                </h3>

                <p>
                  <strong>Type:</strong>
                  ${location.type}
                </p>

                <p>
                  <strong>Capacity:</strong>
                  ${location.capacity}
                </p>

                <p>
                  <strong>
                    Available Capacity:
                  </strong>
                  ${location.availableCapacity}
                </p>
              </div>
            `);

        const marker = new mapboxgl.Marker({
          element: safeMarker,
        })
          .setLngLat([longitude, latitude])
          .setPopup(popup)
          .addTo(map.current);

        markers.current.push(marker);
      });
    };

    if (map.current.loaded()) {
      renderMapData();
    } else {
      map.current.once("load", renderMapData);
    }
  }, [hazards, safeLocations]);

  return (
    <div>
      <div
        ref={mapContainer}
        style={{
          width: "100%",
          height: "min(500px, 70vh)",
          minHeight: "350px",
        }}
      />

      <div
        style={{
          display: "flex",
          gap: "20px",
          marginTop: "15px",
          flexWrap: "wrap",
        }}
      >
        <span>🟢 LOW</span>

        <span>🟡 MODERATE</span>

        <span>🟠 HIGH</span>

        <span>🔴 CRITICAL</span>

        <span>🏠 SAFE LOCATION</span>
      </div>
    </div>
  );
}

export default Map;
