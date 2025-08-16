import express from 'express';
import morgan from 'morgan';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import http from 'http';
// eslint-disable-next-line import/no-extraneous-dependencies
import { Server } from 'socket.io';
//---------------------------------
import appRoute from './routers/index.js';
import globalError from './middlewares/globalError.js';
import dbConnection from './configuration/dbConnection.js';

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
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});
io.on('connection', (socket) => {
  console.log('Admin connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Admin disconnected:', socket.id);
  });
});

app.listen(process.env.PORT, () => {
  console.log(`Server is listen on ${process.env.PORT}`);
  dbConnection();
});
