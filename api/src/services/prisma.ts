import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

declare global {
  var __prisma: PrismaClient | undefined;
}

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!global.__prisma) {
    global.__prisma = new PrismaClient({
      log: ['query', 'error', 'warn'],
    });
  }
  prisma = global.__prisma;
}

class PrismaService {
  private static instance: PrismaService;
  public client: PrismaClient;

  private constructor() {
    this.client = prisma;
  }

  public static getInstance(): PrismaService {
    if (!PrismaService.instance) {
      PrismaService.instance = new PrismaService();
    }
    return PrismaService.instance;
  }

  public async connect(): Promise<void> {
    try {
      await this.client.$connect();
      console.log('🗄️  Banco de dados PostgreSQL conectado com sucesso');
    } catch (error) {
      console.error('❌ Falha na conexão com o banco de dados:', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    try {
      await this.client.$disconnect();
      console.log('🗄️  Banco de dados PostgreSQL desconectado');
    } catch (error) {
      console.error('❌ Falha na desconexão do banco de dados:', error);
      throw error;
    }
  }

  public async healthCheck(): Promise<boolean> {
    try {
      await this.client.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }

  public async testConnection(): Promise<void> {
    try {
      await this.client.$queryRaw`SELECT 'Conexão OK' as status`;
      console.log('✅ Teste de conexão com o banco bem-sucedido');
    } catch (error) {
      console.error('❌ Teste de conexão falhou:', error);
      throw error;
    }
  }
}

export const db = PrismaService.getInstance();
export { PrismaService };
export default prisma;
