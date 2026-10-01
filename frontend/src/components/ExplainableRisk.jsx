import { useMemo, useState } from "react";

const typeScore = (type) => {
  const normalized = String(type || "").toLowerCase().replace(/[\s_-]+/g, "");
  const values = {
    earthquake: 100,
    landslide: 90,
    flood: 85,
    chemical: 80,
    fire: 75,
  };
  return values[normalized] || 50;
};

function ExplainableRisk({ hazards = [], predictions = [] }) {
  const [selectedId, setSelectedId] = useState(hazards[0]?._id || "");
  const selected = hazards.find((item) => item._id === selectedId) || hazards[0];

  const explanation = useMemo(() => {
    if (!selected) return null;
    const severity = Number(selected.severity || 0);
    const population = Number(selected.population || 0);
    const populationScore = Math.min((population / 10000) * 100, 100);
    const hazardTypeScore = typeScore(selected.type);
    const calculated = Number((severity * 0.5 + populationScore * 0.3 + hazardTypeScore * 0.2).toFixed(2));
    const prediction = predictions.find((item) => item._id === selected._id)?.prediction;

    return {
      severity,
      population,
      populationScore: Math.round(populationScore),
      hazardTypeScore,
      calculated,
      backendScore: Number(prediction?.predictedScore ?? selected.riskScore ?? calculated),
      level: prediction?.predictedRisk || selected.riskLevel || "LOW",
    };
  }, [selected, predictions]);

  return (
    <section className="section explainable-section">
      <div className="section-heading">
        <div>
          <span className="section-kicker">TRANSPARENT DECISION SUPPORT</span>
          <h2>🤖 Explainable Risk Score</h2>
          <p>See the main factors behind a hazard score instead of treating the number as a black box.</p>
        </div>
        <div className="explainable-status">WHY THIS SCORE?</div>
      </div>

      {!selected || !explanation ? (
        <div className="empty-state"><div>🤖</div><h3>No risk signal available</h3><p>Add a hazard to explain its score.</p></div>
      ) : (
        <div className="explainable-layout">
          <div className="explainable-main">
            <div className="explainable-selector">
              <label>Select incident</label>
              <select value={selected._id} onChange={(e) => setSelectedId(e.target.value)}>
                {hazards.map((hazard) => <option key={hazard._id} value={hazard._id}>{hazard.name}</option>)}
              </select>
            </div>

            <div className="explainable-score-card">
              <div>
                <span>CALCULATED RISK</span>
                <strong>{explanation.backendScore}<small>/100</small></strong>
              </div>
              <em className={`priority-badge risk-${String(explanation.level).toLowerCase()}`}>{explanation.level}</em>
            </div>

            <div className="explanation-factors">
              <div className="explanation-factor">
                <div className="explanation-factor-top"><span>Severity</span><b>{explanation.severity}/100 · 50% weight</b></div>
                <div className="factor-track"><i style={{ width: `${explanation.severity}%` }} /></div>
                <small>Higher severity directly increases the emergency risk contribution.</small>
              </div>
              <div className="explanation-factor">
                <div className="explanation-factor-top"><span>Population Exposure</span><b>{explanation.population.toLocaleString()} people · 30% weight</b></div>
                <div className="factor-track"><i style={{ width: `${explanation.populationScore}%` }} /></div>
                <small>Population is normalized against the project exposure scale.</small>
              </div>
              <div className="explanation-factor">
                <div className="explanation-factor-top"><span>Hazard Type Influence</span><b>{explanation.hazardTypeScore}/100 · 20% weight</b></div>
                <div className="factor-track"><i style={{ width: `${explanation.hazardTypeScore}%` }} /></div>
                <small>Different hazard types carry different baseline risk influence.</small>
              </div>
            </div>
          </div>

          <div className="explainable-summary">
            <div className="explain-icon">🧠</div>
            <span>PLAIN-LANGUAGE EXPLANATION</span>
            <h3>{selected.name} is classified as {explanation.level}.</h3>
            <p>
              The score is mainly influenced by <strong>{explanation.severity}% severity</strong>, exposure of <strong>{explanation.population.toLocaleString()} people</strong>, and the baseline risk of a <strong>{selected.type}</strong> incident.
            </p>
            <div className="explain-formula">
              <span>Decision support model</span>
              <b>Severity × 50% + Population × 30% + Type × 20%</b>
            </div>
            <small>Scores are decision-support estimates and should be validated against real emergency information.</small>
          </div>
        </div>
      )}
    </section>
  );
}

export default ExplainableRisk;
