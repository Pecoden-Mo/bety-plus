// import AppError from '../utils/appError';

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
  const error = {
    statusCode: err.statusCode || 500,
    status: err.status || 'error',
    message: err.message || 'Something went wrong!',
    isOperational: err.isOperational || false,
    stack: err.stack,
  };

  if (process.env.NODE_ENV === 'development') {
    developmentError(error, res);
  } else if (process.env.NODE_ENV === 'production') {
    productionError(error, res);
  }
};

export default errorHandler;
