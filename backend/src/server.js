const http = require('http');
const app = require('./app');
const env = require('./config/env');
const connectDB = require('./config/db');
const { initSocket } = require('./config/socket');

const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

const startServer = async () => {
  try {
    await connectDB();
    server.listen(env.PORT, () => {
      console.log(`🚀 BookLeaf Portal Server running on port ${env.PORT} [${env.NODE_ENV}]`);
    });
  } catch (err) {
    console.error('Fatal: Failed to connect to MongoDB, starting server anyway for diagnostics...');
    server.listen(env.PORT, () => {
      console.log(`⚠️ BookLeaf Portal Server running on port ${env.PORT} without DB connection`);
    });
  }
};

startServer();
