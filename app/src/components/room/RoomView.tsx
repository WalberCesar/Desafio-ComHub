'use client';

// =============================================================================
// VISUALIZAÇÃO DE SALA - Chat + Ideias - PitchLab
// =============================================================================

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { socketClient } from '@/lib/socket';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ChatPanel } from './ChatPanel';
import { IdeasPanel } from './IdeasPanel';
import { RoomHeader } from './RoomHeader';
import type { Room, Message, Idea } from '@/types';
import { ArrowLeft, MessageCircle, Lightbulb } from 'lucide-react';

interface RoomViewProps {
  roomId: string;
}

export function RoomView({ roomId }: RoomViewProps) {
  const router = useRouter();
  
  // Estados principais
  const [room, setRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  
  // Estados de layout
  const [activeTab, setActiveTab] = useState<'chat' | 'ideas'>('chat');
  const [connectedUsers, setConnectedUsers] = useState<string[]>([]);

  // =============================================================================
  // CARREGAR DADOS INICIAIS
  // =============================================================================

  useEffect(() => {
    const loadAndSetup = async () => {
      await loadRoomData();
      setupSocketListeners();
      
      // Entrar na sala via socket
      socketClient.joinRoom(roomId);
    };

    loadAndSetup();

    // Cleanup ao sair da sala
    return () => {
      socketClient.leaveRoom(roomId);
      socketClient.offAllListeners();
    };
  }, [roomId]);

  const loadRoomData = async () => {
    try {
      setIsLoading(true);
      setError('');

      // Carregar dados em paralelo
      const [roomResponse, messagesResponse, ideasResponse] = await Promise.all([
        apiClient.getRoom(roomId),
        apiClient.getMessages(roomId),
        apiClient.getIdeas(roomId),
      ]);

      // Verificar se a sala existe
      if (!roomResponse.success || !roomResponse.data) {
        setError('Sala não encontrada');
        return;
      }

      setRoom(roomResponse.data);

      // Configurar mensagens
      if (messagesResponse.success && messagesResponse.data) {
        setMessages(messagesResponse.data.data || []);
      }

      // Configurar ideias
      if (ideasResponse.success && ideasResponse.data) {
        setIdeas(ideasResponse.data);
      }

    } catch (error) {
      console.error('Erro ao carregar sala:', error);
      setError('Erro ao carregar dados da sala');
    } finally {
      setIsLoading(false);
    }
  };

  // =============================================================================
  // SOCKET.IO LISTENERS
  // =============================================================================

  const setupSocketListeners = () => {
    // Mensagens
    socketClient.onNewMessage((message) => {
      setMessages(prev => {
        // Evitar duplicatas verificando se a mensagem já existe
        const messageExists = prev.some(m => m.id === message.id);
        if (messageExists) {
          return prev;
        }
        return [...prev, message];
      });
    });

    // Ideias
    socketClient.onNewIdea((idea) => {
      setIdeas(prev => {
        // Evitar duplicatas verificando se a ideia já existe
        const ideaExists = prev.some(i => i.id === idea.id);
        if (ideaExists) {
          return prev;
        }
        return [idea, ...prev];
      });
    });

    socketClient.onIdeaVoted((data) => {
      setIdeas(prev => prev.map(idea => 
        idea.id === data.ideaId 
          ? { ...idea, votes: data.votes }
          : idea
      ));
    });

    // Usuários conectados
    socketClient.onRoomJoined((data) => {
      if (data.roomId === roomId) {
        console.log('Usuário entrou na sala:', data.user.name);
        setConnectedUsers(prev => {
          // Evitar duplicatas
          if (!prev.includes(data.user.id)) {
            return [...prev, data.user.id];
          }
          return prev;
        });
      }
    });

    socketClient.onRoomLeft((data) => {
      if (data.roomId === roomId) {
        console.log('Usuário saiu da sala:', data?.user?.name);
        setConnectedUsers(prev => prev.filter(userId => userId !== data?.user?.id));
      }
    });

    // Eventos da IA
    socketClient.onAISummary((data) => {
      if (data.roomId === roomId) {
        console.log('📊 Resumo da IA recebido:', data.summary);
        // O resumo já está na mensagem do assistente, mas vamos exibir no console
      }
    });

    socketClient.onAITags((data) => {
      if (data.roomId === roomId) {
        console.log('🏷️ Tags da IA recebidas:', data.tags);
        // As tags poderiam ser exibidas em uma UI específica no futuro
      }
    });

    socketClient.onAIPitch((data) => {
      if (data.roomId === roomId) {
        console.log('🎯 Pitch da IA recebido:', data.pitch);
        // O pitch poderia ser exibido em uma UI específica no futuro
      }
    });
  };

  // =============================================================================
  // HANDLERS
  // =============================================================================

  const handleBackToRooms = () => {
    router.push('/');
  };

  const handleSendMessage = async (content: string, triggerAI?: boolean) => {
    try {
      const response = await apiClient.sendMessage({
        roomId,
        content,
        triggerAI,
      });

      if (!response.success) {
        console.error('Erro ao enviar mensagem:', response.error);
        return;
      }

      // A IA será processada no backend via Groq e enviada via Socket.IO
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    }
  };

  const handleCreateIdea = async (title: string, description?: string) => {
    try {
      const response = await apiClient.createIdea({
        roomId,
        title,
        description,
      });

      if (!response.success) {
        console.error('Erro ao criar ideia:', response.error);
      }
      // A ideia será adicionada via Socket.IO
    } catch (error) {
      console.error('Erro ao criar ideia:', error);
    }
  };

  const handleVoteIdea = async (ideaId: string) => {
    try {
      const response = await apiClient.voteIdea(ideaId);

      if (!response.success) {
        console.error('Erro ao votar na ideia:', response.error);
      }
      // O voto será atualizado via Socket.IO
    } catch (error) {
      console.error('Erro ao votar na ideia:', error);
    }
  };

  // =============================================================================
  // RENDER LOADING/ERROR
  // =============================================================================

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando sala...</p>
        </div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md w-full mx-4 text-center p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {error || 'Sala não encontrada'}
          </h1>
          <p className="text-gray-600 mb-6">
            Não foi possível carregar os dados da sala.
          </p>
          <Button onClick={handleBackToRooms}>
            <ArrowLeft size={16} className="mr-2" />
            Voltar às Salas
          </Button>
        </Card>
      </div>
    );
  }

  // =============================================================================
  // RENDER PRINCIPAL
  // =============================================================================

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header da sala */}
      <RoomHeader 
        room={room} 
        onBackToRooms={handleBackToRooms}
        connectedUsers={connectedUsers}
      />

      {/* Navegação por abas - Mobile */}
      <div className="lg:hidden bg-white border-b border-gray-200">
        <div className="flex">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium ${
              activeTab === 'chat'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <MessageCircle size={16} />
            Chat
            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
              {messages.length}
            </span>
          </button>
          
          <button
            onClick={() => setActiveTab('ideas')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium ${
              activeTab === 'ideas'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Lightbulb size={16} />
            Ideias
            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
              {ideas.length}
            </span>
          </button>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="flex-1 flex">
        {/* Chat Panel */}
        <div className={`${
          activeTab === 'chat' ? 'flex' : 'hidden'
        } lg:flex flex-1 lg:border-r lg:border-gray-200`}>
          <ChatPanel
            messages={messages}
            onSendMessage={handleSendMessage}
            roomId={roomId}
          />
        </div>

        {/* Ideas Panel */}
        <div className={`${
          activeTab === 'ideas' ? 'flex' : 'hidden'
        } lg:flex lg:w-96 xl:w-1/3`}>
          <IdeasPanel
            ideas={ideas}
            onCreateIdea={handleCreateIdea}
            onVoteIdea={handleVoteIdea}
          />
        </div>
      </div>
    </div>
  );
}