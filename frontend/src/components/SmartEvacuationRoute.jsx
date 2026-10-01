import { useMemo, useState } from "react";

const toRad = (value) => (value * Math.PI) / 180;

const distanceKm = (lat1, lon1, lat2, lon2) => {
  const earthRadius = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return Number((earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(2));
};

function SmartEvacuationRoute({ hazards = [], safeLocations = [], onOpenMap }) {
  const [selectedId, setSelectedId] = useState(hazards[0]?._id || "");
  const selected = hazards.find((item) => item._id === selectedId) || hazards[0];

  const routeOptions = useMemo(() => {
    if (!selected) return [];
    return safeLocations
      .map((location) => ({
        ...location,
        distance: distanceKm(Number(selected.latitude), Number(selected.longitude), Number(location.latitude), Number(location.longitude)),
        capacityFit: Number(location.availableCapacity || 0) >= Number(selected.population || 0),
      }))
      .sort((a, b) => {
        if (a.capacityFit !== b.capacityFit) return a.capacityFit ? -1 : 1;
        return a.distance - b.distance;
      });
  }, [selected, safeLocations]);

  const best = routeOptions[0];

  return (
    <section className="section route-section">
      <div className="section-heading">
        <div>
          <span className="section-kicker">EVACUATION NAVIGATION</span>
          <h2>🗺️ Smart Evacuation Route</h2>
          <p>Choose a safe location using distance, available capacity and incident exposure.</p>
        </div>
        <div className="route-status">ROUTE PLANNER</div>
      </div>

      {!selected ? (
        <div className="empty-state"><div>🗺️</div><h3>No incident available</h3><p>Add a hazard and safe location to calculate a route.</p></div>
      ) : (
        <>
          <div className="route-toolbar">
            <div>
              <label>Incident</label>
              <select value={selected._id} onChange={(e) => setSelectedId(e.target.value)}>
                {hazards.map((hazard) => <option key={hazard._id} value={hazard._id}>{hazard.name} · {hazard.population.toLocaleString()} people</option>)}
              </select>
            </div>
            <button className="route-map-btn" onClick={onOpenMap}>🗺️ Open Live Map</button>
          </div>

          {!best ? (
            <div className="form-error">⚠️ No safe location is available for route planning.</div>
          ) : (
            <div className="route-planner-grid">
              <div className="route-visual-card">
                <div className="route-map-mini">
                  <div className="route-grid-lines" />
                  <div className="route-point hazard-point">🚨<span>Hazard</span></div>
                  <div className="route-path-line" />
                  <div className="route-point safe-point">🏠<span>{best.name}</span></div>
                  <div className="route-distance-pill">{best.distance} km</div>
                </div>
                <small>Planning estimate using straight-line geographic distance. Final road routing should be verified on the live map.</small>
              </div>

              <div className="route-detail-card">
                <span className="route-label">RECOMMENDED SAFE LOCATION</span>
                <h3>🏠 {best.name}</h3>
                <div className="route-metrics">
                  <div><span>Distance</span><strong>{best.distance} km</strong></div>
                  <div><span>Available</span><strong>{Number(best.availableCapacity || 0).toLocaleString()}</strong></div>
                  <div><span>Required</span><strong>{Number(selected.population || 0).toLocaleString()}</strong></div>
                  <div><span>Capacity Fit</span><strong className={best.capacityFit ? "fit-good" : "fit-bad"}>{best.capacityFit ? "READY" : "SHORT"}</strong></div>
                </div>
                <div className="route-decision">
                  <b>Why this location?</b>
                  <p>{best.capacityFit ? "It can accommodate the affected population while remaining one of the closest available safe locations." : "It is the closest available option, but additional shelter capacity is required before complete relocation."}</p>
                </div>
              </div>
            </div>
          )}

          {routeOptions.length > 1 && (
            <div className="route-options">
              <div className="list-heading"><div><h3>Alternative Safe Locations</h3><p>Sorted by capacity fit and distance</p></div><span>{routeOptions.length} locations</span></div>
              {routeOptions.slice(0, 5).map((location) => (
                <div className="route-option-row" key={location._id}>
                  <strong>{location.name}</strong><span>{location.distance} km</span><span>{Number(location.availableCapacity || 0).toLocaleString()} available</span><em className={location.capacityFit ? "fit-good" : "fit-bad"}>{location.capacityFit ? "CAPACITY OK" : "CAPACITY GAP"}</em>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default SmartEvacuationRoute;
