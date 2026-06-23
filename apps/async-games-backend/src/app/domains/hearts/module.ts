import { Module } from '@nestjs/common';
import { HeartsController } from './controller';
import { HeartsService } from './service';
import { HeartsStore } from './store';

@Module({
  controllers: [HeartsController],
  providers: [HeartsService, HeartsStore],
})
export class HeartsModule {}
