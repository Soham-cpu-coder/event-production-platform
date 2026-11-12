// Safe defaults so importing the app in tests never needs a real database or secrets.
process.env.NODE_ENV = "test";
process.env.MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/event_production_test";
process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret-test-secret-test-secret";
process.env.CLIENT_ORIGIN = "http://localhost:3000, https://app.example.com/";
