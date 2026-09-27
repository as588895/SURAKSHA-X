const riskClass = (level) => `risk-${String(level || "unknown").toLowerCase()}`;

const riskIcon = (level) =>
  ({
    CRITICAL: "🔴",
    HIGH: "🟠",
    MODERATE: "🟡",
    LOW: "🟢",
  }[level] || "⚪");

const hazardIcon = (type) => {
  const value = type?.toLowerCase() || "";
  if (value.includes("landslide")) return "⛰️";
  if (value.includes("flood")) return "🌊";
  if (value.includes("earthquake")) return "🌋";
  if (value.includes("fire")) return "🔥";
  if (value.includes("cyclone")) return "🌀";
  if (value.includes("storm")) return "⛈️";
  return "⚠️";
};

function PriorityCenter({
  hazards,
  highestPriorityHazard,
  criticalPriorityCount,
  highPriorityCount,
  emergencyPopulation,
  onRelocation,
}) {
  return (
    <section className="section emergency-section">
      <div className="section-heading">
        <div>
          <span className="section-kicker">RESPONSE INTELLIGENCE</span>
          <h2>🚨 Emergency Priority Center</h2>
          <p>Automated prioritization based on risk, severity and population.</p>
        </div>
        <div className="heading-icon emergency-icon">🎯</div>
      </div>

      <div className="priority-summary">
        <div className="priority-stat priority-critical-stat">
          <span>Critical Priority</span>
          <strong>{criticalPriorityCount}</strong>
        </div>
        <div className="priority-stat priority-high-stat">
          <span>High Priority</span>
          <strong>{highPriorityCount}</strong>
        </div>
        <div className="priority-stat priority-population-stat">
          <span>Emergency Population</span>
          <strong>{emergencyPopulation}</strong>
        </div>
      </div>

      {highestPriorityHazard ? (
        <div className="top-priority-card">
          <div className="top-priority-main">
            <span className="priority-label">🚨 TOP PRIORITY INCIDENT</span>
            <h2>
              {hazardIcon(highestPriorityHazard.type)}{" "}
              {highestPriorityHazard.name}
            </h2>
            <div className="priority-meta">
              <span>Type: <strong>{highestPriorityHazard.type}</strong></span>
              <span>Population: <strong>{highestPriorityHazard.population}</strong></span>
              <span>Severity: <strong>{highestPriorityHazard.severity}/100</strong></span>
            </div>
          </div>

          <div className="priority-score-box">
            <span>Priority Score</span>
            <strong>{highestPriorityHazard.priorityScore}</strong>
            <span className={`priority-badge ${riskClass(highestPriorityHazard.priorityLevel)}`}>
              {riskIcon(highestPriorityHazard.priorityLevel)}{" "}
              {highestPriorityHazard.priorityLevel}
            </span>
          </div>
        </div>
      ) : (
        <div className="empty-state">
          <div>🛰️</div>
          <h3>No Emergency Data</h3>
          <p>Add a hazard to generate emergency priority information.</p>
        </div>
      )}

      {hazards.length > 0 && (
        <div className="priority-list">
          <div className="list-heading">
            <div>
              <h3>Emergency Priority Queue</h3>
              <p>Highest-risk incidents requiring attention</p>
            </div>
            <span>{hazards.length} incidents</span>
          </div>

          {hazards.slice(0, 5).map((hazard, index) => (
            <div className="priority-row" key={hazard._id}>
              <div className="priority-rank">#{index + 1}</div>
              <div className="priority-info">
                <strong>{hazardIcon(hazard.type)} {hazard.name}</strong>
                <span>{hazard.type} • {hazard.population} people affected</span>
              </div>
              <div className="priority-score">
                <strong>{hazard.priorityScore}</strong>
                <span className={`priority-badge ${riskClass(hazard.priorityLevel)}`}>
                  {hazard.priorityLevel}
                </span>
              </div>
              <button className="mini-action" onClick={() => onRelocation(hazard)}>
                Plan
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default PriorityCenter;
