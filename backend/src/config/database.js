const mongoose = require("mongoose");
const env = require("./env");

async function connectToDatabase() {
  await mongoose.connect(env.mongodbUri, {
    serverSelectionTimeoutMS: 10_000,
  });
}

function isDatabaseConnected() {
  return mongoose.connection.readyState === 1;
}

async function disconnectFromDatabase() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}

module.exports = {
  connectToDatabase,
  disconnectFromDatabase,
  isDatabaseConnected,
};
