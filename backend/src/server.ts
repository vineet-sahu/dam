import 'dotenv/config';
import app from './app';
import logger from './utils/logger';
import { connectDatabase } from './config/database';
import { initializeMinIOBuckets } from './utils/initMinio';

const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

const startServer = async () => {
  try {
    await connectDatabase();
    logger.info('Database connected successfully');

    await initializeMinIOBuckets();
    logger.info('MinIO buckets initialized');

    const server = app.listen(PORT, () => {
      logger.info(`DAM API Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
      if (!isProduction) logger.info(`Health check: http://localhost:${PORT}/health`);
    });

    server.on('connection', (socket) => socket.setNoDelay(true));
  } catch (error) {
    logger.error('Server startup failed:', error);
    process.exit(1);
  }
};

startServer();
