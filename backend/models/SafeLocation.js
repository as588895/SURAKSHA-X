const mongoose = require("mongoose");

const safeLocationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
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

    capacity: {
      type: Number,
      required: true,
    },

    availableCapacity: {
      type: Number,
      required: true,
    },

    type: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "SafeLocation",
  safeLocationSchema
);