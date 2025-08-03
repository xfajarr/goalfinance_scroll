import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gift, Plus, Users, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

// Import responsive layout components
import { Container, Grid } from '@/components/layout-components';

// Demo Goal Card Component
interface DemoGoalCardProps {
  goal: {
    id: number;
    name: string;
    goal: number;
    current: number;
    members: number;
    daysLeft: number;
    status: string;
  };
  index: number;
}

const DemoGoalCard = ({ goal, index }: DemoGoalCardProps) => {
  const progress = (goal.current / goal.goal) * 100;
  
  const cardColors = [
    'bg-gradient-to-br from-purple-100 to-pink-100',
    'bg-gradient-to-br from-blue-100 to-cyan-100',
    'bg-gradient-to-br from-green-100 to-emerald-100',
  ];
  
  const avatars = ['🎯', '💰', '🏠', '🚗', '✈️', '🎓'];
  const cardColor = cardColors[index % cardColors.length];
  const avatar = avatars[index % avatars.length];

  return (
    <Card className={`${cardColor} backdrop-blur-sm border-goal-border/30 p-4 lg:p-6 rounded-2xl hover:scale-[1.02] transition-all duration-200 mb-3 md:mb-0 h-full`}>
      <div className="flex items-center justify-between mb-3 lg:mb-4">
        <div className="flex items-center gap-3 lg:gap-4">
          <div className="w-12 h-12 lg:w-16 lg:h-16 bg-white/70 rounded-full flex items-center justify-center">
            <span className="text-2xl lg:text-3xl">{avatar}</span>
          </div>
          <div>
            <h3 className="font-fredoka font-bold text-goal-heading text-lg lg:text-xl">{goal.name}</h3>
            <p className="text-goal-text-secondary text-sm lg:text-base font-inter">
              {goal.daysLeft} days left
            </p>
            <div className="flex items-center gap-1 mt-1">
              <Users className="w-3 h-3 lg:w-4 lg:h-4 text-goal-text-secondary" />
              <span className="text-goal-text-secondary text-xs lg:text-sm font-inter">
                {goal.members} members
              </span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-goal-text-secondary text-sm lg:text-base font-inter mb-1">
            {Math.round(progress)}%
          </div>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="mb-2">
        <div className="flex justify-between items-center mb-1">
          <span className="text-goal-text-secondary text-xs lg:text-sm font-inter">Progress</span>
          <span className="text-goal-text-secondary text-xs lg:text-sm font-inter">
            ${goal.current.toLocaleString()} / ${goal.goal.toLocaleString()}
          </span>
        </div>
        <div className="w-full bg-white/30 rounded-full h-2 lg:h-3">
          <div 
            className={`h-2 lg:h-3 rounded-full transition-all duration-300 bg-goal-text`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          ></div>
        </div>
      </div>
    </Card>
  );
};

const DashboardDemo = () => {
  const demoGoals = [
    {
      id: 1,
      name: "Emergency Fund",
      goal: 10000,
      current: 7500,
      members: 1,
      daysLeft: 45,
      status: "active"
    },
    {
      id: 2,
      name: "Vacation Fund",
      goal: 5000,
      current: 3200,
      members: 4,
      daysLeft: 120,
      status: "active"
    },
    {
      id: 3,
      name: "New Car",
      goal: 25000,
      current: 8500,
      members: 2,
      daysLeft: 365,
      status: "active"
    }
  ];

  const stats = {
    totalSaved: 19200,
    earnedYield: 1250,
    activeGoals: 3,
    friends: 12
  };

  return (
    <div className="min-h-screen bg-goal-bg pb-32 md:pb-0">
      {/* Header */}
      <Container size="xl" className="pt-6 pb-4">
        <div className="text-center">
          <h1 className="text-2xl lg:text-3xl font-fredoka font-bold text-goal-heading mb-2">
            Dashboard Responsive Demo
          </h1>
          <p className="text-goal-text-secondary text-sm lg:text-base font-inter">
            Showcasing responsive design improvements for desktop
          </p>
        </div>
      </Container>

      {/* Total Amount Section */}
      <Container size="xl" className="pt-10 pb-6 lg:pt-16 lg:pb-8">
        <div className="text-center">
          <div className="text-goal-text-secondary text-lg md:text-xl font-inter mb-2">I have</div>
          <div className="text-goal-heading text-5xl md:text-6xl lg:text-7xl font-fredoka font-bold mb-2">
            ${stats.totalSaved.toLocaleString()}
          </div>
          <div className="text-goal-text-secondary text-sm md:text-base font-inter">in my total goals</div>
        </div>
      </Container>

      <Container size="xl" className="space-y-6 lg:space-y-8">
        {/* Win Exciting Rewards Section */}
        <Card className="bg-goal-primary/60 backdrop-blur-sm border-goal-border/30 p-4 lg:p-6 rounded-2xl">
          <div className="flex items-center gap-3 lg:gap-4">
            <div className="w-12 h-12 lg:w-16 lg:h-16 bg-goal-accent rounded-2xl flex items-center justify-center">
              <Gift className="w-6 h-6 lg:w-8 lg:h-8 text-goal-text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-goal-heading font-fredoka font-bold text-lg lg:text-xl">Win Exciting Rewards</h3>
              <p className="text-goal-text-secondary text-sm lg:text-base font-inter">Complete your goal to unlock your earning yield</p>
            </div>
          </div>
        </Card>

        {/* My Goals Section */}
        <div className="space-y-4 lg:space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-goal-heading font-fredoka font-bold text-xl lg:text-2xl">My Goals</h2>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" className="text-goal-text/90 hover:text-goal-text font-fredoka font-semibold">
                View All (3)
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>

          {/* Add New Goal Button */}
          <Card className="bg-goal-accent/60 backdrop-blur-sm border-goal-border/30 p-4 lg:p-6 rounded-2xl hover:bg-goal-accent/80 transition-all duration-200">
            <div className="flex items-center justify-center gap-2">
              <Plus className="w-5 h-5 lg:w-6 lg:h-6 text-goal-text-primary" />
              <span className="text-goal-text-primary font-fredoka font-semibold text-sm lg:text-base">Add new goal</span>
            </div>
          </Card>

          {/* Goal Cards - Responsive Grid */}
          <Grid cols={3} gap="md" className="md:gap-6">
            {demoGoals.map((goal, index) => (
              <DemoGoalCard key={goal.id} goal={goal} index={index} />
            ))}
          </Grid>
        </div>

        {/* Join Goal Circle Section */}
        <Card className="bg-white/60 backdrop-blur-sm border-goal-border/30 p-6 lg:p-8 rounded-3xl">
          <div className="text-center mb-6 lg:mb-8">
            <h3 className="text-goal-heading font-fredoka font-bold text-xl lg:text-2xl mb-2">Join a Circle</h3>
            <p className="text-goal-text-secondary font-inter text-sm lg:text-base">
              Enter an invite code to join a savings circle with friends
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
            <input
              type="text"
              placeholder="Enter invite code (e.g., 0x...)"
              className="flex-1 bg-goal-soft/50 border border-goal-border/30 rounded-full px-4 py-3 lg:px-6 lg:py-4 font-inter placeholder:text-goal-text/50 focus:border-goal-primary focus:ring-goal-primary focus:outline-none"
            />
            <Button className="bg-goal-primary hover:bg-goal-primary/90 text-goal-text rounded-full px-6 lg:px-8 py-3 lg:py-4 font-fredoka font-semibold w-full sm:w-auto">
              Validate
            </Button>
          </div>
        </Card>

        {/* Responsive Info */}
        <Card className="bg-goal-soft/60 backdrop-blur-sm border-goal-border/30 p-6 lg:p-8 rounded-2xl">
          <div className="text-center">
            <h3 className="text-goal-heading font-fredoka font-bold text-lg lg:text-xl mb-4">
              Responsive Design Features
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm lg:text-base">
              <div className="bg-white/50 p-4 rounded-xl">
                <div className="font-fredoka font-semibold text-goal-heading mb-2">📱 Mobile First</div>
                <div className="text-goal-text-secondary">Optimized for mobile devices</div>
              </div>
              <div className="bg-white/50 p-4 rounded-xl">
                <div className="font-fredoka font-semibold text-goal-heading mb-2">🖥️ Desktop Enhanced</div>
                <div className="text-goal-text-secondary">Better spacing and layout on desktop</div>
              </div>
              <div className="bg-white/50 p-4 rounded-xl">
                <div className="font-fredoka font-semibold text-goal-heading mb-2">📐 Responsive Grid</div>
                <div className="text-goal-text-secondary">Goal cards adapt to screen size</div>
              </div>
            </div>
          </div>
        </Card>
      </Container>
    </div>
  );
};

export default DashboardDemo;
