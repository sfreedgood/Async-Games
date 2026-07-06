import {
  EntityValidationError,
  ValidationErrorMessage,
} from '../../../utils/error.utils';
import type { CreateUserInput, UpdateUserInput } from './user.interface';

const REQUIRED_CREATE_FIELDS: Array<keyof CreateUserInput> = [
  'username',
  'email',
  'password',
];

// Email FORMAT is validated at the controller boundary by the DTO's @IsEmail
// decorator (Layer 1 -> 400). This entity validator (Layer 2) only enforces
// business rules the DTO can't express, so it does not re-check email shape.

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
  return input;
};
