import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EntityRelationship } from './entities/entity-relationship.entity';
import { EntityRelationshipRepository } from './repositories/entity-relationship.repository';
import { EntityRelationshipsService } from './services/entity-relationships.service';
import { EntityRelationshipsController } from './controllers/entity-relationships.controller';
import { EntitiesModule } from '../entities/entities.module';
import { EntityHistoryEntity } from '../entity-history/entities/entity-history.entity';
import { EntityHistoryRepository } from '../entity-history/repositories/entity-history.repository';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([EntityRelationship, EntityHistoryEntity]),
        forwardRef(() => EntitiesModule),
        forwardRef(() => AuthModule),
    ],
    controllers: [EntityRelationshipsController],
    providers: [
        EntityRelationshipRepository,
        EntityRelationshipsService,
        EntityHistoryRepository,
    ],
    exports: [EntityRelationshipRepository, EntityRelationshipsService],
})
export class EntityRelationshipsModule { }
