import { Router } from 'express';
import { db } from '../services/database';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const dbHealthy = await db.healthCheck();
    
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      database: dbHealthy ? 'connected' : 'disconnected',
    };

    res.status(dbHealthy ? 200 : 503).json(health);
  } catch (error) {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
    });
  }
});

export default router;


