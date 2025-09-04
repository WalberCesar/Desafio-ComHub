// =============================================================================
// TIPOS COMPARTILHADOS - Frontend PitchLab
// =============================================================================

export interface User {
  id: string;
  name: string;
  email?: string;
  isGuest: boolean;
  createdAt: string;
}

export interface Room {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  _count?: {
    messages: number;
    participants: number;
  };
}

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  roomId: string;
  userId: string;
  user: User;
  createdAt: string;
}

export interface Idea {
  id: string;
  title: string;
  description?: string;
  votes: number;
  roomId: string;
  userId: string;
  user: User;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  hasNextPage: boolean;
  nextCursor?: string;
}

// =============================================================================
// TIPOS DE EVENTOS SOCKET.IO
// =============================================================================

export interface ServerToClientEvents {
  // Sala
  'room:joined': (data: { roomId: string; user: User }) => void;
  'room:left': (data: { roomId: string; user: User }) => void;
  
  // Mensagens
  'message:new': (message: Message) => void;
  'message:typing': (data: { roomId: string; user: User; isTyping: boolean }) => void;
  
  // Ideias
  'idea:new': (idea: Idea) => void;
  'idea:voted': (data: { ideaId: string; votes: number; roomId: string }) => void;
  
  // IA
  'ai:summary': (data: { roomId: string; summary: string }) => void;
  'ai:tags': (data: { roomId: string; tags: string[] }) => void;
  'ai:pitch': (data: { roomId: string; pitch: string }) => void;
}

export interface ClientToServerEvents {
  // Sala
  'room:join': (roomId: string) => void;
  'room:leave': (roomId: string) => void;
  
  // Mensagens
  'message:send': (data: { roomId: string; content: string }) => void;
  'message:typing': (data: { roomId: string; isTyping: boolean }) => void;
  
  // Ideias
  'idea:create': (data: { roomId: string; title: string; description?: string }) => void;
  'idea:vote': (ideaId: string) => void;
}

// =============================================================================
// TIPOS DE FORMS
// =============================================================================

export interface AuthFormData {
  name: string;
  email?: string;
  password?: string;
}

export interface RoomFormData {
  name: string;
  description?: string;
}

export interface IdeaFormData {
  title: string;
  description?: string;
}

export interface MessageFormData {
  content: string;
  triggerAI?: boolean;
}

