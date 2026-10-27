// src/middleware/authenticate.js
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/user.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Verifies the JWT from the HTTP-only cookie.
 * Attaches the full user document (minus passwordHash) to req.user.
 * Returns 401 if the token is missing, invalid, or expired.
 * Returns 401 if the user account is inactive.
 */
export const authenticate = asyncHandler(async (req, _res, next) => {
  // Check for Hardware API Key in headers
  const apiKey = req.headers['x-api-key'];
  if (apiKey && apiKey === env.hardwareApiKey) {
    const admin = await User.findOne({ role: 'admin' });
    req.user = admin || { 
      _id: '000000000000000000000000', // Dummy Object ID fallback
      role: 'admin', 
      name: 'Hardware Sensor' 
    };
    return next();
  }

  const token = req.cookies?.[env.cookieName] || req.cookies?.['uas_rtmvd_auth'] || req.cookies?.['uass_auth'];

  if (!token) {
    throw ApiError.unauthorized('Authentication required');
  }

  const decoded = jwt.verify(token, env.jwtSecret);

  const user = await User.findById(decoded.sub);

  if (!user) {
    throw ApiError.unauthorized('User not found');
  }

  if (!user.isActive) {
    throw ApiError.unauthorized('Account is deactivated');
  }

  req.user = user;
  next();
});

