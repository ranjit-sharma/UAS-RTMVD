// src/server.js
import { env } from './config/env.js';
import { connectDatabase } from './config/database.js';
import { createApp } from './app.js';
import { logger } from './utils/logger.js';
import { createServer } from 'http';
import { initSocketServer } from './sockets/socket.server.js';
import { startUdpLanListener, startTcpLanListener } from './collectors/lanReceiver.js';

import { DataCollection } from './models/dataCollection.model.js';

async function start() {
  try {
    await connectDatabase();

    // Feature 7: Automatic Session Recovery
    // If the backend restarted unexpectedly while a session was running, it's an orphan.
    const orphans = await DataCollection.updateMany(
      { status: 'running' },
      { $set: { status: 'failed', endedAt: new Date() } }
    );
    if (orphans.modifiedCount > 0) {
      logger.warn(`Recovered and marked ${orphans.modifiedCount} orphaned sessions as failed.`);
    }

    const app = createApp();
    const httpServer = createServer(app);

    // Socket.IO is initialized here so it shares the HTTP server
    initSocketServer(httpServer);

    // Initialize LAN Cable UDP/TCP Physical Sensor Receivers
    try {
      startUdpLanListener(5001);
      startTcpLanListener(5002);
    } catch (lanErr) {
      logger.warn({ lanErr }, 'LAN Cable receiver startup skipped');
    }

    httpServer.listen(env.port, () => {
      logger.info(
        { port: env.port, env: env.nodeEnv },
        'UAS-RTMVD server started'
      );
    });
  } catch (err) {
    logger.error({ err }, 'Server startup failed');
    process.exit(1);
  }
}

start();

