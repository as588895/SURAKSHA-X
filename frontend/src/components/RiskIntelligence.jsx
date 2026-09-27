import { useMemo } from "react";

function RiskIntelligence({ hazards, onRelocation }) {
  const insights = useMemo(() => {
    return [...hazards]
      .map((hazard) => {
        const severity = Number(hazard.severity || 0);
        const population = Number(hazard.population || 0);
        const score = Math.round(severity * 0.65 + Math.min(population / 100, 35));
        let level = "LOW";
        if (score >= 80) level = "CRITICAL";
        else if (score >= 55) level = "HIGH";
        else if (score >= 30) level = "MODERATE";
        return { ...hazard, intelligenceScore: Math.min(score, 100), intelligenceLevel: level };
      })
      .sort((a, b) => b.intelligenceScore - a.intelligenceScore)
      .slice(0, 5);
  }, [hazards]);

  return (
    <section className="section intelligence-section">
      <div className="section-heading">
        <div>
          <span className="section-kicker">DECISION SUPPORT ENGINE</span>
          <h2>🧠 Risk Intelligence</h2>
          <p>Explainable risk signals combine severity and population exposure for response planning.</p>
        </div>
        <div className="heading-icon">🧠</div>
      </div>

      <div className="intelligence-note">
        <span>ⓘ</span>
        <p>This is a transparent decision-support score, not a medical or scientific prediction. Backend AI/ML can be connected later without changing this component.</p>
      </div>

      <div className="intelligence-list">
        {insights.length ? insights.map((hazard, index) => (
          <div className="intelligence-row" key={hazard._id}>
            <div className="intel-rank">{index + 1}</div>
            <div className="intel-main">
              <strong>{hazard.name}</strong>
              <span>{hazard.type} • Severity {hazard.severity} • {hazard.population} people</span>
            </div>
            <div className="intel-score">
              <strong>{hazard.intelligenceScore}</strong>
              <span className={`priority-badge risk-${hazard.intelligenceLevel.toLowerCase()}`}>{hazard.intelligenceLevel}</span>
            </div>
            <button className="relocation-btn" onClick={() => onRelocation(hazard)}>Plan Response</button>
          </div>
        )) : <div className="empty-state"><div>🧠</div><h3>No Risk Signals</h3><p>Add hazards to generate decision-support insights.</p></div>}
      </div>
    </section>
  );
}

export default RiskIntelligence;
