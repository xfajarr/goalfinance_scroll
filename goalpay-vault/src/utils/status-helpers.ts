
export const getStatusColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    active: "bg-green-50 text-green-500 border border-green-200",
    completed: "bg-blue-50 text-blue-500 border border-blue-200",
    paused: "bg-yellow-50 text-yellow-500 border border-yellow-200",
    default: "bg-gray-50 text-gray-500 border border-gray-200"
  };
  
  return statusColors[status] || statusColors.default;
};

export const getStatusText = (status: string): string => {
  const statusTexts: Record<string, string> = {
    active: "Active",
    completed: "Completed",
    paused: "Paused",
    pending: "Pending"
  };
  
  return statusTexts[status] || status;
};
