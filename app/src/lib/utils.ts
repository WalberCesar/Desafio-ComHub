// =============================================================================
// UTILITÁRIOS - Frontend PitchLab
// =============================================================================

/**
 * Formata uma data para "X tempo atrás" (ex: "2 horas atrás")
 */
export function formatDistanceToNow(date: string | Date): string {
  const now = new Date();
  const target = new Date(date);
  const diffInMs = now.getTime() - target.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) {
    return 'agora';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} min atrás`;
  } else if (diffInHours < 24) {
    return `${diffInHours} h atrás`;
  } else if (diffInDays < 7) {
    return `${diffInDays} dias atrás`;
  } else {
    return target.toLocaleDateString('pt-BR');
  }
}

/**
 * Formata uma data para formato brasileiro
 */
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('pt-BR');
}

/**
 * Formata horário no formato brasileiro
 */
export function formatTime(date: string | Date): string {
  return new Date(date).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Formata data e hora completas
 */
export function formatDateTime(date: string | Date): string {
  const d = new Date(date);
  return `${formatDate(d)} às ${formatTime(d)}`;
}

/**
 * Classe utilitária para combinar classes CSS condicionalmente
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Trunca texto adicionando "..." se exceder o limite
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Debounce function para evitar múltiplas chamadas
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Gera uma cor aleatória para avatars
 */
export function generateAvatarColor(name: string): string {
  const colors = [
    'bg-red-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-gray-500',
  ];
  
  const hash = name.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  
  return colors[Math.abs(hash) % colors.length];
}

/**
 * Obtém as iniciais de um nome
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}