import { db as prismaService } from './prisma';

export type { User, Room, Message, Idea, Vote, Tag } from '@prisma/client';

class DatabaseService {
  private static instance: DatabaseService;

  public prisma = prismaService.client;

  private constructor() {
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  public async connect(): Promise<void> {
    try {
      await prismaService.connect();
    } catch (error) {
      console.error('❌ Falha na conexão com o banco de dados:', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    try {
      await prismaService.disconnect();
    } catch (error) {
      console.error('❌ Falha na desconexão do banco de dados:', error);
      throw error;
    }
  }

  public async healthCheck(): Promise<boolean> {
    try {
      return await prismaService.healthCheck();
    } catch {
      return false;
    }
  }

  public async testConnection(): Promise<void> {
    try {
      await prismaService.testConnection();
    } catch (error) {
      throw error;
    }
  }
}

export const db = DatabaseService.getInstance();
export { DatabaseService };