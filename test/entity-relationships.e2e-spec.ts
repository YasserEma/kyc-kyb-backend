import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ExecutionContext } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { JwtAuthGuard } from '../src/modules/auth/guards/jwt-auth.guard';
import { AppDataSource } from '../src/config/data-source';
import { SubscriberEntity } from '../src/modules/subscribers/entities/subscriber.entity';
import { SubscriberUserEntity } from '../src/modules/subscriber-users/entities/subscriber-user.entity';
import { EntityEntity } from '../src/modules/entities/entities/entity.entity';
import { EntityRelationship } from '../src/modules/entity-relationships/entities/entity-relationship.entity';
import { Repository } from 'typeorm';

describe('Entity Relationships E2E Tests', () => {
    let app: INestApplication;
    let subscriberRepo: Repository<SubscriberEntity>;
    let userRepo: Repository<SubscriberUserEntity>;
    let entityRepo: Repository<EntityEntity>;
    let relationshipRepo: Repository<EntityRelationship>;

    // Seed data IDs
    let testSubscriber: SubscriberEntity;
    let testUser: SubscriberUserEntity;
    let alphaCorpEntity: EntityEntity;
    let johnDoeEntity: EntityEntity;

    // Mock user for authentication
    const mockUser = {
        id: '', // Will be set after seeding
        subscriber_id: '', // Will be set after seeding
        email: 'test@example.com',
    };

    beforeAll(async () => {
        // Initialize database connection
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
        }

        // Get repositories
        subscriberRepo = AppDataSource.getRepository(SubscriberEntity);
        userRepo = AppDataSource.getRepository(SubscriberUserEntity);
        entityRepo = AppDataSource.getRepository(EntityEntity);
        relationshipRepo = AppDataSource.getRepository(EntityRelationship);

        // Seed test data
        await seedTestData();

        // Create testing module with mocked authentication
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideGuard(JwtAuthGuard)
            .useValue({
                canActivate: (context: ExecutionContext) => {
                    const request = context.switchToHttp().getRequest();
                    request.user = mockUser;
                    return true;
                },
            })
            .compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    afterAll(async () => {
        // Clean up test data
        await cleanupTestData();

        await app.close();
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
        }
    });

    /**
     * Seed test data before running tests
     */
    async function seedTestData() {
        const timestamp = Date.now();

        // 1. Create Subscriber
        testSubscriber = subscriberRepo.create({
            username: `test_subscriber_${timestamp}`,
            email: `subscriber_${timestamp}@test.com`,
            password: 'hashed_password',
            type: 'business',
            status: 'active',
            is_active: true,
        });
        await subscriberRepo.save(testSubscriber);

        // 2. Create User linked to Subscriber
        testUser = userRepo.create({
            subscriber_id: testSubscriber.id,
            email: `user_${timestamp}@test.com`,
            password_hash: 'hashed_password',
            first_name: 'Test',
            last_name: 'User',
            role: 'admin', // Required field
            status: 'active', // Required field
            is_active: true,
        });
        await userRepo.save(testUser);

        // Update mock user with actual IDs
        mockUser.id = testUser.id;
        mockUser.subscriber_id = testSubscriber.id;

        // 3. Create Organization Entity - "Alpha Corp"
        alphaCorpEntity = entityRepo.create({
            subscriber_id: testSubscriber.id,
            entity_type: 'organization',
            name: 'Alpha Corp',
            reference_number: `ORG-${Date.now()}-001`,
            status: 'ACTIVE',
            created_by: testUser.id,
            is_active: true,
        });
        await entityRepo.save(alphaCorpEntity);

        // 4. Create Individual Entity - "John Doe"
        johnDoeEntity = entityRepo.create({
            subscriber_id: testSubscriber.id,
            entity_type: 'individual',
            name: 'John Doe',
            reference_number: `IND-${Date.now()}-001`,
            status: 'ACTIVE',
            created_by: testUser.id,
            is_active: true,
        });
        await entityRepo.save(johnDoeEntity);
    }

    /**
     * Clean up all test data
     */
    async function cleanupTestData() {
        // Delete in reverse order of dependencies
        if (relationshipRepo) {
            await relationshipRepo.delete({ from_entity_id: alphaCorpEntity?.id });
            await relationshipRepo.delete({ from_entity_id: johnDoeEntity?.id });
        }
        if (entityRepo) {
            await entityRepo.delete({ subscriber_id: testSubscriber?.id });
        }
        if (userRepo) {
            await userRepo.delete({ subscriber_id: testSubscriber?.id });
        }
        if (subscriberRepo) {
            await subscriberRepo.delete({ id: testSubscriber?.id });
        }
    }

    /**
     * Test Scenario A: Link Existing Entities (POST)
     */
    describe('A. Link Existing Entities', () => {
        let relationshipId: string;

        it('should create a relationship between Alpha Corp and John Doe', async () => {
            const payload = {
                target_entity_id: johnDoeEntity.id,
                relationship_type: 'director',
                metadata: { position: 'Board Director' },
            };

            const response = await request(app.getHttpServer())
                .post(`/api/v1/entities/${alphaCorpEntity.id}/relationships`)
                .send(payload)
                .expect(201);

            // Verify response structure
            expect(response.body).toHaveProperty('id');
            expect(response.body.from_entity_id).toBe(alphaCorpEntity.id);
            expect(response.body.to_entity_id).toBe(johnDoeEntity.id);
            expect(response.body.relationship_type).toBe('director');
            expect(response.body.metadata).toEqual({ position: 'Board Director' });

            relationshipId = response.body.id;

            // Verify in database
            const dbRelationship = await relationshipRepo.findOne({
                where: { id: relationshipId },
            });

            expect(dbRelationship).toBeDefined();
            expect(dbRelationship!.from_entity_id).toBe(alphaCorpEntity.id);
            expect(dbRelationship!.to_entity_id).toBe(johnDoeEntity.id);
            expect(dbRelationship!.relationship_type).toBe('director');
            expect(dbRelationship!.is_active).toBe(true);
        });
    });

    /**
     * Test Scenario B: Create & Link NEW Individual (POST - Polymorphic)
     */
    describe('B. Create & Link NEW Individual', () => {
        let janeSmithEntityId: string;
        let relationshipId: string;

        it('should create a new individual entity and link it to Alpha Corp', async () => {
            const payload = {
                relationship_type: 'shareholder',
                new_target_entity: {
                    entity_type: 'individual',
                    name: 'Jane Smith',
                    date_of_birth: '1990-01-01',
                    nationality: ['US'],
                    is_pep: false,
                    has_criminal_record: false,
                },
                metadata: { ownership_percentage: 10 },
            };

            const response = await request(app.getHttpServer())
                .post(`/api/v1/entities/${alphaCorpEntity.id}/relationships`)
                .send(payload)
                .expect(201);

            // Verify response
            expect(response.body).toHaveProperty('id');
            expect(response.body.from_entity_id).toBe(alphaCorpEntity.id);
            expect(response.body.relationship_type).toBe('shareholder');
            expect(response.body.metadata).toEqual({ ownership_percentage: 10 });

            relationshipId = response.body.id;
            janeSmithEntityId = response.body.to_entity_id;

            // 1. Verify new entity was created
            const newEntity = await entityRepo.findOne({
                where: { id: janeSmithEntityId },
            });

            expect(newEntity).toBeDefined();
            expect(newEntity!.name).toBe('Jane Smith');
            expect(newEntity!.entity_type).toBe('individual');
            expect(newEntity!.subscriber_id).toBe(testSubscriber.id);

            // 2. Verify relationship was created
            const relationship = await relationshipRepo.findOne({
                where: { id: relationshipId },
            });

            expect(relationship).toBeDefined();
            expect(relationship!.from_entity_id).toBe(alphaCorpEntity.id);
            expect(relationship!.to_entity_id).toBe(janeSmithEntityId);
            expect(relationship!.relationship_type).toBe('shareholder');
        });
    });

    /**
     * Test Scenario C: Create & Link NEW Organization (POST - Polymorphic)
     */
    describe('C. Create & Link NEW Organization', () => {
        let betaLLCEntityId: string;
        let relationshipId: string;

        it('should create a new organization entity and link it to John Doe', async () => {
            const payload = {
                relationship_type: 'employer',
                new_target_entity: {
                    entity_type: 'organization',
                    name: 'Beta LLC',
                    legal_name: 'Beta LLC',
                    country_of_incorporation: 'US',
                    date_of_incorporation: '2020-01-01',
                },
            };

            const response = await request(app.getHttpServer())
                .post(`/api/v1/entities/${johnDoeEntity.id}/relationships`)
                .send(payload)
                .expect(201);

            // Verify response
            expect(response.body).toHaveProperty('id');
            expect(response.body.from_entity_id).toBe(johnDoeEntity.id);
            expect(response.body.relationship_type).toBe('employer');

            relationshipId = response.body.id;
            betaLLCEntityId = response.body.to_entity_id;

            // 1. Verify new organization was created
            const newOrg = await entityRepo.findOne({
                where: { id: betaLLCEntityId },
            });

            expect(newOrg).toBeDefined();
            expect(newOrg!.name).toBe('Beta LLC');
            expect(newOrg!.entity_type).toBe('organization');
            expect(newOrg!.subscriber_id).toBe(testSubscriber.id);

            // 2. Verify relationship was created
            const relationship = await relationshipRepo.findOne({
                where: { id: relationshipId },
            });

            expect(relationship).toBeDefined();
            expect(relationship!.from_entity_id).toBe(johnDoeEntity.id);
            expect(relationship!.to_entity_id).toBe(betaLLCEntityId);
            expect(relationship!.relationship_type).toBe('employer');
        });
    });

    /**
     * Test Scenario D: Prevent Duplicates (Error Handling)
     */
    describe('D. Prevent Duplicates', () => {
        it('should return 409 when trying to create duplicate relationship', async () => {
            const payload = {
                target_entity_id: johnDoeEntity.id,
                relationship_type: 'director',
            };

            // This should fail because we already created this relationship in Scenario A
            const response = await request(app.getHttpServer())
                .post(`/api/v1/entities/${alphaCorpEntity.id}/relationships`)
                .send(payload)
                .expect(409);

            expect(response.body).toHaveProperty('message');
            expect(response.body.message).toContain('already exists');
        });
    });

    /**
     * Test Scenario E: List Relationships (GET)
     */
    describe('E. List Relationships', () => {
        it('should list all relationships for Alpha Corp', async () => {
            const response = await request(app.getHttpServer())
                .get(`/api/v1/entities/${alphaCorpEntity.id}/relationships`)
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThanOrEqual(2);

            // Check if both John Doe and Jane Smith relationships exist
            const relationshipTypes = response.body.map((r: any) => r.relationship_type);
            expect(relationshipTypes).toContain('director');
            expect(relationshipTypes).toContain('shareholder');

            // Verify structure of at least one relationship
            const firstRelationship = response.body[0];
            expect(firstRelationship).toHaveProperty('id');
            expect(firstRelationship).toHaveProperty('from_entity_id');
            expect(firstRelationship).toHaveProperty('to_entity_id');
            expect(firstRelationship).toHaveProperty('relationship_type');
            expect(firstRelationship).toHaveProperty('from_entity');
            expect(firstRelationship).toHaveProperty('to_entity');
        });

        it('should filter active relationships only', async () => {
            const response = await request(app.getHttpServer())
                .get(`/api/v1/entities/${alphaCorpEntity.id}/relationships?active_only=true`)
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);

            // All returned relationships should be active
            response.body.forEach((rel: any) => {
                expect(rel.is_active).toBe(true);
                expect(rel.deleted_at).toBeNull();
            });
        });
    });

    /**
     * Test Scenario F: Soft Delete (DELETE)
     */
    describe('F. Soft Delete Relationship', () => {
        let relationshipToDelete: EntityRelationship;

        beforeAll(async () => {
            // Find the director relationship created in Scenario A
            relationshipToDelete = (await relationshipRepo.findOne({
                where: {
                    from_entity_id: alphaCorpEntity.id,
                    to_entity_id: johnDoeEntity.id,
                    relationship_type: 'director',
                },
            }))!;
        });

        it('should soft delete a relationship', async () => {
            expect(relationshipToDelete).toBeDefined();

            const response = await request(app.getHttpServer())
                .delete(`/api/v1/relationships/${relationshipToDelete.id}`)
                .expect(200);

            expect(response.body).toHaveProperty('message');
            expect(response.body.message).toContain('deleted successfully');

            // Verify soft delete in database
            const deletedRelationship = await relationshipRepo.findOne({
                where: { id: relationshipToDelete.id },
                withDeleted: true, // Include soft-deleted records
            });

            expect(deletedRelationship).toBeDefined();
            expect(deletedRelationship!.deleted_at).not.toBeNull();
        });

        it('should not return soft-deleted relationships in list by default', async () => {
            const response = await request(app.getHttpServer())
                .get(`/api/v1/entities/${alphaCorpEntity.id}/relationships`)
                .expect(200);

            // The director relationship should not be in the list
            const directorRelationship = response.body.find(
                (r: any) => r.id === relationshipToDelete.id
            );

            expect(directorRelationship).toBeUndefined();
        });
    });

    /**
     * Additional Test: Error Handling for Non-Existent Entity
     */
    describe('G. Error Handling', () => {
        it('should return 404 when source entity does not exist', async () => {
            const fakeEntityId = '00000000-0000-0000-0000-000000000000';
            const payload = {
                target_entity_id: johnDoeEntity.id,
                relationship_type: 'partner',
            };

            await request(app.getHttpServer())
                .post(`/api/v1/entities/${fakeEntityId}/relationships`)
                .send(payload)
                .expect(404);
        });

        it('should return 404 when target entity does not exist', async () => {
            const fakeEntityId = '00000000-0000-0000-0000-000000000000';
            const payload = {
                target_entity_id: fakeEntityId,
                relationship_type: 'partner',
            };

            await request(app.getHttpServer())
                .post(`/api/v1/entities/${alphaCorpEntity.id}/relationships`)
                .send(payload)
                .expect(404);
        });

        it('should return 400 when both target_entity_id and new_target_entity are provided', async () => {
            const payload = {
                target_entity_id: johnDoeEntity.id,
                new_target_entity: {
                    name: 'Test Entity',
                    date_of_birth: '1990-01-01',
                    nationality: ['US'],
                },
                relationship_type: 'partner',
            };

            const response = await request(app.getHttpServer())
                .post(`/api/v1/entities/${alphaCorpEntity.id}/relationships`)
                .send(payload)
                .expect(400);

            expect(response.body.message).toContain('Cannot specify both');
        });

        it('should return 400 when neither target_entity_id nor new_target_entity is provided', async () => {
            const payload = {
                relationship_type: 'partner',
            };

            const response = await request(app.getHttpServer())
                .post(`/api/v1/entities/${alphaCorpEntity.id}/relationships`)
                .send(payload)
                .expect(400);

            expect(response.body.message).toContain('Must specify either');
        });
    });
});
