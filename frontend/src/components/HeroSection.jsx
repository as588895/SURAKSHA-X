function HeroSection({ onReport, onMap }) {
  return (
    <section className="hero-section">
      <div className="hero-content">
        <div className="hero-badge">⚡ REAL-TIME DISASTER COMMAND CENTER</div>

        <h2>
          Protecting Communities.
          <br />
          <span>Prioritizing Every Life.</span>
        </h2>

        <p>
          Monitor hazards, identify emergency priorities, visualize affected
          zones and generate intelligent relocation plans from one centralized
          platform.
        </p>

        <div className="hero-actions">
          <button className="hero-primary-btn" onClick={onReport}>
            ➕ Report Hazard
          </button>
          <button className="hero-secondary-btn" onClick={onMap}>
            🗺️ Open Live Map
          </button>
        </div>
      </div>

      <div className="hero-visual" aria-hidden="true">
        <div className="radar-ring radar-one" />
        <div className="radar-ring radar-two" />
        <div className="radar-ring radar-three" />
        <div className="radar-core">🛡️</div>
        <div className="radar-point point-one" />
        <div className="radar-point point-two" />
        <div className="radar-point point-three" />
      </div>
    </section>
  );
}

export default HeroSection;
