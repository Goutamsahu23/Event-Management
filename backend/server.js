// server.js
const http = require('http');
const app = require('./src/app');
const mongooseConfig = require('./src/config/mongoose');
const config = require('./src/config/config');

const server = http.createServer(app);

async function start() {
  try {
    await mongooseConfig.connect();
    mongooseConfig.setupGracefulShutdown();

    server.listen(config.port, () => {
      console.log(`Server listening on port ${config.port}`);
      console.log(`API docs (if any) at http://localhost:${config.port}/api`);
    });
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
}

start();
