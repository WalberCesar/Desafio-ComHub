'use client';

// =============================================================================
// PAINEL DE CHAT - PitchLab
// =============================================================================

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { socketClient } from '@/lib/socket';
import { Button } from '@/components/ui/Button';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { debounce } from '@/lib/utils';
import type { Message } from '@/types';
import { Send, Bot, Sparkles } from 'lucide-react';

interface ChatPanelProps {
  messages: Message[];
  onSendMessage: (content: string, triggerAI?: boolean) => Promise<void>;
  roomId: string;
}

export function ChatPanel({ messages, onSendMessage, roomId }: ChatPanelProps) {
  const { user } = useAuth();
  const [messageInput, setMessageInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // =============================================================================
  // AUTO SCROLL E FOCUS
  // =============================================================================

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Setup typing listeners
    socketClient.onTyping((data) => {
      if (data.roomId === roomId && data.user?.id !== user?.id) {
        setTypingUsers(prev => {
          if (data.isTyping) {
            return prev.includes(data.user?.name) ? prev : [...prev, data.user?.name];
          } else {
            return prev.filter(name => name !== data.user?.name);
          }
        });
      }
    });

    return () => {
      socketClient.offListener('message:typing');
    };
  }, [roomId, user?.id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // =============================================================================
  // TYPING INDICATOR
  // =============================================================================

  const debouncedStopTyping = debounce(() => {
    socketClient.setTyping(roomId, false);
  }, 1000);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessageInput(value);

    // Indicador de digitação
    if (value.length > 0) {
      socketClient.setTyping(roomId, true);
      debouncedStopTyping();
    } else {
      socketClient.setTyping(roomId, false);
    }
  };

  // =============================================================================
  // ENVIO DE MENSAGENS
  // =============================================================================

  const handleSendMessage = async (triggerAI = false) => {
    const content = messageInput.trim();
    if (!content || isSending) return;

    setIsSending(true);
    
    try {
      await onSendMessage(content, triggerAI);
      setMessageInput('');
      socketClient.setTyping(roomId, false);
      
      // Focar no input novamente
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // =============================================================================
  // RENDER
  // =============================================================================

  return (
    <div className="flex flex-col h-full w-full bg-white">
      {/* Área de mensagens */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <div className="bg-gray-100 p-4 rounded-full mb-4">
              <Send size={24} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium mb-2">Nenhuma mensagem ainda</h3>
            <p className="text-sm text-center max-w-xs">
              Seja o primeiro a enviar uma mensagem nesta sala!
            </p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble 
                key={message.id} 
                message={message} 
                isOwn={message.userId === user?.id}
              />
            ))}
            
            {/* Indicador de digitação */}
            {typingUsers.length > 0 && (
              <TypingIndicator users={typingUsers} />
            )}
            
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Área de input */}
      <div className="border-t border-gray-200 p-4 bg-gray-50">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={messageInput}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua mensagem..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none max-h-32"
              rows={1}
              disabled={isSending}
              style={{
                height: 'auto',
                minHeight: '40px',
                maxHeight: '120px',
                overflowY: messageInput.length > 100 ? 'auto' : 'hidden'
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = target.scrollHeight + 'px';
              }}
            />
          </div>
          
          <div className="flex gap-1">
            {/* Botão de IA */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSendMessage(true)}
              disabled={!messageInput.trim() || isSending}
              className="px-3 py-2 flex items-center gap-1"
              title="Enviar e acionar IA"
            >
              <Sparkles size={16} />
              <Bot size={16} />
            </Button>
            
            {/* Botão de envio */}
            <Button
              onClick={() => handleSendMessage(false)}
              disabled={!messageInput.trim() || isSending}
              isLoading={isSending}
              className="px-3 py-2"
            >
              <Send size={16} />
            </Button>
          </div>
        </div>
        
        <p className="text-xs text-gray-500 mt-2">
          <kbd className="bg-gray-200 px-1 rounded">Enter</kbd> para enviar, 
          <kbd className="bg-gray-200 px-1 rounded ml-1">Shift+Enter</kbd> para nova linha
        </p>
      </div>
    </div>
  );
}