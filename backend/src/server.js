async function startServer() {
  let env;
  let app;
  let database;

  try {
    env = require("./config/env");
    database = require("./config/database");
    app = require("./app");
    await database.connectToDatabase();
  } catch (error) {
    const isConfigurationError = [
      "Invalid PORT",
      "Invalid NODE_ENV",
      "Missing MongoDB configuration",
      "Invalid MongoDB configuration",
      "Invalid CLIENT_ORIGIN",
      "Missing or invalid SESSION_SECRET",
    ].some((prefix) => error.message.startsWith(prefix));

    console.error(
      isConfigurationError
        ? `Configuration error: ${error.message}`
        : "Database connection failed. The API was not started.",
    );
    process.exitCode = 1;
    return null;
  }

  const server = app.listen(env.port, () => {
    console.log(
      `Lumina API is running at http://localhost:${env.port} (${env.nodeEnv})`,
    );
  });

  const shutdown = async (signal) => {
    console.log(`${signal} received. Shutting down Lumina API.`);

    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
    await database.disconnectFromDatabase();
    process.exit(0);
  };

  process.once("SIGINT", () => shutdown("SIGINT"));
  process.once("SIGTERM", () => shutdown("SIGTERM"));

  return server;
}

if (require.main === module) {
  startServer();
}

module.exports = { startServer };
