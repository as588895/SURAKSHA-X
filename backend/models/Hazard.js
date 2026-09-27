const mongoose = require("mongoose");

const hazardSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      required: true,
      trim: true,
    },

    severity: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },

    population: {
      type: Number,
      required: true,
      min: 0,
    },

    latitude: {
      type: Number,
      required: true,
      min: -90,
      max: 90,
    },

    longitude: {
      type: Number,
      required: true,
      min: -180,
      max: 180,
    },

    riskScore: {
      type: Number,
      default: 0,
    },

    riskLevel: {
      type: String,
      enum: [
        "LOW",
        "MODERATE",
        "HIGH",
        "CRITICAL",
      ],
      default: "LOW",
    },

    // ==================================
    // EMERGENCY PRIORITY
    // ==================================

    priorityScore: {
      type: Number,
      default: 0,
    },

    priorityLevel: {
      type: String,
      enum: [
        "LOW",
        "MODERATE",
        "HIGH",
        "CRITICAL",
      ],
      default: "LOW",
    },
  },

  {
    timestamps: true,
  }
);

module.exports =
  mongoose.model(
    "Hazard",
    hazardSchema
  );