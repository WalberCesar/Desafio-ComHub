const jwt = require('jsonwebtoken');
import bcrypt from 'bcryptjs';
import { db } from './database';
import { 
  JwtPayload, 
  AuthenticatedUser, 
  RegisterUserData, 
  LoginUserData, 
  IdentifyUserData 
} from '../types/auth';

export class AuthService {
  private static jwtSecret = process.env.JWT_SECRET || 'pitchlab-super-secret-key-change-in-production';
  private static jwtExpiresIn = '7d'; // Token válido por 7 dias

  // === MÉTODOS DE AUTENTICAÇÃO ===

  /**
   * Registra um novo usuário com email e senha
   */
  static async registerUser(userData: RegisterUserData): Promise<{ user: AuthenticatedUser; token: string }> {
    const { name, email, password } = userData;

    // Verificar se o email já existe
    const existingUser = await db.prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new Error('Email já está em uso');
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar usuário
    const user = await db.prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        isGuest: false,
      },
    });

    // Gerar token
    const token = this.generateToken({
      userId: user.id,
      name: user.name,
      email: user.email!,
      isGuest: false,
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email!,
        isGuest: false,
      },
      token,
    };
  }

  /**
   * Faz login de um usuário existente
   */
  static async loginUser(loginData: LoginUserData): Promise<{ user: AuthenticatedUser; token: string }> {
    const { email, password } = loginData;

    // Buscar usuário por email
    const user = await db.prisma.user.findUnique({
      where: { email }
    });

    if (!user || !user.password) {
      throw new Error('Credenciais inválidas');
    }

    // Verificar senha
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Credenciais inválidas');
    }

    // Gerar token
    const token = this.generateToken({
      userId: user.id,
      name: user.name,
      email: user.email!,
      isGuest: false,
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email!,
        isGuest: false,
      },
      token,
    };
  }

  /**
   * Identifica um usuário apenas pelo nome (usuário convidado)
   */
  static async identifyUser(identifyData: IdentifyUserData): Promise<{ user: AuthenticatedUser; token: string }> {
    const { name } = identifyData;

    // Buscar ou criar usuário convidado
    let user = await db.prisma.user.findFirst({
      where: {
        name,
        isGuest: true,
      }
    });

    if (!user) {
      user = await db.prisma.user.create({
        data: {
          name,
          isGuest: true,
        },
      });
    }

    // Gerar token
    const token = this.generateToken({
      userId: user.id,
      name: user.name,
      isGuest: true,
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        isGuest: true,
      },
      token,
    };
  }

  // === MÉTODOS DE TOKEN ===

  /**
   * Gera um token JWT
   */
  static generateToken(payload: any): string {
    return jwt.sign(payload, this.jwtSecret, { expiresIn: this.jwtExpiresIn });
  }

  /**
   * Verifica e decodifica um token JWT
   */
  static verifyToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, this.jwtSecret) as JwtPayload;
    } catch (error) {
      throw new Error('Token inválido ou expirado');
    }
  }

  /**
   * Busca usuário pelo ID (para validação do token)
   */
  static async getUserById(userId: string): Promise<AuthenticatedUser | null> {
    const user = await db.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        isGuest: true,
      },
    });

    if (!user) return null;

    return {
      id: user.id,
      name: user.name,
      email: user.email || undefined,
      isGuest: user.isGuest,
    };
  }

  // === MÉTODOS UTILITÁRIOS ===

  /**
   * Extrai token do header Authorization
   */
  static extractTokenFromHeader(authHeader?: string): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7); // Remove "Bearer "
  }

  /**
   * Verifica se a senha atende aos critérios mínimos
   */
  static validatePassword(password: string): boolean {
    return password.length >= 6;
  }

  /**
   * Verifica se o email é válido
   */
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
