import AppError from '../utils/appError.js';

// Handle duplicate key error in MongoDB
const handleDuplicateKeyError = (err) => {
  // Extract field and value from the error message
  const match = err.message.match(/dup key: \{ (.+): "(.+)" \}/);
  if (match) {
    const field = match[1];
    const value = match[2];
    const message = `Duplicate field value: ${value}. Please use another ${field}!`;
    return new AppError(message, 400);
  }
  // Fallback message if regex doesn't match
  const message = 'Duplicate field value. Please use another value!';
  return new AppError(message, 400);
};

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const developmentError = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const productionError = (err, res) => {
  // Only send operational errors to client in production
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.error('ERROR 💥:', err);
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong!',
    });
  }
};

const errorHandler = (err, req, res, next) => {
  // eslint-disable-next-line node/no-unsupported-features/es-syntax
  let error = { ...err };
  error.message = err.message;

  // Set default values
  error.statusCode = err.statusCode || 500;
  error.status = err.status || 'error';

  // Send error response based on environment
  if (process.env.NODE_ENV === 'development') {
    developmentError(error, res);
  } else if (process.env.NODE_ENV === 'production') {
    // Handle specific MongoDB errors by checking the message content
    if (err.name === 'CastError') {
      error = handleCastErrorDB(err);
    }

    // Check for duplicate key error in message (E11000)
    if (
      err.code === 11000 ||
      err.message.includes('E11000 duplicate key error')
    ) {
      error = handleDuplicateKeyError(err);
    }

    if (err.name === 'ValidationError') {
      error = handleValidationErrorDB(err);
    }

    // Check for MongoServerError or CastError in message
    if (err.message.includes('CastError')) {
      error = handleCastErrorDB(err);
    }
    productionError(error, res);
  }
};

export default errorHandler;
