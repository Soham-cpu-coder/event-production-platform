const mongoose = require("mongoose");
const env = require("./env");

// The connection is cached on `global` so that warm serverless invocations (Vercel) and
// hot-reloads reuse it instead of opening a new connection per request.
const cache = global.__mongoose || (global.__mongoose = { promise: null });

async function connectDB() {
  // 1 = connected
  if (mongoose.connection.readyState === 1) return mongoose;

  if (!cache.promise) {
    mongoose.set("strictQuery", true);
    cache.promise = mongoose
      .connect(env.mongoUri, {
        bufferCommands: false, // fail fast instead of hanging when the DB is unreachable
        serverSelectionTimeoutMS: 5000,
        maxPoolSize: 10,
      })
      .then((m) => {
        console.log(`MongoDB connected: ${m.connection.host}`);
        return m;
      })
      .catch((err) => {
        cache.promise = null; // allow a retry on the next request
        throw err;
      });
  }

  await cache.promise;
  return mongoose;
}

module.exports = connectDB;
