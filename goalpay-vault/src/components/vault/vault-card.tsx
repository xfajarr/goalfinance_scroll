
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, Calendar, ChevronRight } from 'lucide-react';
import { formatCurrency, calculateProgress } from '@/utils/formatters';
import { getStatusColor } from '@/utils/status-helpers';

interface VaultCardProps {
  vault: {
    id: number;
    name: string;
    goal: number;
    current: number;
    members: number;
    daysLeft: number;
    status: string;
  };
}

export const VaultCard = ({ vault }: VaultCardProps) => {
  return (
    <Link to={`/vault/${vault.id}`}>
      <Card className="p-component bg-goal-accent/30 border-goal-border/30 rounded-2xl hover:scale-105 hover:shadow-lg transition-all duration-300 cursor-pointer group">
        <div className="space-component">
          <div className="flex justify-between items-start">
            <h3 className="font-fredoka font-bold text-lg text-goal-text group-hover:text-goal-subheading transition-colors">
              {vault.name}
            </h3>
            <Badge className={`${getStatusColor(vault.status)} font-fredoka font-medium`}>
              {vault.status}
            </Badge>
          </div>

          <div className="space-tight">
            <div className="flex justify-between text-sm">
              <span className="font-inter text-goal-text-secondary">Progress</span>
              <span className="font-fredoka font-bold text-goal-text-primary">
                {formatCurrency(vault.current)} / {formatCurrency(vault.goal)}
              </span>
            </div>
            <Progress
              value={calculateProgress(vault.current, vault.goal)}
              className="h-3 bg-goal-accent"
            />

            <div className="flex justify-between items-center pt-2">
              <div className="flex items-center space-x-4 text-xs text-goal-text-muted">
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>{vault.members} members</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{vault.daysLeft} days left</span>
                </div>
              </div>
              <div className="flex items-center text-goal-text-secondary group-hover:text-goal-text transition-colors">
                <span className="font-inter text-sm font-medium mr-1">View</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
};
