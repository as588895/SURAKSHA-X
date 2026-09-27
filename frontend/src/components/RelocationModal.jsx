function RelocationModal({ data, onClose }) {
  if (!data) return null;

  return (
    <div className="modal-overlay relocation-overlay">
      <div className="relocation-modal">
        <div className="modal-header">
          <div>
            <span className="section-kicker">EVACUATION INTELLIGENCE</span>
            <h2>🚨 Smart Relocation Plan</h2>
            <p>
              Recommended safe-location allocation based on distance and
              available capacity.
            </p>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="summary-grid">
          <div className="summary-card">
            <span>Affected Population</span>
            <strong>{data.totalAffectedPopulation}</strong>
          </div>
          <div className="summary-card">
            <span>Total Relocated</span>
            <strong>{data.totalRelocatedPopulation}</strong>
          </div>
          <div className="summary-card">
            <span>Remaining</span>
            <strong>{data.remainingPopulation}</strong>
          </div>
        </div>

        <div className="hazard-summary">
          <h3>🚨 Target Hazard</h3>
          <p><strong>Name:</strong> {data.hazard.name}</p>
          <p><strong>Risk:</strong> {data.hazard.riskLevel}</p>
        </div>

        <h3 className="plan-heading">Safe Location Allocation</h3>

        <div className="relocation-plan">
          {data.relocationPlan?.length ? (
            data.relocationPlan.map((location, index) => (
              <div className="relocation-card" key={location.locationId || index}>
                <div className="location-number">{index + 1}</div>
                <div className="location-info">
                  <h3>🏠 {location.locationName}</h3>
                  <p><strong>Type:</strong> {location.type}</p>
                  <p><strong>Distance:</strong> {location.distance} km</p>
                  <p><strong>Available Capacity:</strong> {location.availableCapacity}</p>
                  <p className="assigned">
                    <strong>People Assigned:</strong> {location.peopleToRelocate}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state compact">
              <div>⚠️</div>
              <h3>No allocation generated</h3>
              <p>No safe-location allocation is currently available.</p>
            </div>
          )}
        </div>

        <div className={`recommendation ${data.remainingPopulation === 0 ? "success" : "warning"}`}>
          <h3>
            {data.remainingPopulation === 0
              ? "✅ Relocation Capacity Available"
              : "⚠️ Additional Capacity Required"}
          </h3>
          <p>{data.recommendation}</p>
        </div>
      </div>
    </div>
  );
}

export default RelocationModal;
