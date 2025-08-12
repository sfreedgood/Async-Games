import { Injectable } from '@nestjs/common';
import { StandardPlayingCard } from '../../entities/card';

@Injectable()
export class CardService {
  getData(): StandardPlayingCard {
    return new StandardPlayingCard('3', 'heart');
  }
}
