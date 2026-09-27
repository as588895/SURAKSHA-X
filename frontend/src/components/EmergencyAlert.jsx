function EmergencyAlert({ hazard, onResponsePlan }) {
  if (!hazard) return null;

  return (
    <section className="live-alert">
      <div className="alert-icon">🚨</div>
      <div className="alert-content">
        <span className="alert-label">LIVE EMERGENCY PRIORITY</span>
        <strong>{hazard.name}</strong>
        <p>{hazard.type} hazard requires priority response.</p>
      </div>

      <div className="alert-score">
        <span>Priority</span>
        <strong>{hazard.priorityScore}</strong>
      </div>

      <button onClick={() => onResponsePlan(hazard)}>
        Response Plan →
      </button>
    </section>
  );
}

export default EmergencyAlert;
