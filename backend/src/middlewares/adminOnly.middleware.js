function adminOnly(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        code: 'UNAUTHORIZED',
        message: 'Not authenticated',
      });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        code: 'FORBIDDEN',
        message: 'Admin privileges required',
      });
    }

    return next();
  } catch (err) {
    console.error('adminOnly.middleware error', err);
    return res.status(500).json({
      status: 'error',
      code: 'SERVER_ERROR',
      message: 'Authorization middleware failed',
    });
  }
}

module.exports = adminOnly;
