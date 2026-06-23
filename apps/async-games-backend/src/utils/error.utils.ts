import { HttpException, HttpStatus } from '@nestjs/common';

// type ValidationErrorType = Extract<HttpStatus, HttpStatus.UNPROCESSABLE_ENTITY>;

export enum ValidationErrorMessage {
  MISSING_REQUIRED_FIELD = 'Missing Required Field',
  INVALID_REFERENCE = 'Invalid Reference',
  ILLEGAL_MOVE = 'Illegal Move',
  OUT_OF_TURN = 'Out Of Turn',
  WRONG_PHASE = 'Wrong Phase',
  CARD_NOT_IN_HAND = 'Card Not In Hand',
}

export class EntityValidationError extends HttpException {
  constructor(message: ValidationErrorMessage, cause?: string) {
    super(message, HttpStatus.UNPROCESSABLE_ENTITY, {
      cause: `${message}: ${cause}`,
    });
  }
}
