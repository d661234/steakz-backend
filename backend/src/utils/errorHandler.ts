import { Request, Response, NextFunction } from 'express'; // Import Express types for the error handler middleware signature

export class AppError extends Error { // Custom error class that carries an HTTP status code alongside the error message
  statusCode: number; // The HTTP status code to respond with (e.g. 404, 400, 500)
  isOperational: boolean; // Distinguishes expected operational errors (true) from unexpected programmer errors (false)

  constructor(
    message: string, // Human-readable error description
    statusCode: number = 500, // Default to 500 Internal Server Error if no status is specified
    isOperational: boolean = true // Default to operational (expected) error
  ) {
    super(message); // Call the Error base class constructor with the message
    this.statusCode = statusCode; // Store the HTTP status code on the instance
    this.isOperational = isOperational; // Store the operational flag on the instance
    Error.captureStackTrace(this, this.constructor); // Capture the stack trace, excluding the constructor itself for cleaner traces
  }
}

export const errorHandler = ( // Express error-handling middleware — must have exactly 4 parameters to be recognised by Express
  err: Error | AppError, // The error object (either a standard Error or our AppError subclass)
  _req: Request, // The incoming request (required by Express error middleware signature but not used here)
  res: Response, // The response object used to send the error back to the client
  _next: NextFunction // The next middleware (required by Express error middleware signature but not used here)
) => {
  const statusCode = err instanceof AppError // Determine the HTTP status code to use
    ? err.statusCode // Use the AppError's status code if it's our custom error
    : 500; // Fall back to 500 for generic Error instances

  const errorResponse = { // Build the JSON response body for the error
    status: 'error', // Always 'error' for error responses to be consistent with success responses
    statusCode, // Include the status code in the body as well as the HTTP header
    message: err.message, // Include the error's message (may be the developer's description or thrown message)
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }), // Include the stack trace only in development — never expose it in production
  };

  console.error(`[ERROR] ${err.message}`); // Log the error message to the server console for monitoring

  res.status(statusCode).json(errorResponse); // Send the error response with the appropriate HTTP status code
};

export const asyncHandler = ( // Higher-order function that wraps async route handlers to automatically catch rejected promises
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void> // The async route handler to wrap
) => {
  return (req: Request, res: Response, next: NextFunction) => { // Return a synchronous wrapper that Express can call normally
    Promise.resolve(fn(req, res, next)).catch(next); // Execute the async function and pass any rejection to Express's next() so the error handler receives it
  };
};

export const createAppError = ( // Factory function to create AppError instances without using new — useful for one-liners
  message: string, // Human-readable error description
  statusCode: number = 500, // Default to 500 if no status is specified
  isOperational: boolean = true // Default to operational error
): AppError => new AppError(message, statusCode, isOperational); // Construct and return the AppError instance
