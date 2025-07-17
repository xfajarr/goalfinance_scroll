
export const formatCurrency = (amount: number): string => {
  return `$${amount.toLocaleString()}`;
};

export const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

export const calculateProgress = (current: number, goal: number): number => {
  return Math.min((current / goal) * 100, 100);
};

export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};
