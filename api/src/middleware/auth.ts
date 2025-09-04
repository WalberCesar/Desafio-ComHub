import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { AuthenticatedUser } from '../types/auth';

export const requireAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = AuthService.extractTokenFromHeader(authHeader);

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Token de autenticação não fornecido',
        message: 'Acesso negado. Faça login para continuar.',
      });
      return;
    }

    const payload = AuthService.verifyToken(token);

    const user = await AuthService.getUserById(payload.userId);

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Usuário não encontrado',
        message: 'Token inválido. Faça login novamente.',
      });
      return;
    }

    req.user = user;
    next();

  } catch (error: any) {
    console.error('Erro na autenticação:', error.message);
    res.status(401).json({
      success: false,
      error: 'Token inválido',
      message: 'Token de autenticação inválido ou expirado. Faça login novamente.',
    });
  }
};

export const optionalAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = AuthService.extractTokenFromHeader(authHeader);

    if (token) {
      const payload = AuthService.verifyToken(token);
      const user = await AuthService.getUserById(payload.userId);
      
      if (user) {
        req.user = user;
      }
    }

    next();

  } catch (error) {
    next();
  }
};

export const requireOwnership = (userIdField: string = 'userId') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Não autenticado',
        message: 'Acesso negado. Autenticação necessária.',
      });
      return;
    }

    const resourceUserId = req.params[userIdField] || req.body[userIdField];

    if (req.user.id !== resourceUserId) {
      res.status(403).json({
        success: false,
        error: 'Acesso negado',
        message: 'Você não tem permissão para acessar este recurso.',
      });
      return;
    }

    next();
  };
};

export const requireRegisteredUser = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'Não autenticado',
      message: 'Acesso negado. Autenticação necessária.',
    });
    return;
  }

  if (req.user.isGuest) {
    res.status(403).json({
      success: false,
      error: 'Acesso restrito',
      message: 'Esta ação requer uma conta registrada. Registre-se para continuar.',
    });
    return;
  }

  next();
};

export const getCurrentUser = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'Não autenticado',
      message: 'Acesso negado. Faça login para ver suas informações.',
    });
    return;
  }

  next();
};
