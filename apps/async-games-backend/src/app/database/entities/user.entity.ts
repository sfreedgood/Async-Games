import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { HeartEntity } from './heart.entity';

@Entity({ name: 'users' })
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  username!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ name: 'password_hash' })
  passwordHash!: string;

  @Column({ name: 'full_name', nullable: true })
  fullName?: string;

  @Column({ name: 'email_verified', default: false })
  emailVerified!: boolean;

  @Column({ name: 'avatar_url', nullable: true })
  avatarUrl?: string;

  @Column()
  locale!: string;

  @Column()
  language!: string;

  @Column()
  timezone!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @Column({ default: false })
  disabled!: boolean;

  @Column({ type: 'jsonb', default: () => "'{}'::jsonb" })
  meta!: Record<string, unknown>;

  @OneToMany(() => HeartEntity, (heart) => heart.player)
  hearts?: HeartEntity[];
}
