const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const hazardRoutes = require("./routes/hazardRoutes");
const safeLocationRoutes = require("./routes/safeLocationRoutes");
const relocationRoutes = require("./routes/relocationRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/hazards", hazardRoutes);
app.use("/api/safe-locations", safeLocationRoutes);
app.use("/api/relocation", relocationRoutes);
app.use("/api/dashboard", dashboardRoutes);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB Connected");

    app.listen(5000, () => {
      console.log("Server running on port 5000");
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
  });
