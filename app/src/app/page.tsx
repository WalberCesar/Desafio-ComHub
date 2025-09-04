'use client';

// =============================================================================
// PÁGINA PRINCIPAL - LISTAGEM DE SALAS - PitchLab
// =============================================================================

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthModal } from '@/components/auth/AuthModal';
import { RoomsPage } from '@/components/rooms/RoomsPage';

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const [showAuthModal, setShowAuthModal] = React.useState(false);

  // Mostrar modal de auth se não estiver autenticado
  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setShowAuthModal(true);
    } else {
      setShowAuthModal(false);
    }
  }, [isAuthenticated, isLoading]);

  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Página principal - só mostra se autenticado */}
      {isAuthenticated && <RoomsPage />}
      
      {/* Modal de autenticação */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </>
  );
}
