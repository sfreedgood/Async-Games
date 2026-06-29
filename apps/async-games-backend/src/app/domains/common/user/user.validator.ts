import {
  EntityValidationError,
  ValidationErrorMessage,
} from '../../../../utils/error.utils';
import type { CreateUserInput, UpdateUserInput } from './user.interface';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const REQUIRED_CREATE_FIELDS: Array<keyof CreateUserInput> = [
  'username',
  'email',
  'password',
];

/**
 * Validates input for creating a new user.
 * Throws EntityValidationError on invalid data.
 * Returns a normalised CreateUserInput with defaults applied.
 */
export const validateCreateUser = (
  input: Partial<CreateUserInput>
): CreateUserInput => {
  const missing = REQUIRED_CREATE_FIELDS.filter((f) => !input[f]);

  if (missing.length) {
    throw new EntityValidationError(
      ValidationErrorMessage.MISSING_REQUIRED_FIELD,
      missing.join(', ')
    );
  }

  if (!EMAIL_REGEX.test(input.email!)) {
    throw new EntityValidationError(
      ValidationErrorMessage.INVALID_REFERENCE,
      `'email' must be a valid email address`
    );
  }

  return {
    username: input.username!,
    email: input.email!,
    password: input.password!,
    fullName: input.fullName,
    locale: input.locale ?? 'en-US',
    language: input.language ?? 'en',
    timezone: input.timezone ?? 'UTC',
    meta: input.meta ?? {},
  };
};

/**
 * Validates input for updating an existing user.
 * Throws EntityValidationError on invalid data.
 */
export const validateUpdateUser = (
  input: Partial<UpdateUserInput>
): Partial<UpdateUserInput> => {
  if (input.email !== undefined && !EMAIL_REGEX.test(input.email)) {
    throw new EntityValidationError(
      ValidationErrorMessage.INVALID_REFERENCE,
      `'email' must be a valid email address`
    );
  }

  return input;
};
