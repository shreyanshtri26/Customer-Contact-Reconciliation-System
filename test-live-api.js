#!/usr/bin/env node

/**
 * Test script for the live Bitespeed Identity Reconciliation API
 * Run with: node test-live-api.js
 */

const https = require('https');

const API_BASE_URL = 'https://bitespeed-identity-reconciliation.onrender.com';

// Test cases
const testCases = [
  {
    name: '1. Create new contact with email only',
    data: { email: 'test1@example.com' }
  },
  {
    name: '2. Create new contact with phone only',
    data: { phoneNumber: '555-1111' }
  },
  {
    name: '3. Create new contact with both email and phone',
    data: { email: 'test3@example.com', phoneNumber: '555-3333' }
  },
  {
    name: '4. Add secondary contact with matching phone',
    data: { email: 'secondary@example.com', phoneNumber: '555-3333' }
  },
  {
    name: '5. Add secondary contact with matching email',
    data: { email: 'test3@example.com', phoneNumber: '555-4444' }
  },
  {
    name: '6. Exact match (should not create new record)',
    data: { email: 'test3@example.com', phoneNumber: '555-3333' }
  }
];

function makeRequest(data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: 'bitespeed-identity-reconciliation.onrender.com',
      port: 443,
      path: '/api/identify',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({
            statusCode: res.statusCode,
            data: parsed
          });
        } catch (error) {
          reject(new Error(`Failed to parse response: ${responseData}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Testing Live Bitespeed Identity Reconciliation API\n');
  console.log(`📍 API Endpoint: ${API_BASE_URL}/api/identify\n`);

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`\n${testCase.name}`);
    console.log(`📤 Request: ${JSON.stringify(testCase.data)}`);
    
    try {
      const response = await makeRequest(testCase.data);
      console.log(`📥 Response (${response.statusCode}):`);
      console.log(JSON.stringify(response.data, null, 2));
      
      if (response.statusCode === 200) {
        console.log('✅ PASS');
      } else {
        console.log('❌ FAIL - Unexpected status code');
      }
    } catch (error) {
      console.log(`❌ FAIL - ${error.message}`);
    }
    
    // Add delay between requests
    if (i < testCases.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.log('\n🎉 Test suite completed!');
}

// Health check
async function healthCheck() {
  console.log('🏥 Checking API health...');
  
  try {
    const response = await new Promise((resolve, reject) => {
      const req = https.request({
        hostname: 'bitespeed-identity-reconciliation.onrender.com',
        port: 443,
        path: '/health',
        method: 'GET'
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve({ statusCode: res.statusCode, data: JSON.parse(data) });
          } catch (error) {
            reject(error);
          }
        });
      });
      
      req.on('error', reject);
      req.end();
    });

    console.log(`✅ Health check passed: ${JSON.stringify(response.data)}`);
    return true;
  } catch (error) {
    console.log(`❌ Health check failed: ${error.message}`);
    return false;
  }
}

// Main execution
async function main() {
  const isHealthy = await healthCheck();
  
  if (isHealthy) {
    await runTests();
  } else {
    console.log('\n⚠️  API appears to be down. Please check your deployment.');
    process.exit(1);
  }
}

main().catch(console.error); 