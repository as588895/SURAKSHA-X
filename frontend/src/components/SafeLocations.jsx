function SafeLocations({ locations }) {
  return (
    <section className="section safe-section">
      <div className="section-heading">
        <div>
          <span className="section-kicker">EVACUATION NETWORK</span>
          <h2>🏠 Safe Relocation Locations</h2>
          <p>Available locations for emergency population relocation.</p>
        </div>
        <div className="safe-count">{locations.length} Locations</div>
      </div>

      {locations.length > 0 ? (
        <div className="card-grid">
          {locations.map((location) => (
            <div className="safe-card" key={location._id}>
              <div className="safe-card-icon">🏠</div>
              <h3>{location.name}</h3>
              <span className="safe-type">{location.type}</span>

              <div className="safe-capacity">
                <div><span>Capacity</span><strong>{location.capacity}</strong></div>
                <div><span>Available</span><strong>{location.availableCapacity}</strong></div>
              </div>

              <div className="safe-location">
                📍 {location.latitude}, {location.longitude}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div>🏠</div>
          <h3>No Safe Locations</h3>
          <p>Safe relocation locations are not available yet.</p>
        </div>
      )}
    </section>
  );
}

export default SafeLocations;
