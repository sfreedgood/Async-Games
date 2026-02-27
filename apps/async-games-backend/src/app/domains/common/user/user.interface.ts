/** Shape of a User returned from the API (no sensitive fields). */
export interface User {
  id: string;
  username: string;
  email: string;
  fullName?: string;
  emailVerified: boolean;
  avatarUrl?: string;
  locale: string;
  language: string;
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
  disabled: boolean;
  meta: Record<string, unknown>;
}

/** Fields required to register a new user. */
export type CreateUserInput = {
  username: string;
  email: string;
  /** Plain-text password – will be hashed before persistence. */
  password: string;
  fullName?: string;
  locale?: string;
  language?: string;
  timezone?: string;
  meta?: Record<string, unknown>;
};

/** All fields are optional for partial updates. */
export type UpdateUserInput = {
  username?: string;
  email?: string;
  /** Plain-text password – will be hashed before persistence. */
  password?: string;
  fullName?: string;
  emailVerified?: boolean;
  avatarUrl?: string;
  locale?: string;
  language?: string;
  timezone?: string;
  disabled?: boolean;
  meta?: Record<string, unknown>;
};
