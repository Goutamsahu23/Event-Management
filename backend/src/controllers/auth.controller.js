const jwt = require('jsonwebtoken');
const Profile = require('../models/Profile.model');
// const config = require('../config/config'); // if you need env

// Simple login: find profile by email (or accept profileId for dev)
exports.login = async (req, res) => {
  try {
    const { email, profileId } = req.body;

    // Simple dev-mode login by profileId (or implement password flow)
    let profile;
    if (profileId) {
      profile = await Profile.findById(profileId).lean();
    } else if (email) {
      profile = await Profile.findOne({ email }).lean();
    } else {
      return res.status(400).json({
        status: 'error',
        code: 'INVALID_INPUT',
        message: 'email or profileId required',
      });
    }

    if (!profile) {
      return res.status(401).json({
        status: 'error',
        code: 'UNAUTHORIZED',
        message: 'Invalid credentials',
      });
    }

    // Create JWT payload
    const payload = {
      sub: profile._id.toString(),
      role: profile.role || 'user',
      timezone: profile.timezone || null,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'dev_secret', {
      expiresIn: '7d',
    });

    res.json({
      status: 'ok',
      data: {
        token,
        profile: {
          _id: profile._id,
          name: profile.name,
          timezone: profile.timezone,
          role: profile.role,
          email: profile.email,
        },
      },
    });
  } catch (err) {
    console.error('auth.login error', err);
    res.status(500).json({ status: 'error', code: 'SERVER_ERROR', message: err.message });
  }
};
