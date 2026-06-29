import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ActiveGameEntity } from './active-game.entity';
import { UserEntity } from './user.entity';

@Entity({ name: 'hearts' })
export class HeartEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => ActiveGameEntity, (game) => game.hearts, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'game_id' })
  game!: ActiveGameEntity;

  @ManyToOne(() => UserEntity, (user) => user.hearts, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'player' })
  player!: UserEntity;

  @Column({ name: 'hand_number', type: 'int' })
  handNumber!: number;

  @Column({ name: 'player_hand', type: 'jsonb', default: () => "'[]'::jsonb" })
  playerHand!: unknown[];

  @Column({ type: 'int' })
  trick!: number;

  @Column({ type: 'boolean', default: false })
  initiative!: boolean;

  @Column({ name: 'card_suit', nullable: true })
  cardSuit?: string;

  @Column({ name: 'card_name', nullable: true })
  cardName?: string;

  @Column({ name: 'points_taken', type: 'int', default: 0 })
  pointsTaken!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
