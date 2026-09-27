function HazardMap({ hazards, safeLocations, MapComponent }) {
  return (
    <section className="section map-section" id="hazard-map">
      <div className="section-heading">
        <div>
          <span className="section-kicker">GEOSPATIAL INTELLIGENCE</span>
          <h2>🗺️ Live Hazard Intelligence Map</h2>
          <p>Visualize active hazard zones and safe relocation locations.</p>
        </div>
        <div className="map-status">
          <span className="status-dot" /> LIVE
        </div>
      </div>

      <div className="map-wrapper">
        <MapComponent hazards={hazards} safeLocations={safeLocations} />
      </div>
    </section>
  );
}

export default HazardMap;
