const express = require("express");

const router = express.Router();

const { predictRisk } = require("../services/riskPrediction");

router.post("/predict", (req, res) => {
  try {
    const { severity, population, type } = req.body;

    const prediction = predictRisk({
      severity,
      population,
      type,
    });

    res.json(prediction);
  } catch (error) {
    console.error("Risk prediction error:", error);

    res.status(500).json({
      message: "Risk prediction failed.",
    });
  }
});

module.exports = router;