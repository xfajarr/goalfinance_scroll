import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Target, 
  PiggyBank, 
  Coins, 
  Users,
  Shield,
  Zap,
  ArrowRight,
  CheckCircle,
  DollarSign
} from 'lucide-react';

export const AcornsShowcase: React.FC = () => {
  const handleDemoClick = () => {
    window.open('/acorns-demo', '_blank');
  };

  const handleGoalsDemoClick = () => {
    window.open('/dashboard-demo', '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="flex items-center gap-3 px-6 py-3 bg-white rounded-full shadow-lg">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">🌰</span>
                </div>
                <span className="text-xl font-bold text-gray-900">GoalPay</span>
                <Badge className="bg-green-100 text-green-800">New: Acorns Features</Badge>
              </div>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Save Smarter with
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {" "}Goals & Acorns
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Combine goal-based collaborative savings with Acorns-style micro-investing. 
              Save for specific goals with friends while automatically investing your spare change.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={handleDemoClick}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 text-lg"
              >
                <PiggyBank className="w-5 h-5 mr-2" />
                Try Acorns Demo
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={handleGoalsDemoClick}
                className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg"
              >
                <Target className="w-5 h-5 mr-2" />
                Try Goals Demo
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Comparison */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Two Powerful Ways to Save
          </h2>
          <p className="text-xl text-gray-600">
            Choose goal-based savings, micro-investing, or use both together
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Goal-Based Savings */}
          <Card className="p-8 bg-gradient-to-br from-blue-50 to-green-50 border-blue-200">
            <div className="flex items-center gap-3 mb-6">
              <Target className="w-8 h-8 text-blue-600" />
              <h3 className="text-2xl font-bold text-gray-900">Goal-Based Savings</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Save for specific goals with friends and family. Set targets, invite others, and achieve your dreams together.
            </p>
            
            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-gray-700">Create specific savings goals</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-gray-700">Invite friends and family</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-gray-700">Track progress together</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-gray-700">Penalty system for motivation</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg mb-6">
              <h4 className="font-semibold text-gray-900 mb-2">Example Goals:</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Emergency Fund</span>
                  <span className="text-blue-600">$3,250 / $10,000</span>
                </div>
                <div className="flex justify-between">
                  <span>Vacation to Japan</span>
                  <span className="text-blue-600">$2,100 / $8,000</span>
                </div>
                <div className="flex justify-between">
                  <span>New Car</span>
                  <span className="text-blue-600">$7,800 / $15,000</span>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={handleGoalsDemoClick}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Users className="w-4 h-4 mr-2" />
              Try Goals Demo
            </Button>
          </Card>

          {/* Acorns Micro-Investing */}
          <Card className="p-8 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <div className="flex items-center gap-3 mb-6">
              <PiggyBank className="w-8 h-8 text-purple-600" />
              <h3 className="text-2xl font-bold text-gray-900">Acorns Micro-Investing</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Automatically invest your spare change from everyday purchases. Watch small amounts grow into significant savings.
            </p>
            
            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-gray-700">Round-up transactions automatically</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-gray-700">Choose portfolio risk level</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-gray-700">Earn 4-8% APY yields</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-gray-700">Set up recurring investments</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg mb-6">
              <h4 className="font-semibold text-gray-900 mb-2">Portfolio Options:</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-600" />
                    <span>Conservative</span>
                  </div>
                  <span className="text-blue-600">4% APY</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span>Moderate</span>
                  </div>
                  <span className="text-green-600">6% APY</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-purple-600" />
                    <span>Aggressive</span>
                  </div>
                  <span className="text-purple-600">8% APY</span>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={handleDemoClick}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Coins className="w-4 h-4 mr-2" />
              Try Acorns Demo
            </Button>
          </Card>
        </div>
      </div>

      {/* How Round-ups Work */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How Acorns Round-ups Work
            </h2>
            <p className="text-xl text-gray-600">
              Turn everyday purchases into investments automatically
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">1. Make a Purchase</h3>
              <p className="text-gray-600">
                Buy your daily coffee for $4.25
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Coins className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">2. Round Up</h3>
              <p className="text-gray-600">
                We round up to $5.00, saving $0.75 spare change
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">3. Invest & Grow</h3>
              <p className="text-gray-600">
                Your $0.75 gets invested and earns 4-8% APY
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Card className="inline-block p-6 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
              <p className="text-lg font-semibold text-gray-900 mb-2">
                💡 Small amounts add up fast!
              </p>
              <p className="text-gray-600">
                Just $1 in daily round-ups becomes <strong>$400+</strong> per year with compound growth
              </p>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Start Saving Smarter?
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            Experience both goal-based savings and micro-investing in our interactive demos
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={handleDemoClick}
              className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-4 text-lg"
            >
              <PiggyBank className="w-5 h-5 mr-2" />
              Try Acorns Demo
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={handleGoalsDemoClick}
              className="border-2 border-white text-white hover:bg-white hover:text-purple-600 px-8 py-4 text-lg"
            >
              <Target className="w-5 h-5 mr-2" />
              Try Goals Demo
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
