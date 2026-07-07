import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
  IsObject,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

/** DTO used when creating a new user (client -> server) */
export class CreateUserDTO {
  @IsString()
  @MinLength(3)
  @MaxLength(32)
  @Matches(/^[a-zA-Z0-9_]+$/)
  @ApiProperty({ example: 'alice', description: 'Unique username' })
  username!: string;

  @IsEmail()
  @ApiProperty({ example: 'alice@example.com', description: 'User email' })
  email!: string;

  // TODO: Review password security requirements in more detail (e.g., breached-password checks,
  // configurable complexity rules, rate-limiting on auth endpoints).
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  })
  @ApiProperty({ example: 'S3cr3tPass', description: 'Plain-text password' })
  password!: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'Alice Doe', description: 'Full name' })
  fullName?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'en-US', description: 'Locale' })
  locale?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'en', description: 'Language' })
  language?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    example: 'America/Los_Angeles',
    description: 'Timezone',
  })
  timezone?: string;

  @IsOptional()
  @IsObject()
  @ApiPropertyOptional({
    example: {},
    description: 'Arbitrary metadata/preferences',
  })
  meta?: Record<string, unknown>;
}

/** DTO used when updating an existing user (partial) */
export class UpdateUserDTO {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'alice', description: 'Unique username' })
  username?: string;

  @IsOptional()
  @IsEmail()
  @ApiPropertyOptional({
    example: 'alice@example.com',
    description: 'User email',
  })
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  })
  @ApiPropertyOptional({
    example: 'S3cr3tPass',
    description: 'Plain-text password (will be hashed)',
  })
  password?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'Alice Doe', description: 'Full name' })
  fullName?: string;

  // NOTE: emailVerified and disabled are intentionally NOT accepted here. They
  // are privileged, server-controlled fields; exposing them on the update DTO
  // would let any caller self-verify their email or re-enable a disabled
  // account via PUT /user/:id (mass-assignment). With the global ValidationPipe
  // (forbidNonWhitelisted), sending them now yields a 400.

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'https://...', description: 'Avatar URL' })
  avatarUrl?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'en-US', description: 'Locale' })
  locale?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'en', description: 'Language' })
  language?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    example: 'America/Los_Angeles',
    description: 'Timezone',
  })
  timezone?: string;

  @IsOptional()
  @IsObject()
  @ApiPropertyOptional({
    example: {},
    description: 'Arbitrary metadata/preferences',
  })
  meta?: Record<string, unknown>;
}

/** DTO returned by the API representing a user */
export class UserResponseDTO {
  @IsUUID()
  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  id!: string;

  @IsString()
  @ApiProperty({ example: 'alice' })
  username!: string;

  @IsEmail()
  @ApiProperty({ example: 'alice@example.com' })
  email!: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'Alice Doe' })
  fullName?: string;

  @IsBoolean()
  @ApiProperty({ example: false })
  emailVerified!: boolean;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'https://...', description: 'Avatar URL' })
  avatarUrl?: string;

  @IsString()
  @ApiProperty({ example: 'en-US' })
  locale!: string;

  @IsString()
  @ApiProperty({ example: 'en' })
  language!: string;

  @IsString()
  @ApiProperty({ example: 'America/Los_Angeles' })
  timezone!: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  @IsBoolean()
  @ApiProperty({ example: false })
  disabled!: boolean;

  @IsObject()
  @ApiPropertyOptional({
    example: {},
    description: 'Arbitrary metadata/preferences',
  })
  meta!: Record<string, unknown>;
}
