import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsString } from 'class-validator';
import { standardSuits } from './card.interface';

export class StandardPlayingCardDTO {
  @IsInt()
  @ApiProperty({
    example: 2,
    description: 'numeric value of the card',
  })
  value!: number;

  @IsString()
  @ApiProperty({
    example: 'red',
    description: 'red or black',
  })
  color!: string | null;

  @IsString()
  @ApiProperty({
    example: '2',
    description: 'The text reference written on the card',
  })
  name!: string;

  @IsString()
  @ApiProperty({
    example: 'Clubs',
    description: 'The Suit/Type of card',
    enum: standardSuits,
  })
  suit!: string;

  @ApiProperty({
    example: false,
    description:
      'Optional: for games utilizing trumps. For example: Hearts, Spades, Euchre, Whist, Pinochle, Bridge, etc.',
  })
  isTrumpSuit?: boolean;

  @ApiProperty({
    example: { aceLow: true, valueOverrides: { joker: 0, J: 12, Q: 11 } },
    description: `aceLow: option to make Ace Low (1). High (14) by default
      valueOverrides: object to assign specific values to cards:
      \tuseful for card games using traditionally Spanish or German style decks
      \tor games with specific gameplay requirements`,
  })
  options?: object;
}

export class StandardDeckOptionsDTO {
  @IsInt()
  jokers?: number;

  @IsBoolean()
  aceLow?: boolean;
}
