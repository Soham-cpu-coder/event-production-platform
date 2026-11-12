const { z } = require("zod");
const { SESSION_TYPES } = require("../models/Session");
const { TIERS } = require("../models/Sponsor");

const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid id");
const date = z.coerce.date();

const register = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().email(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72)
    .regex(/[A-Za-z]/, "Password must contain a letter")
    .regex(/\d/, "Password must contain a number"),
});

const login = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1).max(72),
});

const stage = z.object({
  name: z.string().trim().min(1).max(80),
  capacity: z.coerce.number().int().min(0).max(1000000).optional(),
  avRequirements: z.string().trim().max(1000).optional(),
});

const eventBase = z.object({
  title: z.string().trim().min(3).max(140),
  description: z.string().trim().max(4000).optional(),
  venue: z.string().trim().min(2).max(200),
  startDate: date,
  endDate: date,
  status: z.enum(["draft", "published", "completed"]).optional(),
  stages: z.array(stage).max(20).optional(),
});

const createEvent = eventBase.refine((v) => v.endDate >= v.startDate, {
  message: "endDate must be on or after startDate",
  path: ["endDate"],
});

const updateEvent = eventBase.partial();

const listEvents = z.object({
  status: z.enum(["draft", "published", "completed"]).optional(),
  mine: z.enum(["true", "false"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

const sessionBase = z.object({
  title: z.string().trim().min(2).max(160),
  type: z.enum(SESSION_TYPES).optional(),
  stage: z.string().trim().min(1).max(80),
  startTime: date,
  endTime: date,
  speaker: z
    .object({
      name: z.string().trim().max(100).optional(),
      title: z.string().trim().max(100).optional(),
      company: z.string().trim().max(100).optional(),
      bio: z.string().trim().max(1000).optional(),
    })
    .optional(),
  avNotes: z.string().trim().max(1000).optional(),
});

const createSession = sessionBase.refine((v) => v.endTime > v.startTime, {
  message: "endTime must be after startTime",
  path: ["endTime"],
});
const updateSession = sessionBase.partial();

const sponsorBase = z.object({
  name: z.string().trim().min(1).max(120),
  tier: z.enum(TIERS).optional(),
  website: z.string().trim().url().max(300).optional().or(z.literal("")),
  contactEmail: z.string().trim().email().max(200).optional().or(z.literal("")),
  boothNumber: z.string().trim().max(20).optional(),
  deliverables: z.array(z.string().trim().min(1).max(200)).max(30).optional(),
});
const createSponsor = sponsorBase;
const updateSponsor = sponsorBase.partial();

const idParams = z.object({ id: objectId });
const eventIdParams = z.object({ eventId: objectId });
const eventChildParams = z.object({ eventId: objectId, id: objectId });

const updateRole = z.object({ role: z.enum(["attendee", "organizer", "admin"]) });

module.exports = {
  register,
  login,
  createEvent,
  updateEvent,
  listEvents,
  createSession,
  updateSession,
  createSponsor,
  updateSponsor,
  idParams,
  eventIdParams,
  eventChildParams,
  updateRole,
};
