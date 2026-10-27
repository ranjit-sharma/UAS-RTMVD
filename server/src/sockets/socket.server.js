// src/sockets/socket.server.js
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { initBroadcast } from '../services/collection.service.js';

let _io = null;

/**
 * Initializes the Socket.IO server on the given HTTP server.
 * Must be called once from server.js.
 */
export function initSocketServer(httpServer) {
  _io = new Server(httpServer, {
    cors: {
      origin: env.clientUrl,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    // Limit payload size
    maxHttpBufferSize: 1e5, // 100 KB
  });

  // Authenticate every incoming socket connection via the JWT cookie.
  // The cookie is available in the Socket.IO handshake headers.
  _io.use(authenticateSocket);

  _io.on('connection', (socket) => {
    const { userId, role } = socket.data;
    logger.info({ userId, role, socketId: socket.id }, 'Socket connected');

    socket.on('disconnect', (reason) => {
      logger.debug(
        { userId, socketId: socket.id, reason },
        'Socket disconnected'
      );
    });

    // Reject all client-emitted data events â€” the server controls the data source.
    // Clients may only listen; they cannot emit events that modify data.
  });

  // Register the broadcast function with the collection service
  initBroadcast((event, payload) => {
    _io.emit(event, payload);
  });

  logger.info('Socket.IO server initialized');
  return _io;
}

/**
 * Socket.IO middleware that validates the JWT from the HTTP-only cookie.
 * Extracts user ID and role and attaches them to socket.data.
 */
function authenticateSocket(socket, next) {
  try {
    // Parse cookies from the handshake headers
    const cookieHeader = socket.handshake.headers.cookie || '';
    const cookies = parseCookies(cookieHeader);
    const token = cookies[env.cookieName] || cookies['uas_rtmvd_auth'] || cookies['uass_auth'];

    if (!token) {
      return next(new Error('Authentication required'));
    }

    const decoded = jwt.verify(token, env.jwtSecret);
    socket.data.userId = decoded.sub;
    // Role is not stored in token for this implementation; it is fetched from
    // DB in HTTP requests. For sockets we trust the token subject (userId) only.
    socket.data.role = decoded.role;
    next();
  } catch {
    next(new Error('Invalid or expired token'));
  }
}

/**
 * Minimal cookie string parser. Avoids importing the full cookie-parser
 * for a simple key-value extraction.
 */
function parseCookies(cookieStr) {
  return cookieStr.split(';').reduce((acc, pair) => {
    const idx = pair.indexOf('=');
    if (idx < 0) return acc;
    const key = pair.slice(0, idx).trim();
    const val = pair.slice(idx + 1).trim();
    acc[key] = decodeURIComponent(val);
    return acc;
  }, {});
}

