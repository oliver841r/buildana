const fs = require("fs");
const path = require("path");
const app = require("./app");
const env = require("./config/env");
const logger = require("./utils/logger");

const uploadsDir = path.resolve(__dirname, "../", env.uploadsDir);
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const server = app.listen(env.port, () => {
  logger.info(`Buildana API running on port ${env.port}`);
});

process.on("SIGTERM", () => {
  server.close(() => {
    logger.info("Server closed");
  });
});
