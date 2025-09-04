import { z } from 'zod';


export const registerUserSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(50, 'Nome muito longo'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres').max(100, 'Senha muito longa'),
});

export const loginUserSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

export const identifyUserSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(50, 'Nome muito longo'),
});


export type RegisterUserData = z.infer<typeof registerUserSchema>;

export type LoginUserData = z.infer<typeof loginUserSchema>;

export type IdentifyUserData = z.infer<typeof identifyUserSchema>;

export interface JwtPayload {
  userId: string;
  name: string;
  email?: string;
  isGuest: boolean;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedUser {
  id: string;
  name: string;
  email?: string;
  isGuest: boolean;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: AuthenticatedUser;
    token: string;
  };
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}
