const { register, createEvent, createSession } = require('./schemas');

describe('Validation Schema Unit Tests', () => {
  describe('register schema', () => {
    it('should fail when required fields are missing or invalid', () => {
      const result = register.safeParse({
        name: 'A',
        email: 'not-an-email',
        password: 'short',
      });
      expect(result.success).toBe(false);
    });

    it('should pass when valid user registration details are provided', () => {
      const result = register.safeParse({
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'Password123',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('createEvent schema', () => {
    it('should fail if endDate is earlier than startDate', () => {
      const result = createEvent.safeParse({
        title: 'Tech Conference 2026',
        venue: 'Mumbai Convention Center',
        startDate: '2026-09-20',
        endDate: '2026-09-15',
      });
      expect(result.success).toBe(false);
    });

    it('should pass when proper event parameters are provided', () => {
      const result = createEvent.safeParse({
        title: 'Tech Conference 2026',
        venue: 'Mumbai Convention Center',
        startDate: '2026-09-15',
        endDate: '2026-09-17',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('createSession schema', () => {
    it('should fail if endTime is not after startTime', () => {
      const result = createSession.safeParse({
        title: 'Opening Keynote',
        stage: 'Main Stage',
        startTime: '2026-09-15T10:00:00Z',
        endTime: '2026-09-15T09:00:00Z',
      });
      expect(result.success).toBe(false);
    });
  });
});
