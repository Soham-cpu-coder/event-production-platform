const {
  register,
  createEvent,
  createSession,
  createOnboarding,
  updateOnboardingStatus,
  listOnboarding,
} = require('./schemas');

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

  describe('createOnboarding schema', () => {
    const validOnboarding = {
      companyName: 'Acme Corp',
      contactName: 'Alice Smith',
      email: 'alice@acme.com',
      phone: '+1-555-0199',
      eventType: 'conference',
      expectedAttendees: 500,
      preferredStartDate: '2026-10-01',
      durationDays: 3,
      venueStatus: 'shortlisted',
      services: ['staging', 'audio-visual'],
      budgetRange: '100k-250k',
      notes: 'Need full production setup.',
    };

    it('should pass with valid input', () => {
      const result = createOnboarding.safeParse(validOnboarding);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('alice@acme.com');
        expect(result.data.expectedAttendees).toBe(500);
      }
    });

    it('should normalize email to lowercase and trim strings', () => {
      const result = createOnboarding.safeParse({
        ...validOnboarding,
        email: '  ALICE@ACME.COM  ',
        companyName: '  Acme Corp  ',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('alice@acme.com');
        expect(result.data.companyName).toBe('Acme Corp');
      }
    });

    it('should fail with a bad email address', () => {
      const result = createOnboarding.safeParse({
        ...validOnboarding,
        email: 'not-an-email',
      });
      expect(result.success).toBe(false);
    });

    it('should fail when expectedAttendees is less than 1 or greater than 1,000,000', () => {
      const tooLow = createOnboarding.safeParse({
        ...validOnboarding,
        expectedAttendees: 0,
      });
      expect(tooLow.success).toBe(false);

      const tooHigh = createOnboarding.safeParse({
        ...validOnboarding,
        expectedAttendees: 1000001,
      });
      expect(tooHigh.success).toBe(false);
    });

    it('should pass when honeypot is empty string or absent', () => {
      const absentHp = createOnboarding.safeParse(validOnboarding);
      expect(absentHp.success).toBe(true);

      const emptyHp = createOnboarding.safeParse({
        ...validOnboarding,
        honeypot: '',
      });
      expect(emptyHp.success).toBe(true);
    });

    it('should fail when honeypot is filled', () => {
      const filledHp = createOnboarding.safeParse({
        ...validOnboarding,
        honeypot: 'spam-bot-value',
      });
      expect(filledHp.success).toBe(false);
    });

    it('should strip unknown fields', () => {
      const withExtra = createOnboarding.safeParse({
        ...validOnboarding,
        isAdmin: true,
        extraSecretField: 'hack',
      });
      expect(withExtra.success).toBe(true);
      if (withExtra.success) {
        expect(withExtra.data.isAdmin).toBeUndefined();
        expect(withExtra.data.extraSecretField).toBeUndefined();
      }
    });
  });

  describe('updateOnboardingStatus schema', () => {
    it('should pass with valid status enum', () => {
      const result = updateOnboardingStatus.safeParse({ status: 'in-review' });
      expect(result.success).toBe(true);
    });

    it('should fail with invalid status', () => {
      const result = updateOnboardingStatus.safeParse({ status: 'unknown-status' });
      expect(result.success).toBe(false);
    });
  });

  describe('listOnboarding schema', () => {
    it('should apply defaults for page and limit', () => {
      const result = listOnboarding.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(20);
      }
    });

    it('should fail when limit exceeds 50', () => {
      const result = listOnboarding.safeParse({ limit: 100 });
      expect(result.success).toBe(false);
    });

    it('should allow valid status filter', () => {
      const result = listOnboarding.safeParse({ status: 'new' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe('new');
      }
    });
  });
});
