import { useMemo, useState } from "react";

const TYPE_WEIGHTS = {
  earthquake: 1.2,
  flood: 1.15,
  landslide: 1.1,
  cyclone: 1.2,
  fire: 1.05,
  storm: 1.1,
  drought: 0.95,
  heatwave: 1.05,
  tsunami: 1.25,
  avalanche: 1.15,
  chemical: 1.1,
};

const normalizeType = (type) =>
  String(type || "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");

const calculateSimulation = ({ severity, population, type, capacity }) => {
  const severityScore = Math.max(0, Math.min(Number(severity) || 0, 100));
  const populationValue = Math.max(0, Number(population) || 0);
  const populationScore = Math.min((populationValue / 10000) * 100, 100);

  const normalizedType = normalizeType(type);
  const typeMultiplier = TYPE_WEIGHTS[normalizedType] || 1;
  const typeBase = Math.min(100, 50 * typeMultiplier);

  const riskScore = Math.min(
    100,
    Math.round(severityScore * 0.5 + populationScore * 0.3 + typeBase * 0.2),
  );

  let riskLevel = "LOW";
  if (riskScore > 75) riskLevel = "CRITICAL";
  else if (riskScore > 50) riskLevel = "HIGH";
  else if (riskScore > 25) riskLevel = "MODERATE";

  const safeCapacity = Math.max(0, Number(capacity) || 0);
  const capacityGap = Math.max(0, populationValue - safeCapacity);
  const coverage = populationValue
    ? Math.min(100, Math.round((safeCapacity / populationValue) * 100))
    : 100;

  let recommendation = "Continue routine monitoring.";
  if (riskLevel === "CRITICAL") recommendation = "Immediate evacuation and response activation recommended.";
  else if (riskLevel === "HIGH") recommendation = "Prepare priority evacuation and emergency resources.";
  else if (riskLevel === "MODERATE") recommendation = "Increase monitoring and verify safe-site readiness.";

  if (capacityGap > 0) {
    recommendation += ` Additional shelter capacity required for ${capacityGap.toLocaleString()} people.`;
  }

  return {
    riskScore,
    riskLevel,
    populationValue,
    severityScore,
    populationScore: Math.round(populationScore),
    typeBase: Math.round(typeBase),
    typeMultiplier,
    safeCapacity,
    capacityGap,
    coverage,
    recommendation,
  };
};

function DisasterSimulator({ hazards = [], safeLocations = [] }) {
  const initialHazard = hazards[0];
  const [selectedId, setSelectedId] = useState(initialHazard?._id || "");
  const selected = hazards.find((item) => item._id === selectedId) || initialHazard;

  const [severity, setSeverity] = useState(Number(initialHazard?.severity) || 50);
  const [population, setPopulation] = useState(Number(initialHazard?.population) || 1000);
  const [type, setType] = useState(initialHazard?.type || "Landslide");
  const [simulated, setSimulated] = useState(false);

  const totalCapacity = useMemo(
    () => safeLocations.reduce((sum, location) => sum + Number(location.availableCapacity || 0), 0),
    [safeLocations],
  );

  const result = useMemo(
    () => calculateSimulation({ severity, population, type, capacity: totalCapacity }),
    [severity, population, type, totalCapacity],
  );

  const loadHazard = (id) => {
    const hazard = hazards.find((item) => item._id === id);
    if (!hazard) return;
    setSelectedId(id);
    setSeverity(Number(hazard.severity) || 0);
    setPopulation(Number(hazard.population) || 0);
    setType(hazard.type || "Landslide");
    setSimulated(false);
  };

  const riskClass = `risk-${result.riskLevel.toLowerCase()}`;

  return (
    <section className="section simulator-section">
      <div className="section-heading">
        <div>
          <span className="section-kicker">SCENARIO DECISION ENGINE</span>
          <h2>🧠 What-If Disaster Simulator</h2>
          <p>Change disaster conditions and preview how the emergency response changes before taking action.</p>
        </div>
        <div className="simulator-status">SCENARIO MODE</div>
      </div>

      <div className="simulator-layout">
        <div className="simulator-controls">
          <div className="scenario-select-row">
            <label>Load existing incident</label>
            <select value={selected?._id || ""} onChange={(e) => loadHazard(e.target.value)}>
              <option value="">Custom scenario</option>
              {hazards.map((hazard) => (
                <option key={hazard._id} value={hazard._id}>
                  {hazard.name} · {hazard.type}
                </option>
              ))}
            </select>
          </div>

          <div className="sim-control">
            <div className="sim-control-head">
              <label>Severity</label>
              <strong>{severity}/100</strong>
            </div>
            <input type="range" min="0" max="100" value={severity} onChange={(e) => { setSeverity(Number(e.target.value)); setSimulated(false); }} />
            <div className="range-labels"><span>LOW</span><span>CRITICAL</span></div>
          </div>

          <div className="sim-control">
            <div className="sim-control-head">
              <label>Affected population</label>
              <strong>{Number(population).toLocaleString()}</strong>
            </div>
            <input type="range" min="0" max="20000" step="100" value={population} onChange={(e) => { setPopulation(Number(e.target.value)); setSimulated(false); }} />
            <div className="range-labels"><span>0</span><span>20,000+</span></div>
          </div>

          <div className="scenario-select-row">
            <label>Hazard type</label>
            <select value={type} onChange={(e) => { setType(e.target.value); setSimulated(false); }}>
              <option>Landslide</option>
              <option>Flood</option>
              <option>Earthquake</option>
              <option>Cyclone</option>
              <option>Fire</option>
              <option>Storm</option>
              <option>Chemical</option>
              <option>Drought</option>
              <option>Heatwave</option>
              <option>Tsunami</option>
              <option>Avalanche</option>
            </select>
          </div>

          <button className="simulate-btn" onClick={() => setSimulated(true)}>
            ⚡ SIMULATE IMPACT
          </button>
        </div>

        <div className={`simulator-result ${simulated ? "simulated" : ""}`}>
          <div className="sim-result-header">
            <div>
              <span>PROJECTED RESPONSE</span>
              <h3>{simulated ? "Simulation Result" : "Live Scenario Preview"}</h3>
            </div>
            <div className={`sim-risk-score ${riskClass}`}>
              <strong>{result.riskScore}</strong>
              <small>/100</small>
            </div>
          </div>

          <div className="sim-result-grid">
            <div><span>Risk Level</span><strong className={`priority-badge ${riskClass}`}>{result.riskLevel}</strong></div>
            <div><span>Population</span><strong>{result.populationValue.toLocaleString()}</strong></div>
            <div><span>Safe Capacity</span><strong>{result.safeCapacity.toLocaleString()}</strong></div>
            <div><span>Coverage</span><strong>{result.coverage}%</strong></div>
          </div>

          <div className="sim-factors">
            <div className="sim-factor">
              <div><span>Severity contribution</span><b>{result.severityScore}%</b></div>
              <div className="factor-track"><i style={{ width: `${result.severityScore}%` }} /></div>
            </div>
            <div className="sim-factor">
              <div><span>Population exposure</span><b>{result.populationScore}%</b></div>
              <div className="factor-track"><i style={{ width: `${result.populationScore}%` }} /></div>
            </div>
            <div className="sim-factor">
              <div><span>Hazard influence</span><b>{result.typeBase}%</b></div>
              <div className="factor-track"><i style={{ width: `${result.typeBase}%` }} /></div>
            </div>
          </div>

          <div className={`sim-recommendation ${result.riskLevel.toLowerCase()}`}>
            <span>RECOMMENDED ACTION</span>
            <p>{result.recommendation}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default DisasterSimulator;
