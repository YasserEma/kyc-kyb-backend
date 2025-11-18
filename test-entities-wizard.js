/**
 * Entity Wizard Flow E2E Test
 * 
 * Comprehensive test for multi-stage Entity Creation Wizard
 * Tests the complete flow: entity creation → documents → relationships → custom fields
 */

(async () => {
  const verbose = true; // Enable verbose logging for debugging
  const baseUrl = (process.env.API_BASE_URL || 'http://localhost:3001/api/v1').replace(/\/$/, '');
  const timeoutMs = Number(process.env.API_TIMEOUT_MS || 30000); // Longer timeout for complex operations

  let myFetch = globalThis.fetch;
  if (!myFetch) {
    try {
      // Use built-in undici fetch if available
      const undici = await import('node:undici');
      myFetch = undici.fetch;
    } catch (err) {
      console.error('Fetch API not available in this Node runtime.');
      process.exit(1);
    }
  }

  const log = (...args) => { if (verbose) console.log(...args); };

  async function request(method, path, { headers = {}, json, body, formData } = {}) {
    const url = `${baseUrl}/${String(path).replace(/^\/+/, '')}`;
    let finalHeaders = { ...headers };
    let requestBody = body;

    // Handle form data for file uploads
    if (formData) {
      // For multipart/form-data, let the browser set the content-type with boundary
      delete finalHeaders['Content-Type'];
      requestBody = formData;
    } else if (json) {
      finalHeaders['Content-Type'] = 'application/json';
      requestBody = JSON.stringify(json);
    }

    const controller = new AbortController();
    const to = setTimeout(() => controller.abort(), timeoutMs);
    let res;
    try {
      res = await myFetch(url, {
        method,
        headers: finalHeaders,
        body: requestBody,
        signal: controller.signal,
      });
    } finally {
      clearTimeout(to);
    }

    const contentType = (res.headers.get('content-type') || '').toLowerCase();
    let data = null;
    let text = null;
    try {
      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        text = await res.text();
      }
    } catch (e) {
      // Non-JSON or empty body
      text = await res.text().catch(() => '');
    }

    log(`[${method}] ${path} -> ${res.status}`, data ?? text ?? '');
    return { status: res.status, ok: res.ok, data, text, headers: res.headers };
  }

  function assert(condition, message) {
    if (!condition) {
      throw new Error(message);
    }
  }

  // Global variables to store IDs
  let individualEntityId, organizationEntityId, linkingIndividualId, linkingOrganizationId;
  let individualSubId, organizationSubId, linkingIndividualSubId, linkingOrganizationSubId;

  try {
    console.log('🧪 Starting Entity Wizard Flow E2E Test...');

    // 0) Health check
    log('Checking health...');
    const health = await request('GET', 'auth/health');
    assert(health.status === 200, `Health check failed (status ${health.status}) — ensure server is running at ${baseUrl}`);
    assert((health.data && health.data.status) === 'ok', 'Health endpoint did not return ok');

    // 1) Register subscriber + admin (same as existing test)
    const ts = Date.now();
    const companyName = `WizardCo_${ts}`;
    const adminEmail = `wizard_admin_${ts}@example.com`;
    const adminPassword = 'SecurePassword123!';

    log('Registering subscriber and admin...');
    const registerRes = await request('POST', 'auth/register', {
      json: {
        companyName,
        companyType: 'LLC',
        jurisdiction: 'Delaware',
        companyContactPhone: '+15555550123',
        adminName: 'Wizard Test Admin',
        adminEmail,
        adminPassword,
        adminPhoneNumber: '+15555550124',
      },
    });
    assert(registerRes.status === 201, `Register failed (status ${registerRes.status}): ${registerRes.text || JSON.stringify(registerRes.data)}`);
    const { subscriberId, adminUserId } = registerRes.data || {};
    assert(subscriberId && adminUserId, 'Register response missing subscriberId or adminUserId');
    log('Registered:', { subscriberId, adminUserId });

    // 2) Login as admin
    log('Logging in as admin...');
    const loginRes = await request('POST', 'auth/login', {
      json: { username: adminEmail, password: adminPassword },
    });
    assert(loginRes.status === 200, `Login failed (status ${loginRes.status}): ${loginRes.text || JSON.stringify(loginRes.data)}`);
    const accessToken = loginRes.data?.access_token;
    assert(accessToken, 'Login response missing access_token');

    const authHeader = { Authorization: `Bearer ${accessToken}` };

    // 2) Create test PDF file for document uploads
    const fs = await import('fs');
    const path = await import('path');
    const testPdfPath = path.join(process.cwd(), 'test-document.pdf');
    
    try {
      // Create a dummy PDF file
      fs.writeFileSync(testPdfPath, '%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n>>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000015 00000 n \n0000000074 00000 n \n0000000120 00000 n \ntrailer\n<<\n/Size 4\n/Root 1 0 R\n>>\nstartxref\n179\n%%EOF');
      console.log('✅ Created test PDF file');

      // Stage 1: Entity Creation
      console.log('\n📋 Stage 1: Entity Creation');

      // Create Individual Entity (Primary)
      log('Creating primary individual entity...');
      const individualRes = await request('POST', 'entities/individual', {
        headers: authHeader,
        json: {
          name: 'John Doe',
          date_of_birth: '1990-01-01',
          nationality: ['US'],
          is_pep: false,
          has_criminal_record: false
        }
      });
      assert(individualRes.status === 201, `Create individual failed: ${individualRes.text || JSON.stringify(individualRes.data)}`);
      individualEntityId = individualRes.data?.id;
      assert(individualEntityId, 'Individual entity ID not returned');
      console.log('✅ Created primary individual entity:', individualEntityId);

      // Create Organization Entity (Primary)
      log('Creating primary organization entity...');
      const orgRes = await request('POST', 'entities/organization', {
        headers: authHeader,
        json: {
          name: 'TestCorp Inc.',
          legal_name: 'TestCorp Inc.',
          country_of_incorporation: 'US',
          date_of_incorporation: '2010-01-01'
        }
      });
      assert(orgRes.status === 201, `Create organization failed: ${orgRes.text || JSON.stringify(orgRes.data)}`);
      organizationEntityId = orgRes.data?.id;
      assert(organizationEntityId, 'Organization entity ID not returned');
      console.log('✅ Created primary organization entity:', organizationEntityId);

      // Create Linking Individual Entity (Secondary)
      log('Creating linking individual entity...');
      const linkingIndRes = await request('POST', 'entities/individual', {
        headers: authHeader,
        json: {
          name: 'Jane Smith',
          date_of_birth: '1985-05-15',
          nationality: ['US'],
          is_pep: false,
          has_criminal_record: false
        }
      });
      assert(linkingIndRes.status === 201, `Create linking individual failed: ${linkingIndRes.text || JSON.stringify(linkingIndRes.data)}`);
      linkingIndividualId = linkingIndRes.data?.id;
      assert(linkingIndividualId, 'Linking individual entity ID not returned');
      console.log('✅ Created linking individual entity:', linkingIndividualId);

      // Create Linking Organization Entity (Secondary)
      log('Creating linking organization entity...');
      const linkingOrgRes = await request('POST', 'entities/organization', {
        headers: authHeader,
        json: {
          name: 'Subsidiary Corp',
          registration_number: 'SUB789012',
          incorporation_country: 'US',
          incorporation_date: '2021-06-01',
          business_type: 'Subsidiary',
          address: '456 Subsidiary Ave, Los Angeles, CA 90001'
        }
      });
      assert(linkingOrgRes.status === 201, `Create linking organization failed: ${linkingOrgRes.text || JSON.stringify(linkingOrgRes.data)}`);
      linkingOrganizationId = linkingOrgRes.data?.id;
      assert(linkingOrganizationId, 'Linking organization entity ID not returned');
      console.log('✅ Created linking organization entity:', linkingOrganizationId);

      // Fetch Sub-Entity IDs
      console.log('\n🔍 Fetching sub-entity IDs...');
      
      // Get Individual Sub-IDs
      const indSubRes = await request('GET', `entities/${individualEntityId}/individual`, {
        headers: authHeader
      });
      assert(indSubRes.status === 200, `Get individual sub-entity failed: ${indSubRes.text || JSON.stringify(indSubRes.data)}`);
      individualSubId = indSubRes.data?.id;
      assert(individualSubId, 'Individual sub-entity ID not found');

      const linkingIndSubRes = await request('GET', `entities/${linkingIndividualId}/individual`, {
        headers: authHeader
      });
      assert(linkingIndSubRes.status === 200, `Get linking individual sub-entity failed: ${linkingIndSubRes.text || JSON.stringify(linkingIndSubRes.data)}`);
      linkingIndividualSubId = linkingIndSubRes.data?.id;
      assert(linkingIndividualSubId, 'Linking individual sub-entity ID not found');

      // Get Organization Sub-IDs
      const orgSubRes = await request('GET', `entities/${organizationEntityId}/organization`, {
        headers: authHeader
      });
      assert(orgSubRes.status === 200, `Get organization sub-entity failed: ${orgSubRes.text || JSON.stringify(orgSubRes.data)}`);
      organizationSubId = orgSubRes.data?.id;
      assert(organizationSubId, 'Organization sub-entity ID not found');

      const linkingOrgSubRes = await request('GET', `entities/${linkingOrganizationId}/organization`, {
        headers: authHeader
      });
      assert(linkingOrgSubRes.status === 200, `Get linking organization sub-entity failed: ${linkingOrgSubRes.text || JSON.stringify(linkingOrgSubRes.data)}`);
      linkingOrganizationSubId = linkingOrgSubRes.data?.id;
      assert(linkingOrganizationSubId, 'Linking organization sub-entity ID not found');

      console.log('✅ Retrieved all sub-entity IDs');

      // Stage 2: Documents & Custom Fields
      console.log('\n📄 Stage 2: Documents & Custom Fields');

      // Add Document to Individual
      log('Adding document to individual entity...');
      const formData = new FormData();
      const fileBuffer = fs.readFileSync(testPdfPath);
      const blob = new Blob([fileBuffer], { type: 'application/pdf' });
      formData.append('file', blob, 'test-document.pdf');
      formData.append('document_type', 'PASSPORT');
      formData.append('document_name', 'John Doe Passport');
      formData.append('document_number', 'P123456789');
      formData.append('expiry_date', '2025-12-31');
      formData.append('issuing_country', 'US');
      formData.append('mime_type', 'application/pdf');
      formData.append('category', 'identity');
      formData.append('tags', JSON.stringify(['passport', 'identity']));
      formData.append('metadata', JSON.stringify({
        issued_by: 'US Department of State',
        issue_date: '2020-01-01'
      }));

      const docRes = await request('POST', `entities/${individualEntityId}/documents`, {
        headers: authHeader,
        formData
      });
      assert(docRes.status === 201, `Add document failed: ${docRes.text || JSON.stringify(docRes.data)}`);
      console.log('✅ Added document to individual');

      // Add Custom Fields to Individual
      log('Adding custom fields to individual entity...');
      const customFieldsRes = await request('POST', `entities/${individualEntityId}/custom-fields`, {
        headers: authHeader,
        json: {
          custom_fields: [
            {
              field_name: 'occupation',
              field_value: 'Software Engineer'
            },
            {
              field_name: 'annual_income',
              field_value: '100000'
            }
          ]
        }
      });
      assert(customFieldsRes.status === 201, `Add custom fields failed: ${customFieldsRes.text || JSON.stringify(customFieldsRes.data)}`);
      assert(customFieldsRes.data?.fields?.[0]?.field_group === 'documents', 'Custom field group not set correctly');
      console.log('✅ Added custom fields to individual');

      // Stage 3: Related Parties & Final Custom Fields
      console.log('\n🔗 Stage 3: Related Parties & Final Custom Fields');

      // Add Organization-to-Individual Relationship (Director)
      log('Adding organization-to-individual relationship...');
      const orgIndRelRes = await request('POST', 'organization-entity-associations', {
        headers: authHeader,
        json: {
          organization_entity_id: organizationEntityId,
          individual_entity_id: linkingIndividualId,
          relationship_type: 'director',
          relationship_details: {
            position: 'Board Director',
            appointment_date: '2021-01-01',
            responsibilities: 'Strategic oversight and governance'
          },
          status: 'active'
        }
      });
      assert(orgIndRelRes.status === 201, `Create org-ind relationship failed: ${orgIndRelRes.text || JSON.stringify(orgIndRelRes.data)}`);
      console.log('✅ Added organization-to-individual relationship');

      // Add Organization-to-Organization Relationship (Subsidiary)
      log('Adding organization-to-organization relationship...');
      const orgOrgRelRes = await request('POST', 'organization-relationships', {
        headers: authHeader,
        json: {
          primary_organization_id: organizationSubId,
          related_organization_id: linkingOrganizationSubId,
          relationship_type: 'subsidiary',
          relationship_details: {
            ownership_percentage: 100,
            acquisition_date: '2021-06-01',
            relationship_nature: 'Wholly owned subsidiary'
          },
          status: 'active'
        }
      });
      assert(orgOrgRelRes.status === 201, `Create org-org relationship failed: ${orgOrgRelRes.text || JSON.stringify(orgOrgRelRes.data)}`);
      console.log('✅ Added organization-to-organization relationship');

      // Add Individual-to-Individual Relationship (Family)
      log('Adding individual-to-individual relationship...');
      const indIndRelRes = await request('POST', 'relationships', {
        headers: authHeader,
        json: {
          primary_individual_id: individualSubId,
          related_individual_id: linkingIndividualSubId,
          relationship_type: 'spouse',
          relationship_details: {
            relationship_nature: 'Married',
            relationship_start_date: '2020-01-01',
            relationship_description: 'Married couple'
          },
          status: 'active'
        }
      });
      assert(indIndRelRes.status === 201, `Create ind-ind relationship failed: ${indIndRelRes.text || JSON.stringify(indIndRelRes.data)}`);
      console.log('✅ Added individual-to-individual relationship');

      // Add Final Custom Fields to Organization
      log('Adding final custom fields to organization...');
      const finalCustomFieldsRes = await request('POST', `entities/${organizationEntityId}/custom-fields`, {
        headers: authHeader,
        json: {
          fields: [
            {
              field_name: 'beneficial_owner',
              field_value: 'John Doe',
              field_group: 'related_parties'
            },
            {
              field_name: 'ownership_percentage',
              field_value: '75',
              field_group: 'related_parties'
            }
          ]
        }
      });
      assert(finalCustomFieldsRes.status === 201, `Add final custom fields failed: ${finalCustomFieldsRes.text || JSON.stringify(finalCustomFieldsRes.data)}`);
      assert(finalCustomFieldsRes.data?.fields?.[0]?.field_group === 'related_parties', 'Final custom field group not set correctly');
      console.log('✅ Added final custom fields to organization');

      // Verification Tests
      console.log('\n✅ Verification Tests');

      // Verify all entities were created
      log('Verifying entities...');
      const verifyIndRes = await request('GET', `entities/${individualEntityId}`, {
        headers: authHeader
      });
      assert(verifyIndRes.status === 200, 'Individual entity verification failed');
      assert(verifyIndRes.data?.entity_type === 'individual', 'Individual entity type incorrect');

      const verifyOrgRes = await request('GET', `entities/${organizationEntityId}`, {
        headers: authHeader
      });
      assert(verifyOrgRes.status === 200, 'Organization entity verification failed');
      assert(verifyOrgRes.data?.entity_type === 'organization', 'Organization entity type incorrect');
      console.log('✅ All entities verified successfully');

      // Verify relationships
      log('Verifying relationships...');
      const verifyOrgAssocRes = await request('GET', `organization-entity-associations?organization_entity_id=${organizationEntityId}`, {
        headers: authHeader
      });
      assert(verifyOrgAssocRes.status === 200, 'Organization associations verification failed');
      assert(verifyOrgAssocRes.data?.data?.length > 0, 'No organization associations found');

      const verifyOrgRelRes = await request('GET', `organization-relationships?primary_organization_id=${organizationSubId}`, {
        headers: authHeader
      });
      assert(verifyOrgRelRes.status === 200, 'Organization relationships verification failed');
      assert(verifyOrgRelRes.data?.data?.length > 0, 'No organization relationships found');

      const verifyIndRelRes = await request('GET', `relationships?primary_individual_id=${individualSubId}`, {
        headers: authHeader
      });
      assert(verifyIndRelRes.status === 200, 'Individual relationships verification failed');
      assert(verifyIndRelRes.data?.data?.length > 0, 'No individual relationships found');
      console.log('✅ All relationships verified successfully');

      console.log('\n🎉 Entity Wizard Flow E2E Test completed successfully!');

    } finally {
      // Cleanup test file
      if (fs.existsSync(testPdfPath)) {
        fs.unlinkSync(testPdfPath);
        console.log('🧹 Cleaned up test PDF file');
      }
    }

    process.exit(0);
  } catch (err) {
    console.error('\n❌ Entity Wizard Flow E2E Test Failed:', err?.message || err);
    
    // Try to cleanup test file even on error
    try {
      const fs = await import('fs');
      const path = await import('path');
      const testPdfPath = path.join(process.cwd(), 'test-document.pdf');
      if (fs.existsSync(testPdfPath)) {
        fs.unlinkSync(testPdfPath);
      }
    } catch (cleanupErr) {
      // Ignore cleanup errors
    }
    
    process.exit(1);
  }
})();