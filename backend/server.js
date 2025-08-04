import AppError from './utils/appError.js';
import dbConnection from './configuration/dbConnection.js';
import globalError from './middlewares/globalError.js';
import express from 'express';
import morgan from 'morgan';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import appRoute from './routers/index.js';

//------------------------------------------
dotenv.config();
const app = express();

app.use(morgan('dev'));

// routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api/v1/', appRoute);
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
