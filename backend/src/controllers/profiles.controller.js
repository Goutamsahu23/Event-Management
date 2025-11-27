const Profile = require('../models/Profile.model');

exports.createProfile = async (req, res) => {
  try {
    
    const { name, email, role, timezone } = req.body;
    if (!name ) {
      return res.status(400).json({
        status: 'error',
        code: 'INVALID_INPUT',
        message: 'name is required',
      });
    }
    

 

    const profile = new Profile({
      name,
      email,
      role: role || 'user',
      timezone,
    });

    await profile.save();

    res.status(201).json({
      status: 'ok',
      data: {
        _id: profile._id,
        name: profile.name,
        email: profile.email,
        role: profile.role,
        timezone: profile.timezone,
        createdAtUTC: profile.createdAtUTC,
      },
    });
  } catch (err) {
    console.error('profiles.createProfile error', err);
    // handle duplicate email / validation specifics
    res.status(500).json({ status: 'error', code: 'SERVER_ERROR', message: err.message });
  }
};

exports.listProfiles = async (req, res) => {
  try {
    const q = req.query.q || '';
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.min(200, parseInt(req.query.limit || '50', 10));
    const skip = (page - 1) * limit;

    const filter = {};
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
      ];
    }

    const [items, total] = await Promise.all([
      Profile.find(filter).skip(skip).limit(limit).lean(),
      Profile.countDocuments(filter),
    ]);

    res.json({
      status: 'ok',
      data: { items, meta: { page, limit, total } },
    });
  } catch (err) {
    console.error('profiles.listProfiles error', err);
    res.status(500).json({ status: 'error', code: 'SERVER_ERROR', message: err.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const id = req.params.id;
    const profile = await Profile.findById(id).lean();
    if (!profile) {
      return res.status(404).json({ status: 'error', code: 'NOT_FOUND', message: 'Profile not found' });
    }
    res.json({ status: 'ok', data: profile });
  } catch (err) {
    console.error('profiles.getProfile error', err);
    res.status(500).json({ status: 'error', code: 'SERVER_ERROR', message: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const id = req.params.id;

    const updates = {};
    const allowed = ['name', 'timezone', 'email', 'role', 'meta'];
    allowed.forEach((k) => {
      if (req.body[k] !== undefined) updates[k] = req.body[k];
    });
    updates.updatedAtUTC = new Date();

    const updated = await Profile.findByIdAndUpdate(id, updates, { new: true }).lean();
    if (!updated) {
      return res.status(404).json({ status: 'error', code: 'NOT_FOUND', message: 'Profile not found' });
    }
    res.json({ status: 'ok', data: updated });
  } catch (err) {
    console.error('profiles.updateProfile error', err);
    res.status(500).json({ status: 'error', code: 'SERVER_ERROR', message: err.message });
  }
};
