
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Sparkles, 
  Target, 
  Users, 
  TrendingUp, 
  Shield, 
  ChevronRight,
  ArrowRight,
  Heart,
  Coins
} from 'lucide-react';

interface OnboardingWelcomeProps {
  onComplete: () => void;
}

const OnboardingWelcome = ({ onComplete }: OnboardingWelcomeProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  const steps = [
    {
      title: "Welcome to Goal Finance! 👋",
      subtitle: "The fun way to save with friends",
      content: (
        <div className="text-center space-y-6">
          <div className="text-6xl mb-4">🎯</div>
          <p className="text-goal-text/80 leading-relaxed">
            Turn your dreams into achievable goals while earning yields on your savings. 
            Save together, win together!
          </p>
          <div className="bg-gradient-to-r from-goal-primary/20 to-goal-accent/20 p-4 rounded-2xl">
            <p className="text-sm text-goal-text/70">
              ✨ <strong>Hit your goal?</strong> Keep your savings + earn yield rewards<br/>
              🛡️ <strong>Don't reach it?</strong> Get 100% of your money back, no penalties
            </p>
          </div>
        </div>
      )
    },
    {
      title: "How It Works",
      subtitle: "Simple, safe, and rewarding",
      content: (
        <div className="space-y-4">
          <div className="flex items-start space-x-4 p-4 bg-white/50 rounded-2xl">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Target className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-goal-text">1. Set Your Goal</h4>
              <p className="text-sm text-goal-text/70">Choose what you're saving for and how much you need</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-4 p-4 bg-white/50 rounded-2xl">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h4 className="font-semibold text-goal-text">2. Invite Friends</h4>
              <p className="text-sm text-goal-text/70">Share your vault and save together for motivation</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-4 p-4 bg-white/50 rounded-2xl">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h4 className="font-semibold text-goal-text">3. Earn While You Save</h4>
              <p className="text-sm text-goal-text/70">Your money grows with competitive yields</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-4 p-4 bg-white/50 rounded-2xl">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <h4 className="font-semibold text-goal-text">4. Reach Your Dreams</h4>
              <p className="text-sm text-goal-text/70">Celebrate success and enjoy your rewards!</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Choose Your Adventure",
      subtitle: "What would you like to do first?",
      content: (
        <div className="space-y-4">
          <Card 
            className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 cursor-pointer hover:scale-105 transition-all"
            onClick={() => navigate('/create-vault')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-200 rounded-2xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-fredoka font-bold text-blue-800">Create My First Vault</h4>
                  <p className="text-sm text-blue-600">Start saving for something special</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-blue-600" />
            </div>
          </Card>
          
          <Card 
            className="p-4 rounded-2xl bg-gradient-to-r from-green-50 to-green-100 border-green-200 cursor-pointer hover:scale-105 transition-all"
            onClick={() => navigate('/discover-circles')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-200 rounded-2xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h4 className="font-fredoka font-bold text-green-800">Join a Savings Circle</h4>
                  <p className="text-sm text-green-600">Save with other Goal Finance users</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-green-600" />
            </div>
          </Card>
          
          <Card 
            className="p-4 rounded-2xl bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200 cursor-pointer hover:scale-105 transition-all"
            onClick={() => navigate('/learn')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-purple-200 rounded-2xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-fredoka font-bold text-purple-800">Learn & Earn Points</h4>
                  <p className="text-sm text-purple-600">Master finance while having fun</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-purple-600" />
            </div>
          </Card>
        </div>
      )
    },
    {
      title: "You're All Set! 🎉",
      subtitle: "Ready to start your savings journey",
      content: (
        <div className="text-center space-y-6">
          <div className="text-6xl mb-4">🚀</div>
          <p className="text-goal-text/80 leading-relaxed">
            Welcome to the Goal Finance family! Remember, every small step counts towards your big dreams.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-goal-accent/20 p-4 rounded-2xl">
              <Heart className="w-6 h-6 text-red-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-goal-text">Safe & Secure</p>
              <p className="text-xs text-goal-text/70">Your funds are protected</p>
            </div>
            <div className="bg-goal-primary/20 p-4 rounded-2xl">
              <Coins className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-goal-text">Earn Rewards</p>
              <p className="text-xs text-goal-text/70">Competitive yields</p>
            </div>
          </div>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <div className="fixed inset-0 bg-goal-bg z-50 flex items-center justify-center p-4">
      <Card className="bg-white/90 backdrop-blur-sm border-goal-border/30 p-8 rounded-3xl max-w-lg w-full">
        {/* Progress indicator */}
        <div className="flex space-x-2 mb-8">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-2 flex-1 rounded-full ${
                index <= currentStep ? 'bg-goal-primary' : 'bg-goal-accent/30'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="mb-8">
          <h2 className="text-2xl font-fredoka font-bold text-goal-text mb-2 text-center">
            {steps[currentStep].title}
          </h2>
          <p className="text-goal-text/70 text-center mb-6">
            {steps[currentStep].subtitle}
          </p>
          {steps[currentStep].content}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="ghost"
            onClick={handleSkip}
            className="text-goal-text/60 hover:text-goal-text"
          >
            Skip
          </Button>
          <Button
            onClick={handleNext}
            className="bg-goal-primary hover:bg-goal-primary/90 text-goal-text font-fredoka font-semibold px-6 rounded-2xl"
          >
            {currentStep === steps.length - 1 ? (
              <>
                Get Started <ArrowRight className="w-4 h-4 ml-2" />
              </>
            ) : (
              <>
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default OnboardingWelcome;
