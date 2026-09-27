import { useMemo, useState } from "react";

const multipliers = {
  earthquake: 1.35,
  landslide: 1.15,
  flood: 1.25,
  cyclone: 1.5,
  storm: 1.25,
  fire: 0.85,
};

const calculateRadius = (hazard) => {
  if (!hazard) return 0;
  const severity = Math.max(0, Math.min(100, Number(hazard.severity) || 0));
  const population = Math.max(0, Number(hazard.population) || 0);
  const type = String(hazard.type || "").toLowerCase();
  const multiplier = Object.entries(multipliers).find(([key]) => type.includes(key))?.[1] || 1;
  return Math.min(25, Math.max(1, Number(((severity * 0.12 + Math.sqrt(population) * 0.035) * multiplier).toFixed(1))));
};

function DynamicHazardRadius({ hazards }) {
  const [selectedId, setSelectedId] = useState(hazards[0]?._id || "");
  const selected = hazards.find((hazard) => hazard._id === selectedId) || hazards[0];
  const radius = useMemo(() => calculateRadius(selected), [selected]);

  const zones = useMemo(
    () => hazards.map((hazard) => ({ ...hazard, radius: calculateRadius(hazard) })).sort((a, b) => b.radius - a.radius),
    [hazards]
  );

  return (
    <section className="section radius-section">
      <div className="section-heading">
        <div>
          <span className="section-kicker">GEOSPATIAL RISK MODEL</span>
          <h2>📍 Dynamic Hazard Radius</h2>
          <p>Estimated impact radius adapts to severity, exposed population and hazard type.</p>
        </div>
        <div className="radius-status">AUTO CALCULATED</div>
      </div>

      {!selected ? (
        <div className="empty-state"><div>📍</div><h3>No Hazard Zone</h3><p>Add a hazard to calculate an estimated impact radius.</p></div>
      ) : (
        <div className="radius-layout">
          <div className="radius-visual-wrap">
            <div className="radius-visual" style={{ "--radius-size": `${Math.min(86, 32 + radius * 2)}%` }}>
              <div className="radius-ring radius-ring-1" />
              <div className="radius-ring radius-ring-2" />
              <div className="radius-ring radius-ring-3" />
              <div className="radius-core">🚨</div>
            </div>
            <div className="radius-readout"><strong>{radius} km</strong><span>estimated impact radius</span></div>
          </div>

          <div className="radius-controls">
            <label>Select incident</label>
            <select value={selected?._id || ""} onChange={(e) => setSelectedId(e.target.value)}>
              {hazards.map((hazard) => <option key={hazard._id} value={hazard._id}>{hazard.name}</option>)}
            </select>
            <div className="radius-metrics">
              <div><span>Severity</span><strong>{selected.severity}/100</strong></div>
              <div><span>Population</span><strong>{selected.population}</strong></div>
              <div><span>Latitude</span><strong>{selected.latitude}</strong></div>
              <div><span>Longitude</span><strong>{selected.longitude}</strong></div>
            </div>
            <div className="radius-note">This is a decision-support estimate. The map layer can use the same radius value for a Mapbox circle overlay.</div>
          </div>
        </div>
      )}

      {zones.length > 0 && (
        <div className="radius-table">
          <div className="list-heading"><div><h3>Impact Zone Estimates</h3><p>Largest estimated zones first</p></div><span>{zones.length} zones</span></div>
          {zones.slice(0, 6).map((zone) => (
            <div className="radius-row" key={zone._id}>
              <strong>{zone.name}</strong><span>{zone.type}</span><b>{zone.radius} km</b>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default DynamicHazardRadius;
