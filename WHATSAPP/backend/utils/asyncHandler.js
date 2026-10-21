// Wraps an async express handler so rejected promises are forwarded
// to the central error handler instead of crashing the process.
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
