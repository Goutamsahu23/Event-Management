const mongoose = require('mongoose');
const config = require('./config');

async function connect() {
  const uri = config.mongoUri;
  if (!uri) {
    throw new Error('MONGO_URI is not defined in environment');
  }
  mongoose.set('strictQuery', false);
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log('MongoDB connected:', uri);
}

function disconnect() {
  return mongoose.disconnect();
}

// Optional: handle process termination gracefully
function setupGracefulShutdown() {
  const shutdown = async () => {
    try {
      await mongoose.disconnect();
      console.log('MongoDB disconnected due to app termination');
      process.exit(0);
    } catch (err) {
      console.error('Error during MongoDB disconnect', err);
      process.exit(1);
    }
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

module.exports = { connect, disconnect, setupGracefulShutdown };
