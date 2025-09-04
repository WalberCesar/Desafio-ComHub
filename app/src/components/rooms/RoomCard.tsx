'use client';

// =============================================================================
// CARD DE SALA - PitchLab
// =============================================================================

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatDistanceToNow } from '@/lib/utils';
import type { Room } from '@/types';
import { Users, MessageCircle, ArrowRight, Calendar } from 'lucide-react';

interface RoomCardProps {
  room: Room;
}

export function RoomCard({ room }: RoomCardProps) {
  const router = useRouter();

  const handleEnterRoom = () => {
    router.push(`/room/${room.id}`);
  };

  return (
    <Card className="hover:shadow-md transition-shadow cursor-default group">
      <CardContent className="p-6">
        {/* Header da sala */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
            {room.name}
          </h3>
          
          {room.description && (
            <p className="text-gray-600 mt-1 text-sm line-clamp-2">
              {room.description}
            </p>
          )}
        </div>

        {/* Estatísticas */}
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
          {room._count && (
            <>
              <div className="flex items-center gap-1">
                <MessageCircle size={14} />
                <span>{room._count.messages || 0} mensagens</span>
              </div>
              
              <div className="flex items-center gap-1">
                <Users size={14} />
                <span>{room._count?.ideas || 0} ideias</span>
              </div>
            </>
          )}
        </div>

        {/* Data de criação */}
        <div className="flex items-center gap-1 text-xs text-gray-400 mb-4">
          <Calendar size={12} />
          <span>Criada {formatDistanceToNow(room.createdAt)}</span>
        </div>

        {/* Botão de entrar */}
        <Button 
          onClick={handleEnterRoom}
          className="w-full flex items-center justify-center gap-2 group-hover:bg-blue-700 transition-colors cursor-pointer"
        >
          Entrar na Sala
          <ArrowRight size={16} />
        </Button>
      </CardContent>
    </Card>
  );
}