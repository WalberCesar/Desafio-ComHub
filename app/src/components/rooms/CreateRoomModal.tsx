'use client';

// =============================================================================
// MODAL DE CRIAÇÃO DE SALA - PitchLab
// =============================================================================

import React, { useState } from 'react';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import type { Room, RoomFormData } from '@/types';
import { X, Plus } from 'lucide-react';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRoomCreated: (room: Room) => void;
}

export function CreateRoomModal({ isOpen, onClose, onRoomCreated }: CreateRoomModalProps) {
  const [formData, setFormData] = useState<RoomFormData>({
    name: '',
    description: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const resetForm = () => {
    setFormData({ name: '', description: '' });
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('O nome da sala é obrigatório');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await apiClient.createRoom({
        name: formData.name.trim(),
        description: formData.description?.trim() || undefined,
      });

      if (response.success && response.data) {
        onRoomCreated(response.data);
        resetForm();
      } else {
        setError(response.error || 'Erro ao criar sala');
      }
    } catch (error) {
      setError('Erro inesperado ao criar sala');
      console.error('Erro ao criar sala:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="relative">
            <button
              onClick={handleClose}
              className="absolute top-0 right-0 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
            
            <CardTitle className="flex items-center gap-2">
              <Plus size={20} className="text-blue-600" />
              Criar Nova Sala
            </CardTitle>
            
            <p className="text-sm text-gray-600 mt-2">
              Crie uma sala para começar a colaborar com sua equipe
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Nome da Sala"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Brainstorm Marketing Q1"
                required
                maxLength={100}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição (opcional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descreva o objetivo da sala..."
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  rows={3}
                  maxLength={300}
                />
                <p className="mt-1 text-xs text-gray-500">
                  {formData.description?.length || 0}/300 caracteres
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  isLoading={isLoading}
                  className="flex-1"
                >
                  Criar Sala
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}