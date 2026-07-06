import { EntityValidationError } from '../../../utils/error.utils';
import { validateCreateUser, validateUpdateUser } from './user.validator';

describe('validateCreateUser', () => {
  const valid = {
    username: 'alice',
    email: 'alice@example.com',
    password: 'secret',
  };

  describe('required fields', () => {
    it('throws when username is missing', () => {
      expect(() =>
        validateCreateUser({ ...valid, username: undefined })
      ).toThrow(EntityValidationError);
    });

    it('throws when email is missing', () => {
      expect(() =>
        validateCreateUser({ ...valid, email: undefined })
      ).toThrow(EntityValidationError);
    });

    it('throws when password is missing', () => {
      expect(() =>
        validateCreateUser({ ...valid, password: undefined })
      ).toThrow(EntityValidationError);
    });

    it('includes all missing field names in the error cause', () => {
      try {
        validateCreateUser({});
      } catch (e) {
        const err = e as EntityValidationError;
        expect(String(err.cause)).toContain('username');
        expect(String(err.cause)).toContain('email');
        expect(String(err.cause)).toContain('password');
      }
    });
  });

  describe('email format', () => {
    it('throws for an invalid email address', () => {
      expect(() =>
        validateCreateUser({ ...valid, email: 'not-an-email' })
      ).toThrow(EntityValidationError);
    });

    it('accepts a valid email address', () => {
      expect(() => validateCreateUser(valid)).not.toThrow();
    });
  });

  describe('defaults', () => {
    it('applies default locale, language, timezone and meta', () => {
      const result = validateCreateUser(valid);
      expect(result.locale).toBe('en-US');
      expect(result.language).toBe('en');
      expect(result.timezone).toBe('UTC');
      expect(result.meta).toEqual({});
    });

    it('preserves provided optional values', () => {
      const result = validateCreateUser({
        ...valid,
        locale: 'fr-FR',
        language: 'fr',
        timezone: 'Europe/Paris',
        meta: { theme: 'dark' },
      });
      expect(result.locale).toBe('fr-FR');
      expect(result.language).toBe('fr');
      expect(result.timezone).toBe('Europe/Paris');
      expect(result.meta).toEqual({ theme: 'dark' });
    });
  });
});

describe('validateUpdateUser', () => {
  it('passes through valid partial data unchanged', () => {
    const input = { username: 'bob' };
    expect(validateUpdateUser(input)).toEqual(input);
  });

  it('throws for an invalid email address', () => {
    expect(() =>
      validateUpdateUser({ email: 'bad-email' })
    ).toThrow(EntityValidationError);
  });

  it('accepts a valid email address', () => {
    expect(() =>
      validateUpdateUser({ email: 'new@example.com' })
    ).not.toThrow();
  });

  it('does not require any fields', () => {
    expect(() => validateUpdateUser({})).not.toThrow();
  });
});

