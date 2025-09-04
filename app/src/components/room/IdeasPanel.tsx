'use client';

// =============================================================================
// PAINEL DE IDEIAS - PitchLab
// =============================================================================

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { IdeaCard } from './IdeaCard';
import type { Idea, IdeaFormData } from '@/types';
import { Plus, Lightbulb, TrendingUp, Clock } from 'lucide-react';

interface IdeasPanelProps {
  ideas: Idea[];
  onCreateIdea: (title: string, description?: string) => Promise<void>;
  onVoteIdea: (ideaId: string) => Promise<void>;
}

type SortType = 'newest' | 'votes' | 'oldest';

export function IdeasPanel({ ideas, onCreateIdea, onVoteIdea }: IdeasPanelProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [sortBy, setSortBy] = useState<SortType>('newest');
  const [isCreating, setIsCreating] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState<IdeaFormData>({
    title: '',
    description: '',
  });

  // =============================================================================
  // ORDENAÇÃO DE IDEIAS
  // =============================================================================

  const sortedIdeas = React.useMemo(() => {
    const sorted = [...ideas];
    
    switch (sortBy) {
      case 'votes':
        return sorted.sort((a, b) => b.votes - a.votes);
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      case 'newest':
      default:
        return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  }, [ideas, sortBy]);

  // =============================================================================
  // CRIAÇÃO DE IDEIAS
  // =============================================================================

  const handleCreateIdea = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) return;

    setIsCreating(true);
    
    try {
      await onCreateIdea(
        formData.title.trim(),
        formData.description?.trim() || undefined
      );
      
      // Reset form
      setFormData({ title: '', description: '' });
      setShowCreateForm(false);
    } catch (error) {
      console.error('Erro ao criar ideia:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCancelCreate = () => {
    setFormData({ title: '', description: '' });
    setShowCreateForm(false);
  };

  // =============================================================================
  // RENDER
  // =============================================================================

  return (
    <div className="flex flex-col h-full w-full bg-white border-l border-gray-200">
      {/* Header do painel */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Lightbulb className="text-yellow-500" size={20} />
            <h2 className="font-semibold text-gray-900">Ideias</h2>
            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
              {ideas.length}
            </span>
          </div>

          <Button
            size="sm"
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2"
            disabled={showCreateForm}
          >
            <Plus size={16} />
            Nova
          </Button>
        </div>

        {/* Filtros de ordenação */}
        <div className="flex gap-2">
          <button
            onClick={() => setSortBy('newest')}
            className={`text-xs px-3 py-1 rounded-full transition-colors ${
              sortBy === 'newest'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Clock size={12} className="inline mr-1" />
            Recentes
          </button>
          
          <button
            onClick={() => setSortBy('votes')}
            className={`text-xs px-3 py-1 rounded-full transition-colors ${
              sortBy === 'votes'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <TrendingUp size={12} className="inline mr-1" />
            Votos
          </button>
        </div>
      </div>

      {/* Formulário de criação */}
      {showCreateForm && (
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <form onSubmit={handleCreateIdea} className="space-y-3">
            <Input
              label="Título da Ideia"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Digite o título da sua ideia..."
              required
              maxLength={100}
              autoFocus
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição (opcional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descreva sua ideia em detalhes..."
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                rows={3}
                maxLength={500}
              />
              <p className="mt-1 text-xs text-gray-500">
                {formData.description?.length || 0}/500 caracteres
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCancelCreate}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                size="sm"
                isLoading={isCreating}
                disabled={!formData.title.trim()}
                className="flex-1"
              >
                Criar Ideia
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de ideias */}
      <div className="flex-1 overflow-y-auto">
        {sortedIdeas.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-gray-500">
            <div className="bg-gray-100 p-4 rounded-full mb-4">
              <Lightbulb size={24} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium mb-2">Nenhuma ideia ainda</h3>
            <p className="text-sm text-center mb-4">
              Seja o primeiro a compartilhar uma ideia!
            </p>
            <Button
              size="sm"
              onClick={() => setShowCreateForm(true)}
              disabled={showCreateForm}
            >
              <Plus size={16} className="mr-2" />
              Criar Primeira Ideia
            </Button>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {sortedIdeas.map((idea) => (
              <IdeaCard
                key={idea.id}
                idea={idea}
                onVote={() => onVoteIdea(idea.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}