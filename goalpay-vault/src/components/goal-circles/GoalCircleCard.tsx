import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Users, Calendar, ChevronRight, Clock, Target } from 'lucide-react';
import { GoalCircle } from '@/types/goalCircles';
import { GOAL_CIRCLE_CATEGORIES } from '@/constants/goalCircles';

interface GoalCircleCardProps {
  circle: GoalCircle;
  showJoinButton?: boolean;
  onJoin?: (circleId: string) => void;
  isJoining?: boolean;
}

export const GoalCircleCard = ({ 
  circle, 
  showJoinButton = false, 
  onJoin, 
  isJoining = false 
}: GoalCircleCardProps) => {
  const progress = (circle.currentAmount / circle.targetAmount) * 100;
  const daysLeft = Math.ceil((circle.deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const categoryInfo = GOAL_CIRCLE_CATEGORIES[circle.category];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleJoinClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onJoin) {
      onJoin(circle.id);
    }
  };

  const CardContent = () => (
    <Card className="p-4 md:p-6 bg-goal-accent/30 border-goal-border/30 rounded-2xl hover:scale-[1.02] hover:shadow-lg transition-all duration-200 cursor-pointer group min-h-[200px] flex flex-col">
      <div className="flex flex-col h-full space-y-4">
        {/* Header */}
        <div className="flex justify-between items-start gap-3">
          <div className="flex items-center gap-3 flex-1">
            <div className="text-2xl">{circle.image || categoryInfo.emoji}</div>
            <div className="flex-1 min-w-0">
              <h3 className="font-fredoka font-bold text-base md:text-lg text-goal-text group-hover:text-goal-subheading transition-colors line-clamp-2">
                {circle.name}
              </h3>
              <p className="text-xs text-goal-text/70 font-inter mt-1">
                {categoryInfo.name}
              </p>
            </div>
          </div>
          <Badge className={`${getStatusColor(circle.status)} font-fredoka font-medium text-xs shrink-0`}>
            {circle.status}
          </Badge>
        </div>

        {/* Description */}
        <p className="text-sm text-goal-text/80 font-inter line-clamp-2 flex-1">
          {circle.description}
        </p>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="font-inter text-goal-text/70">Progress</span>
            <span className="font-fredoka font-semibold text-goal-text">
              {formatCurrency(circle.currentAmount)} / {formatCurrency(circle.targetAmount)}
            </span>
          </div>
          <Progress 
            value={progress} 
            className="h-2 bg-goal-soft"
          />
          <div className="text-xs text-goal-text/60 font-inter">
            {progress.toFixed(1)}% complete
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-goal-text/70 font-inter">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{circle.memberCount}/{circle.maxMembers}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{daysLeft > 0 ? `${daysLeft} days left` : 'Expired'}</span>
          </div>
          {!circle.isPublic && (
            <div className="flex items-center gap-1">
              <span className="text-xs">🔒 Private</span>
            </div>
          )}
        </div>

        {/* Action Button or Arrow */}
        {showJoinButton ? (
          <Button
            onClick={handleJoinClick}
            disabled={isJoining || circle.memberCount >= circle.maxMembers || circle.status !== 'active'}
            className="w-full bg-goal-primary hover:bg-goal-primary/90 text-white font-fredoka font-semibold rounded-full"
          >
            {isJoining ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Joining...
              </>
            ) : circle.memberCount >= circle.maxMembers ? (
              'Full'
            ) : circle.status !== 'active' ? (
              'Unavailable'
            ) : (
              'Join Circle'
            )}
          </Button>
        ) : (
          <div className="flex items-center justify-end text-goal-text/50 group-hover:text-goal-text/70 transition-colors">
            <ChevronRight className="w-5 h-5" />
          </div>
        )}
      </div>
    </Card>
  );

  if (showJoinButton) {
    return <CardContent />;
  }

  return (
    <Link to={`/app/goal-circle/${circle.id}`}>
      <CardContent />
    </Link>
  );
};
