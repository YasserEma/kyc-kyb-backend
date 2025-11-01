import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriberUserEntity } from './entities/subscriber-user.entity';
import { SubscriberUserRepository } from './repositories/subscriber-user.repository';

@Module({
  imports: [TypeOrmModule.forFeature([SubscriberUserEntity])],
  providers: [SubscriberUserRepository],
  exports: [SubscriberUserRepository, TypeOrmModule],
})
export class SubscriberUsersModule {}