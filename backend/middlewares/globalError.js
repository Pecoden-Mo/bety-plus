import AppError from '../utils/appError.js';

// handle duplicate key error in monogodb
const handleDuplicateKeyError = (err) => {
  const message = `Duplicate field value: ${err.keyValue.email}. Please use another value!`;
  console.log('Duplicate Key Error:', err.keyValue);

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
const errorHandler = (err, req, res, _next) => {
  console.log('Error Handler:', err);

  const error = {
    statusCode: err.statusCode || 500,
    status: err.status || 'error',
    message: err.message || 'Something went wrong!',
    isOperational: err.isOperational || false,
    stack: err.stack,
  };

  if (process.env.NODE_ENV === 'development') {
    if (err.code === 11000)
      error.message = handleDuplicateKeyError(err).message;
    developmentError(error, res);
  } else if (process.env.NODE_ENV === 'production') {
    productionError(error, res);
  }
};

export default errorHandler;
