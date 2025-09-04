'use client';

// =============================================================================
// INDICADOR DE DIGITAÇÃO - PitchLab
// =============================================================================

import React from 'react';

interface TypingIndicatorProps {
  users: string[];
}

export function TypingIndicator({ users }: TypingIndicatorProps) {
  if (users.length === 0) return null;

  const formatTypingText = (usersList: string[]) => {
    if (usersList.length === 1) {
      return `${usersList[0]} está digitando...`;
    } else if (usersList.length === 2) {
      return `${usersList[0]} e ${usersList[1]} estão digitando...`;
    } else {
      return `${usersList[0]}, ${usersList[1]} e mais ${usersList.length - 2} pessoas estão digitando...`;
    }
  };

  return (
    <div className="flex items-center gap-3">
      {/* Avatar genérico */}
      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
        <span className="text-xs text-gray-600">...</span>
      </div>

      {/* Bubble de digitação */}
      <div className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg rounded-bl-sm">
        <div className="flex items-center gap-2">
          <span className="text-sm">{formatTypingText(users)}</span>
          
          {/* Animação de pontinhos */}
          <div className="flex gap-1">
            <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}