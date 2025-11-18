import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import * as fs from 'fs';
import * as path from 'path';

describe('Phase 3 E2E: Entity Wizard', () => {
  let app: INestApplication;
  let http: request.SuperTest<request.Test>;
  let accessToken: string;
  let individualEntityId: string;
  let organizationEntityId: string;
  let linkingIndividualId: string;
  let linkingOrganizationId: string;
  let individualSubId: string;
  let organizationSubId: string;
  let linkingIndividualSubId: string;
  let linkingOrganizationSubId: string;

  const api = (p: string) => `/api/v1/${p}`.replace(/\/$/, '');

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
    http = request(app.getHttpServer());

    const testPdfPath = path.join(process.cwd(), 'test', 'test.pdf');
    if (!fs.existsSync(path.dirname(testPdfPath))) fs.mkdirSync(path.dirname(testPdfPath), { recursive: true });
    fs.writeFileSync(testPdfPath, '%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n>>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000015 00000 n \n0000000074 00000 n \n0000000120 00000 n \ntrailer\n<<\n/Size 4\n/Root 1 0 R\n>>\nstartxref\n179\n%%EOF');

    const ts = Date.now();
    const adminEmail = `phase3_admin_${ts}@example.com`;
    const adminPassword = 'SecurePassword123!';

    await http.post(api('auth/register')).send({
      companyName: `Phase3_${ts}`,
      companyType: 'LLC',
      jurisdiction: 'Delaware',
      companyContactPhone: '+15555550123',
      adminName: 'Phase 3 Admin',
      adminEmail,
      adminPassword,
      adminPhoneNumber: '+15555550124',
    }).expect(201);

    const login = await http.post(api('auth/login')).send({ username: adminEmail, password: adminPassword }).expect(200);
    accessToken = login.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('Stage 1: Create Individual (Primary)', async () => {
    const res = await http.post(api('entities/individual')).set('Authorization', `Bearer ${accessToken}`).send({
      name: 'John Doe',
      date_of_birth: '1990-01-01',
      nationality: ['US'],
      is_pep: false,
      has_criminal_record: false,
      custom_fields: [
        { field_name: 'preferred_language', field_value: 'English', field_group: 'basic_info' },
      ],
    });
    expect(res.status).toBe(201);
    individualEntityId = res.body.id;
    expect(individualEntityId).toBeTruthy();
  });

  it('Stage 1: Create Organization (Primary)', async () => {
    const res = await http.post(api('entities/organization')).set('Authorization', `Bearer ${accessToken}`).send({
      name: 'TestCorp Inc.',
      legal_name: 'TestCorp Inc.',
      country_of_incorporation: 'US',
      date_of_incorporation: '2010-01-01',
    });
    expect(res.status).toBe(201);
    organizationEntityId = res.body.id;
    expect(organizationEntityId).toBeTruthy();
  });

  it('Stage 1: Create Linking Individual', async () => {
    const res = await http.post(api('entities/individual')).set('Authorization', `Bearer ${accessToken}`).send({
      name: 'Jane Smith',
      date_of_birth: '1985-05-15',
      nationality: ['US'],
      is_pep: false,
      has_criminal_record: false,
    });
    expect(res.status).toBe(201);
    linkingIndividualId = res.body.id;
  });

  it('Stage 1: Create Linking Organization', async () => {
    const res = await http.post(api('entities/organization')).set('Authorization', `Bearer ${accessToken}`).send({
      name: 'Subsidiary Corp',
      legal_name: 'Subsidiary Corp',
      country_of_incorporation: 'US',
      date_of_incorporation: '2021-06-01',
    });
    expect(res.status).toBe(201);
    linkingOrganizationId = res.body.id;
  });

  it('Fetch Sub-Entity IDs', async () => {
    const ind = await http.get(api(`entities/${individualEntityId}/individual`)).set('Authorization', `Bearer ${accessToken}`).expect(200);
    individualSubId = ind.body.id;
    const linkInd = await http.get(api(`entities/${linkingIndividualId}/individual`)).set('Authorization', `Bearer ${accessToken}`).expect(200);
    linkingIndividualSubId = linkInd.body.id;
    const org = await http.get(api(`entities/${organizationEntityId}/organization`)).set('Authorization', `Bearer ${accessToken}`).expect(200);
    organizationSubId = org.body.id;
    const linkOrg = await http.get(api(`entities/${linkingOrganizationId}/organization`)).set('Authorization', `Bearer ${accessToken}`).expect(200);
    linkingOrganizationSubId = linkOrg.body.id;
    expect(individualSubId && organizationSubId && linkingIndividualSubId && linkingOrganizationSubId).toBeTruthy();
  });

  it('Stage 2: Add Document to Organization', async () => {
    const testPdfPath = path.join(process.cwd(), 'test', 'test.pdf');
    const res = await http.post(api(`entities/${organizationEntityId}/documents`))
      .set('Authorization', `Bearer ${accessToken}`)
      .field('document_type', 'incorporation_certificate')
      .field('document_name', 'Incorporation Certificate')
      .field('mime_type', 'application/pdf')
      .attach('file', testPdfPath);
    expect(res.status).toBe(201);
  });

  it('Stage 2: Add Custom Fields to Individual (documents group)', async () => {
    const res = await http.post(api(`entities/${individualEntityId}/custom-fields`))
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ custom_fields: [
        { field_name: 'occupation', field_value: 'Engineer', field_group: 'documents' },
        { field_name: 'annual_income', field_value: '100000', field_group: 'documents' },
      ]});
    expect(res.status).toBe(201);
    expect(Array.isArray(res.body.fields)).toBe(true);
    expect(res.body.fields[0].field_group).toBe('documents');
  });

  it('Stage 3: Organization-to-Individual association', async () => {
    const res = await http.post(api('organization-entity-associations'))
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        organization_id: organizationSubId,
        individual_id: linkingIndividualSubId,
        relationship_type: 'director',
        relationship_details: { position: 'Board Director' },
        status: 'active',
      });
    expect(res.status).toBe(201);
  });

  it('Stage 3: Organization-to-Organization relationship', async () => {
    const res = await http.post(api('organization-relationships'))
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        primary_organization_id: organizationSubId,
        related_organization_id: linkingOrganizationSubId,
        relationship_type: 'subsidiary',
        effective_from: new Date().toISOString(),
        verified: true,
      });
    expect(res.status).toBe(201);
  });

  it('Stage 3: Individual-to-Individual relationship', async () => {
    const res = await http.post(api('relationships'))
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        primary_individual_id: individualSubId,
        related_individual_id: linkingIndividualSubId,
        relationship_type: 'family',
        relationship_status: 'active',
      });
    expect(res.status).toBe(201);
  });

  it('Stage 3: Add Custom Fields to Organization (related_parties)', async () => {
    const res = await http.post(api(`entities/${organizationEntityId}/custom-fields`))
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ custom_fields: [
        { field_name: 'group_structure', field_value: 'Simple', field_group: 'related_parties' },
      ]});
    expect(res.status).toBe(201);
    expect(res.body.fields[0].field_group).toBe('related_parties');
  });
});