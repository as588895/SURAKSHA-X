const express = require("express");

const Hazard = require("../models/Hazard");
const SafeLocation = require("../models/SafeLocation");

const calculateDistance = require("../utils/distance");

const router = express.Router();

// =========================================================
// GET INTELLIGENT RELOCATION PLAN
// =========================================================

router.get("/:hazardId", async (req, res) => {
  try {
    // -------------------------------------------------------
    // 1. FIND HAZARD
    // -------------------------------------------------------

    const hazard =
      await Hazard.findById(
        req.params.hazardId
      );

    if (!hazard) {
      return res.status(404).json({
        message: "Hazard not found",
      });
    }

    // -------------------------------------------------------
    // 2. FIND SAFE LOCATIONS
    // -------------------------------------------------------

    const safeLocations =
      await SafeLocation.find();

    if (
      safeLocations.length === 0
    ) {
      return res.status(404).json({
        message:
          "No safe locations available",
      });
    }

    // -------------------------------------------------------
    // 3. BASIC HAZARD DATA
    // -------------------------------------------------------

    const population =
      Number(hazard.population) || 0;

    const hazardLatitude =
      Number(hazard.latitude);

    const hazardLongitude =
      Number(hazard.longitude);

    // -------------------------------------------------------
    // 4. VALIDATE COORDINATES
    // -------------------------------------------------------

    if (
      !Number.isFinite(
        hazardLatitude
      ) ||
      !Number.isFinite(
        hazardLongitude
      )
    ) {
      return res.status(400).json({
        message:
          "Hazard coordinates are missing or invalid",
      });
    }

    // -------------------------------------------------------
    // 5. CALCULATE DISTANCE
    // -------------------------------------------------------

    const locationsWithDistance =
      safeLocations
        .map((location) => {
          const latitude =
            Number(
              location.latitude
            );

          const longitude =
            Number(
              location.longitude
            );

          const capacity =
            Number(
              location.capacity
            ) || 0;

          const availableCapacity =
            Number(
              location.availableCapacity
            ) || 0;

          if (
            !Number.isFinite(
              latitude
            ) ||
            !Number.isFinite(
              longitude
            )
          ) {
            return null;
          }

          const distance =
            calculateDistance(
              hazardLatitude,
              hazardLongitude,
              latitude,
              longitude
            );

          return {
            locationId:
              location._id,

            locationName:
              location.name,

            type:
              location.type,

            latitude,
            longitude,

            capacity,
            availableCapacity,

            distance:
              Number(
                distance.toFixed(2)
              ),
          };
        })

        // Only usable locations
        .filter(
          (location) =>
            location !== null &&
            location.availableCapacity >
              0
        )

        // Nearest first
        .sort(
          (a, b) =>
            a.distance -
            b.distance
        );

    // -------------------------------------------------------
    // 6. TOTAL AVAILABLE CAPACITY
    // -------------------------------------------------------

    const totalAvailableCapacity =
      locationsWithDistance.reduce(
        (total, location) =>
          total +
          location.availableCapacity,
        0
      );

    // -------------------------------------------------------
    // 7. CREATE RELOCATION PLAN
    // -------------------------------------------------------

    let remainingPopulation =
      population;

    const relocationPlan = [];

    for (
      const location of
        locationsWithDistance
    ) {
      if (
        remainingPopulation <=
        0
      ) {
        break;
      }

      const peopleToRelocate =
        Math.min(
          remainingPopulation,
          location.availableCapacity
        );

      const remainingCapacity =
        location.availableCapacity -
        peopleToRelocate;

      relocationPlan.push({
        locationId:
          location.locationId,

        locationName:
          location.locationName,

        type:
          location.type,

        distance:
          location.distance,

        capacity:
          location.capacity,

        availableCapacity:
          location.availableCapacity,

        peopleToRelocate,

        remainingCapacity,
      });

      remainingPopulation -=
        peopleToRelocate;
    }

    // -------------------------------------------------------
    // 8. STATISTICS
    // -------------------------------------------------------

    const totalRelocatedPopulation =
      population -
      remainingPopulation;

    const additionalCapacityRequired =
      Math.max(
        population -
          totalAvailableCapacity,
        0
      );

    const relocationCoverage =
      population > 0
        ? Number(
            (
              (totalRelocatedPopulation /
                population) *
              100
            ).toFixed(2)
          )
        : 100;

    // -------------------------------------------------------
    // 9. STATUS
    // -------------------------------------------------------

    let status;
    let recommendation;

    if (
      remainingPopulation ===
      0
    ) {
      status = "COMPLETE";

      recommendation =
        "Complete relocation plan available. Current safe-location capacity is sufficient.";
    } else {
      status =
        "INSUFFICIENT_CAPACITY";

      recommendation =
        "Safe-location capacity is insufficient for complete relocation. Additional emergency shelter capacity is required.";
    }

    // -------------------------------------------------------
    // 10. RESPONSE
    // -------------------------------------------------------

    res.status(200).json({
      hazard: {
        id: hazard._id,
        name: hazard.name,
        type: hazard.type,

        population,

        severity:
          hazard.severity,

        riskScore:
          hazard.riskScore,

        riskLevel:
          hazard.riskLevel,

        priorityScore:
          hazard.priorityScore,

        priorityLevel:
          hazard.priorityLevel,
      },

      relocationSummary: {
        totalAffectedPopulation:
          population,

        totalAvailableCapacity,

        totalRelocatedPopulation,

        remainingPopulation,

        additionalCapacityRequired,

        relocationCoverage,

        status,
      },

      relocationPlan,

      recommendation,
    });

  } catch (error) {
    console.error(
      "Relocation calculation error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to calculate relocation plan",

      error: error.message,
    });
  }
});

