import express from 'express';
import morgan from 'morgan';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import http from 'http';
//---------------------------------
import appRoute from './routes/index.js';
import globalError from './middleware/globalError.js';
import dbConnection from './config/dbConnection.js';
import socketService from './services/socketService.js';

//------------------------------------------
dotenv.config();
const app = express();

app.use(morgan('dev'));

// CORS Configuration
// const corsOrigins = process.env.CORS_ORIGINS
//   ? process.env.CORS_ORIGINS.split(',')
//   : ['http://localhost:3020'];

app.use(
  cors({
    origin: ['http://127.0.0.1:5500', 'http://localhost:5500'],
    credentials: true, // Allow cookies to be sent
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

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

// CORS test endpoint
app.get('/cors-test', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'CORS is working correctly! 🎉',
    origin: req.headers.origin,
    timestamp: new Date().toISOString(),
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
