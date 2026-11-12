const Session = require("../models/Session");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { getManagedEvent } = require("./eventController");

// A stage can only run one session at a time.
async function assertNoStageConflict({ eventId, stage, startTime, endTime, ignoreId }) {
  const filter = { event: eventId, stage, startTime: { $lt: endTime }, endTime: { $gt: startTime } };
  if (ignoreId) filter._id = { $ne: ignoreId };
  const clash = await Session.findOne(filter);
  if (clash) {
    throw new ApiError(409, `Stage "${stage}" is already booked for "${clash.title}" during that time`);
  }
}

function assertWithinEvent(event, startTime, endTime) {
  // Allow the full last day of the event.
  const eventEnd = new Date(event.endDate.getTime() + 24 * 60 * 60 * 1000);
  if (startTime < event.startDate || endTime > eventEnd) {
    throw new ApiError(400, "Session must fall within the event dates");
  }
}

exports.list = asyncHandler(async (req, res) => {
  const sessions = await Session.find({ event: req.params.eventId }).sort({ startTime: 1 });
  res.json({ success: true, items: sessions });
});

exports.create = asyncHandler(async (req, res) => {
  const event = await getManagedEvent(req.params.eventId, req.user);
  const { stage, startTime, endTime } = req.body;
  assertWithinEvent(event, startTime, endTime);
  await assertNoStageConflict({ eventId: event.id, stage, startTime, endTime });

  const session = await Session.create({ ...req.body, event: event.id });
  res.status(201).json({ success: true, session });
});

exports.update = asyncHandler(async (req, res) => {
  const event = await getManagedEvent(req.params.eventId, req.user);
  const session = await Session.findOne({ _id: req.params.id, event: event.id });
  if (!session) throw new ApiError(404, "Session not found");

  session.set(req.body);
  if (session.endTime <= session.startTime) throw new ApiError(400, "endTime must be after startTime");
  assertWithinEvent(event, session.startTime, session.endTime);
  await assertNoStageConflict({
    eventId: event.id,
    stage: session.stage,
    startTime: session.startTime,
    endTime: session.endTime,
    ignoreId: session.id,
  });

  await session.save();
  res.json({ success: true, session });
});

exports.remove = asyncHandler(async (req, res) => {
  const event = await getManagedEvent(req.params.eventId, req.user);
  const session = await Session.findOneAndDelete({ _id: req.params.id, event: event.id });
  if (!session) throw new ApiError(404, "Session not found");
  res.json({ success: true, message: "Session deleted" });
});
