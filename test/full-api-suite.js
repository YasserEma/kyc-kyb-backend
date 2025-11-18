(async () => {
  const verbose = process.argv.includes('--verbose');
  const baseUrl = (process.env.API_BASE_URL || 'http://localhost:3001/api/v1').replace(/\/$/, '');
  const timeoutMs = Number(process.env.API_TIMEOUT_MS || 30000);

  let myFetch = globalThis.fetch;
  let FormDataImpl = globalThis.FormData;
  let BlobImpl = globalThis.Blob;
  if (!myFetch || !FormDataImpl || !BlobImpl) {
    const undici = await import('node:undici');
    myFetch = myFetch || undici.fetch;
    FormDataImpl = FormDataImpl || undici.FormData;
    BlobImpl = BlobImpl || undici.Blob;
  }

  const log = (...args) => { if (verbose) console.log(...args); };

  async function request(method, path, { headers = {}, json, body, formData } = {}) {
    const url = `${baseUrl}/${String(path).replace(/^\/+/, '')}`;
    let finalHeaders = { ...headers };
    let requestBody = body;
    if (formData) {
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
      res = await myFetch(url, { method, headers: finalHeaders, body: requestBody, signal: controller.signal });
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
    } catch (_) {
      text = await res.text().catch(() => '');
    }
    log(`[${method}] ${path} -> ${res.status}`, data ?? text ?? '');
    return { status: res.status, ok: res.ok, data, text, headers: res.headers };
  }

  function assert(condition, message) {
    if (!condition) throw new Error(message);
  }

  try {
    const health = await request('GET', 'auth/health');
    assert(health.status === 200 && health.data?.status === 'ok', `Health check failed (${health.status})`);

    const ts = Date.now();
    const companyName = `FullSuite_${ts}`;
    const adminEmail = `full_admin_${ts}@example.com`;
    const adminPassword = 'SecurePassword123!';

    const registerRes = await request('POST', 'auth/register', {
      json: {
        companyName,
        companyType: 'LLC',
        jurisdiction: 'Delaware',
        companyContactPhone: '+15555550123',
        adminName: 'Full Suite Admin',
        adminEmail,
        adminPassword,
        adminPhoneNumber: '+15555550124',
      },
    });
    assert(registerRes.status === 201, `Register failed (${registerRes.status})`);
    const { subscriberId, adminUserId } = registerRes.data || {};
    assert(subscriberId && adminUserId, 'Missing subscriberId/adminUserId');

    const loginRes = await request('POST', 'auth/login', { json: { username: adminEmail, password: adminPassword } });
    assert(loginRes.status === 200 && loginRes.data?.access_token, `Login failed (${loginRes.status})`);
    const accessTokenAdmin = loginRes.data.access_token;
    const authAdmin = { Authorization: `Bearer ${accessTokenAdmin}` };

    const profileRes = await request('GET', 'auth/profile', { headers: authAdmin });
    assert(profileRes.status === 200 && profileRes.data?.id, 'Profile fetch failed');

    const indRes = await request('POST', 'entities/individual', {
      headers: authAdmin,
      json: {
        name: 'John Doe',
        date_of_birth: '1990-01-01',
        nationality: ['US'],
        is_pep: false,
        has_criminal_record: false,
      },
    });
    assert(indRes.status === 201 && indRes.data?.id, `Create individual failed (${indRes.status})`);
    const individualEntityId = indRes.data.id;

    const orgRes = await request('POST', 'entities/organization', {
      headers: authAdmin,
      json: {
        name: 'TestCorp Inc.',
        legal_name: 'TestCorp Inc.',
        country_of_incorporation: 'US',
        date_of_incorporation: '2010-01-01',
      },
    });
    assert(orgRes.status === 201 && orgRes.data?.id, `Create organization failed (${orgRes.status})`);
    const organizationEntityId = orgRes.data.id;

    const indDetails = await request('GET', `entities/${individualEntityId}`, { headers: authAdmin });
    assert(indDetails.status === 200 && indDetails.data?.entity_type === 'individual', 'Individual details failed');

    const orgDetails = await request('GET', `entities/${organizationEntityId}`, { headers: authAdmin });
    assert(orgDetails.status === 200 && orgDetails.data?.entity_type === 'organization', 'Organization details failed');

    const indSubRes = await request('GET', `entities/${individualEntityId}/individual`, { headers: authAdmin });
    assert(indSubRes.status === 200 && indSubRes.data?.id, 'Resolve individual sub-id failed');
    const individualSubId = indSubRes.data.id;

    const orgSubRes = await request('GET', `entities/${organizationEntityId}/organization`, { headers: authAdmin });
    assert(orgSubRes.status === 200 && orgSubRes.data?.id, 'Resolve organization sub-id failed');
    const organizationSubId = orgSubRes.data.id;

    const fs = await import('fs');
    const path = await import('path');
    const testPdfPath = path.join(process.cwd(), 'test-document.pdf');
    fs.writeFileSync(testPdfPath, '%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n>>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000015 00000 n \n0000000074 00000 n \n0000000120 00000 n \ntrailer\n<<\n/Size 4\n/Root 1 0 R\n>>\nstartxref\n179\n%%EOF');

    const fileBuffer = fs.readFileSync(testPdfPath);
    const base64 = Buffer.from(fileBuffer).toString('base64');

    const addCFRes = await request('POST', `entities/${individualEntityId}/custom-fields`, {
      headers: authAdmin,
      json: {
        custom_fields: [
          { field_name: 'occupation', field_value: 'Engineer', field_group: 'documents' },
          { field_name: 'annual_income', field_value: '100000', field_group: 'documents' },
        ],
      },
    });
    assert(addCFRes.status === 201 && Array.isArray(addCFRes.data?.fields), `Add custom fields failed (${addCFRes.status})`);

    const updateEntityRes = await request('PUT', `entities/${individualEntityId}`, {
      headers: authAdmin,
      json: { name: 'John D.', risk_level: 'MEDIUM', screening_status: 'IN_PROGRESS', onboarding_completed: true },
    });
    assert(updateEntityRes.status === 200 && updateEntityRes.data?.name === 'John D.', `Update entity failed (${updateEntityRes.status})`);

    const statusRes = await request('PATCH', `entities/${individualEntityId}/status`, {
      headers: authAdmin,
      json: { status: 'ACTIVE', reason: 'Activation' },
    });
    assert(statusRes.status === 200 && statusRes.data?.status === 'ACTIVE', `Update status failed (${statusRes.status})`);

    const bulkRes = await request('POST', 'entities/bulk', {
      headers: authAdmin,
      json: { action: 'suspend', entityIds: [individualEntityId, organizationEntityId], reason: 'Bulk suspend' },
    });
    assert(bulkRes.status === 200 && bulkRes.data?.count === 2, `Bulk action failed (${bulkRes.status})`);

    const historyRes = await request('GET', `entities/${individualEntityId}/history`, { headers: authAdmin });
    assert(historyRes.status === 200 && Array.isArray(historyRes.data), 'Get history failed');

    const exportRes = await request('GET', 'entities/export', { headers: authAdmin });
    assert(exportRes.status === 200 && typeof exportRes.text === 'string', 'Export entities failed');

    const linkingIndRes = await request('POST', 'entities/individual', {
      headers: authAdmin,
      json: { name: 'Jane Smith', date_of_birth: '1985-05-15', nationality: ['US'], is_pep: false, has_criminal_record: false },
    });
    assert(linkingIndRes.status === 201 && linkingIndRes.data?.id, `Create linking individual failed (${linkingIndRes.status})`);
    const linkingIndividualEntityId = linkingIndRes.data.id;
    const linkingIndSubRes = await request('GET', `entities/${linkingIndividualEntityId}/individual`, { headers: authAdmin });
    assert(linkingIndSubRes.status === 200 && linkingIndSubRes.data?.id, 'Resolve linking individual sub-id failed');
    const linkingIndividualSubId = linkingIndSubRes.data.id;

    const linkingOrgRes = await request('POST', 'entities/organization', {
      headers: authAdmin,
      json: { name: 'Subsidiary Corp', legal_name: 'Subsidiary Corp', country_of_incorporation: 'US', date_of_incorporation: '2021-06-01' },
    });
    assert(linkingOrgRes.status === 201 && linkingOrgRes.data?.id, `Create linking organization failed (${linkingOrgRes.status})`);
    const linkingOrganizationEntityId = linkingOrgRes.data.id;
    const linkingOrgSubRes = await request('GET', `entities/${linkingOrganizationEntityId}/organization`, { headers: authAdmin });
    assert(linkingOrgSubRes.status === 200 && linkingOrgSubRes.data?.id, 'Resolve linking organization sub-id failed');
    const linkingOrganizationSubId = linkingOrgSubRes.data.id;

    const relCreateRes = await request('POST', 'relationships', {
      headers: authAdmin,
      json: {
        primary_individual_id: individualSubId,
        related_individual_id: linkingIndividualSubId,
        relationship_type: 'spouse',
        relationship_status: 'active',
      },
    });
    assert(relCreateRes.status === 201 && relCreateRes.data?.id, `Create relationship failed (${relCreateRes.status})`);
    const relationshipId = relCreateRes.data.id;

    const relVerifyRes = await request('PATCH', `relationships/${relationshipId}/verify`, { headers: authAdmin, json: { is_verified: true, verification_method: 'document' } });
    assert(relVerifyRes.status === 200, `Verify relationship failed (${relVerifyRes.status})`);

    const nextReviewDate = new Date();
    nextReviewDate.setMonth(nextReviewDate.getMonth() + 6);
    const relReviewRes = await request('PATCH', `relationships/${relationshipId}/review`, { headers: authAdmin, json: { next_review_date: nextReviewDate.toISOString() } });
    assert(relReviewRes.status === 200, `Review relationship failed (${relReviewRes.status})`);

    const relRiskRes = await request('PATCH', `relationships/${relationshipId}/risk`, { headers: authAdmin, json: { risk_level: 'HIGH', risk_factors: 'Test factor' } });
    assert(relRiskRes.status === 200, `Risk update failed (${relRiskRes.status})`);

    const relListRes = await request('GET', `relationships/individual/${individualSubId}`, { headers: authAdmin });
    assert(relListRes.status === 200 && Array.isArray(relListRes.data?.items), 'List relationships failed');

    const relStatsRes = await request('GET', `relationships/stats?individual_id=${encodeURIComponent(individualSubId)}`, { headers: authAdmin });
    assert(relStatsRes.status === 200, 'Relationships stats failed');

    const orgAssocCreate = await request('POST', `organization-entity-associations?userId=${encodeURIComponent(profileRes.data.id)}`, {
      headers: authAdmin,
      json: {
        organization_entity_id: organizationEntityId,
        individual_entity_id: linkingIndividualEntityId,
        relationship_type: 'director',
        relationship_details: { position: 'Board Director' },
        status: 'active',
      },
    });
    assert(orgAssocCreate.status === 201 && orgAssocCreate.data?.id, `Create org-association failed (${orgAssocCreate.status})`);
    const orgAssocId = orgAssocCreate.data.id;

    const orgAssocList = await request('GET', `organization-entity-associations?organization_id=${encodeURIComponent(organizationEntityId)}`, { headers: authAdmin });
    assert(orgAssocList.status === 200, 'List org-associations failed');

    const orgAssocGet = await request('GET', `organization-entity-associations/${orgAssocId}`, { headers: authAdmin });
    assert(orgAssocGet.status === 200, 'Get org-association failed');

    const orgAssocVerify = await request('PUT', `organization-entity-associations/${orgAssocId}/verify?userId=${encodeURIComponent(profileRes.data.id)}`, { headers: authAdmin, json: { verification_status: 'verified', verification_notes: 'ok' } });
    assert(orgAssocVerify.status === 200, 'Verify org-association failed');

    const reviewDateStr = new Date().toISOString();
    const orgAssocReview = await request('PUT', `organization-entity-associations/${orgAssocId}/next-review?userId=${encodeURIComponent(profileRes.data.id)}`, { headers: authAdmin, json: { next_review_date: reviewDateStr } });
    assert(orgAssocReview.status === 200, 'Set next review failed');

    const orgAssocRisk = await request('PUT', `organization-entity-associations/${orgAssocId}/risk-level?userId=${encodeURIComponent(profileRes.data.id)}`, { headers: authAdmin, json: { risk_level: 'MEDIUM', risk_reason: 'test' } });
    assert(orgAssocRisk.status === 200, 'Update risk level failed');

    const orgAssocStats = await request('GET', `organization-entity-associations/organization/${organizationEntityId}/stats`, { headers: authAdmin });
    assert(orgAssocStats.status === 200, 'Org association stats failed');

    const orgRelCreate = await request('POST', 'organization-relationships', {
      headers: authAdmin,
      json: {
        primary_organization_id: organizationSubId,
        related_organization_id: linkingOrganizationSubId,
        relationship_type: 'subsidiary',
        verified: true,
      },
    });
    assert(orgRelCreate.status === 201 && orgRelCreate.data?.id, `Create org-relationship failed (${orgRelCreate.status})`);
    const orgRelId = orgRelCreate.data.id;

    const orgRelGet = await request('GET', `organization-relationships/${orgRelId}`, { headers: authAdmin });
    assert(orgRelGet.status === 200, 'Get org-relationship failed');

    const orgRelList = await request('GET', `organization-relationships?primary_organization_id=${encodeURIComponent(organizationSubId)}`, { headers: authAdmin });
    assert(orgRelList.status === 200, 'List org-relationships failed');

    const orgRelVerify = await request('PUT', `organization-relationships/${orgRelId}/verify?verified=true`, { headers: authAdmin });
    assert(orgRelVerify.status === 200, 'Verify org-relationship failed');

    const orgRelStats = await request('GET', `organization-relationships/organization/${organizationSubId}/statistics`, { headers: authAdmin });
    assert(orgRelStats.status === 200, 'Org relationship statistics failed');

    const downgradeRes = await request('PUT', `users/${adminUserId}`, { headers: authAdmin, json: { role: 'analyst' } });
    assert(downgradeRes.status === 200 && downgradeRes.data?.role === 'analyst', `Role downgrade failed (${downgradeRes.status})`);

    const reloginRes = await request('POST', 'auth/login', { json: { username: adminEmail, password: adminPassword } });
    assert(reloginRes.status === 200 && reloginRes.data?.access_token, `Re-login failed (${reloginRes.status})`);
    assert(reloginRes.data?.user?.role === 'analyst', `Expected analyst, got ${reloginRes.data?.user?.role}`);
    const authAnalyst = { Authorization: `Bearer ${reloginRes.data.access_token}` };

    const patchForbidden = await request('PATCH', `entities/${individualEntityId}/status`, { headers: authAnalyst, json: { status: 'ACTIVE', reason: 'rbac' } });
    assert(patchForbidden.status === 403, `Expected 403, got ${patchForbidden.status}`);

    const relAsAnalyst = await request('POST', 'relationships', { headers: authAnalyst, json: { primary_individual_id: individualSubId, related_individual_id: linkingIndividualSubId, relationship_type: 'sibling', relationship_status: 'active' } });
    assert(relAsAnalyst.status === 201, `Create relationship as analyst failed (${relAsAnalyst.status})`);

    fs.unlinkSync(testPdfPath);
    console.log('Full API suite passed');
    process.exit(0);
  } catch (err) {
    console.error('Full API suite failed:', err?.message || err);
    process.exit(1);
  }
})();