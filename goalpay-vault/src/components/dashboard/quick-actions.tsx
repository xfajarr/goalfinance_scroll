
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Users, BookOpen } from 'lucide-react';

export const QuickActions = () => {
  return (
    <Card className="bg-white/60 backdrop-blur-sm border-goal-border/30 p-component rounded-3xl">
      <h3 className="font-fredoka font-bold text-lg text-goal-text-primary mb-4">Quick Actions</h3>

      <div className="space-tight">
        <Link to="/app/create-goal">
          <Button variant="outline" className="w-full rounded-2xl">
            <Plus className="w-4 h-4 mr-2" />
            Create New Goal
          </Button>
        </Link>

        <Link to="/app/discover-circles">
          <Button variant="outline" className="w-full rounded-2xl mt-2">
            <Users className="w-4 h-4 mr-2" />
            Discover Circles
          </Button>
        </Link>

        <Link to="/app/learn">
          <Button variant="outline" className="w-full rounded-2xl mt-2">
            <BookOpen className="w-4 h-4 mr-2" />
            Learn & Earn
          </Button>
        </Link>
      </div>
    </Card>
  );
};
