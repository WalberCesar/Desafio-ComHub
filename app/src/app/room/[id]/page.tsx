'use client';

// =============================================================================
// PÁGINA DE SALA INDIVIDUAL - PitchLab
// =============================================================================

import React from 'react';
import { useParams } from 'next/navigation';
import { RoomView } from '@/components/room/RoomView';

export default function RoomPage() {
  const params = useParams();
  const roomId = params.id as string;

  if (!roomId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Sala não encontrada</h1>
          <p className="text-gray-600">ID da sala é inválido</p>
        </div>
      </div>
    );
  }

  return <RoomView roomId={roomId} />;
}