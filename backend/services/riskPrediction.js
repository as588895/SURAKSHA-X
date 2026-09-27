const predictRisk = ({ severity, population, type }) => {
  const severityScore = Number(severity) || 0;
  const populationScore = Number(population) || 0;

  let populationFactor = 0;

  if (populationScore >= 10000) {
    populationFactor = 30;
  } else if (populationScore >= 5000) {
    populationFactor = 25;
  } else if (populationScore >= 1000) {
    populationFactor = 20;
  } else if (populationScore >= 500) {
    populationFactor = 15;
  } else {
    populationFactor = 10;
  }

  const typeWeights = {
    earthquake: 1.2,
    flood: 1.15,
    landslide: 1.1,
    cyclone: 1.2,
    fire: 1.05,
    storm: 1.1,
  };

  const typeKey = String(type || "").toLowerCase();

  const typeMultiplier = typeWeights[typeKey] || 1;

  const baseScore =
    severityScore * 0.7 +
    populationFactor;

  const predictedScore = Math.min(
    Math.round(baseScore * typeMultiplier),
    100
  );

  let predictedRisk = "LOW";

  if (predictedScore >= 80) {
    predictedRisk = "CRITICAL";
  } else if (predictedScore >= 60) {
    predictedRisk = "HIGH";
  } else if (predictedScore >= 40) {
    predictedRisk = "MODERATE";
  }

  return {
    severity: severityScore,
    population: populationScore,
    type,
    predictedScore,
    predictedRisk,
    message: `Predicted risk level: ${predictedRisk}`,
  };
};

module.exports = {
  predictRisk,
};