// ==========================================
// RISK PRIORITY ENGINE
// ==========================================

const calculatePriority = ({
  riskScore,
  severity,
  population,
  riskLevel,
}) => {
  const score = Number(riskScore) || 0;
  const severityValue = Number(severity) || 0;
  const populationValue = Number(population) || 0;

  // Population contribution is capped
  // so extremely large populations
  // don't completely dominate the score.
  const populationFactor = Math.min(
    populationValue / 10000,
    1
  ) * 20;

  const severityFactor =
    (severityValue / 100) * 20;

  const riskFactor =
    (score / 100) * 60;

  const priorityScore =
    riskFactor +
    severityFactor +
    populationFactor;

  let priorityLevel = "LOW";

  if (
    priorityScore >= 75 ||
    riskLevel === "CRITICAL"
  ) {
    priorityLevel = "CRITICAL";
  } else if (
    priorityScore >= 55 ||
    riskLevel === "HIGH"
  ) {
    priorityLevel = "HIGH";
  } else if (
    priorityScore >= 30 ||
    riskLevel === "MODERATE"
  ) {
    priorityLevel = "MODERATE";
  }

  return {
    priorityScore: Number(
      priorityScore.toFixed(2)
    ),
    priorityLevel,
  };
};

module.exports = calculatePriority;