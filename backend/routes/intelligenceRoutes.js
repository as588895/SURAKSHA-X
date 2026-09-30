const express = require("express");

const router = express.Router();

const { predictRisk } = require("../services/riskPrediction");

router.post("/predict", (req, res) => {
  try {
    console.log("REQUEST BODY:", req.body);

    const { severity, population, type } = req.body;

    const prediction = predictRisk({
      severity,
      population,
      type,
    });

    console.log("PREDICTION:", prediction);

    res.json(prediction);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Risk prediction failed.",
    });
  }
});

module.exports = router;