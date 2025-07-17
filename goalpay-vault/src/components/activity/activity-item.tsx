
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface ActivityItemProps {
  activity: {
    id: number;
    user: string;
    action: string;
    amount?: number;
    timestamp: string;
  };
}

export const ActivityItem = ({ activity }: ActivityItemProps) => {
  return (
    <div className="flex items-center space-x-4 p-4 bg-goal-accent/20 rounded-2xl">
      <Avatar className="w-10 h-10 bg-goal-primary">
        <AvatarFallback className="text-goal-text font-fredoka font-semibold">
          {activity.user.charAt(0)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <p className="font-inter text-goal-text">
          <span className="font-semibold">{activity.user}</span> {activity.action}
          {activity.amount && <span className="font-semibold"> ${activity.amount}</span>}
        </p>
        <p className="font-inter text-sm text-goal-text/60">{activity.timestamp}</p>
      </div>
    </div>
  );
};
