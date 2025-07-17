
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy } from 'lucide-react';

export const AchievementsPreview = () => {
  return (
    <Card className="bg-white/60 backdrop-blur-sm border-goal-border/30 p-6 rounded-3xl">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-fredoka font-semibold text-goal-text">Latest Achievement</h3>
        <Link to="/learn" className="text-goal-primary hover:text-goal-primary/80 font-inter text-sm">
          View All
        </Link>
      </div>
      
      <div className="flex items-center space-x-3 p-4 bg-goal-primary/20 rounded-2xl">
        <div className="w-12 h-12 bg-goal-primary rounded-2xl flex items-center justify-center">
          <Trophy className="w-6 h-6 text-goal-text" />
        </div>
        <div>
          <h4 className="font-fredoka font-semibold text-goal-text">Streak Master</h4>
          <p className="font-inter text-sm text-goal-text/70">7-day learning streak</p>
          <Badge className="bg-goal-primary/20 text-goal-text border-goal-border/30 mt-1">
            +50 points
          </Badge>
        </div>
      </div>
    </Card>
  );
};
