const { OpenAI } = require('openai');
const env = require('../config/env');

const clientConfig = { apiKey: env.OPENAI_API_KEY };
if (env.OPENAI_BASE_URL) {
  clientConfig.baseURL = env.OPENAI_BASE_URL;
}

const openai = env.OPENAI_API_KEY ? new OpenAI(clientConfig) : null;

module.exports = openai;
