// A predictable, expected application error with an HTTP status code.
// Controllers/services throw these; the central error handler turns
// them into safe JSON responses without ever leaking stack traces,
// tokens, secrets, or internal database details.
export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace?.(this, AppError);
  }
}
