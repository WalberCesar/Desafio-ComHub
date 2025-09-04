import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.post('/register', AuthController.register);

router.post('/login', AuthController.login);

router.post('/identify', AuthController.identify);

router.get('/me', requireAuth, AuthController.getCurrentUser);

router.post('/logout', requireAuth, AuthController.logout);

router.get('/verify', AuthController.verifyToken);

export default router;
