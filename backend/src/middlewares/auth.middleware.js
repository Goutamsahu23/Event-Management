const jwt = require('jsonwebtoken');
const Profile = require('../models/Profile.model');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
const AUTH_HEADER_PREFIX = 'Bearer ';

async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith(AUTH_HEADER_PREFIX)) {
      return res.status(401).json({
        status: 'error',
        code: 'UNAUTHORIZED',
        message: 'Missing or invalid Authorization header',
      });
    }

    const token = authHeader.slice(AUTH_HEADER_PREFIX.length).trim();
    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        status: 'error',
        code: 'UNAUTHORIZED',
        message: 'Invalid or expired token',
      });
    }

    // payload expected: { sub, role, timezone, ... }
    if (!payload || !payload.sub) {
      return res.status(401).json({
        status: 'error',
        code: 'UNAUTHORIZED',
        message: 'Invalid token payload',
      });
    }

    // Optionally load profile from DB to ensure current role/timezone
    const profile = await Profile.findById(payload.sub).lean();
    if (!profile) {
      return res.status(401).json({
        status: 'error',
        code: 'UNAUTHORIZED',
        message: 'Profile not found',
      });
    }

    // Attach normalized user info to req.user
    req.user = {
      sub: profile._id.toString(),
      role: profile.role || (payload.role || 'user'),
      timezone: profile.timezone || (payload.timezone || null),
      email: profile.email || null,
      rawPayload: payload,
    };

    return next();
  } catch (err) {
    console.error('auth.middleware error', err);
    return res.status(500).json({
      status: 'error',
      code: 'SERVER_ERROR',
      message: 'Authentication middleware failed',
    });
  }
}

module.exports = authMiddleware;
