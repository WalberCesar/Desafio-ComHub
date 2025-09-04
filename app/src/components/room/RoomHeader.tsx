'use client';

// =============================================================================
// HEADER DA SALA - PitchLab
// =============================================================================

import React from 'react';
import { Button } from '@/components/ui/Button';
import { formatDateTime } from '@/lib/utils';
import type { Room } from '@/types';
import { ArrowLeft, Users, Calendar, Hash } from 'lucide-react';

interface RoomHeaderProps {
  room: Room;
  onBackToRooms: () => void;
  connectedUsers: string[];
}

export function RoomHeader({ room, onBackToRooms, connectedUsers }: RoomHeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Lado esquerdo - Voltar + Info da sala */}
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBackToRooms}
              className="flex items-center gap-2 shrink-0"
            >
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">Voltar</span>
            </Button>
            
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Hash size={16} className="text-gray-400 shrink-0" />
                <h1 className="text-lg font-semibold text-gray-900 truncate">
                  {room.name}
                </h1>
              </div>
              
              {room.description && (
                <p className="text-sm text-gray-600 truncate">
                  {room.description}
                </p>
              )}
            </div>
          </div>

          {/* Lado direito - Estatísticas */}
          <div className="flex items-center gap-4 shrink-0">
            {/* Usuários conectados */}
            <div className="hidden sm:flex items-center gap-1 text-sm text-gray-500">
              <Users size={14} />
              <span>{connectedUsers.length || 1} online</span>
            </div>

            {/* Data de criação */}
            <div className="hidden md:flex items-center gap-1 text-sm text-gray-500">
              <Calendar size={14} />
              <span>Criada em {formatDateTime(room.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Informações adicionais para mobile */}
        <div className="sm:hidden pb-3 text-xs text-gray-500 space-y-1">
          {room.description && (
            <p className="line-clamp-2">{room.description}</p>
          )}
          <div className="flex items-center justify-between">
            <span>{connectedUsers.length || 1} usuário(s) online</span>
            <span>Criada em {new Date(room.createdAt).toLocaleDateString('pt-BR')}</span>
          </div>
        </div>
      </div>
    </header>
  );
}