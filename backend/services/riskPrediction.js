const predictRisk = ({ severity, population, type }) => {
  const severityScore = Math.max(
    0,
    Math.min(Number(severity) || 0, 100)
  );

  const populationScore = Math.max(
    0,
    Number(population) || 0
  );

  const normalizedType = String(type || "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");

  /*
   * Population Exposure Score
   * Maximum contribution = 30
   */

  let populationFactor = 10;

  if (populationScore >= 10000) {
    populationFactor = 30;
  } else if (populationScore >= 5000) {
    populationFactor = 25;
  } else if (populationScore >= 1000) {
    populationFactor = 20;
  } else if (populationScore >= 500) {
    populationFactor = 15;
  }

  /*
   * Hazard Type Weight
   */

  const typeWeights = {
    earthquake: 1.2,
    flood: 1.15,
    landslide: 1.1,
    cyclone: 1.2,
    fire: 1.05,
    storm: 1.1,
    drought: 0.95,
    heatwave: 1.05,
    tsunami: 1.25,
    avalanche: 1.15,
    reliefcamp: 0.8,
  };

  const typeMultiplier =
    typeWeights[normalizedType] || 1;

  /*
   * Risk Score Calculation
   *
   * Severity      = 70%
   * Population    = exposure factor
   * Hazard Type   = multiplier
   */

  const severityContribution =
    severityScore * 0.7;

  const baseScore =
    severityContribution + populationFactor;

  const calculatedScore =
    baseScore * typeMultiplier;

  const predictedScore = Math.max(
    0,
    Math.min(Math.round(calculatedScore), 100)
  );

  /*
   * Risk Classification
   */

  let predictedRisk = "LOW";

  if (predictedScore >= 80) {
    predictedRisk = "CRITICAL";
  } else if (predictedScore >= 60) {
    predictedRisk = "HIGH";
  } else if (predictedScore >= 40) {
    predictedRisk = "MODERATE";
  }

  /*
   * Decision Support Message
   */

  let message =
    `Predicted risk level: ${predictedRisk}`;

  if (predictedRisk === "CRITICAL") {
    message =
      "Critical risk detected. Immediate response planning is recommended.";
  } else if (predictedRisk === "HIGH") {
    message =
      "High risk detected. Priority monitoring and response planning are recommended.";
  } else if (predictedRisk === "MODERATE") {
    message =
      "Moderate risk detected. Continuous monitoring is recommended.";
  } else {
    message =
      "Low risk detected. Continue routine monitoring.";
  }

  return {
    severity: severityScore,
    population: populationScore,
    type: type || "Unknown",
    predictedScore,
    predictedRisk,
    message,
  };
};

module.exports = {
  predictRisk,
};

