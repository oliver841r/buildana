const logger = require("../utils/logger");

const errorHandler = (err, req, res, next) => {
  logger.error(`${err.message} | ${req.method} ${req.originalUrl}`);
  const status = err.statusCode || 500;
  res.status(status).json({
    error: err.message || "Server error",
  });
};

module.exports = errorHandler;
