import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {
  ClassicCardModule,
  ClassicCardController,
  ClassicCardService,
} from './domains/classic-card';
import {
  HeartsModule,
  HeartsController,
  HeartsService,
  HeartsStore,
} from './domains/hearts';

@Module({
  imports: [
    // Global rate limiting: 60 requests per minute per client. Mitigates
    // brute-force and request-flood denial of service on unauthenticated routes.
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 60 }]),
    ClassicCardModule,
    HeartsModule,
  ],
  controllers: [AppController, ClassicCardController, HeartsController],
  providers: [
    AppService,
    ClassicCardService,
    HeartsService,
    HeartsStore,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
