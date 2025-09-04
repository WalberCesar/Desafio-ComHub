import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth';
import roomRoutes from './routes/rooms';
import messageRoutes from './routes/messages';
import ideaRoutes from './routes/ideas';
import healthRoutes from './routes/health';

// Import socket handlers
import { setupSocketHandlers } from './services/socketService';
import { db } from './services/database';

const app = express();
const server = createServer(app);

// Configure CORS
const corsOptions = {
  origin: process.env.APP_ORIGIN || 'http://localhost:3000',
  credentials: true,
};

// Socket.IO setup
const io = new Server(server, {
  cors: corsOptions,
});

// Middleware
app.use(helmet());
app.use(cors(corsOptions));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/ideas', ideaRoutes);

// Setup Socket.IO handlers
setupSocketHandlers(io);

// Make io available to routes
app.set('io', io);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.originalUrl} not found`,
  });
});

const PORT = process.env.PORT || 3001;

// Start server
async function startServer() {
  try {
    // Connect to database
    await db.connect();
    
    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n⏳ Shutting down gracefully...');
  await db.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n⏳ Shutting down gracefully...');
  await db.disconnect();
  process.exit(0);
});

startServer();

export { io };
