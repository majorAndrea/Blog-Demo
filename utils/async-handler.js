// Middleware to detect any async errors and pass to the errors handling middleware.
const asyncHandler = (fn) => (req, res, next) => {
  return Promise.resolve(fn(req, res, next)).catch((e) => next(e)); // Pass to the errors handling middleware.
};

module.exports = asyncHandler;
