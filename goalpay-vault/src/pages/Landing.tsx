import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { WalletButton } from '@/components/wallet/WalletButton';
import { 
  Target, 
  Users, 
  Shield, 
  TrendingUp, 
  Coins,
  Heart,
  ArrowRight,
  CheckCircle,
  Sparkles
} from 'lucide-react';
import FloatingDecorations from '@/components/FloatingDecorations';

const Landing = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Trigger animation after component mounts
    setTimeout(() => setIsLoaded(true), 100);
  }, []);

  const features = [
    {
      icon: Target,
      title: 'Set Shared Goals',
      description: 'Create savings goals and invite friends to join your financial journey together.'
    },
    {
      icon: Users,
      title: 'Social Accountability',
      description: 'Stay motivated with friends tracking progress and celebrating milestones together.'
    },
    {
      icon: Shield,
      title: 'Secure & Transparent',
      description: 'Smart contracts ensure your funds are safe and progress is transparent to all members.'
    },
    {
      icon: TrendingUp,
      title: 'Track Progress',
      description: 'Real-time updates show how close you are to achieving your financial goals.'
    }
  ];

  const steps = [
    {
      number: '01',
      title: 'Connect Your Wallet',
      description: 'Link your Web3 wallet to get started with Goal Finance.'
    },
    {
      number: '02',
      title: 'Create a Goal',
      description: 'Set your savings target and invite friends to join your goal.'
    },
    {
      number: '03',
      title: 'Save Together',
      description: 'Add funds regularly and track progress with your group.'
    },
    {
      number: '04',
      title: 'Achieve Success',
      description: 'Celebrate when you reach your goal and withdraw your savings.'
    }
  ];

  return (
    <div className="min-h-screen bg-goal-bg relative">
      <FloatingDecorations />

      {/* Hero Section */}
      <section className={`relative z-10 container-narrow pt-20 pb-32 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="text-center">
          {/* Hero Content */}
          <div className={`transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
            <h1 className="text-4xl md:text-6xl font-fredoka font-bold text-goal-text-primary mb-6 leading-tight">
              Achieve Your
              <span className="text-goal-primary block">Financial Goals</span>
              Together
            </h1>
            
            <p className="text-lg md:text-xl text-goal-text/80 mb-8 max-w-2xl mx-auto leading-relaxed">
              Join friends in secure, social savings goals powered by blockchain technology. 
              Stay motivated, track progress, and celebrate success together.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <WalletButton 
                variant="default"
                size="lg"
                className="bg-goal-primary hover:bg-goal-primary/90 text-goal-text font-fredoka font-bold px-8 py-4 rounded-2xl text-lg shadow-lg hover:shadow-xl transition-all"
              />
              
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-goal-border text-goal-text hover:bg-goal-accent/50 font-fredoka font-semibold px-8 py-4 rounded-2xl text-lg"
              >
                <Link to="/how-it-works">
                  Learn More <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-6 text-goal-text/60 text-sm">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span>Secure Smart Contracts</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span>Audited Code</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>Community Driven</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-20 bg-goal-accent/30">
        <div className="container-page">
          <div className={`text-center mb-16 transition-all duration-700 delay-400 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h2 className="text-3xl md:text-4xl font-fredoka font-bold text-goal-text-primary mb-4">
              Why Choose Goal Finance?
            </h2>
            <p className="text-lg text-goal-text/80 max-w-2xl mx-auto">
              Experience the power of social savings with cutting-edge blockchain technology
            </p>
          </div>

          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 transition-all duration-700 delay-600 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {features.map((feature, index) => (
              <Card key={index} className="bg-goal-bg border-goal-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-goal-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="h-6 w-6 text-goal-primary" />
                  </div>
                  <h3 className="font-fredoka font-semibold text-goal-text-primary mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-goal-text/70 text-sm">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative z-10 py-20">
        <div className="container-page">
          <div className={`text-center mb-16 transition-all duration-700 delay-800 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h2 className="text-3xl md:text-4xl font-fredoka font-bold text-goal-text-primary mb-4">
              How It Works
            </h2>
            <p className="text-lg text-goal-text/80 max-w-2xl mx-auto">
              Get started with Goal Finance in just four simple steps
            </p>
          </div>

          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 transition-all duration-700 delay-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-goal-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-goal-text font-fredoka font-bold text-xl">
                    {step.number}
                  </span>
                </div>
                <h3 className="font-fredoka font-semibold text-goal-text-primary mb-2">
                  {step.title}
                </h3>
                <p className="text-goal-text/70 text-sm">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20 bg-goal-primary/5">
        <div className="container-page text-center">
          <div className={`transition-all duration-700 delay-1200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <Sparkles className="h-12 w-12 text-goal-primary mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-fredoka font-bold text-goal-text-primary mb-4">
              Ready to Start Saving?
            </h2>
            <p className="text-lg text-goal-text/80 mb-8 max-w-xl mx-auto">
              Join thousands of users who are achieving their financial goals together
            </p>
            
            <WalletButton 
              variant="default"
              size="lg"
              className="bg-goal-primary hover:bg-goal-primary/90 text-goal-text font-fredoka font-bold px-8 py-4 rounded-2xl text-lg shadow-lg hover:shadow-xl transition-all"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
