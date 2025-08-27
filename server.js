import express from 'express';
import morgan from 'morgan';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import http from 'http';
//---------------------------------
import appRoute from './routers/index.js';
import globalError from './middlewares/globalError.js';
import dbConnection from './config/dbConnection.js';
import socketService from './utils/socketService.js';

//------------------------------------------
dotenv.config();
const app = express();

app.use(morgan('dev'));

// routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Welcome to Buty Plus API',
  });
});
app.use('/api/v1/', appRoute);

// handle not found pages
app.all('/{*splat}', (req, res) => {
  res.status(404).json({
    status: 'fail',
    message: 'Route not found',
  });
});
app.use(globalError);

const server = http.createServer(app);

// Initialize Socket.IO service
socketService.init(server);

server.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);

  dbConnection();
});
