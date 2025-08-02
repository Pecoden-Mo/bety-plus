import express from 'express';
import morgan from 'morgan';
import dotenv from 'dotenv';
import dbConnection from './configuration/dbConnection.js';
import globalError from './middlewares/globalError.js';
import AppError from './utils/appError.js';

//------------------------------------------
dotenv.config();
const app = express();

app.use(morgan('dev'));

// routes
app.get('/app', (req, res, _next) => {
  // res.json({
  //   message: 'Test',
  // });
  return _next(new AppError('This is my custom error message!', 404));
});

// handle not found pages

app.all('/{*splat}', (req, res) => {
  res.status(404).json({
    status: 'fail',
    message: 'Route not found',
  });
});
app.use(globalError);

app.listen(process.env.PORT, () => {
  console.log(`Server is listen on ${process.env.PORT}`);
  dbConnection();
});
