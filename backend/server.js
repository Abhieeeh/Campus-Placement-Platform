import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import connectDB from './config/db.js';
import { initSocket } from './socket.js';
import authRoutes from './routes/authRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import interviewRoutes from './routes/interviewRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import shortlistRoutes from './routes/shortlistRoutes.js';
import { authenticateToken } from './middleware/authMiddleware.js';

const app = express();
const server = http.createServer(app);   // wrap express in an http server
const port = process.env.PORT || 5000;

connectDB();
initSocket(server);                       // attach Socket.IO to the http server

app.use(cors({
    origin: 'http://localhost:5173',
}));
app.use(express.json());
app.use(authenticateToken);

app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/shortlists', shortlistRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/dashboard', dashboardRoutes);

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log(`http://localhost:${port}`);
});