// =========================================================
// CONFIRM RELOCATION
// =========================================================

router.post(
  "/confirm",
  async (req, res) => {
    try {
      const {
        hazardId,
        locationId,
        people,
      } = req.body;

      // -----------------------------------------------------
      // 1. VALIDATE INPUT
      // -----------------------------------------------------

      if (
        !hazardId ||
        !locationId ||
        people === undefined
      ) {
        return res.status(400).json({
          message:
            "hazardId, locationId and people are required",
        });
      }

      const peopleToRelocate =
        Number(people);

      if (
        !Number.isFinite(
          peopleToRelocate
        ) ||
        peopleToRelocate <= 0
      ) {
        return res.status(400).json({
          message:
            "People must be a valid positive number",
        });
      }

      // -----------------------------------------------------
      // 2. FIND HAZARD
      // -----------------------------------------------------

      const hazard =
        await Hazard.findById(
          hazardId
        );

      if (!hazard) {
        return res.status(404).json({
          message:
            "Hazard not found",
        });
      }

      // -----------------------------------------------------
      // 3. ATOMIC CAPACITY UPDATE
      // -----------------------------------------------------

      const location =
        await SafeLocation.findOneAndUpdate(
          {
            _id: locationId,

            availableCapacity: {
              $gte:
                peopleToRelocate,
            },
          },
          {
            $inc: {
              availableCapacity:
                -peopleToRelocate,
            },
          },
          {
            new: true,
          }
        );

      // -----------------------------------------------------
      // 4. LOCATION NOT FOUND / CAPACITY ISSUE
      // -----------------------------------------------------

      if (!location) {
        const existingLocation =
          await SafeLocation.findById(
            locationId
          );

        if (!existingLocation) {
          return res.status(404).json({
            message:
              "Safe location not found",
          });
        }

        return res.status(400).json({
          message:
            "Insufficient safe-location capacity",

          availableCapacity:
            Number(
              existingLocation.availableCapacity
            ) || 0,

          requested:
            peopleToRelocate,
        });
      }

      // -----------------------------------------------------
      // 5. SUCCESS RESPONSE
      // -----------------------------------------------------

      return res.status(200).json({
        message:
          "Relocation confirmed successfully",

        relocation: {
          hazardId:
            hazard._id,

          hazardName:
            hazard.name,

          locationId:
            location._id,

          locationName:
            location.name,

          peopleRelocated:
            peopleToRelocate,

          remainingCapacity:
            location.availableCapacity,
        },
      });

    } catch (error) {
      console.error(
        "Confirm relocation error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to confirm relocation",

        error: error.message,
      });
    }
  }
);

module.exports = router;