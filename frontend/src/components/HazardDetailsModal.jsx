const riskClass = (level) => `risk-${String(level || "unknown").toLowerCase()}`;
const riskIcon = (level) => ({ CRITICAL: "🔴", HIGH: "🟠", MODERATE: "🟡", LOW: "🟢" }[level] || "⚪");

function HazardDetailsModal({ hazard, onClose, onRelocation }) {
  if (!hazard) return null;

  const items = [
    ["Hazard Name", hazard.name],
    ["Hazard Type", hazard.type],
    ["Severity", `${hazard.severity}/100`],
    ["Affected Population", hazard.population],
    ["Risk Score", hazard.riskScore],
    ["Risk Level", hazard.riskLevel],
    ["Priority Score", hazard.priorityScore ?? hazard.riskScore],
    ["Emergency Priority", hazard.priorityLevel || hazard.riskLevel],
    ["Latitude", hazard.latitude],
    ["Longitude", hazard.longitude],
  ];

  return (
    <div className="modal-overlay">
      <div className="hazard-modal">
        <div className="modal-header">
          <div>
            <span className="section-kicker">INCIDENT INTELLIGENCE</span>
            <h2>🚨 Hazard Details</h2>
            <p>Complete intelligence profile of this hazard.</p>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-content">
          {items.map(([label, value]) => {
            const isRisk = ["Risk Level", "Emergency Priority"].includes(label);
            return (
              <div className="detail-item" key={label}>
                <span>{label}</span>
                <strong className={isRisk ? `risk-text ${riskClass(value)}` : ""}>
                  {isRisk ? `${riskIcon(value)} ${value}` : value}
                </strong>
              </div>
            );
          })}
        </div>

        <div className="modal-footer">
          <button className="close-btn" onClick={onClose}>Close</button>
          <button
            className="relocation-btn"
            onClick={() => {
              onClose();
              onRelocation(hazard);
            }}
          >
            🏠 Find Safe Location
          </button>
        </div>
      </div>
    </div>
  );
}

export default HazardDetailsModal;
