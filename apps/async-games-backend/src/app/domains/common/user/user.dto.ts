import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
  IsObject,
} from 'class-validator';

/** DTO used when creating a new user (client -> server) */
export class CreateUserDTO {
  @IsString()
  @ApiProperty({ example: 'alice', description: 'Unique username' })
  username!: string;

  @IsEmail()
  @ApiProperty({ example: 'alice@example.com', description: 'User email' })
  email!: string;

  @IsString()
  @ApiProperty({ example: 's3cr3t', description: 'Plain-text password' })
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
  @ApiPropertyOptional({ example: 'America/Los_Angeles', description: 'Timezone' })
  timezone?: string;

  @IsOptional()
  @IsObject()
  @ApiPropertyOptional({ example: {}, description: 'Arbitrary metadata/preferences' })
  meta?: Record<string, unknown>;
}

/** DTO used when updating an existing user (partial) */
export class UpdateUserDTO {
  @IsOptional()
  @IsUUID()
  @ApiPropertyOptional({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6', description: 'User id (inferred from URL param)' })
  id?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'alice', description: 'Unique username' })
  username?: string;

  @IsOptional()
  @IsEmail()
  @ApiPropertyOptional({ example: 'alice@example.com', description: 'User email' })
  email?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 's3cr3t', description: 'Plain-text password (will be hashed)' })
  password?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'Alice Doe', description: 'Full name' })
  fullName?: string;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({ example: false, description: 'Email verified flag' })
  emailVerified?: boolean;

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
  @ApiPropertyOptional({ example: 'America/Los_Angeles', description: 'Timezone' })
  timezone?: string;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({ example: false, description: 'Disabled / soft-delete flag' })
  disabled?: boolean;

  @IsOptional()
  @IsObject()
  @ApiPropertyOptional({ example: {}, description: 'Arbitrary metadata/preferences' })
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
  @ApiPropertyOptional({ example: {}, description: 'Arbitrary metadata/preferences' })
  meta!: Record<string, unknown>;
}
