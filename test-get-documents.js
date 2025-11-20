/**
 * Test GET documents endpoint
 */

(async () => {
  const myFetch = globalThis.fetch || (await import('node:undici')).fetch;
  const baseUrl = 'http://localhost:3001/api/v1';

  async function request(method, path, { headers = {}, json, body } = {}) {
    const url = `${baseUrl}/${String(path).replace(/^\/+/, '')}`;
    const finalHeaders = { 'Content-Type': 'application/json', ...headers };
    
    console.log(`\n=== REQUEST ===`);
    console.log(`${method} ${url}`);
    if (json) console.log('Body:', JSON.stringify(json, null, 2));
    
    const res = await myFetch(url, {
      method,
      headers: finalHeaders,
      body: json ? JSON.stringify(json) : body,
    });

    const data = await res.json().catch(() => null);
    console.log(`\n=== RESPONSE ===`);
    console.log(`Status: ${res.status}`);
    if (data) console.log('Body:', JSON.stringify(data, null, 2));
    
    return { status: res.status, data };
  }

  try {
    // 1. Register and login
    console.log('=== STEP 1: Register and Login ===');
    const ts = Date.now();
    const registerRes = await request('POST', 'auth/register', {
      json: {
        companyName: `TestCo_${ts}`,
        companyAddress: '123 Test St',
        companyType: 'LLC',
        jurisdiction: 'Delaware',
        companyContactPhone: '+15555550123',
        adminName: 'Test Admin',
        adminEmail: `test_admin_${ts}@example.com`,
        adminPassword: 'SecurePassword123!',
      },
    });
    
    if (registerRes.status !== 201) throw new Error('Registration failed');
    
    const loginRes = await request('POST', 'auth/login', {
      json: { username: `test_admin_${ts}@example.com`, password: 'SecurePassword123!' },
    });
    
    if (loginRes.status !== 200) throw new Error('Login failed');
    
    const authHeader = { Authorization: `Bearer ${loginRes.data.access_token}` };
    
    // 2. Test GET documents endpoint
    console.log('\n=== STEP 2: Test GET Documents Endpoint ===');
    const entityId = 'e8382fdb-1638-40fb-9f19-6d8bf2dd218c';
    const documentsRes = await request('GET', `entities/${entityId}/documents`, {
      headers: authHeader,
    });
    
    if (documentsRes.status === 200) {
      console.log('\n✅ SUCCESS: GET documents endpoint is working!');
      console.log(`Found ${documentsRes.data.data?.length || 0} documents`);
    } else {
      console.log('\n❌ FAILED: GET documents endpoint returned error');
    }
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
  }
})();