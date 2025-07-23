
export const getStatusColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    active: "bg-green-50 text-green-600 border border-green-200 font-semibold",
    completed: "bg-blue-50 text-blue-600 border border-blue-200 font-semibold",
    failed: "bg-red-50 text-red-600 border border-red-200 font-semibold",
    cancelled: "bg-gray-50 text-gray-600 border border-gray-200 font-semibold",
    paused: "bg-yellow-50 text-yellow-600 border border-yellow-200 font-semibold",
    default: "bg-gray-50 text-gray-500 border border-gray-200"
  };

  return statusColors[status] || statusColors.default;
};

export const getStatusText = (status: string): string => {
  const statusTexts: Record<string, string> = {
    active: "Active",
    completed: "Completed",
    failed: "Failed",
    cancelled: "Cancelled",
    paused: "Paused",
    pending: "Pending"
  };

  return statusTexts[status] || status;
};
