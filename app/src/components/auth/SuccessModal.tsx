'use client';

// =============================================================================
// MODAL DE SUCESSO - PitchLab
// =============================================================================

import React from 'react';
import { Button } from '@/components/ui/Button';
import { CheckCircle } from 'lucide-react';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  buttonText?: string;
}

export function SuccessModal({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  buttonText = "Continuar" 
}: SuccessModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 animate-in fade-in zoom-in duration-200">
        {/* Conteúdo */}
        <div className="p-6 text-center">
          {/* Ícone de sucesso */}
          <div className="mx-auto flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>

          {/* Título */}
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {title}
          </h3>

          {/* Mensagem */}
          <p className="text-gray-600 mb-6">
            {message}
          </p>

          {/* Botão */}
          <Button 
            onClick={onClose}
            className="w-full"
          >
            {buttonText}
          </Button>
        </div>
      </div>
    </div>
  );
}
