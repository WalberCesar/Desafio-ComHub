import { z } from 'zod';

// Enums
export enum MessageRole {
  USER = 'USER',
  ASSISTANT = 'ASSISTANT',
}

// Zod schemas for validation
export const CreateUserSchema = z.object({
  name: z.string().min(1).max(100),
});

export const CreateRoomSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
});

export const CreateMessageSchema = z.object({
  content: z.string().min(1).max(1000),
  roomId: z.string(),
  userId: z.string().optional(),
  role: z.nativeEnum(MessageRole).default(MessageRole.USER),
  triggerAI: z.boolean().optional(),
});

export const CreateIdeaSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(1000).optional(),
  roomId: z.string(),
  userId: z.string().optional(),
});

export const VoteIdeaSchema = z.object({
  ideaId: z.string(),
  userId: z.string(),
  value: z.number().int().min(-1).max(1).default(1),
});

// TypeScript types from Zod schemas
export type CreateUserData = z.infer<typeof CreateUserSchema>;
export type CreateRoomData = z.infer<typeof CreateRoomSchema>;
export type CreateMessageData = z.infer<typeof CreateMessageSchema>;
export type CreateIdeaData = z.infer<typeof CreateIdeaSchema>;
export type VoteIdeaData = z.infer<typeof VoteIdeaSchema>;

// Socket event types
export interface ServerToClientEvents {
  'room:joined': (data: { roomId: string; user: { id: string; name: string } }) => void;
  'room:left': (data: { roomId: string; user: { id: string; name: string } }) => void;
  'message:new': (message: any) => void;
  'message:typing': (data: { roomId: string; user: { id: string; name: string }; isTyping: boolean }) => void;
  'idea:new': (idea: any) => void;
  'idea:voted': (data: { ideaId: string; votes: number; roomId: string }) => void;
  'ai:summary': (data: { roomId: string; summary: string }) => void;
  'ai:tags': (data: { roomId: string; tags: string[] }) => void;
  'ai:pitch': (data: { roomId: string; pitch: string }) => void;
  'user:disconnected': (data: { roomId: string; user: { id: string; name: string } }) => void;
}

export interface ClientToServerEvents {
  'room:join': (roomId: string) => void;
  'room:leave': (roomId: string) => void;
  'message:send': (data: CreateMessageData) => void;
  'message:typing': (data: { roomId: string; isTyping: boolean }) => void;
  'idea:create': (data: CreateIdeaData) => void;
  'idea:vote': (data: VoteIdeaData) => void;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    cursor?: string;
    hasMore: boolean;
    total?: number;
  };
}


