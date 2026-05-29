import { execSync } from 'child_process';

// Simulate a client dossier request
async function testClientDossierEndpoint() {
  try {
    // Simulate a JWT token (you can generate a real token using jose)
    const CLIENT_ID = 'client_12345';
    const fakeToken = `session=${Buffer.from(JSON.stringify({ id: CLIENT_ID, role: 'client' }), 'utf8').toString('base64')}`;

    // Prepare curl command
    const curlCmd = `curl -s -X GET 'http://localhost:3000/api/dossiers/client/${CLIENT_ID}' \
      -H 'Cookie: ${fakeToken}' \
      -H 'Content-Type: application/json'`;

    // Execute the curl command
    const result = execSync(curlCmd, { encoding: 'utf-8' });
    console.log('Client dossier endpoint response:', result);

    // Validate response
    const data = JSON.parse(result);
    if (data && typeof data === 'object' && 'documents' in data) {
      console.log('✅ Client dossier endpoint works correctly.');
    } else {
      console.error('❌ Unexpected response from client dossier endpoint:', data);
    }
  } catch (error: any) {
    console.error('❌ Error testing client dossier endpoint:', error.message || error);
  }
}

testClientDossierEndpoint();
