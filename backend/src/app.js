const express = require("express");
const cors = require("cors");
const env = require("./config/env");
const authRouter = require("./routes/auth");
const healthRouter = require("./routes/health");
const professionalsRouter = require("./routes/professionals");
const usersRouter = require("./routes/users");
const dashboardRouter = require("./routes/dashboard");
const learningRouter = require("./routes/learning");
const consultationsRouter = require("./routes/consultations");
const venuesRouter = require("./routes/venues");

const app = express();

app.disable("x-powered-by");
app.use(cors({
  origin(origin, callback) {
    if (!origin || env.clientOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(null, false);
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "X-CSRF-Token"],
  credentials: true,
}));
app.use(express.json({ limit: "10kb" }));
app.use(require("./config/session").parseCookies);

app.use("/api/v1/health", healthRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/professionals", professionalsRouter);
app.use("/api/v1/users", usersRouter);
app.use("/api/v1/dashboard", dashboardRouter);
app.use("/api/v1/learning", learningRouter);
app.use("/api/v1/consultations", consultationsRouter);
app.use("/api/v1/venues", venuesRouter);

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
