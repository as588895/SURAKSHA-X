const riskClass = (level) =>
  `risk-${String(level || "unknown").toLowerCase()}`;

const riskIcon = (level) =>
  ({
    CRITICAL: "🔴",
    HIGH: "🟠",
    MODERATE: "🟡",
    LOW: "🟢",
  }[level] || "⚪");

function EmergencyAlert({
  hazard,
  prediction,
  onResponsePlan,
}) {
  if (!hazard) return null;

  const predictedRisk =
    prediction?.predictedRisk ||
    hazard.priorityLevel ||
    hazard.riskLevel ||
    "LOW";

  const predictedScore =
    prediction?.predictedScore ??
    hazard.priorityScore ??
    0;

  return (
    <section className="live-alert">

      {/* ================= ICON ================= */}

      <div className="alert-icon">
        🚨
      </div>

      {/* ================= CONTENT ================= */}

      <div className="alert-content">

        <span className="alert-label">
          LIVE EMERGENCY PRIORITY
        </span>

        <strong>
          {hazard.name}
        </strong>

        <p>
          {hazard.type} hazard requires priority
          response.
        </p>

      </div>

      {/* ================= EXISTING SCORE ================= */}

      <div className="alert-score">

        <span>
          Priority
        </span>

        <strong>
          {hazard.priorityScore ?? 0}
        </strong>

      </div>

      {/* ================= AI SCORE ================= */}

      <div className="alert-score ai-alert-score">

        <span>
          🧠 AI Risk
        </span>

        <strong>
          {predictedScore}
        </strong>

        <small
          className={`priority-badge ${riskClass(
            predictedRisk
          )}`}
        >
          {riskIcon(predictedRisk)}{" "}
          {predictedRisk}
        </small>

      </div>

      {/* ================= ACTION ================= */}

      <button
        onClick={() =>
          onResponsePlan(hazard)
        }
      >
        Response Plan →
      </button>

    </section>
  );
}

export default EmergencyAlert;

