// =============================================================================
// CLIENTE API - Frontend PitchLab
// =============================================================================

import type { 
  User, 
  Room, 
  Message, 
  Idea, 
  AuthResponse, 
  ApiResponse, 
  PaginatedResponse,
  AuthFormData,
  RoomFormData,
  IdeaFormData,
  MessageFormData 
} from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// =============================================================================
// CLIENTE HTTP BASE
// =============================================================================

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    
    // Recuperar token do localStorage no cliente
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('token', token);
      } else {
        localStorage.removeItem('token');
      }
    }
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ 
          message: `HTTP ${response.status}: ${response.statusText}` 
        }));
        throw new Error(errorData.message || 'Erro na requisição');
      }

      const data = await response.json();
      // Se a resposta do backend já tem success/data, extrair apenas o data
      if (data.success && data.data !== undefined) {
        return { success: true, data: data.data };
      }
      // Senão, retornar como está
      return { success: true, data };
    } catch (error) {
      console.error('API Error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      };
    }
  }

  // =============================================================================
  // AUTENTICAÇÃO
  // =============================================================================

  async identify(data: { name: string }): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>('/api/auth/identify', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async register(data: AuthFormData): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: { email: string; password: string }): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMe(): Promise<ApiResponse<User>> {
    return this.request<User>('/api/auth/me');
  }

  async logout(): Promise<ApiResponse<void>> {
    this.setToken(null);
    return { success: true };
  }

  // =============================================================================
  // SALAS
  // =============================================================================

  async getRooms(): Promise<ApiResponse<Room[]>> {
    return this.request<Room[]>('/api/rooms');
  }

  async createRoom(data: RoomFormData): Promise<ApiResponse<Room>> {
    return this.request<Room>('/api/rooms', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getRoom(roomId: string): Promise<ApiResponse<Room>> {
    return this.request<Room>(`/api/rooms/${roomId}`);
  }

  // =============================================================================
  // MENSAGENS
  // =============================================================================

  async getMessages(
    roomId: string, 
    cursor?: string, 
    limit: number = 20
  ): Promise<ApiResponse<PaginatedResponse<Message>>> {
    const params = new URLSearchParams();
    if (cursor) params.append('cursor', cursor);
    params.append('limit', limit.toString());
    
    const query = params.toString();
    const url = `/api/messages/${roomId}${query ? `?${query}` : ''}`;
    
    return this.request<PaginatedResponse<Message>>(url);
  }

  async sendMessage(data: MessageFormData & { roomId: string }): Promise<ApiResponse<Message>> {
    return this.request<Message>('/api/messages', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // =============================================================================
  // IDEIAS
  // =============================================================================

  async getIdeas(roomId: string): Promise<ApiResponse<Idea[]>> {
    return this.request<Idea[]>(`/api/ideas/${roomId}`);
  }

  async createIdea(data: IdeaFormData & { roomId: string }): Promise<ApiResponse<Idea>> {
    return this.request<Idea>('/api/ideas', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async voteIdea(ideaId: string): Promise<ApiResponse<Idea>> {
    return this.request<Idea>(`/api/ideas/${ideaId}/vote`, {
      method: 'POST',
    });
  }

  // =============================================================================
  // SAÚDE
  // =============================================================================

  async healthCheck(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    return this.request<{ status: string; timestamp: string }>('/api/health');
  }
}

// =============================================================================
// INSTÂNCIA SINGLETON
// =============================================================================

export const apiClient = new ApiClient(API_URL);
export default apiClient;