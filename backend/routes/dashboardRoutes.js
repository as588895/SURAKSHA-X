const express = require("express");
const Hazard = require("../models/Hazard");

const router = express.Router();

router.get("/stats", async (req, res) => {
  try {
    const totalHazards = await Hazard.countDocuments();

    const criticalHazards = await Hazard.countDocuments({
      riskLevel: "CRITICAL",
    });

    const highHazards = await Hazard.countDocuments({
      riskLevel: "HIGH",
    });

    const moderateHazards = await Hazard.countDocuments({
      riskLevel: "MODERATE",
    });

    const lowHazards = await Hazard.countDocuments({
      riskLevel: "LOW",
    });

    const populationResult = await Hazard.aggregate([
      {
        $group: {
          _id: null,
          totalPopulation: {
            $sum: "$population",
          },
        },
      },
    ]);

    const totalAffectedPopulation =
      populationResult.length > 0
        ? populationResult[0].totalPopulation
        : 0;

    res.status(200).json({
      totalHazards,
      criticalHazards,
      highHazards,
      moderateHazards,
      lowHazards,
      totalAffectedPopulation,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch dashboard statistics",
      error: error.message,
    });
  }
});

module.exports = router;