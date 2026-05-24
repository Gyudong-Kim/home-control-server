const axios = require('axios');
const fs = require('fs');
const path = require('path');
const config = require('../config');

const ENV_FILE = path.join(__dirname, '../../.env');

function persistRefreshToken(token) {
  try {
    let content = fs.readFileSync(ENV_FILE, 'utf-8');
    if (content.match(/^SMARTTHINGS_REFRESH_TOKEN=.*/m)) {
      content = content.replace(/^SMARTTHINGS_REFRESH_TOKEN=.*/m, `SMARTTHINGS_REFRESH_TOKEN=${token}`);
    } else {
      content += `\nSMARTTHINGS_REFRESH_TOKEN=${token}`;
    }
    fs.writeFileSync(ENV_FILE, content);
  } catch (err) {
    console.error('[WARN] Failed to persist refresh token:', err.message);
  }
}

const TOKEN_URL = 'https://api.smartthings.com/oauth/token';
const API_BASE = 'https://api.smartthings.com/v1';

let accessToken = null;
let refreshToken = config.smartthings.refreshToken;
let renewalTimer = null;

function basicAuthHeader() {
  const credentials = Buffer.from(
    `${config.smartthings.clientId}:${config.smartthings.clientSecret}`
  ).toString('base64');
  return `Basic ${credentials}`;
}

function scheduleRenewal(expiresIn) {
  if (renewalTimer) clearTimeout(renewalTimer);
  const delay = Math.max((expiresIn - 60) * 1000, 0);
  renewalTimer = setTimeout(async () => {
    try {
      await refreshAccessToken();
    } catch (err) {
      console.error('Token auto-renewal failed:', err.message);
      process.exit(1);
    }
  }, delay);
}

async function refreshAccessToken() {
  const response = await axios.post(
    TOKEN_URL,
    new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refreshToken }),
    {
      headers: {
        Authorization: basicAuthHeader(),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );

  const { access_token, refresh_token, expires_in } = response.data;
  accessToken = access_token;
  if (refresh_token) {
    refreshToken = refresh_token;
    persistRefreshToken(refresh_token);
  }
  scheduleRenewal(expires_in);
}

async function init() {
  try {
    await refreshAccessToken();
  } catch (err) {
    console.error('SmartThings token initialization failed:', err.message);
    process.exit(1);
  }
}

async function getDeviceStatus(deviceId) {
  const response = await axios.get(
    `${API_BASE}/devices/${deviceId}/components/main/capabilities/switch/status`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  return response.data.switch.value;
}

async function sendCommand(deviceId, command) {
  await axios.post(
    `${API_BASE}/devices/${deviceId}/commands`,
    {
      commands: [{ component: 'main', capability: 'switch', command }],
    },
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
}

module.exports = { init, getDeviceStatus, sendCommand };
