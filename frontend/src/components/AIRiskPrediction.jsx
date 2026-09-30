function AIRiskPrediction({
predictions = [],
loading = false,
error = "",
onSelect,
}) {
const validPredictions = [...predictions]
.filter(
(item) =>
item?.prediction &&
typeof item.prediction.predictedScore === "number"
)
.sort(
(a, b) =>
b.prediction.predictedScore -
a.prediction.predictedScore
);

const top = validPredictions[0] || null;

const getRiskClass = (risk) => {
return `priority-badge risk-${String(
      risk || "LOW"
    ).toLowerCase()}`;
};

return ( <section className="section ai-risk-section">

```
  {/* ================= HEADER ================= */}

  <div className="section-heading">

    <div>

      <span className="section-kicker">
        INTELLIGENCE ENGINE
      </span>

      <h2>
        🧠 AI-Assisted Risk Prediction
      </h2>

      <p>
        Backend-powered risk prediction using
        severity, population exposure and hazard type.
      </p>

    </div>

    <div className="ai-engine-status">
      <span>●</span> ENGINE ACTIVE
    </div>

  </div>

  {/* ================= LOADING ================= */}

  {loading && (
    <div className="loading-state">

      <div className="loading-spinner"></div>

      <p>
        AI risk intelligence is analyzing active
        hazard zones...
      </p>

    </div>
  )}

  {/* ================= ERROR ================= */}

  {!loading && error && (
    <div className="form-error">
      ⚠️ {error}
    </div>
  )}

  {/* ================= EMPTY ================= */}

  {!loading && !error && !top && (
    <div className="empty-state">

      <div>🧠</div>

      <h3>
        No Prediction Data
      </h3>

      <p>
        Add hazards to generate risk intelligence.
      </p>

    </div>
  )}

  {/* ================= TOP PREDICTION ================= */}

  {!loading && !error && top && (
    <>

      <div className="ai-top-card">

        {/* HAZARD INFO */}

        <div className="ai-top-info">

          <span className="priority-label">
            TOP PREDICTED RISK
          </span>

          <h2>
            {top.name ||
              "Unknown Hazard"}
          </h2>

          <p>
            {top.type ||
              "Unknown Type"}{" "}
            •{" "}
            {Number(
              top.population ||
                top.prediction.population ||
                0
            ).toLocaleString("en-IN")}{" "}
            people exposed
          </p>

        </div>

        {/* SCORE */}

        <div className="ai-score-ring">

          <strong>
            {Number(
              top.prediction.predictedScore
            ).toFixed(0)}
          </strong>

          <span>
            /100
          </span>

        </div>

        {/* RISK */}

        <div
          className={getRiskClass(
            top.prediction.predictedRisk
          )}
        >
          {top.prediction.predictedRisk ||
            "LOW"}
        </div>

      </div>

      {/* ================= FEATURE GRID ================= */}

      <div className="ai-feature-grid">

        <div className="ai-feature-card">

          <span>
            Severity Input
          </span>

          <strong>
            {top.prediction.severity ?? 0}
          </strong>

          <small>
            Source hazard severity
          </small>

        </div>

        <div className="ai-feature-card">

          <span>
            Population Exposure
          </span>

          <strong>
            {Number(
              top.prediction.population ??
                top.population ??
                0
            ).toLocaleString("en-IN")}
          </strong>

          <small>
            People under monitoring
          </small>

        </div>

        <div className="ai-feature-card">

          <span>
            Prediction Status
          </span>

          <strong>
            ACTIVE
          </strong>

          <small>
            Backend intelligence engine
          </small>

        </div>

      </div>

      {/* ================= PREDICTION LIST ================= */}

      <div className="ai-list">

        {validPredictions
          .slice(0, 5)
          .map((item, index) => {

            const prediction =
              item.prediction;

            return (
              <button
                type="button"
                className="ai-row"
                key={item._id}
                onClick={() =>
                  onSelect?.(item)
                }
              >

                {/* RANK */}

                <span className="ai-rank">
                  #{index + 1}
                </span>

                {/* HAZARD */}

                <span className="ai-row-main">

                  <strong>
                    {item.name ||
                      "Unknown Hazard"}
                  </strong>

                  <small>
                    {item.type ||
                      "Unknown Type"}{" "}
                    •{" "}
                    {Number(
                      item.population ||
                        0
                    ).toLocaleString(
                      "en-IN"
                    )}{" "}
                    affected
                  </small>

                </span>

                {/* SCORE */}

                <strong className="ai-row-score">
                  {Number(
                    prediction.predictedScore
                  ).toFixed(0)}
                </strong>

                {/* RISK */}

                <span
                  className={getRiskClass(
                    prediction.predictedRisk
                  )}
                >
                  {prediction.predictedRisk ||
                    "LOW"}
                </span>

              </button>
            );
          })}

      </div>

    </>
  )}

</section>


);
}

export default AIRiskPrediction;
