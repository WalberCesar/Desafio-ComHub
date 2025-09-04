import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { 
  registerUserSchema, 
  loginUserSchema, 
  identifyUserSchema,
  AuthResponse 
} from '../types/auth';

export class AuthController {
  
  /**
   * Registra um novo usuário com email e senha
   * POST /api/auth/register
   */
  static async register(req: Request, res: Response): Promise<void> {
    try {
      // Validar dados de entrada
      const validatedData = registerUserSchema.parse(req.body);

      // Registrar usuário
      const result = await AuthService.registerUser(validatedData);

      const response: AuthResponse = {
        success: true,
        message: 'Usuário registrado com sucesso',
        data: result,
      };

      res.status(201).json(response);

    } catch (error: any) {
      console.error('Erro no registro:', error);

      let statusCode = 400;
      let message = 'Erro ao registrar usuário';

      if (error.name === 'ZodError') {
        message = 'Dados inválidos: ' + error.errors.map((e: any) => e.message).join(', ');
      } else if (error.message.includes('Email já está em uso')) {
        statusCode = 409;
        message = error.message;
      } else if (error.message) {
        message = error.message;
      }

      const response: AuthResponse = {
        success: false,
        message,
      };

      res.status(statusCode).json(response);
    }
  }

  /**
   * Faz login de um usuário existente
   * POST /api/auth/login
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      // Validar dados de entrada
      const validatedData = loginUserSchema.parse(req.body);

      // Fazer login
      const result = await AuthService.loginUser(validatedData);

      const response: AuthResponse = {
        success: true,
        message: 'Login realizado com sucesso',
        data: result,
      };

      res.status(200).json(response);

    } catch (error: any) {
      console.error('Erro no login:', error);

      let statusCode = 400;
      let message = 'Erro ao fazer login';

      if (error.name === 'ZodError') {
        message = 'Dados inválidos: ' + error.errors.map((e: any) => e.message).join(', ');
      } else if (error.message.includes('Credenciais inválidas')) {
        statusCode = 401;
        message = 'Email ou senha incorretos';
      } else if (error.message) {
        message = error.message;
      }

      const response: AuthResponse = {
        success: false,
        message,
      };

      res.status(statusCode).json(response);
    }
  }

  /**
   * Identifica um usuário apenas pelo nome (modo convidado)
   * POST /api/auth/identify
   */
  static async identify(req: Request, res: Response): Promise<void> {
    try {
      // Validar dados de entrada
      const validatedData = identifyUserSchema.parse(req.body);

      // Identificar usuário
      const result = await AuthService.identifyUser(validatedData);

      const response: AuthResponse = {
        success: true,
        message: 'Usuário identificado com sucesso',
        data: result,
      };

      res.status(200).json(response);

    } catch (error: any) {
      console.error('Erro na identificação:', error);

      let statusCode = 400;
      let message = 'Erro ao identificar usuário';

      if (error.name === 'ZodError') {
        message = 'Dados inválidos: ' + error.errors.map((e: any) => e.message).join(', ');
      } else if (error.message) {
        message = error.message;
      }

      const response: AuthResponse = {
        success: false,
        message,
      };

      res.status(statusCode).json(response);
    }
  }

  /**
   * Retorna informações do usuário atual
   * GET /api/auth/me
   */
  static async getCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Usuário atual obtido com sucesso',
        data: req.user,
      });

    } catch (error: any) {
      console.error('Erro ao obter usuário atual:', error);

      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }

  /**
   * Logout (client-side remove o token, server apenas confirma)
   * POST /api/auth/logout
   */
  static async logout(req: Request, res: Response): Promise<void> {
    try {
      // Como JWT é stateless, o logout é feito pelo cliente removendo o token
      // Aqui apenas confirmamos a ação
      res.status(200).json({
        success: true,
        message: 'Logout realizado com sucesso',
      });

    } catch (error: any) {
      console.error('Erro no logout:', error);

      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }

  /**
   * Verifica se um token é válido
   * GET /api/auth/verify
   */
  static async verifyToken(req: Request, res: Response): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      const token = AuthService.extractTokenFromHeader(authHeader);

      if (!token) {
        res.status(400).json({
          success: false,
          message: 'Token não fornecido',
        });
        return;
      }

      // Verificar token
      const payload = AuthService.verifyToken(token);
      const user = await AuthService.getUserById(payload.userId);

      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Token inválido - usuário não encontrado',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Token válido',
        data: {
          user,
          valid: true,
          expiresAt: payload.exp ? new Date(payload.exp * 1000) : null,
        },
      });

    } catch (error: any) {
      console.error('Erro na verificação do token:', error);

      res.status(401).json({
        success: false,
        message: 'Token inválido ou expirado',
      });
    }
  }
}
