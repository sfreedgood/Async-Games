import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { CARDS_TO_PASS } from './hearts.interface';

export class CardRefDTO {
  @IsString()
  @ApiProperty({ example: 'Q', description: 'Card rank: 2–10, J, Q, K, A' })
  name!: string;

  @IsString()
  @ApiProperty({
    example: 'spade',
    description: 'Card suit: spade, heart, club, or diamond',
  })
  suit!: string;
}

export class CreateGameDTO {
  @IsString()
  @ApiProperty({ example: 'Sam', description: 'Display name for the human seat' })
  humanName!: string;

  @IsOptional()
  @IsInt()
  @ApiProperty({
    required: false,
    example: 1234,
    description: 'Optional seed for a reproducible deal',
  })
  seed?: number;
}

export class PassCardsDTO {
  @IsInt()
  @Min(0)
  @Max(3)
  @ApiProperty({ example: 0, description: 'Seat index passing the cards (0–3)' })
  seat!: number;

  @ValidateNested({ each: true })
  @Type(() => CardRefDTO)
  @ArrayMinSize(CARDS_TO_PASS)
  @ArrayMaxSize(CARDS_TO_PASS)
  @ApiProperty({
    type: [CardRefDTO],
    description: `Exactly ${CARDS_TO_PASS} cards to pass`,
  })
  cards!: CardRefDTO[];
}

export class PlayCardDTO {
  @IsInt()
  @Min(0)
  @Max(3)
  @ApiProperty({ example: 0, description: 'Seat index playing the card (0–3)' })
  seat!: number;

  @ValidateNested()
  @Type(() => CardRefDTO)
  @ApiProperty({ type: CardRefDTO, description: 'The card to play' })
  card!: CardRefDTO;
}
