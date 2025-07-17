
import { StatCard } from '@/components/ui/stat-card';
import { DollarSign, TrendingUp, Target, Users } from 'lucide-react';

interface QuickStatsProps {
  totalSaved: string;
  earnedYield: string;
  activeGoals: number;
  friends: number;
}

export const QuickStats = ({ totalSaved, earnedYield, activeGoals, friends }: QuickStatsProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard
        icon={DollarSign}
        value={totalSaved}
        label="Total Saved"
        iconBgColor="bg-goal-primary"
      />
      
      <StatCard
        icon={TrendingUp}
        value={earnedYield}
        label="Earned Yield"
        iconBgColor="bg-goal-accent"
      />
      
      <StatCard
        icon={Target}
        value={activeGoals.toString()}
        label="Active Goals"
        iconBgColor="bg-goal-border"
      />
      
      <StatCard
        icon={Users}
        value={friends.toString()}
        label="Friends"
        iconBgColor="bg-goal-primary/50"
      />
    </div>
  );
};
