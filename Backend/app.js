import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import employeeRoute from './Routes/employeeRoute.js';
import { authRouter } from './Routes/authRoute.js';
import statsRouter from './Routes/statsRoute.js';
import { rateLimiter } from './Middleware/rateLimitMiddleware.js';

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Global Rate Limiting Middleware
app.use(rateLimiter()); // If needed per route, move this into individual route files

// Routes
app.use('/api/auth', authRouter);         // Auth routes
app.use('/api/employees', employeeRoute); // Employee CRUD (protected)
app.use('/api/stats', statsRouter);       // Analytics data

// Root health check (optional)
app.get('/', (req, res) => {
  res.status(200).json({ message: 'API is running...' });
});

export default app;
