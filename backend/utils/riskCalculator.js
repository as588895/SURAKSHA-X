const calculateRisk = ({
  severity,
  population,
  type
}) => {
  const severityScore = Math.min(
    Math.max(severity, 0),
    100
  );

  const populationScore = Math.min(
    (population / 10000) * 100,
    100
  );

  let typeScore = 50;

  if (type === "Landslide") {
    typeScore = 90;
  } else if (type === "Flood") {
    typeScore = 85;
  } else if (type === "Earthquake") {
    typeScore = 100;
  } else if (type === "Chemical") {
    typeScore = 80;
  } else if (type === "Fire") {
    typeScore = 75;
  }

  const riskScore =
    severityScore * 0.5 +
    populationScore * 0.3 +
    typeScore * 0.2;

  let riskLevel;

  if (riskScore <= 25) {
    riskLevel = "LOW";
  } else if (riskScore <= 50) {
    riskLevel = "MODERATE";
  } else if (riskScore <= 75) {
    riskLevel = "HIGH";
  } else {
    riskLevel = "CRITICAL";
  }

  return {
    riskScore: Number(riskScore.toFixed(2)),
    riskLevel
  };
};

module.exports = calculateRisk;