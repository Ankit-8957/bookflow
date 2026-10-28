require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  JWT_SECRET: process.env.JWT_SECRET || 'bookleaf_default_jwt_secret_dev',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bookleaf_portal',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  OPENAI_BASE_URL: process.env.OPENAI_BASE_URL || (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.startsWith('sk-or-') ? 'https://openrouter.ai/api/v1' : undefined),
};
