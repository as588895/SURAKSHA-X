const mongoose = require("mongoose");

const hazardSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      required: true,
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
    },

    riskLevel: {
      type: String,
      required: true,
    },

    riskScore: {
      type: Number,
      required: true,
    },
    
    latitude: {
      type: Number,
      required: true,
    },

    longitude: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Hazard", hazardSchema);
