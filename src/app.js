const config = require('./config');
const express = require('express');
const smartthings = require('./services/smartthings');
const expressLoader = require('./loaders/express');

async function main() {
  await smartthings.init();

  const app = express();
  expressLoader(app);

  app.listen(config.port, () => {
    console.log(`Server listening on port ${config.port}`);
  });
}

main().catch((err) => {
  console.error('Fatal error during startup:', err.message);
  process.exit(1);
});
