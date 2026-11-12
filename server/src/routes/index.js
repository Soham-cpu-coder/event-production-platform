const express = require("express");
const rateLimit = require("express-rate-limit");

const { authenticate, optionalAuth, authorize } = require("../middleware/auth");
const validate = require("../middleware/validate");
const s = require("../validators/schemas");

const auth = require("../controllers/authController");
const events = require("../controllers/eventController");
const sessions = require("../controllers/sessionController");
const sponsors = require("../controllers/sponsorController");

const router = express.Router();
const manager = [authenticate, authorize("organizer", "admin")];

// Stricter limit on credential endpoints to slow brute-force attempts.
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: true, legacyHeaders: false });

router.get("/health", (_req, res) => res.json({ success: true, status: "ok" }));

// Auth & users
router.post("/auth/register", authLimiter, validate(s.register), auth.register);
router.post("/auth/login", authLimiter, validate(s.login), auth.login);
router.get("/auth/me", authenticate, auth.me);
router.patch(
  "/users/:id/role",
  authenticate,
  authorize("admin"),
  validate(s.idParams, "params"),
  validate(s.updateRole),
  auth.updateRole
);

// Events
router.get("/events", optionalAuth, validate(s.listEvents, "query"), events.list);
router.get("/events/:id", optionalAuth, validate(s.idParams, "params"), events.get);
router.post("/events", manager, validate(s.createEvent), events.create);
router.patch("/events/:id", manager, validate(s.idParams, "params"), validate(s.updateEvent), events.update);
router.delete("/events/:id", manager, validate(s.idParams, "params"), events.remove);

// Sessions (schedule) — nested under an event
router.get("/events/:eventId/sessions", validate(s.eventIdParams, "params"), sessions.list);
router.post("/events/:eventId/sessions", manager, validate(s.eventIdParams, "params"), validate(s.createSession), sessions.create);
router.patch("/events/:eventId/sessions/:id", manager, validate(s.eventChildParams, "params"), validate(s.updateSession), sessions.update);
router.delete("/events/:eventId/sessions/:id", manager, validate(s.eventChildParams, "params"), sessions.remove);

// Sponsors — nested under an event
router.get("/events/:eventId/sponsors", validate(s.eventIdParams, "params"), sponsors.list);
router.post("/events/:eventId/sponsors", manager, validate(s.eventIdParams, "params"), validate(s.createSponsor), sponsors.create);
router.patch("/events/:eventId/sponsors/:id", manager, validate(s.eventChildParams, "params"), validate(s.updateSponsor), sponsors.update);
router.delete("/events/:eventId/sponsors/:id", manager, validate(s.eventChildParams, "params"), sponsors.remove);

module.exports = router;
