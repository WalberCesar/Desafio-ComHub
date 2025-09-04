'use client';

// =============================================================================
// BUBBLE DE MENSAGEM - PitchLab
// =============================================================================

import React from 'react';
import { formatTime, getInitials, generateAvatarColor } from '@/lib/utils';
import type { Message } from '@/types';
import { Bot } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const isAssistant = message.role === 'assistant';

  return (
    <div className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''} group`}>
      {/* Avatar */}
      <div className="shrink-0">
        {isAssistant ? (
          <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
            <Bot size={16} className="text-white" />
          </div>
        ) : (
          <div className={`w-8 h-8 ${generateAvatarColor(message.user.name)} rounded-full flex items-center justify-center text-white text-sm font-medium`}>
            {getInitials(message.user.name)}
          </div>
        )}
      </div>

      {/* Conteúdo da mensagem */}
      <div className={`flex flex-col max-w-xs sm:max-w-md lg:max-w-lg ${isOwn ? 'items-end' : 'items-start'}`}>
        {/* Nome e hora */}
        <div className={`flex items-center gap-2 mb-1 ${isOwn ? 'flex-row-reverse' : ''}`}>
          <span className="text-sm font-medium text-gray-900">
            {isAssistant ? 'Assistente IA' : message.user.name}
            {message.user.isGuest && !isAssistant && (
              <span className="ml-1 text-xs text-gray-500">(Convidado)</span>
            )}
          </span>
          <span className="text-xs text-gray-500">
            {formatTime(message.createdAt)}
          </span>
        </div>

        {/* Bubble da mensagem */}
        <div
          className={`
            px-4 py-2 rounded-lg whitespace-pre-wrap break-words
            ${isOwn 
              ? 'bg-blue-600 text-white rounded-br-sm' 
              : isAssistant
                ? 'bg-purple-100 border border-purple-200 text-purple-900 rounded-bl-sm'
                : 'bg-gray-100 text-gray-900 rounded-bl-sm'
            }
          `}
        >
          {message.content}
        </div>

        {/* Indicador de IA */}
        {isAssistant && (
          <div className="flex items-center gap-1 mt-1 text-xs text-purple-600">
            <Bot size={12} />
            <span>Resposta gerada por IA</span>
          </div>
        )}
      </div>
    </div>
  );
}