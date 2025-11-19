import { Module } from '@nestjs/common';
import { ClassicCardController } from './controller';
import { ClassicCardService } from './service';

@Module({
  imports: [ClassicCardModule],
  controllers: [ClassicCardController],
  providers: [ClassicCardService],
})
export class ClassicCardModule {}
