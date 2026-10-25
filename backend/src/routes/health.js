const express = require("express");
const env = require("../config/env");
const { isDatabaseConnected } = require("../config/database");

const router = express.Router();

router.get("/", (_req, res) => {
  const databaseConnected = isDatabaseConnected();

  res.status(databaseConnected ? 200 : 503).json({
    status: databaseConnected ? "ok" : "unavailable",
    message: databaseConnected
      ? "Lumina API is running"
      : "Lumina API database is unavailable",
    environment: env.nodeEnv,
    database: {
      status: databaseConnected ? "connected" : "disconnected",
    },
  });
});

module.exports = router;
