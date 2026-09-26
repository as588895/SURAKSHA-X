const express = require("express");
const Hazard = require("../models/Hazard");
const calculateRisk = require("../utils/riskCalculator");

const router = express.Router();


// ===============================
// CREATE HAZARD
// ===============================

router.post("/", async (req, res) => {
  try {
    const {
      name,
      type,
      severity,
      population,
      latitude,
      longitude,
    } = req.body;

    const { riskScore, riskLevel } =
      calculateRisk({
        severity: Number(severity),
        population: Number(population),
        type,
      });

    const hazard = await Hazard.create({
      name,
      type,
      severity: Number(severity),
      population: Number(population),
      latitude: Number(latitude),
      longitude: Number(longitude),
      riskScore,
      riskLevel,
    });

    res.status(201).json(hazard);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to create hazard",
      error: error.message,
    });
  }
});


// ===============================
// GET ALL HAZARDS
// ===============================

router.get("/", async (req, res) => {
  try {
    const hazards = await Hazard.find();

    res.status(200).json(hazards);

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch hazards",
      error: error.message,
    });
  }
});


// ===============================
// RECALCULATE ALL HAZARDS
// ===============================

router.put("/recalculate/all", async (req, res) => {
  try {
    const hazards = await Hazard.find();

    let updatedCount = 0;

    for (const hazard of hazards) {

      const { riskScore, riskLevel } =
        calculateRisk({
          severity: hazard.severity,
          population: hazard.population,
          type: hazard.type,
        });

      await Hazard.findByIdAndUpdate(
        hazard._id,
        {
          riskScore,
          riskLevel,
        },
        {
          new: true,
        }
      );

      updatedCount++;
    }

    res.status(200).json({
      message:
        "All hazards recalculated successfully",
      updatedCount,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message:
        "Failed to recalculate hazards",
      error: error.message,
    });
  }
});


// ===============================
// UPDATE HAZARD
// ===============================

router.put("/:id", async (req, res) => {
  try {
    const existingHazard =
      await Hazard.findById(req.params.id);

    if (!existingHazard) {
      return res.status(404).json({
        message: "Hazard not found",
      });
    }

    const updatedSeverity =
      req.body.severity !== undefined
        ? Number(req.body.severity)
        : existingHazard.severity;

    const updatedPopulation =
      req.body.population !== undefined
        ? Number(req.body.population)
        : existingHazard.population;

    const updatedType =
      req.body.type !== undefined
        ? req.body.type
        : existingHazard.type;

    const {
      riskScore,
      riskLevel,
    } = calculateRisk({
      severity: updatedSeverity,
      population: updatedPopulation,
      type: updatedType,
    });

    const updatedHazard =
      await Hazard.findByIdAndUpdate(
        req.params.id,
        {
          ...req.body,
          severity: updatedSeverity,
          population: updatedPopulation,
          type: updatedType,
          riskScore,
          riskLevel,
        },
        {
          new: true,
          runValidators: true,
        }
      );

    res.status(200).json(updatedHazard);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to update hazard",
      error: error.message,
    });
  }
});


// ===============================
// DELETE HAZARD
// ===============================

router.delete("/:id", async (req, res) => {
  try {
    const hazard =
      await Hazard.findByIdAndDelete(
        req.params.id
      );

    if (!hazard) {
      return res.status(404).json({
        message: "Hazard not found",
      });
    }

    res.status(200).json({
      message:
        "Hazard deleted successfully",
    });

  } catch (error) {
    res.status(500).json({
      message:
        "Failed to delete hazard",
      error: error.message,
    });
  }
});


module.exports = router;