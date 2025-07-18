
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navigation from '@/components/Navigation';
import BottomNavigation from '@/components/BottomNavigation';
import {
  Users,
  Target,
  Globe,
  TrendingUp,
  Search,
  Filter,
  Star,
  Shield,
  Zap,
  Heart,
  Sparkles,
  Clock,
  Bell,
  ArrowRight
} from 'lucide-react';

const Community = () => {
  const upcomingFeatures = [
    {
      icon: Search,
      title: "Smart Discovery",
      description: "Find vaults that match your interests, budget, and timeline with AI-powered recommendations",
      color: "bg-blue-500"
    },
    {
      icon: Filter,
      title: "Advanced Filters",
      description: "Filter by category, yield rate, time remaining, member count, and more to find your perfect match",
      color: "bg-purple-500"
    },
    {
      icon: Star,
      title: "Vault Ratings",
      description: "Community ratings and reviews to help you choose the most reliable and successful vaults",
      color: "bg-yellow-500"
    },
    {
      icon: Shield,
      title: "Verified Creators",
      description: "Trust badges and verification system for vault creators with proven track records",
      color: "bg-green-500"
    },
    {
      icon: TrendingUp,
      title: "Performance Analytics",
      description: "Detailed analytics on vault performance, yield history, and success rates",
      color: "bg-indigo-500"
    },
    {
      icon: Bell,
      title: "Smart Notifications",
      description: "Get notified about new vaults matching your criteria and important vault updates",
      color: "bg-red-500"
    }
  ];

  const vaultCategories = [
    { name: "Travel & Adventure", emoji: "✈️", count: "12+ vaults" },
    { name: "Tech & Gadgets", emoji: "📱", count: "8+ vaults" },
    { name: "Emergency Funds", emoji: "🚨", count: "15+ vaults" },
    { name: "Education", emoji: "📚", count: "6+ vaults" },
    { name: "Housing & Real Estate", emoji: "🏠", count: "10+ vaults" },
    { name: "Health & Wellness", emoji: "💪", count: "5+ vaults" },
    { name: "Vehicles", emoji: "🚗", count: "7+ vaults" },
    { name: "Entertainment", emoji: "🎮", count: "9+ vaults" }
  ];

  return (
    <div className="min-h-screen bg-goal-bg pb-32 md:pb-0">
      <Navigation />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Coming Soon Header */}
        <div className="text-center mb-12">
          <div className="relative inline-block mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-goal-primary to-purple-500 rounded-full flex items-center justify-center mx-auto relative">
              <Globe className="w-12 h-12 text-goal-text" />
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-yellow-800" />
              </div>
            </div>
          </div>

          <Badge className="bg-goal-primary/20 text-goal-primary border-goal-primary/30 font-fredoka font-semibold mb-4">
            <Clock className="w-3 h-3 mr-1" />
            Coming Soon
          </Badge>

          <h1 className="text-4xl md:text-5xl font-fredoka font-bold text-goal-text mb-4">
            Explore Community Vaults
          </h1>
          <p className="font-inter text-goal-text/70 max-w-3xl mx-auto text-lg leading-relaxed">
            Discover and join public savings goals from around the world. Save together with like-minded people,
            earn yield, and achieve your dreams faster through the power of community!
          </p>
        </div>

        {/* What to Expect Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-white/60 backdrop-blur-sm border-goal-border/30 p-6 rounded-3xl text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Globe className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-fredoka font-bold text-goal-text text-xl mb-2">50+ Vaults</h3>
            <p className="font-inter text-goal-text/70 text-sm">
              Diverse public vaults across multiple categories and goals
            </p>
          </Card>

          <Card className="bg-white/60 backdrop-blur-sm border-goal-border/30 p-6 rounded-3xl text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-fredoka font-bold text-goal-text text-xl mb-2">Global Community</h3>
            <p className="font-inter text-goal-text/70 text-sm">
              Connect with savers worldwide and achieve goals together
            </p>
          </Card>

          <Card className="bg-white/60 backdrop-blur-sm border-goal-border/30 p-6 rounded-3xl text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-fredoka font-bold text-goal-text text-xl mb-2">Smart Matching</h3>
            <p className="font-inter text-goal-text/70 text-sm">
              AI-powered recommendations to find your perfect vault match
            </p>
          </Card>
        </div>

        {/* Upcoming Features */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-fredoka font-bold text-goal-text mb-4">
              What's Coming Soon
            </h2>
            <p className="font-inter text-goal-text/70 max-w-2xl mx-auto">
              We're building powerful features to make discovering and joining community vaults seamless and rewarding.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingFeatures.map((feature, index) => (
              <Card key={index} className="bg-white/60 backdrop-blur-sm border-goal-border/30 p-6 rounded-3xl hover:shadow-lg transition-all duration-300 hover:scale-105">
                <div className="space-y-4">
                  <div className={`w-12 h-12 ${feature.color} rounded-2xl flex items-center justify-center`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-fredoka font-semibold text-goal-text text-lg mb-2">
                      {feature.title}
                    </h3>
                    <p className="font-inter text-sm text-goal-text/70 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Vault Categories Preview */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-fredoka font-bold text-goal-text mb-4">
              Explore by Category
            </h2>
            <p className="font-inter text-goal-text/70 max-w-2xl mx-auto">
              Browse vaults organized by your interests and goals. From travel adventures to emergency funds,
              find your community of savers.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {vaultCategories.map((category, index) => (
              <Card key={index} className="bg-white/60 backdrop-blur-sm border-goal-border/30 p-4 rounded-2xl hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer">
                <div className="text-center space-y-3">
                  <div className="text-3xl">{category.emoji}</div>
                  <div>
                    <h3 className="font-fredoka font-semibold text-goal-text text-sm leading-tight">
                      {category.name}
                    </h3>
                    <p className="font-inter text-xs text-goal-text/60 mt-1">
                      {category.count}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Notification Signup */}
        <Card className="bg-gradient-to-br from-goal-primary/20 to-purple-100 backdrop-blur-sm border-goal-border/50 p-8 rounded-3xl text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-goal-primary to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Bell className="w-8 h-8 text-goal-text" />
          </div>
          <h3 className="font-fredoka font-bold text-goal-text text-2xl mb-4">
            Be the First to Know!
          </h3>
          <p className="font-inter text-goal-text/70 mb-6 max-w-2xl mx-auto">
            Get notified when Community Vaults launches. Be among the first to discover amazing savings
            opportunities and connect with savers worldwide.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-xl border border-goal-border/30 bg-white/80 font-inter text-goal-text placeholder:text-goal-text/50 focus:outline-none focus:ring-2 focus:ring-goal-primary/50"
            />
            <Button className="bg-goal-primary hover:bg-goal-primary/90 text-goal-text font-fredoka font-semibold rounded-xl px-6 py-3 transition-all duration-300 hover:scale-105">
              Notify Me
            </Button>
          </div>
        </Card>

        {/* Create Your Own CTA */}
        <Card className="bg-goal-primary/20 backdrop-blur-sm border-goal-border/50 border-dashed p-8 rounded-3xl text-center">
          <div className="w-16 h-16 bg-goal-primary rounded-3xl flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-goal-text" />
          </div>
          <h3 className="font-fredoka font-bold text-goal-text text-xl mb-2">
            Ready to Start Saving?
          </h3>
          <p className="font-inter text-goal-text/70 mb-6">
            While you wait for Community Vaults, create your own vault and invite friends to save together!
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              asChild
              className="bg-goal-primary hover:bg-goal-primary/90 text-goal-text font-fredoka font-bold rounded-2xl px-8 py-3 transition-all duration-300 hover:scale-105"
            >
              <Link to="/create-vault">
                <Target className="w-4 h-4 mr-2" />
                Create Your Vault
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-goal-border text-goal-text hover:bg-goal-accent font-fredoka font-semibold rounded-2xl px-8 py-3 transition-all duration-300 hover:scale-105"
            >
              <Link to="/how-it-works">
                <Heart className="w-4 h-4 mr-2" />
                Learn More
              </Link>
            </Button>
          </div>
        </Card>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default Community;
