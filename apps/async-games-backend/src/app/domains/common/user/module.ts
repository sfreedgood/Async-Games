import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../../database/database.module';
import { UserController } from './controller';
import { UserService } from './service';

@Module({
  imports: [DatabaseModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
