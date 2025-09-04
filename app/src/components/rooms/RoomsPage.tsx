'use client';

// =============================================================================
// PÁGINA DE SALAS - PitchLab
// =============================================================================

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { CreateRoomModal } from './CreateRoomModal';
import { RoomCard } from './RoomCard';
import { Header } from '@/components/layout/Header';
import type { Room } from '@/types';
import { Plus, RefreshCw } from 'lucide-react';

export function RoomsPage() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [error, setError] = useState<string>('');

  // =============================================================================
  // CARREGAR SALAS
  // =============================================================================

  const loadRooms = async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      
      setError('');
      const response = await apiClient.getRooms();
      
      if (response.success && response.data) {
        setRooms(response.data);
      } else {
        setError(response.error || 'Erro ao carregar salas');
      }
    } catch (error) {
      setError('Erro inesperado ao carregar salas');
      console.error('Erro ao carregar salas:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Carregar salas ao montar o componente
  useEffect(() => {
    loadRooms();
  }, []);

  // =============================================================================
  // HANDLERS
  // =============================================================================

  const handleRoomCreated = (newRoom: Room) => {
    setRooms(prev => [newRoom, ...prev]);
    setShowCreateModal(false);
  };

  const handleRefresh = () => {
    loadRooms(true);
  };

  // =============================================================================
  // RENDER
  // =============================================================================

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Cabeçalho da página */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Salas de Ideação
              </h1>
              <p className="mt-2 text-gray-600">
                Bem-vindo(a), {user?.name}! Escolha uma sala ou crie uma nova para começar.
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-2"
              >
                <RefreshCw 
                  size={16} 
                  className={isRefreshing ? 'animate-spin' : ''} 
                />
                Atualizar
              </Button>
              
              <Button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2"
              >
                <Plus size={16} />
                Nova Sala
              </Button>
            </div>
          </div>
        </div>

        {/* Estado de loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Carregando salas...</p>
            </div>
          </div>
        )}

        {/* Estado de erro */}
        {error && !isLoading && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="text-center py-8">
              <p className="text-red-700 mb-4">{error}</p>
              <Button variant="outline" onClick={handleRefresh}>
                Tentar Novamente
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Lista de salas */}
        {!isLoading && !error && (
          <>
            {rooms.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rooms.map((room) => (
                  <RoomCard key={room.id} room={room} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <svg
                      className="mx-auto h-12 w-12"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhuma sala encontrada
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Seja o primeiro a criar uma sala de ideação!
                  </p>
                  <Button onClick={() => setShowCreateModal(true)}>
                    <Plus size={16} className="mr-2" />
                    Criar Primeira Sala
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </main>

      {/* Modal de criação de sala */}
      <CreateRoomModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onRoomCreated={handleRoomCreated}
      />
    </div>
  );
}