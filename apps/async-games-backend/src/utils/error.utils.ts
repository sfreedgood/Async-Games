import { HttpException, HttpStatus } from '@nestjs/common';

// type ValidationErrorType = Extract<HttpStatus, HttpStatus.UNPROCESSABLE_ENTITY>;

export enum ValidationErrorMessage {
  MISSING_REQUIRED_FIELD = 'Missing Required Field',
  INVALID_REFERENCE = 'Invalid Reference',
}

export class EntityValidationError extends HttpException {
  constructor(message: ValidationErrorMessage, cause?: string) {
    super(message, HttpStatus.UNPROCESSABLE_ENTITY, {
      cause: `${message}: ${cause}`,
    });
  }
}

// Postgres unique_violation. Surfaced by TypeORM as a QueryFailedError whose
// underlying driver error carries this SQLSTATE code.
const PG_UNIQUE_VIOLATION = '23505';

// Detect a unique-constraint violation so a check-then-insert race (two requests
// passing the pre-check before either commits) can be mapped to a 409 instead of
// surfacing the raw driver error as a 500.
export function isUniqueViolation(error: unknown): boolean {
  const code = (error as { code?: string; driverError?: { code?: string } })
    ?.driverError?.code ?? (error as { code?: string })?.code;
  return code === PG_UNIQUE_VIOLATION;
}
