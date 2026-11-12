const jwt = require("jsonwebtoken");
const env = require("../config/env");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

const authenticate = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) throw new ApiError(401, "Authentication required");

  let payload;
  try {
    payload = jwt.verify(token, env.jwtSecret);
  } catch {
    throw new ApiError(401, "Invalid or expired token");
  }

  const user = await User.findById(payload.sub);
  if (!user) throw new ApiError(401, "User no longer exists");
  req.user = user;
  next();
});

// Optional auth: attaches req.user when a valid token is present, never fails.
const optionalAuth = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");
  if (scheme === "Bearer" && token) {
    try {
      const payload = jwt.verify(token, env.jwtSecret);
      req.user = await User.findById(payload.sub);
    } catch {
      req.user = undefined;
    }
  }
  next();
});

const authorize =
  (...roles) =>
  (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ApiError(403, "You do not have permission to perform this action"));
    }
    next();
  };

module.exports = { authenticate, optionalAuth, authorize };
