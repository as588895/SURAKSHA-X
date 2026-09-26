const express = require("express");

const Hazard = require("../models/Hazard");
const SafeLocation = require("../models/SafeLocation");

const calculateDistance = require("../utils/distance");

const router = express.Router();

router.get("/:hazardId", async (req, res) => {
  try {
    const hazard = await Hazard.findById(
      req.params.hazardId
    );

    if (!hazard) {
      return res.status(404).json({
        message: "Hazard not found",
      });
    }

    const safeLocations =
      await SafeLocation.find();

    if (safeLocations.length === 0) {
      return res.status(404).json({
        message: "No safe locations available",
      });
    }

    const population =
      Number(hazard.population);

    const locationsWithDistance =
      safeLocations
        .map((location) => {
          const distance =
            calculateDistance(
              Number(hazard.latitude),
              Number(hazard.longitude),
              Number(location.latitude),
              Number(location.longitude)
            );

          return {
            id: location._id,
            name: location.name,
            type: location.type,
            latitude: location.latitude,
            longitude: location.longitude,
            capacity: Number(location.capacity),
            availableCapacity: Number(
              location.availableCapacity
            ),
            distance: Number(
              distance.toFixed(2)
            ),
          };
        })
        .filter(
          (location) =>
            location.availableCapacity > 0
        )
        .sort(
          (a, b) =>
            a.distance - b.distance
        );

    let remainingPopulation =
      population;

    const relocationPlan = [];

    for (const location of locationsWithDistance) {
      if (remainingPopulation <= 0) {
        break;
      }

      const peopleToRelocate = Math.min(
        remainingPopulation,
        location.availableCapacity
      );

      relocationPlan.push({
        locationId: location.id,
        locationName: location.name,
        type: location.type,
        distance: location.distance,
        availableCapacity:
          location.availableCapacity,
        peopleToRelocate,
      });

      remainingPopulation -=
        peopleToRelocate;
    }

    const totalRelocated =
      population - remainingPopulation;

    let recommendation;

    if (remainingPopulation === 0) {
      recommendation =
        "Complete relocation plan available";
    } else {
      recommendation =
        "Safe locations are insufficient for complete relocation";
    }

    res.status(200).json({
      hazard: {
        id: hazard._id,
        name: hazard.name,
        population,
        riskLevel: hazard.riskLevel,
      },

      totalAffectedPopulation:
        population,

      totalRelocatedPopulation:
        totalRelocated,

      remainingPopulation,

      relocationPlan,

      recommendation,
    });
  } catch (error) {
    res.status(500).json({
      message:
        "Failed to calculate relocation plan",
      error: error.message,
    });
  }
});

module.exports = router;