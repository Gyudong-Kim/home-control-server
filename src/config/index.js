require('dotenv').config();

const required = [
  'API_KEY',
  'SMARTTHINGS_CLIENT_ID',
  'SMARTTHINGS_CLIENT_SECRET',
  'SMARTTHINGS_REFRESH_TOKEN',
];

for (const key of required) {
  if (!process.env[key]) {
    console.error(`Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

module.exports = Object.freeze({
  port: process.env.PORT || 3000,
  apiKey: process.env.API_KEY,
  smartthings: {
    clientId: process.env.SMARTTHINGS_CLIENT_ID,
    clientSecret: process.env.SMARTTHINGS_CLIENT_SECRET,
    refreshToken: process.env.SMARTTHINGS_REFRESH_TOKEN,
  },
});
