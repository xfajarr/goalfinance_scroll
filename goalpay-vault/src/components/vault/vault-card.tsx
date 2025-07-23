
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, Calendar, ChevronRight } from 'lucide-react';
import { formatCurrency, calculateProgress } from '@/utils/formatters';
import { getStatusColor, getStatusText } from '@/utils/status-helpers';

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
      <Card className="p-4 md:p-6 bg-goal-accent/30 border-goal-border/30 rounded-2xl hover:scale-[1.02] hover:shadow-lg transition-all duration-200 cursor-pointer group min-h-[180px] flex flex-col">
        <div className="flex flex-col h-full space-y-4">
          <div className="flex justify-between items-start gap-3">
            <h3 className="font-fredoka font-bold text-base md:text-lg text-goal-text group-hover:text-goal-subheading transition-colors line-clamp-2 flex-1">
              {vault.name}
            </h3>
            <Badge className={`${getStatusColor(vault.status)} font-fredoka font-medium text-xs shrink-0`}>
              {getStatusText(vault.status)}
            </Badge>
          </div>

          <div className="flex-1 space-y-3">
            <div className="flex justify-between text-xs md:text-sm">
              <span className="font-inter text-goal-text-secondary">Progress</span>
              <span className="font-fredoka font-bold text-goal-text-primary text-xs md:text-sm">
                {formatCurrency(vault.current)} / {formatCurrency(vault.goal)}
              </span>
            </div>
            <Progress
              value={calculateProgress(vault.current, vault.goal)}
              className="h-2 md:h-3 bg-goal-accent"
            />

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 pt-1">
              <div className="flex items-center gap-3 md:gap-4 text-xs text-goal-text-muted">
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3 md:w-4 md:h-4" />
                  <span>{vault.members} members</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                  <span>{vault.daysLeft} days left</span>
                </div>
              </div>
              <div className="flex items-center text-goal-text-secondary group-hover:text-goal-text transition-colors self-end sm:self-auto">
                <span className="font-inter text-xs md:text-sm font-medium mr-1">View</span>
                <ChevronRight className="w-3 h-3 md:w-4 md:h-4" />
              </div>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
};
