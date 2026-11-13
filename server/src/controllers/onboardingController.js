const OnboardingRequest = require("../models/OnboardingRequest");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

exports.create = asyncHandler(async (req, res) => {
  // Silent success if honeypot is filled
  if (req.body && req.body.honeypot) {
    return res.status(201).json({
      success: true,
      message: "Onboarding request submitted successfully",
    });
  }

  const { honeypot, ...data } = req.body;
  await OnboardingRequest.create(data);

  res.status(201).json({
    success: true,
    message: "Onboarding request submitted successfully",
  });
});

exports.list = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const filter = status ? { status } : {};
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    OnboardingRequest.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    OnboardingRequest.countDocuments(filter),
  ]);

  res.json({
    success: true,
    items,
    page,
    limit,
    total,
    pages: Math.ceil(total / limit) || 1,
  });
});

exports.updateStatus = asyncHandler(async (req, res) => {
  const item = await OnboardingRequest.findById(req.params.id);
  if (!item) throw new ApiError(404, "Onboarding request not found");
  item.status = req.body.status;
  await item.save();
  res.json({ success: true, request: item });
});
