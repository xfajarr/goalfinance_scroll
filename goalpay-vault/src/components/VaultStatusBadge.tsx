
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, XCircle, Users } from 'lucide-react';

interface GoalStatusBadgeProps {
  status: 'active' | 'completed' | 'failed' | 'pending';
  size?: 'sm' | 'md' | 'lg';
}

export const VaultStatusBadge = ({ status, size = 'md' }: GoalStatusBadgeProps) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'active':
        return {
          icon: Clock,
          text: 'Active',
          className: 'bg-green-100 text-green-800 border-green-200'
        };
      case 'completed':
        return {
          icon: CheckCircle,
          text: 'Completed',
          className: 'bg-blue-100 text-blue-800 border-blue-200'
        };
      case 'failed':
        return {
          icon: XCircle,
          text: 'Failed',
          className: 'bg-red-100 text-red-800 border-red-200'
        };
      case 'pending':
        return {
          icon: Users,
          text: 'Pending',
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
        };
      default:
        return {
          icon: Clock,
          text: 'Unknown',
          className: 'bg-gray-100 text-gray-800 border-gray-200'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-0.5',
    lg: 'text-base px-3 py-1'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <Badge
      variant="outline"
      className={`${config.className} ${sizeClasses[size]} inline-flex items-center gap-1 font-fredoka font-semibold w-fit`}
    >
      <Icon className={iconSizes[size]} />
      {config.text}
    </Badge>
  );
};
