import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriberEntity } from './entities/subscriber.entity';
import { SubscriberRepository } from './repositories/subscriber.repository';

@Module({
  imports: [TypeOrmModule.forFeature([SubscriberEntity])],
  providers: [SubscriberRepository],
  exports: [SubscriberRepository, TypeOrmModule],
})
export class SubscribersModule {}