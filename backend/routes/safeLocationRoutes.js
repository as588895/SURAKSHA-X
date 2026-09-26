const express = require("express");
const SafeLocation = require("../models/SafeLocation");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const safeLocation = await SafeLocation.create(
      req.body
    );

    res.status(201).json(safeLocation);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create safe location",
      error: error.message,
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const safeLocations =
      await SafeLocation.find();

    res.status(200).json(safeLocations);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch safe locations",
      error: error.message,
    });
  }
});

module.exports = router;