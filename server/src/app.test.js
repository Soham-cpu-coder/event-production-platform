const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("./app");
const validate = require("./middleware/validate");
const { authorize } = require("./middleware/auth");
const { register } = require("./validators/schemas");

describe("App (no database required)", () => {
  it("serves a service banner at /", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("returns a JSON 404 for unknown routes outside /api", async () => {
    const res = await request(app).get("/does-not-exist");
    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({ success: false });
  });

  it("sets security headers (helmet)", async () => {
    const res = await request(app).get("/");
    expect(res.headers["x-content-type-options"]).toBe("nosniff");
  });

  it("allows configured origins (whitespace and trailing slash tolerated)", async () => {
    for (const origin of ["http://localhost:3000", "https://app.example.com"]) {
      const res = await request(app).options("/").set("Origin", origin).set("Access-Control-Request-Method", "GET");
      expect(res.headers["access-control-allow-origin"]).toBe(origin);
    }
  });

  it("does not allow other origins", async () => {
    const res = await request(app).options("/").set("Origin", "http://evil.example").set("Access-Control-Request-Method", "GET");
    expect(res.headers["access-control-allow-origin"]).toBeUndefined();
  });

  it("rejects malformed JSON bodies with a 400, not a crash", async () => {
    const res = await request(app).post("/").set("Content-Type", "application/json").send("{bad json");
    expect(res.status).toBe(400);
  });
});

describe("middleware", () => {
  it("validate() passes parsed data on and reports field errors", () => {
    const next = jest.fn();
    const req = { body: { name: "Jane Doe", email: "JANE@Example.com", password: "Password123", role: "admin" } };
    validate(register)(req, {}, next);
    expect(next).toHaveBeenCalledWith();
    expect(req.body.email).toBe("jane@example.com"); // normalised
    expect(req.body.role).toBeUndefined(); // unknown fields (e.g. role) are stripped

    const bad = jest.fn();
    validate(register)({ body: { name: "J" } }, {}, bad);
    expect(bad.mock.calls[0][0].status).toBe(400);
  });

  it("authorize() blocks users without the role", () => {
    const next = jest.fn();
    authorize("admin")({ user: { role: "attendee" } }, {}, next);
    expect(next.mock.calls[0][0].status).toBe(403);

    const ok = jest.fn();
    authorize("organizer", "admin")({ user: { role: "organizer" } }, {}, ok);
    expect(ok).toHaveBeenCalledWith();
  });

  it("JWTs signed with another secret are rejected", () => {
    const forged = jwt.sign({ sub: "x" }, "wrong-secret");
    expect(() => jwt.verify(forged, process.env.JWT_SECRET)).toThrow();
  });
});
