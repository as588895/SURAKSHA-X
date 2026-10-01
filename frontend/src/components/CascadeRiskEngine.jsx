import { useMemo, useState } from "react";

const buildCascade = (hazard, safeLocations) => {
  if (!hazard) return null;

  const type = String(hazard.type || "Hazard").toLowerCase();
  const severity = Number(hazard.severity || 0);
  const population = Number(hazard.population || 0);
  const totalCapacity = safeLocations.reduce((sum, item) => sum + Number(item.availableCapacity || 0), 0);

  let secondary = "Emergency access disruption";
  let tertiary = "Relief response delay";

  if (type.includes("landslide")) {
    secondary = "Road / mountain access blockage";
    tertiary = "Relief camp accessibility may reduce";
  } else if (type.includes("flood")) {
    secondary = "Road and low-lying area inundation";
    tertiary = "Shelter access and utilities may be disrupted";
  } else if (type.includes("earthquake")) {
    secondary = "Infrastructure and communication disruption";
    tertiary = "Medical and shelter demand may surge";
  } else if (type.includes("fire")) {
    secondary = "Smoke / evacuation corridor restriction";
    tertiary = "Emergency access capacity may reduce";
  } else if (type.includes("cyclone") || type.includes("storm")) {
    secondary = "Power, road and communication disruption";
    tertiary = "Shelter demand and response time may increase";
  }

  const capacityPressure = totalCapacity > 0 ? Math.min(100, Math.round((population / totalCapacity) * 100)) : 100;
  const cascadeScore = Math.min(100, Math.round(severity * 0.55 + capacityPressure * 0.25 + (population > 3000 ? 20 : 10)));

  let level = "LOW";
  if (cascadeScore >= 80) level = "CRITICAL";
  else if (cascadeScore >= 60) level = "HIGH";
  else if (cascadeScore >= 35) level = "MODERATE";

  return {
    secondary,
    tertiary,
    capacityPressure,
    cascadeScore,
    level,
    totalCapacity,
  };
};

function CascadeRiskEngine({ hazards = [], safeLocations = [] }) {
  const [selectedId, setSelectedId] = useState(hazards[0]?._id || "");
  const selected = hazards.find((item) => item._id === selectedId) || hazards[0];
  const result = useMemo(() => buildCascade(selected, safeLocations), [selected, safeLocations]);

  return (
    <section className="section cascade-section">
      <div className="section-heading">
        <div>
          <span className="section-kicker">SECONDARY IMPACT ANALYSIS</span>
          <h2>🌊 Cascading Risk Engine</h2>
          <p>Trace how one hazard can trigger secondary operational problems across the response system.</p>
        </div>
        <div className="cascade-status">CHAIN ANALYSIS</div>
      </div>

      {!selected || !result ? (
        <div className="empty-state"><div>🌊</div><h3>No incident available</h3><p>Add a hazard to run cascade analysis.</p></div>
      ) : (
        <>
          <div className="cascade-toolbar">
            <div>
              <span>ANALYZING INCIDENT</span>
              <strong>{selected.name}</strong>
            </div>
            <select value={selected._id} onChange={(e) => setSelectedId(e.target.value)}>
              {hazards.map((hazard) => <option key={hazard._id} value={hazard._id}>{hazard.name}</option>)}
            </select>
          </div>

          <div className="cascade-chain">
            <div className="cascade-node primary">
              <span>01</span><b>PRIMARY HAZARD</b><strong>{selected.type}</strong><small>Severity {selected.severity}/100</small>
            </div>
            <div className="cascade-arrow">→</div>
            <div className="cascade-node secondary">
              <span>02</span><b>SECONDARY IMPACT</b><strong>{result.secondary}</strong><small>Triggered by hazard conditions</small>
            </div>
            <div className="cascade-arrow">→</div>
            <div className="cascade-node tertiary">
              <span>03</span><b>RESPONSE IMPACT</b><strong>{result.tertiary}</strong><small>Requires response adjustment</small>
            </div>
          </div>

          <div className="cascade-bottom-grid">
            <div className="cascade-score-card">
              <span>CASCADE PRESSURE</span>
              <strong>{result.cascadeScore}<small>/100</small></strong>
              <em className={`priority-badge risk-${result.level.toLowerCase()}`}>{result.level}</em>
            </div>
            <div className="cascade-capacity-card">
              <div><span>Population exposed</span><strong>{Number(selected.population || 0).toLocaleString()}</strong></div>
              <div><span>Available shelter capacity</span><strong>{result.totalCapacity.toLocaleString()}</strong></div>
              <div><span>Capacity pressure</span><strong>{result.capacityPressure}%</strong></div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

export default CascadeRiskEngine;
