/**
 * Phase 3 RBAC API Test Runner
 *
 * Flow:
 * 1) Register subscriber + admin
 * 2) Login as admin
 * 3) Create an individual entity
 * 4) Downgrade admin's role to analyst
 * 5) Re-login (role should reflect analyst)
 * 6) Attempt to PATCH entity status as analyst -> expect 403 Forbidden
 */

(async () => {
  const verbose = process.argv.includes('--verbose');
  const baseUrl = (process.env.API_BASE_URL || 'http://localhost:3001/api/v1').replace(/\/$/, '');
  const timeoutMs = Number(process.env.API_TIMEOUT_MS || 15000);

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

  try {
    // 0) Health check
    log('Checking health...');
    const health = await request('GET', 'auth/health');
    assert(health.status === 200, `Health check failed (status ${health.status}) — ensure server is running at ${baseUrl}`);
    assert((health.data && health.data.status) === 'ok', 'Health endpoint did not return ok');

    // 1) Register subscriber + admin
    const ts = Date.now();
    const companyName = `Phase3Co_${ts}`;
    const adminEmail = `phase3_admin_${ts}@example.com`;
    const adminPassword = 'SecurePassword123!';

    log('Registering subscriber and admin...');
    const registerRes = await request('POST', 'auth/register', {
      json: {
        companyName,
        companyType: 'LLC',
        jurisdiction: 'Delaware',
        companyContactPhone: '+15555550123',
        adminName: 'Alice Phase3',
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
    const adminAccessToken = loginRes.data?.access_token;
    assert(adminAccessToken, 'Login response missing access_token');
    assert(loginRes.data?.user?.role === 'admin', `Expected role admin after first login, got ${loginRes.data?.user?.role}`);

    const authHeaderAdmin = { Authorization: `Bearer ${adminAccessToken}` };

    // 3) Create an individual entity
    log('Creating an individual entity...');
    const individualRes = await request('POST', 'entities/individual', {
      headers: authHeaderAdmin,
      json: {
        name: 'John Testerson',
        date_of_birth: '1990-01-01',
        nationality: ['US'],
        is_pep: false,
        has_criminal_record: false,
      },
    });
    assert(individualRes.status === 201, `Create individual failed (status ${individualRes.status}): ${individualRes.text || JSON.stringify(individualRes.data)}`);
    const entityId = individualRes.data?.id;
    assert(entityId, 'Create individual response missing id');
    log('Created individual entity:', { entityId });

    // 4) Downgrade admin's role to analyst
    log('Downgrading admin role to analyst...');
    const downgradeRes = await request('PUT', `users/${adminUserId}`, {
      headers: authHeaderAdmin,
      json: { role: 'analyst' },
    });
    assert(downgradeRes.status === 200, `Role downgrade failed (status ${downgradeRes.status}): ${downgradeRes.text || JSON.stringify(downgradeRes.data)}`);
    assert((downgradeRes.data && downgradeRes.data.role) === 'analyst', 'Role did not update to analyst');

    // 5) Re-login and confirm role is analyst
    log('Re-logging in to reflect updated role...');
    const reloginRes = await request('POST', 'auth/login', {
      json: { username: adminEmail, password: adminPassword },
    });
    assert(reloginRes.status === 200, `Re-login failed (status ${reloginRes.status})`);
    const analystAccessToken = reloginRes.data?.access_token;
    assert(analystAccessToken, 'Re-login response missing access_token');
    assert(reloginRes.data?.user?.role === 'analyst', `Expected role analyst after re-login, got ${reloginRes.data?.user?.role}`);
    const authHeaderAnalyst = { Authorization: `Bearer ${analystAccessToken}` };

    // 6) Attempt to PATCH entity status as analyst -> expect 403
    log('Attempting to update entity status as analyst (should be forbidden)...');
    const patchRes = await request('PATCH', `entities/${entityId}/status`, {
      headers: authHeaderAnalyst,
      json: { status: 'ACTIVE', reason: 'Testing RBAC' },
    });
    assert(patchRes.status === 403, `Expected 403 Forbidden when analyst updates status, got ${patchRes.status}`);

    console.log('Phase 3 RBAC test passed: analyst is forbidden from updating entity status (403).');
    process.exit(0);
  } catch (err) {
    console.error('[Phase 3 RBAC test] Failed:', err?.message || err);
    process.exit(1);
  }
})();