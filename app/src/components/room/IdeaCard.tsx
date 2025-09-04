'use client';

// =============================================================================
// CARD DE IDEIA - PitchLab
// =============================================================================

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatDistanceToNow, getInitials, generateAvatarColor } from '@/lib/utils';
import type { Idea } from '@/types';
import { ThumbsUp, Calendar } from 'lucide-react';

interface IdeaCardProps {
  idea: Idea;
  onVote: () => void;
}

export function IdeaCard({ idea, onVote }: IdeaCardProps) {
  const { user } = useAuth();
  const [isVoting, setIsVoting] = useState(false);
  const isOwn = idea.userId === user?.id;

  const handleVote = async () => {
    if (isVoting) return;
    
    setIsVoting(true);
    try {
      await onVote();
    } catch (error) {
      console.error('Erro ao votar:', error);
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        {/* Header com autor */}
        <div className="flex items-center gap-2 mb-3">
          <div className={`w-6 h-6 ${generateAvatarColor(idea.user.name)} rounded-full flex items-center justify-center text-white text-xs font-medium`}>
            {getInitials(idea.user.name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {idea.user.name}
              {idea.user.isGuest && (
                <span className="ml-1 text-xs text-gray-500">(Convidado)</span>
              )}
              {isOwn && (
                <span className="ml-1 text-xs text-blue-600">(Você)</span>
              )}
            </p>
          </div>
          
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Calendar size={12} />
            <span>{formatDistanceToNow(idea.createdAt)}</span>
          </div>
        </div>

        {/* Conteúdo da ideia */}
        <div className="mb-3">
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
            {idea.title}
          </h3>
          
          {idea.description && (
            <p className="text-sm text-gray-600 line-clamp-3">
              {idea.description}
            </p>
          )}
        </div>

        {/* Footer com votação */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleVote}
              disabled={isVoting}
              className={`flex items-center gap-2 transition-colors ${
                idea.votes > 0 
                  ? 'text-blue-600 border-blue-200 hover:bg-blue-50' 
                  : 'text-gray-600'
              }`}
            >
              <ThumbsUp 
                size={14} 
                className={isVoting ? 'animate-pulse' : ''} 
              />
              <span className="font-medium">{idea.votes}</span>
            </Button>
          </div>

          {/* Badge de "sua ideia" */}
          {isOwn && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
              Sua ideia
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}