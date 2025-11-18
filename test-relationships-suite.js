/**
 * Individual Relationships API Test Runner
 *
 * Flow:
 * 1) Register subscriber + admin
 * 2) Login as admin
 * 3) Create two individual entities
 * 4) Resolve their individual profile IDs via new endpoint
 * 5) Downgrade admin role to analyst and re-login
 * 6) Create a relationship as analyst
 * 7) Verify, set review date, update risk
 * 8) List relationships and stats to assert updates
 */

(async () => {
  const verbose = process.argv.includes('--verbose');
  const baseUrl = (process.env.API_BASE_URL || 'http://localhost:3001/api/v1').replace(/\/$/, '');
  const timeoutMs = Number(process.env.API_TIMEOUT_MS || 15000);

  let myFetch = globalThis.fetch;
  if (!myFetch) {
    try {
      const undici = await import('node:undici');
      myFetch = undici.fetch;
    } catch (err) {
      console.error('Fetch API not available in this Node runtime.');
      process.exit(1);
    }
  }

  const log = (...args) => { if (verbose) console.log(...args); };

  async function request(method, path, { headers = {}, json, body } = {}) {
    const url = `${baseUrl}/${String(path).replace(/^\/+/, '')}`;
    const finalHeaders = { 'Content-Type': 'application/json', ...headers };
    const controller = new AbortController();
    const to = setTimeout(() => controller.abort(), timeoutMs);
    let res;
    try {
      res = await myFetch(url, {
        method,
        headers: finalHeaders,
        body: json ? JSON.stringify(json) : body,
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
      text = await res.text().catch(() => '');
    }

    log(`[${method}] ${path} -> ${res.status}`, data ?? text ?? '');
    return { status: res.status, ok: res.ok, data, text, headers: res.headers };
  }

  function assert(condition, message) {
    if (!condition) throw new Error(message);
  }

  try {
    // 0) Health check
    const health = await request('GET', 'auth/health');
    assert(health.status === 200, `Health check failed (status ${health.status}) — ensure server is running at ${baseUrl}`);
    assert((health.data && health.data.status) === 'ok', 'Health endpoint did not return ok');

    // 1) Register subscriber + admin
    const ts = Date.now();
    const companyName = `RelSuite_${ts}`;
    const adminEmail = `rels_admin_${ts}@example.com`;
    const adminPassword = 'SecurePassword123!';

    const registerRes = await request('POST', 'auth/register', {
      json: {
        companyName,
        companyType: 'LLC',
        jurisdiction: 'Delaware',
        companyContactPhone: '+15550001234',
        adminName: 'Bob RelSuite',
        adminEmail,
        adminPassword,
        adminPhoneNumber: '+15550001235',
      },
    });
    assert(registerRes.status === 201, `Register failed (status ${registerRes.status}): ${registerRes.text || JSON.stringify(registerRes.data)}`);
    const { subscriberId, adminUserId } = registerRes.data || {};
    assert(subscriberId && adminUserId, 'Register response missing subscriberId or adminUserId');

    // 2) Login as admin
    const loginRes = await request('POST', 'auth/login', { json: { username: adminEmail, password: adminPassword } });
    assert(loginRes.status === 200, `Login failed (status ${loginRes.status}): ${loginRes.text || JSON.stringify(loginRes.data)}`);
    const adminAccessToken = loginRes.data?.access_token;
    assert(adminAccessToken, 'Login response missing access_token');
    const authHeaderAdmin = { Authorization: `Bearer ${adminAccessToken}` };

    // 3) Create first individual entity
    const ind1Res = await request('POST', 'entities/individual', {
      headers: authHeaderAdmin,
      json: {
        name: 'Alice Relationship',
        date_of_birth: '1988-03-14',
        nationality: ['US'],
        is_pep: false,
        has_criminal_record: false,
      },
    });
    assert(ind1Res.status === 201, `Create individual1 failed (${ind1Res.status})`);
    const entityId1 = ind1Res.data?.id;
    assert(entityId1, 'Create individual1 missing entity id');

    // Create second individual entity
    const ind2Res = await request('POST', 'entities/individual', {
      headers: authHeaderAdmin,
      json: {
        name: 'Charlie Relationship',
        date_of_birth: '1992-07-22',
        nationality: ['US'],
        is_pep: false,
        has_criminal_record: false,
      },
    });
    assert(ind2Res.status === 201, `Create individual2 failed (${ind2Res.status})`);
    const entityId2 = ind2Res.data?.id;
    assert(entityId2, 'Create individual2 missing entity id');

    // 4) Resolve individual profile IDs
    const prof1Res = await request('GET', `entities/${entityId1}/individual`, { headers: authHeaderAdmin });
    assert(prof1Res.status === 200 && prof1Res.data?.id, 'Failed to resolve individual profile for entity1');
    const individualId1 = prof1Res.data.id;

    const prof2Res = await request('GET', `entities/${entityId2}/individual`, { headers: authHeaderAdmin });
    assert(prof2Res.status === 200 && prof2Res.data?.id, 'Failed to resolve individual profile for entity2');
    const individualId2 = prof2Res.data.id;

    // 5) Downgrade admin role to analyst and re-login
    const downgradeRes = await request('PUT', `users/${adminUserId}`, { headers: authHeaderAdmin, json: { role: 'analyst' } });
    assert(downgradeRes.status === 200 && downgradeRes.data?.role === 'analyst', 'Role downgrade to analyst failed');

    const reloginRes = await request('POST', 'auth/login', { json: { username: adminEmail, password: adminPassword } });
    assert(reloginRes.status === 200, `Re-login failed (${reloginRes.status})`);
    const analystAccessToken = reloginRes.data?.access_token;
    assert(analystAccessToken, 'Re-login missing access token');
    const authHeaderAnalyst = { Authorization: `Bearer ${analystAccessToken}` };

    // 6) Create a relationship as analyst
    const relCreateRes = await request('POST', 'relationships', {
      headers: authHeaderAnalyst,
      json: {
        primary_individual_id: individualId1,
        related_individual_id: individualId2,
        relationship_type: 'sibling',
        relationship_status: 'active',
        relationship_start_date: '2024-01-01',
        ownership_percentage: null,
      },
    });
    assert(relCreateRes.status === 201, `Create relationship failed (${relCreateRes.status}): ${relCreateRes.text || JSON.stringify(relCreateRes.data)}`);
    const relationshipId = relCreateRes.data?.id;
    assert(relationshipId, 'Create relationship response missing id');

    // 7) Verify, set review date, update risk (analyst allowed)
    const verifyRes = await request('PATCH', `relationships/${relationshipId}/verify`, {
      headers: authHeaderAnalyst,
      json: { is_verified: true, verification_method: 'document' },
    });
    assert(verifyRes.status === 200, `Verify relationship failed (${verifyRes.status})`);

    const nextReviewDate = new Date();
    nextReviewDate.setMonth(nextReviewDate.getMonth() + 6);
    const reviewRes = await request('PATCH', `relationships/${relationshipId}/review`, {
      headers: authHeaderAnalyst,
      json: { next_review_date: nextReviewDate.toISOString() },
    });
    assert(reviewRes.status === 200, `Review update failed (${reviewRes.status})`);

    const riskRes = await request('PATCH', `relationships/${relationshipId}/risk`, {
      headers: authHeaderAnalyst,
      json: { risk_level: 'HIGH', risk_factors: 'Family dispute history' },
    });
    assert(riskRes.status === 200, `Risk update failed (${riskRes.status})`);

    // 8) List relationships and stats to assert
    const listRes = await request('GET', `relationships/individual/${individualId1}`, { headers: authHeaderAnalyst });
    assert(listRes.status === 200 && Array.isArray(listRes.data?.items), 'List relationships failed or missing items');
    const createdRel = listRes.data.items.find(r => r.id === relationshipId);
    assert(createdRel, 'Created relationship not found in list');
    assert(createdRel.is_verified === true, 'Relationship not marked verified');
    assert(createdRel.risk_level === 'HIGH', 'Risk level not updated');

    const statsRes = await request('GET', `relationships/stats?individual_id=${encodeURIComponent(individualId1)}`, { headers: authHeaderAnalyst });
    assert(statsRes.status === 200, `Stats endpoint failed (${statsRes.status})`);
    assert(statsRes.data?.total_relationships >= 1, 'Stats total_relationships not incremented');

    console.log('Relationships suite passed: created, verified, reviewed, and updated risk successfully.');
    process.exit(0);
  } catch (err) {
    console.error('[Relationships suite] Failed:', err?.message || err);
    process.exit(1);
  }
})();