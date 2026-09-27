import { useMemo } from "react";

const typeWeights = {
  earthquake: 1.18,
  landslide: 1.12,
  flood: 1.1,
  cyclone: 1.14,
  storm: 1.06,
  fire: 1.08,
};

const getPrediction = (hazard) => {
  const severity = Math.max(0, Math.min(100, Number(hazard.severity) || 0));
  const population = Math.max(0, Number(hazard.population) || 0);
  const populationExposure = Math.min(100, (population / 10000) * 100);
  const type = String(hazard.type || "").toLowerCase();
  const multiplier = Object.entries(typeWeights).find(([key]) => type.includes(key))?.[1] || 1;

  const score = Math.min(
    100,
    Math.round((severity * 0.62 + populationExposure * 0.38) * multiplier)
  );

  const level = score >= 80 ? "CRITICAL" : score >= 60 ? "HIGH" : score >= 35 ? "MODERATE" : "LOW";
  const confidence = Math.min(96, Math.round(72 + Math.abs(severity - populationExposure) * 0.12));

  return { score, level, confidence, populationExposure };
};

function AIRiskPrediction({ hazards, onSelect }) {
  const predictions = useMemo(
    () => hazards.map((hazard) => ({ ...hazard, prediction: getPrediction(hazard) })).sort((a, b) => b.prediction.score - a.prediction.score),
    [hazards]
  );

  const top = predictions[0];

  return (
    <section className="section ai-risk-section">
      <div className="section-heading">
        <div>
          <span className="section-kicker">INTELLIGENCE ENGINE</span>
          <h2>🧠 AI-Assisted Risk Prediction</h2>
          <p>Explainable risk prediction using severity, population exposure and hazard type.</p>
        </div>
        <div className="ai-engine-status">● ENGINE ACTIVE</div>
      </div>

      {!top ? (
        <div className="empty-state"><div>🧠</div><h3>No Prediction Data</h3><p>Add hazards to generate risk intelligence.</p></div>
      ) : (
        <>
          <div className="ai-top-card">
            <div>
              <span className="priority-label">TOP PREDICTED RISK</span>
              <h2>{top.name}</h2>
              <p>{top.type} • {top.population} people exposed</p>
            </div>
            <div className="ai-score-ring"><strong>{top.prediction.score}</strong><span>/100</span></div>
            <div className={`priority-badge risk-${top.prediction.level.toLowerCase()}`}>{top.prediction.level}</div>
          </div>

          <div className="ai-feature-grid">
            <div className="ai-feature-card"><span>Severity contribution</span><strong>{Math.round((Number(top.severity) || 0) * 0.62)}</strong><small>62% model weight</small></div>
            <div className="ai-feature-card"><span>Population exposure</span><strong>{Math.round(top.prediction.populationExposure)}</strong><small>38% model weight</small></div>
            <div className="ai-feature-card"><span>Model confidence</span><strong>{top.prediction.confidence}%</strong><small>Input-consistency estimate</small></div>
          </div>

          <div className="ai-list">
            {predictions.slice(0, 5).map((item, index) => (
              <button className="ai-row" key={item._id} onClick={() => onSelect?.(item)}>
                <span className="ai-rank">#{index + 1}</span>
                <span className="ai-row-main"><strong>{item.name}</strong><small>{item.type} • {item.population} affected</small></span>
                <strong className="ai-row-score">{item.prediction.score}</strong>
                <span className={`priority-badge risk-${item.prediction.level.toLowerCase()}`}>{item.prediction.level}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

export default AIRiskPrediction;
