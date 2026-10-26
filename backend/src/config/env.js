const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const allowedNodeEnvironments = new Set(["development", "test", "production"]);

function getPort(value) {
  const port = Number(value ?? 5000);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("Invalid PORT. Set PORT to an integer between 1 and 65535.");
  }

  return port;
}

function getNodeEnv(value) {
  const nodeEnv = value ?? "development";

  if (!allowedNodeEnvironments.has(nodeEnv)) {
    throw new Error("Invalid NODE_ENV. Use development, test, or production.");
  }

  return nodeEnv;
}

function getMongoUri() {
  const mongoUri = process.env.MONGODB_URI ?? process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error(
      "Missing MongoDB configuration. Set MONGODB_URI or MONGO_URI in backend/.env.",
    );
  }

  if (!mongoUri.startsWith("mongodb://") && !mongoUri.startsWith("mongodb+srv://")) {
    throw new Error("Invalid MongoDB configuration. Use a MongoDB connection URI.");
  }

  return mongoUri;
}

function getClientOrigins(value) {
  if (!value) {
    return [];
  }

  return value.split(",").map((origin) => {
    try {
      return new URL(origin.trim()).origin;
    } catch {
      throw new Error("Invalid CLIENT_ORIGIN. Use one or more valid HTTP origins.");
    }
  });
}

function getSessionSecret(value) {
  if (typeof value !== "string" || value.length < 32) {
    throw new Error("Missing or invalid SESSION_SECRET. Set a random secret of at least 32 characters in backend/.env.");
  }

  return value;
}

const env = {
  port: getPort(process.env.PORT),
  nodeEnv: getNodeEnv(process.env.NODE_ENV),
  mongodbUri: getMongoUri(),
  clientOrigins: getClientOrigins(process.env.CLIENT_ORIGIN),
  sessionSecret: getSessionSecret(process.env.SESSION_SECRET),
};

module.exports = env;
