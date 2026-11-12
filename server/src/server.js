// Long-running entry point for local development and traditional hosting.
// On Vercel the app is served through api/index.js instead.
const env = require("./config/env");
const connectDB = require("./config/db");
const app = require("./app");

async function start() {
  await connectDB();
  app.listen(env.port, () => console.log(`API listening on http://localhost:${env.port}`));
}

start().catch((err) => {
  console.error("Failed to start server:", err.message);
  process.exit(1);
});
