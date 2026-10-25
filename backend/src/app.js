const express = require("express");
const cors = require("cors");
const env = require("./config/env");
const authRouter = require("./routes/auth");
const healthRouter = require("./routes/health");

const app = express();

app.disable("x-powered-by");
app.use(cors({
  origin(origin, callback) {
    if (!origin || env.clientOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(null, false);
  },
  methods: ["GET", "POST"],
}));
app.use(express.json({ limit: "10kb" }));

app.use("/api/v1/health", healthRouter);
app.use("/api/v1/auth", authRouter);

app.use("/api", (req, res) => {
  res.status(404).json({
    error: {
      code: "NOT_FOUND",
      message: `API route not found: ${req.method} ${req.originalUrl}`,
    },
  });
});

app.use((error, _req, res, _next) => {
  if (error.type === "entity.parse.failed") {
    return res.status(400).json({
      error: {
        code: "INVALID_JSON",
        message: "Request body must be valid JSON.",
      },
    });
  }

  console.error(`Unexpected API error: ${error.name || "Error"}`);

  return res.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred.",
    },
  });
});

module.exports = app;
