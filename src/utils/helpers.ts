export const generateUniqueId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
};

export const calculateDaysRemaining = (targetDate: Date): number => {
  const today = new Date();
  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
};

export const getProgressColor = (progress: number): string => {
  if (progress < 30) return 'bg-amber-500';
  if (progress < 70) return 'bg-blue-500';
  return 'bg-emerald-500';
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const getCategoryIcon = (category: string): string => {
  switch (category) {
    case 'fitness':
      return '🏃‍♂️';
    case 'career':
      return '💼';
    case 'personal':
      return '🌱';
    case 'education':
      return '📚';
    case 'financial':
      return '💰';
    default:
      return '🎯';
  }
};