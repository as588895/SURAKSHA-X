const express = require("express");
const Hazard = require("../models/Hazard");
const calculateRisk = require("../utils/riskCalculator");
const calculatePriority = require("../utils/riskPriority");

const router = express.Router();

// ==========================================
// VALIDATE HAZARD DATA
// ==========================================

const validateHazardData = ({
  name,
  type,
  severity,
  population,
  latitude,
  longitude,
}) => {
  if (!name || !name.trim()) {
    return "Hazard name is required";
  }

  if (!type || !type.trim()) {
    return "Hazard type is required";
  }

  const severityNumber = Number(severity);

  if (
    severity === "" ||
    severity === undefined ||
    severity === null ||
    Number.isNaN(severityNumber)
  ) {
    return "Severity is required";
  }

  if (
    severityNumber < 0 ||
    severityNumber > 100
  ) {
    return "Severity must be between 0 and 100";
  }

  const populationNumber = Number(population);

  if (
    population === "" ||
    population === undefined ||
    population === null ||
    Number.isNaN(populationNumber)
  ) {
    return "Population is required";
  }

  if (populationNumber < 0) {
    return "Population cannot be negative";
  }

  const latitudeNumber = Number(latitude);
  const longitudeNumber = Number(longitude);

  if (Number.isNaN(latitudeNumber)) {
    return "Valid latitude is required";
  }

  if (
    latitudeNumber < -90 ||
    latitudeNumber > 90
  ) {
    return "Latitude must be between -90 and 90";
  }

  if (Number.isNaN(longitudeNumber)) {
    return "Valid longitude is required";
  }

  if (
    longitudeNumber < -180 ||
    longitudeNumber > 180
  ) {
    return "Longitude must be between -180 and 180";
  }

  return null;
};

// ==========================================
// CREATE HAZARD
// ==========================================

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

    const validationError =
      validateHazardData({
        name,
        type,
        severity,
        population,
        latitude,
        longitude,
      });

    if (validationError) {
      return res.status(400).json({
        message: validationError,
      });
    }

    // ------------------------------
    // CALCULATE RISK
    // ------------------------------

    const {
      riskScore,
      riskLevel,
    } = calculateRisk({
      severity: Number(severity),
      population: Number(population),
      type,
    });

    // ------------------------------
    // CALCULATE PRIORITY
    // ------------------------------

    const {
      priorityScore,
      priorityLevel,
    } = calculatePriority({
      riskScore,
      severity: Number(severity),
      population: Number(population),
      riskLevel,
    });

    // ------------------------------
    // CREATE HAZARD
    // ------------------------------

    const hazard = await Hazard.create({
      name: name.trim(),
      type: type.trim(),
      severity: Number(severity),
      population: Number(population),
      latitude: Number(latitude),
      longitude: Number(longitude),
      riskScore,
      riskLevel,
      priorityScore,
      priorityLevel,
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

// ==========================================
// GET ALL HAZARDS
// ==========================================

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

// ==========================================
// GET EMERGENCY PRIORITY LIST
// ==========================================

router.get("/priority/emergency", async (req, res) => {
  try {
    const hazards = await Hazard.find();

    const priorityHazards = hazards
      .map((hazard) => {
        const {
          priorityScore,
          priorityLevel,
        } = calculatePriority({
          riskScore: hazard.riskScore,
          severity: hazard.severity,
          population: hazard.population,
          riskLevel: hazard.riskLevel,
        });

        return {
          ...hazard.toObject(),
          priorityScore,
          priorityLevel,
        };
      })
      .sort(
        (a, b) =>
          b.priorityScore - a.priorityScore
      );

    res.status(200).json(
      priorityHazards
    );

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message:
        "Failed to fetch emergency priority list",
      error: error.message,
    });
  }
});

// ==========================================
// RECALCULATE ALL HAZARDS
// ==========================================

router.put("/recalculate/all", async (req, res) => {
  try {
    const hazards = await Hazard.find();

    let updatedCount = 0;

    for (const hazard of hazards) {

      const {
        riskScore,
        riskLevel,
      } = calculateRisk({
        severity: hazard.severity,
        population: hazard.population,
        type: hazard.type,
      });

      const {
        priorityScore,
        priorityLevel,
      } = calculatePriority({
        riskScore,
        severity: hazard.severity,
        population: hazard.population,
        riskLevel,
      });

      await Hazard.findByIdAndUpdate(
        hazard._id,
        {
          riskScore,
          riskLevel,
          priorityScore,
          priorityLevel,
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

// ==========================================
// UPDATE HAZARD
// ==========================================

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

    const updatedName =
      req.body.name !== undefined
        ? req.body.name
        : existingHazard.name;

    const updatedLatitude =
      req.body.latitude !== undefined
        ? Number(req.body.latitude)
        : existingHazard.latitude;

    const updatedLongitude =
      req.body.longitude !== undefined
        ? Number(req.body.longitude)
        : existingHazard.longitude;

    const validationError =
      validateHazardData({
        name: updatedName,
        type: updatedType,
        severity: updatedSeverity,
        population: updatedPopulation,
        latitude: updatedLatitude,
        longitude: updatedLongitude,
      });

    if (validationError) {
      return res.status(400).json({
        message: validationError,
      });
    }

    // ------------------------------
    // RECALCULATE RISK
    // ------------------------------

    const {
      riskScore,
      riskLevel,
    } = calculateRisk({
      severity: updatedSeverity,
      population: updatedPopulation,
      type: updatedType,
    });

    // ------------------------------
    // RECALCULATE PRIORITY
    // ------------------------------

    const {
      priorityScore,
      priorityLevel,
    } = calculatePriority({
      riskScore,
      severity: updatedSeverity,
      population: updatedPopulation,
      riskLevel,
    });

    // ------------------------------
    // UPDATE
    // ------------------------------

    const updatedHazard =
      await Hazard.findByIdAndUpdate(
        req.params.id,
        {
          ...req.body,

          name: updatedName,
          type: updatedType,
          severity: updatedSeverity,
          population: updatedPopulation,
          latitude: updatedLatitude,
          longitude: updatedLongitude,

          riskScore,
          riskLevel,

          priorityScore,
          priorityLevel,
        },
        {
          new: true,
          runValidators: true,
        }
      );

    res.status(200).json(
      updatedHazard
    );

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to update hazard",
      error: error.message,
    });
  }
});

// ==========================================
// DELETE HAZARD
// ==========================================

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