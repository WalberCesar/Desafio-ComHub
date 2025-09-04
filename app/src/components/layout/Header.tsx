'use client';

// =============================================================================
// HEADER DA APLICAÇÃO - PitchLab
// =============================================================================

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { LogOut, User, Lightbulb } from 'lucide-react';

export function Header() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    // A aplicação automaticamente mostrará o modal de auth novamente
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Lightbulb className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">PitchLab</h1>
                <p className="text-xs text-gray-500">Ideação Colaborativa</p>
              </div>
            </div>
          </div>

          {/* User Info & Actions */}
          <div className="flex items-center gap-4">
            {/* User Info */}
            <div className="flex items-center gap-2 text-sm">
              <div className="bg-gray-100 p-2 rounded-full">
                <User size={16} className="text-gray-600" />
              </div>
              <div className="hidden sm:block">
                <p className="font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">
                  {user?.isGuest ? 'Convidado' : user?.email}
                </p>
              </div>
            </div>

            {/* Logout Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Sair</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}