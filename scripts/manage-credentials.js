#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const readline = require('readline');

const CREDENTIALS_PATH = path.join(__dirname, '../src/config/livekit-credentials.json');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

// Generate a random API key
function generateApiKey() {
  return 'DEMO_KEY_' + crypto.randomBytes(8).toString('hex').toUpperCase();
}

// Load existing credentials
function loadCredentials() {
  if (fs.existsSync(CREDENTIALS_PATH)) {
    return JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
  }
  return { credentials: {} };
}

// Save credentials
function saveCredentials(data) {
  fs.writeFileSync(CREDENTIALS_PATH, JSON.stringify(data, null, 2));
}

async function addCredential() {
  const data = loadCredentials();
  
  console.log('\n=== Add New LiveKit Credential ===\n');
  
  const name = await question('Customer/Demo Name: ');
  const secret = await question('LiveKit API Secret: ');
  const url = await question('LiveKit WebSocket URL (wss://...): ');
  
  const apiKey = generateApiKey();
  
  data.credentials[apiKey] = {
    secret,
    url,
    name
  };
  
  saveCredentials(data);
  
  console.log('\n✅ Credential added successfully!');
  console.log(`API Key: ${apiKey}`);
  console.log('Share this API key with your customer.\n');
}

async function listCredentials() {
  const data = loadCredentials();
  
  console.log('\n=== LiveKit Credentials ===\n');
  
  const credentials = Object.entries(data.credentials);
  if (credentials.length === 0) {
    console.log('No credentials found.\n');
    return;
  }
  
  credentials.forEach(([key, value]) => {
    console.log(`API Key: ${key}`);
    console.log(`  Name: ${value.name}`);
    console.log(`  URL: ${value.url}`);
    console.log(`  Secret: ${value.secret.substring(0, 10)}...`);
    console.log('');
  });
}

async function removeCredential() {
  const data = loadCredentials();
  
  console.log('\n=== Remove Credential ===\n');
  
  const apiKey = await question('Enter API Key to remove: ');
  
  if (data.credentials[apiKey]) {
    delete data.credentials[apiKey];
    saveCredentials(data);
    console.log('\n✅ Credential removed successfully!\n');
  } else {
    console.log('\n❌ API Key not found.\n');
  }
}

async function main() {
  console.log('\n🔐 LiveKit Credentials Manager\n');
  console.log('1. Add new credential');
  console.log('2. List all credentials');
  console.log('3. Remove credential');
  console.log('4. Exit\n');
  
  const choice = await question('Select an option (1-4): ');
  
  switch (choice) {
    case '1':
      await addCredential();
      break;
    case '2':
      await listCredentials();
      break;
    case '3':
      await removeCredential();
      break;
    case '4':
      rl.close();
      process.exit(0);
    default:
      console.log('\n❌ Invalid option.\n');
  }
  
  rl.close();
}

main().catch(console.error);