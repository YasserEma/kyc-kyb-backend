/**
 * Debug Organization Creation Test
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
        companyName: `DebugCo_${ts}`,
        companyType: 'LLC',
        jurisdiction: 'Delaware',
        companyContactPhone: '+15555550123',
        adminName: 'Debug Test Admin',
        adminEmail: `debug_admin_${ts}@example.com`,
        adminPassword: 'SecurePassword123!',
        adminPhoneNumber: '+15555550124',
      },
    });
    
    if (registerRes.status !== 201) throw new Error('Registration failed');
    
    const loginRes = await request('POST', 'auth/login', {
      json: { username: `debug_admin_${ts}@example.com`, password: 'SecurePassword123!' },
    });
    
    if (loginRes.status !== 200) throw new Error('Login failed');
    
    const authHeader = { Authorization: `Bearer ${loginRes.data.access_token}` };
    
    // 2. Test organization creation with minimal data
    console.log('\n=== STEP 2: Test Minimal Organization Creation ===');
    const orgRes1 = await request('POST', 'entities/organization', {
      headers: authHeader,
      json: {
        name: 'TestCorp Inc.',
        legal_name: 'TestCorp Inc.',
        country_of_incorporation: 'US',
        date_of_incorporation: '2010-01-01'
      }
    });
    
    if (orgRes1.status === 201) {
      console.log('✅ Minimal organization creation succeeded!');
    } else {
      console.log('❌ Minimal organization creation failed');
      
      // 3. Try with even more minimal data
      console.log('\n=== STEP 3: Test Ultra-Minimal Organization Creation ===');
      const orgRes2 = await request('POST', 'entities/organization', {
        headers: authHeader,
        json: {
          name: 'TestCorp Inc.',
          legal_name: 'TestCorp Inc.',
          country_of_incorporation: 'US',
          date_of_incorporation: '2010-01-01'
        }
      });
      
      if (orgRes2.status === 201) {
        console.log('✅ Ultra-minimal organization creation succeeded!');
      } else {
        console.log('❌ Ultra-minimal organization creation also failed');
      }
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
})();