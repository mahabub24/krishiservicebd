import app from './app';
import { config } from './config';

const server = app.listen(config.port, () => {
  console.log(`[Krishi Service BD Server] চালু হয়েছে: http://localhost:${config.port}`);
  console.log(`[Environment]: ${config.nodeEnv}`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
