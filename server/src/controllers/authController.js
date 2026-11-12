const jwt = require("jsonwebtoken");
const env = require("../config/env");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

const signToken = (user) => jwt.sign({ sub: user.id, role: user.role }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (await User.exists({ email })) throw new ApiError(409, "Email is already registered");

  // Role is never taken from the request: new accounts are attendees.
  const user = await User.create({ name, email, password });
  res.status(201).json({ success: true, token: signToken(user), user });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");
  // Same message for both failure cases to avoid leaking which emails exist.
  if (!user || !(await user.comparePassword(password))) throw new ApiError(401, "Invalid email or password");
  res.json({ success: true, token: signToken(user), user });
});

exports.me = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user });
});

exports.updateRole = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true, runValidators: true });
  if (!user) throw new ApiError(404, "User not found");
  res.json({ success: true, user });
});
