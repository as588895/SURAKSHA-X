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

function HazardDatabase({
  hazards,
  totalHazards,
  loading,
  searchTerm,
  riskFilter,
  onSearch,
  onRiskFilter,
  onReset,
  onUpdate,
  onDetails,
  onRelocation,
  onDelete,
  loadingRelocation,
}) {
  return (
    <section className="section">
      <div className="section-heading">
        <div>
          <span className="section-kicker">INCIDENT DATABASE</span>
          <h2>⚠️ Active Hazard Zones</h2>
          <p>Search, filter and manage registered disaster zones.</p>
        </div>
        <div className="database-count">{hazards.length}</div>
      </div>

      <div className="hazard-filters">
        <input
          type="text"
          placeholder="🔍 Search hazard name or type..."
          value={searchTerm}
          onChange={(e) => onSearch(e.target.value)}
        />

        <select value={riskFilter} onChange={(e) => onRiskFilter(e.target.value)}>
          <option value="ALL">All Risk Levels</option>
          <option value="LOW">🟢 Low</option>
          <option value="MODERATE">🟡 Moderate</option>
          <option value="HIGH">🟠 High</option>
          <option value="CRITICAL">🔴 Critical</option>
        </select>

        <button className="reset-filter-btn" onClick={onReset}>Reset</button>
      </div>

      <div className="filter-result">
        Showing <strong>{hazards.length}</strong> of{" "}
        <strong>{totalHazards}</strong> registered hazards
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner" />
          <p>Loading disaster intelligence...</p>
        </div>
      ) : hazards.length > 0 ? (
        <div className="card-grid">
          {hazards.map((hazard) => (
            <article className={`hazard-card ${riskClass(hazard.riskLevel)}`} key={hazard._id}>
              <div className="hazard-card-top">
                <div className="hazard-icon">{hazardIcon(hazard.type)}</div>
                <span className={`risk-badge ${riskClass(hazard.riskLevel)}`}>
                  {riskIcon(hazard.riskLevel)} {hazard.riskLevel}
                </span>
              </div>

              <h3>{hazard.name}</h3>
              <span className="hazard-type">{hazard.type}</span>

              <div className="hazard-metrics">
                <div><span>Severity</span><strong>{hazard.severity}<small>/100</small></strong></div>
                <div><span>Population</span><strong>{hazard.population}</strong></div>
                <div><span>Risk Score</span><strong>{hazard.riskScore}</strong></div>
              </div>

              <div className="severity-track">
                <div style={{ width: `${Math.min(Number(hazard.severity) || 0, 100)}%` }} />
              </div>

              <div className="hazard-location">
                📍 {hazard.latitude}, {hazard.longitude}
              </div>

              <div className="priority-card-info">
                <span>Emergency Priority</span>
                <span className={`priority-badge ${riskClass(hazard.priorityLevel || hazard.riskLevel)}`}>
                  {hazard.priorityLevel || hazard.riskLevel}
                </span>
              </div>

              <div className="hazard-card-actions">
                <button className="update-btn" onClick={() => onUpdate(hazard)}>✏️ Update</button>
                <button className="details-btn" onClick={() => onDetails(hazard)}>👁 Details</button>
                <button className="relocation-btn" disabled={loadingRelocation} onClick={() => onRelocation(hazard)}>
                  🏠 Relocate
                </button>
                <button className="delete-btn" onClick={() => onDelete(hazard._id)}>🗑 Delete</button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div>🔎</div>
          <h3>No Hazards Found</h3>
          <p>Try changing the search text or risk level filter.</p>
        </div>
      )}
    </section>
  );
}

export default HazardDatabase;
