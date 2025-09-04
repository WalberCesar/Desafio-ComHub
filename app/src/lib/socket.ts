// =============================================================================
// CLIENTE SOCKET.IO - Frontend PitchLab
// =============================================================================

import { io, Socket } from 'socket.io-client';
import type { ServerToClientEvents, ClientToServerEvents, Message, Idea } from '@/types';

const WS_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// =============================================================================
// CLIENTE SOCKET.IO TIPADO
// =============================================================================

class SocketClient {
  private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;
  private token: string | null = null;

  connect(token?: string) {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.token = token || null;

    this.socket = io(WS_URL, {
      auth: this.token ? { token: this.token } : undefined,
      transports: ['websocket', 'polling'],
      timeout: 20000,
    });

    // Listeners de conexão
    this.socket.on('connect', () => {
      console.log('✅ Conectado ao Socket.IO:', this.socket?.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Desconectado do Socket.IO:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Erro de conexão Socket.IO:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket() {
    return this.socket;
  }

  isConnected() {
    return this.socket?.connected || false;
  }

  // =============================================================================
  // MÉTODOS DE EMISSÃO (CLIENTE → SERVIDOR)
  // =============================================================================

  joinRoom(roomId: string) {
    this.socket?.emit('room:join', roomId);
  }

  leaveRoom(roomId: string) {
    this.socket?.emit('room:leave', roomId);
  }

  sendMessage(roomId: string, content: string) {
    this.socket?.emit('message:send', { roomId, content });
  }

  setTyping(roomId: string, isTyping: boolean) {
    this.socket?.emit('message:typing', { roomId, isTyping });
  }

  createIdea(roomId: string, title: string, description?: string) {
    this.socket?.emit('idea:create', { roomId, title, description });
  }

  voteIdea(ideaId: string) {
    this.socket?.emit('idea:vote', ideaId);
  }

  // =============================================================================
  // MÉTODOS DE ESCUTA (SERVIDOR → CLIENTE)
  // =============================================================================

  onRoomJoined(callback: (data: { roomId: string; user: { id: string; name: string } }) => void) {
    this.socket?.on('room:joined', callback);
  }

  onRoomLeft(callback: (data: { roomId: string; user: { id: string; name: string } }) => void) {
    this.socket?.on('room:left', callback);
  }

  onNewMessage(callback: (message: Message) => void) {
    this.socket?.on('message:new', callback);
  }

  onTyping(callback: (data: { roomId: string; user: { id: string; name: string }; isTyping: boolean }) => void) {
    this.socket?.on('message:typing', callback);
  }

  onNewIdea(callback: (idea: Idea) => void) {
    this.socket?.on('idea:new', callback);
  }

  onIdeaVoted(callback: (data: { ideaId: string; votes: number; roomId: string }) => void) {
    this.socket?.on('idea:voted', callback);
  }

  // =============================================================================
  // EVENTOS DA IA
  // =============================================================================

  onAISummary(callback: (data: { roomId: string; summary: string }) => void) {
    this.socket?.on('ai:summary', callback);
  }

  onAITags(callback: (data: { roomId: string; tags: string[] }) => void) {
    this.socket?.on('ai:tags', callback);
  }

  onAIPitch(callback: (data: { roomId: string; pitch: string }) => void) {
    this.socket?.on('ai:pitch', callback);
  }

  // =============================================================================
  // MÉTODOS DE LIMPEZA
  // =============================================================================

  offAllListeners() {
    this.socket?.removeAllListeners();
  }

  offListener(event: keyof ServerToClientEvents) {
    this.socket?.off(event);
  }
}

// =============================================================================
// INSTÂNCIA SINGLETON
// =============================================================================

export const socketClient = new SocketClient();
export default socketClient;