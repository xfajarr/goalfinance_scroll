
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Navigation from '@/components/Navigation';
import BottomNavigation from '@/components/BottomNavigation';
import { Users, Target, Calendar, TrendingUp, Globe } from 'lucide-react';

const Community = () => {
  // Mock public vaults data
  const publicVaults = [
    {
      id: 1,
      name: "Group Trip to Japan 🇯🇵",
      description: "Save together for an amazing adventure in Tokyo and Kyoto!",
      goal: 8000,
      current: 5200,
      members: [
        { id: 1, name: "Alex", avatar: "A" },
        { id: 2, name: "Sarah", avatar: "S" },
        { id: 3, name: "Mike", avatar: "M" },
        { id: 4, name: "Emma", avatar: "E" },
      ],
      daysLeft: 62,
      creator: "Alex",
      category: "travel",
      yieldRate: "8.5% APY"
    },
    {
      id: 2,
      name: "Gaming Setup Fund 🎮",
      description: "Building the ultimate gaming rig together!",
      goal: 3000,
      current: 1800,
      members: [
        { id: 1, name: "Jake", avatar: "J" },
        { id: 2, name: "Tom", avatar: "T" },
        { id: 3, name: "Lisa", avatar: "L" },
      ],
      daysLeft: 35,
      creator: "Jake",
      category: "electronics",
      yieldRate: "7.2% APY"
    },
    {
      id: 3,
      name: "Emergency Fund Together 🚨",
      description: "Building financial security as a community",
      goal: 15000,
      current: 8900,
      members: [
        { id: 1, name: "Maria", avatar: "M" },
        { id: 2, name: "John", avatar: "J" },
        { id: 3, name: "Kate", avatar: "K" },
        { id: 4, name: "David", avatar: "D" },
        { id: 5, name: "Anna", avatar: "A" },
        { id: 6, name: "Peter", avatar: "P" },
      ],
      daysLeft: 180,
      creator: "Maria",
      category: "emergency",
      yieldRate: "9.1% APY"
    }
  ];

  const getProgressPercentage = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100);
  };

  const getCategoryEmoji = (category: string) => {
    const categories: { [key: string]: string } = {
      travel: '✈️',
      electronics: '📱',
      emergency: '🚨',
      education: '📚',
      housing: '🏠',
      vehicle: '🚗',
      health: '💪',
      other: '🎯'
    };
    return categories[category] || '🎯';
  };

  return (
    <div className="min-h-screen bg-goal-bg pb-20 md:pb-0">
      <Navigation />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-fredoka font-bold text-goal-text mb-4">
            Community Vaults
          </h1>
          <p className="font-inter text-goal-text/70 max-w-2xl mx-auto">
            Join public savings goals and save together with people around the world. 
            Earn yield while building toward shared dreams!
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/60 backdrop-blur-sm border-goal-border/30 p-6 rounded-3xl">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-goal-primary rounded-2xl flex items-center justify-center">
                <Globe className="w-6 h-6 text-goal-text" />
              </div>
              <div>
                <p className="font-inter text-2xl font-bold text-goal-text">
                  {publicVaults.length}
                </p>
                <p className="font-inter text-sm text-goal-text/70">Active Vaults</p>
              </div>
            </div>
          </Card>
          
          <Card className="bg-white/60 backdrop-blur-sm border-goal-border/30 p-6 rounded-3xl">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-goal-accent rounded-2xl flex items-center justify-center">
                <Users className="w-6 h-6 text-goal-text" />
              </div>
              <div>
                <p className="font-inter text-2xl font-bold text-goal-text">
                  {publicVaults.reduce((sum, vault) => sum + vault.members.length, 0)}
                </p>
                <p className="font-inter text-sm text-goal-text/70">Total Members</p>
              </div>
            </div>
          </Card>
          
          <Card className="bg-white/60 backdrop-blur-sm border-goal-border/30 p-6 rounded-3xl">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="font-inter text-2xl font-bold text-goal-text">
                  ${publicVaults.reduce((sum, vault) => sum + vault.current, 0).toLocaleString()}
                </p>
                <p className="font-inter text-sm text-goal-text/70">Total Saved</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Public Vaults Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {publicVaults.map((vault) => (
            <Card key={vault.id} className="bg-white/60 backdrop-blur-sm border-goal-border/30 p-6 rounded-3xl hover:shadow-lg transition-all duration-300 hover:scale-105">
              <div className="space-y-4">
                {/* Vault Header */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getCategoryEmoji(vault.category)}</span>
                    <div className="flex items-center space-x-1 bg-green-100 px-2 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                      <span className="font-inter text-xs text-green-700 font-medium">
                        {vault.yieldRate}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 text-goal-text/60">
                    <Globe className="w-4 h-4" />
                    <span className="font-inter text-xs">Public</span>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-fredoka font-semibold text-goal-text text-lg leading-tight mb-2">
                    {vault.name}
                  </h3>
                  <p className="font-inter text-sm text-goal-text/70 line-clamp-2">
                    {vault.description}
                  </p>
                </div>
                
                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-inter">
                    <span className="text-goal-text font-medium">${vault.current.toLocaleString()}</span>
                    <span className="text-goal-text/80 font-medium">of ${vault.goal.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-goal-accent rounded-full h-2">
                    <div
                      className="bg-goal-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(getProgressPercentage(vault.current, vault.goal), 100)}%` }}
                    />
                  </div>
                  <div className="text-center">
                    <span className="font-inter text-xs text-goal-text font-medium">
                      {Math.round(getProgressPercentage(vault.current, vault.goal))}% complete
                    </span>
                  </div>
                </div>
                
                {/* Members Preview */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <div className="flex -space-x-2">
                      {vault.members.slice(0, 3).map((member) => (
                        <Avatar key={member.id} className="w-6 h-6 bg-goal-primary border-2 border-white">
                          <AvatarFallback className="text-goal-text font-fredoka font-semibold text-xs">
                            {member.avatar}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {vault.members.length > 3 && (
                        <div className="w-6 h-6 bg-goal-accent rounded-full border-2 border-white flex items-center justify-center">
                          <span className="font-inter text-xs text-goal-text/70">
                            +{vault.members.length - 3}
                          </span>
                        </div>
                      )}
                    </div>
                    <span className="font-inter text-xs text-goal-text/70 ml-2">
                      {vault.members.length} members
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-1 text-goal-text/70">
                    <Calendar className="w-3 h-3" />
                    <span className="font-inter text-xs">{vault.daysLeft}d left</span>
                  </div>
                </div>

                {/* Action Button */}
                <Button
                  asChild
                  className="w-full bg-goal-primary hover:bg-goal-primary/90 text-goal-text font-fredoka font-bold rounded-2xl py-2 transition-all duration-300 hover:scale-105"
                >
                  <Link to={`/join/${vault.id}`}>
                    Join Vault
                  </Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Create Your Own CTA */}
        <Card className="bg-goal-primary/20 backdrop-blur-sm border-goal-border/50 border-dashed p-8 rounded-3xl mt-8 text-center">
          <div className="w-16 h-16 bg-goal-primary rounded-3xl flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-goal-text" />
          </div>
          <h3 className="font-fredoka font-bold text-goal-text text-xl mb-2">
            Don't see what you're looking for?
          </h3>
          <p className="font-inter text-goal-text/70 mb-6">
            Create your own vault and invite friends to save together toward your unique goal!
          </p>
          <Button
            asChild
            className="bg-goal-primary hover:bg-goal-primary/90 text-goal-text font-fredoka font-bold rounded-2xl px-8 py-3 transition-all duration-300 hover:scale-105"
          >
            <Link to="/create-vault">
              Create Your Vault
            </Link>
          </Button>
        </Card>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default Community;
