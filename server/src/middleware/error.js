const mongoose = require("mongoose");
const ApiError = require("../utils/ApiError");
const env = require("../config/env");

function notFound(req, _res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, _req, res, _next) {
  let status = err.status || 500;
  let message = err.message || "Internal server error";
  let details = err.details;

  if (err instanceof mongoose.Error.ValidationError) {
    status = 400;
    message = "Validation failed";
    details = Object.values(err.errors).map((e) => ({ path: e.path, message: e.message }));
  } else if (err instanceof mongoose.Error.CastError) {
    status = 400;
    message = `Invalid ${err.path}`;
  } else if (err.code === 11000) {
    status = 409;
    message = "A record with these details already exists";
  }

  if (status >= 500) {
    console.error(err);
    // Hide internals in production, but keep messages we wrote ourselves (ApiError).
    if (env.nodeEnv === "production" && !(err instanceof ApiError)) message = "Internal server error";
  }

  res.status(status).json({ success: false, message, ...(details ? { details } : {}) });
}

module.exports = { notFound, errorHandler };
