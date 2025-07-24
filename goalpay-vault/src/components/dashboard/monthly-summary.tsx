
import { Card } from '@/components/ui/card';

interface MonthlySummaryProps {
  saved: string;
  yieldEarned: string;
  goalsReached: number;
}

export const MonthlySummary = ({ saved, yieldEarned, goalsReached }: MonthlySummaryProps) => {
  return (
    <Card className="bg-white/60 backdrop-blur-sm border-goal-border/30 p-component rounded-3xl">
      <h3 className="font-fredoka font-bold text-lg text-goal-text-primary mb-4">This Month</h3>

      <div className="space-element">
        <div className="flex justify-between items-center">
          <span className="font-inter text-sm text-goal-text-secondary">Saved</span>
          <span className="font-fredoka font-bold text-goal-text-primary">$0</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-inter text-sm text-goal-text-secondary">Yield Earned</span>
          <span className="font-fredoka font-bold text-green-600">$0</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-inter text-sm text-goal-text-secondary">Goals Reached</span>
          <span className="font-fredoka font-bold text-goal-text-primary">0</span>
        </div>
      </div>
    </Card>
  );
};
