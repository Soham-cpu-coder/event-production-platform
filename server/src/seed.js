// Demo data: `npm run seed` (wipes users, events, sessions and sponsors in the configured DB).
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const User = require("./models/User");
const Event = require("./models/Event");
const Session = require("./models/Session");
const Sponsor = require("./models/Sponsor");

async function seed() {
  await connectDB();
  await Promise.all([User.deleteMany({}), Event.deleteMany({}), Session.deleteMany({}), Sponsor.deleteMany({})]);

  const admin = await User.create({ name: "Admin", email: "admin@example.com", password: "Admin1234", role: "admin" });
  const organizer = await User.create({ name: "Olivia Organizer", email: "organizer@example.com", password: "Organizer1234", role: "organizer" });
  await User.create({ name: "Alex Attendee", email: "attendee@example.com", password: "Attendee1234" });

  const day1 = new Date("2027-03-18T00:00:00Z");
  const day2 = new Date("2027-03-19T00:00:00Z");
  const at = (day, h, m = 0) => new Date(day.getTime() + (h * 60 + m) * 60 * 1000);

  const event = await Event.create({
    title: "NextWave Annual Conference 2027",
    description: "Two days of keynotes, workshops and partner showcases on the future of work and technology.",
    venue: "Bombay Exhibition Centre, Mumbai",
    startDate: day1,
    endDate: day2,
    status: "published",
    organizer: organizer.id,
    stages: [
      { name: "Main Stage", capacity: 1200, avRequirements: "LED wall, 4 wireless lavs, confidence monitors, live stream feed" },
      { name: "Workshop Room A", capacity: 120, avRequirements: "Projector, 2 handheld mics" },
    ],
  });

  await Session.create([
    { event: event.id, title: "Opening Keynote", type: "keynote", stage: "Main Stage", startTime: at(day1, 4), endTime: at(day1, 5), speaker: { name: "Priya Nair", title: "CEO", company: "NextWave" } },
    { event: event.id, title: "Hands-on: Building with APIs", type: "workshop", stage: "Workshop Room A", startTime: at(day1, 5), endTime: at(day1, 7), speaker: { name: "Rahul Mehta", company: "DevCo" } },
    { event: event.id, title: "Panel: The Hybrid Workplace", type: "panel", stage: "Main Stage", startTime: at(day2, 4, 30), endTime: at(day2, 5, 30) },
  ]);

  await Sponsor.create([
    { event: event.id, name: "Acme Cloud", tier: "platinum", website: "https://example.com", boothNumber: "A1", deliverables: ["Logo on main screen", "Keynote mention", "Premium booth"] },
    { event: event.id, name: "Globex Systems", tier: "gold", boothNumber: "B4", deliverables: ["Logo on website", "Session slot"] },
  ]);

  console.log("Seeded. Logins: admin@example.com / Admin1234, organizer@example.com / Organizer1234, attendee@example.com / Attendee1234");
  await mongoose.disconnect();
  void admin;
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
