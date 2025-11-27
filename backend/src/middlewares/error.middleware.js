module.exports = function errorHandler(err, req, res, next) {
  console.error('Unhandled error:', err);

  // Mongoose validation
  if (err.name === 'ValidationError') {
    const details = {};
    Object.keys(err.errors || {}).forEach((k) => {
      details[k] = err.errors[k].message;
    });
    return res.status(400).json({
      status: 'error',
      code: 'INVALID_INPUT',
      message: 'Validation failed',
      details,
    });
  }

  // Mongoose duplicate key
  if (err.code && err.code === 11000) {
    const key = Object.keys(err.keyValue || {}).join(', ');
    return res.status(409).json({
      status: 'error',
      code: 'CONFLICT',
      message: `Duplicate key: ${key}`,
    });
  }

  // JWT errors produced by jwt.verify
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      status: 'error',
      code: 'UNAUTHORIZED',
      message: 'Invalid or expired token',
    });
  }

  // default
  res.status(err.status || 500).json({
    status: 'error',
    code: err.code || 'SERVER_ERROR',
    message: err.message || 'Internal server error',
  });
};
