
export const formatCurrency = (amount: number): string => {
  return `$${amount.toLocaleString()}`;
};

export const calculateProgress = (current: number, goal: number): number => {
  return Math.min((current / goal) * 100, 100);
};
