const dotenv = require('dotenv');
const path = require('path');

dotenv.config({
  path: process.env.NODE_ENV === 'test' ? path.resolve(__dirname, '../../.env.test') : path.resolve(__dirname, '../../.env')
});

module.exports = {
  port: process.env.PORT || 4000,
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/eventdb',
  jwtSecret: process.env.JWT_SECRET || 'dev_secret',
  frontendOrigin: process.env.FRONTEND_ORIGIN || 'http://localhost:3000',
  nodeEnv: process.env.NODE_ENV || 'development',
};
