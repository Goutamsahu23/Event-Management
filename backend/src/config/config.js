const dotenv = require('dotenv');
const path = require('path');

dotenv.config({
  path: process.env.NODE_ENV === 'test' ? path.resolve(__dirname, '../../.env.test') : path.resolve(__dirname, '../../.env')
});

module.exports = {
  port: process.env.PORT || 4000,
  mongoUri: process.env.MONGO_URI || 'mongodb+srv://goutamsahu602:heFEljZh96ehNuOs@cluster0.yf7o4r2.mongodb.net/eventdb',
  jwtSecret: process.env.JWT_SECRET || 'dev_secret',
  frontendOrigin: process.env.FRONTEND_ORIGIN || 'http://localhost:3000',
  nodeEnv: process.env.NODE_ENV || 'development',
};
