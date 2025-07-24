
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

import BottomNavigation from '@/components/BottomNavigation';
import {
  Users,
  Target,
  Search,
  Sparkles,
  ArrowRight,
  Play,
  CheckCircle,
  Zap
} from 'lucide-react';

const Community = () => {
  const features = [
    {
      icon: "🎯",
      title: "Smart Matching",
      description: "AI finds your perfect savings circle based on goals and timeline"
    },
    {
      icon: "🌍",
      title: "Global Community",
      description: "Connect with motivated savers from around the world"
    },
    {
      icon: "⚡",
      title: "Instant Setup",
      description: "Join or create circles in under 60 seconds"
    }
  ];

  const categories = [
    { name: "Travel Dreams", emoji: "✈️", popular: true },
    { name: "Tech & Gadgets", emoji: "📱", popular: false },
    { name: "Emergency Fund", emoji: "�️", popular: true },
    { name: "Education", emoji: "📚", popular: false },
    { name: "Home Goals", emoji: "🏠", popular: true },
    { name: "Health & Fitness", emoji: "💪", popular: false }
  ];

  return (
    <div className="min-h-screen bg-goal-bg pb-32 md:pb-0">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">

        {/* Hero Section */}
        <div className="text-center mb-32">
          <div className="inline-flex items-center bg-goal-primary/50 text-goal-text px-6 py-3 rounded-full font-fredoka font-bold mb-8">
            {/* <Sparkles className="w-5 h-5 mr-2" /> */}
            Coming Soon
          </div>

          <h1 className="text-6xl md:text-7xl font-fredoka font-black text-goal-text mb-8 leading-tight">
            Discover
            <br />
            <span className="text-goal-text">Savings Circles</span>
          </h1>

          <p className="text-xl md:text-2xl font-inter text-goal-text-secondary max-w-3xl mx-auto mb-12 leading-relaxed">
            The future of collaborative saving is here. Join circles, achieve goals, build wealth together.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button className="bg-goal-primary hover:bg-goal-primary/90 text-goal-text-primary/80 font-fredoka font-bold text-lg px-8 py-4 rounded-2xl">
              <Play className="w-5 h-5 mr-2" />
              Watch Demo
            </Button>
            <Button variant="outline" className="border-2 border-goal-primary text-goal-text hover:bg-goal-primary hover:text-white font-fredoka font-bold text-lg px-8 py-4 rounded-2xl">
              Get Notified
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-32">
          {features.map((feature, index) => (
            <div key={index} className="text-center group">
              <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="font-fredoka font-bold text-goal-text text-2xl mb-4">
                {feature.title}
              </h3>
              <p className="font-inter text-goal-text-secondary text-lg leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Categories Section */}
        <div className="mb-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-fredoka font-bold text-goal-text mb-6">
              Popular Categories
            </h2>
            <p className="font-inter text-goal-text-secondary max-w-2xl mx-auto text-xl">
              Explore circles by your interests and goals
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {categories.map((category, index) => (
              <div key={index} className="relative group cursor-pointer">
                <div className="bg-white border-2 border-gray-100 hover:border-goal-primary p-8 rounded-3xl text-center transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
                  {category.popular && (
                    <div className="absolute -top-3 -right-3 bg-goal-primary text-white text-xs font-fredoka font-bold px-3 py-1 rounded-full">
                      Popular
                    </div>
                  )}
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {category.emoji}
                  </div>
                  <h3 className="font-fredoka font-bold text-goal-text text-lg">
                    {category.name}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Categories Preview */}
        {/* <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-fredoka font-bold text-goal-text mb-4">
              Explore by Category
            </h2>
            <p className="font-inter text-goal-text-secondary max-w-2xl mx-auto text-lg">
              Browse circles organized by your interests and goals. From travel adventures to emergency funds.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {circleCategories.map((category, index) => (
              <div key={index} className="bg-white border border-gray-100 p-6 rounded-2xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer text-center">
                <div className="text-4xl mb-4">{category.emoji}</div>
                <h3 className="font-fredoka font-bold text-goal-text text-base mb-2">
                  {category.name}
                </h3>
                <p className="font-inter text-goal-text-secondary text-sm">
                  {category.count}
                </p>
              </div>
            ))}
          </div>
        </div> */}

        {/* Stats Section */}
        <div className="bg-goal-primary/5 rounded-3xl p-12 mb-32">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-fredoka font-bold text-goal-text mb-6">
              Join the Movement
            </h2>
            <p className="font-inter text-goal-text-secondary max-w-2xl mx-auto text-xl">
              Thousands are already saving smarter together
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="text-5xl font-fredoka font-black text-goal-primary mb-2">50+</div>
              <div className="text-xl font-fredoka font-bold text-goal-text mb-2">Active Circles</div>
              <div className="text-goal-text-secondary">Ready to join</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-fredoka font-black text-goal-primary mb-2">$2.5M+</div>
              <div className="text-xl font-fredoka font-bold text-goal-text mb-2">Total Saved</div>
              <div className="text-goal-text-secondary">By our community</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-fredoka font-black text-goal-primary mb-2">89%</div>
              <div className="text-xl font-fredoka font-bold text-goal-text mb-2">Success Rate</div>
              <div className="text-goal-text-secondary">Goals achieved</div>
            </div>
          </div>
        </div>

        {/* Waitlist Section */}
        <div className="bg-white border-2 border-goal-primary/10 rounded-3xl p-8 mb-24">
          <div className="text-center max-w-2xl mx-auto">
            <div className="w-16 h-16 bg-goal-primary rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-fredoka font-bold text-goal-text mb-4">
              Be the First to Know!
            </h2>
            <p className="font-inter text-goal-text-secondary text-lg mb-6">
              Join our waitlist for early access to Discover Circles and exclusive features.
            </p>

            <div className="bg-goal-bg/50 rounded-2xl p-6 mb-6">
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-goal-primary focus:border-goal-primary font-inter placeholder:text-gray-400"
                />
                <Button className="bg-goal-primary hover:bg-goal-primary/90 text-white font-fredoka font-bold px-6 py-3 rounded-xl whitespace-nowrap">
                  Join Waitlist
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <span className="font-inter text-goal-text-secondary">Early Access</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                </div>
                <span className="font-inter text-goal-text-secondary">Exclusive Features</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                  <Zap className="w-4 h-4 text-purple-600" />
                </div>
                <span className="font-inter text-goal-text-secondary">Priority Support</span>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="bg-goal-primary/5 border-2 border-goal-primary/20 rounded-3xl p-12 max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-goal-primary rounded-2xl flex items-center justify-center mx-auto mb-8">
              <Target className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-3xl md:text-4xl font-fredoka font-bold text-goal-text mb-6">
              Can't Wait? Start Now!
            </h3>
            <p className="font-inter text-goal-text-secondary text-lg mb-8">
              Don't wait for circles - create your own savings goal today and invite friends to join you!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                className="bg-goal-primary hover:bg-goal-primary/90 text-white font-fredoka font-bold text-lg px-8 py-4 rounded-2xl"
              >
                <Link to="/create-goal">
                  <Target className="w-5 h-5 mr-2" />
                  Create Your Goal
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-2 border-goal-primary text-goal-primary hover:bg-goal-primary hover:text-white font-fredoka font-bold text-lg px-8 py-4 rounded-2xl"
              >
                <Link to="/how-it-works">
                  Learn How It Works
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default Community;
