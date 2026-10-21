// Central error handler. Every controller either handles its own
// errors or throws/passes an error (including AppError) to next(),
// which lands here. Responses NEVER include stack traces, tokens,
// secrets, or raw database errors.
export const errorHandler = (err, req, res, next) => {
  const statusCode =
    err.isOperational && err.statusCode ? err.statusCode : 500;

  const message =
    err.isOperational && err.message ? err.message : "Internal server error";

  if (!err.isOperational) {
    // Log full detail server-side only.
    console.error("Unhandled error:", err);
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
};

export const notFoundHandler = (req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
};
