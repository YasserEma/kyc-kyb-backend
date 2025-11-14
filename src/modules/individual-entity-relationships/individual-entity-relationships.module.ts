import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IndividualEntityRelationshipEntity } from './entities/individual-entity-relationship.entity';
import { IndividualEntityRelationshipRepository } from './repositories/individual-entity-relationship.repository';
import { IndividualEntityRelationshipsService } from './individual-entity-relationships.service';
import { IndividualEntityRelationshipsController } from './individual-entity-relationships.controller';

@Module({
  imports: [TypeOrmModule.forFeature([IndividualEntityRelationshipEntity])],
  controllers: [IndividualEntityRelationshipsController],
  providers: [IndividualEntityRelationshipRepository, IndividualEntityRelationshipsService],
  exports: [IndividualEntityRelationshipRepository],
})
export class IndividualRelationshipsModule {}