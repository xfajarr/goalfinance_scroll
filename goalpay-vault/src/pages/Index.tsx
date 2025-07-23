
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Navigation from '@/components/Navigation';
import FloatingDecorations from '@/components/FloatingDecorations';
import OnboardingWelcome from '@/components/OnboardingWelcome';
import { CloudMoneyIcon } from '@/components/CloudMoneyIcon';
import { CardVaultSection } from '@/components/CardVaultSection';
import { ProtocolPartners } from '@/components/ProtocolPartners';
import { TrendingUp } from 'lucide-react';

const Index = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Check if user is first-time visitor
    const hasVisited = localStorage.getItem('goalpay-visited');
    if (!hasVisited) {
      setShowOnboarding(true);
    }

    // Trigger animation after component mounts
    setTimeout(() => setIsLoaded(true), 100);
  }, []);

  const handleOnboardingComplete = () => {
    localStorage.setItem('goalpay-visited', 'true');
    setShowOnboarding(false);
  };

  return (
    <div className="min-h-screen bg-goal-bg relative">
      <FloatingDecorations />
      <Navigation />

      {/* Hero Section */}
      <main className={`relative z-10 container-narrow pt-16 pb-24 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="text-center">
          {/* Cloud Money Icon */}
          <div className={`flex justify-center transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
            <CloudMoneyIcon size={120} />
          </div>

          {/* Mascot */}
          {/* <div className={`flex justify-center mb-12 transition-all duration-700 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <Mascot />
          </div> */}

          {/* Hero Text */}
          <div className={`space-section transition-all duration-700 delay-400 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-fredoka font-bold text-goal-text-primary leading-tight">
              Save Together,
              <br />
              <span className="bg-gradient-to-r from-goal-primary to-goal-accent bg-clip-text text-goal-text">
                Win Together
              </span>
            </h1>

            <p className="text-lg md:text-xl font-inter text-goal-text-secondary max-w-2xl mx-auto leading-relaxed">
              The cross-chain way to save smarter with friends.
              <br />
              The fun way to save with friends and reach your dreams.
            </p>

            {/* CTA Buttons */}
            <div className={`pt-8 flex flex-col sm:flex-row gap-4 justify-center transition-all duration-700 delay-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <Button
                asChild
                variant="goal"
                size="lg"
                className="text-lg text-goal-text-primary px-12 py-4 rounded-full shadow-md hover:shadow-lg hover:scale-[1.02]"
              >
                <Link to="/dashboard">
                  Start Saving ✨
                </Link>
              </Button>

              <Button
                variant="outline"
                onClick={() => setShowOnboarding(true)}
                className="border-2 border-goal-primary text-goal-text hover:bg-goal-primary hover:text-goal-text font-fredoka font-semibold text-lg px-8 py-4 rounded-full transition-all duration-200 hover:scale-[1.02]"
              >
                Take the Tour 🎯
              </Button>
            </div>

            {/* Trust indicators */}
            <div className={`pt-8 transition-all duration-700 delay-600 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <p className="text-sm text-goal-text mb-4">Trusted by savers worldwide</p>
              <div className="flex justify-center items-center space-x-8 opacity-60">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-goal-primary rounded-full flex items-center justify-center">
                    <span className="text-sm">🛡️</span>
                  </div>
                  <span className="text-sm font-inter text-goal-text">Secure</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-goal-primary rounded-full flex items-center justify-center">
                    <span className="text-sm">🏆</span>
                  </div>
                  <span className="text-sm font-inter text-goal-text">Rewarding</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-goal-primary rounded-full flex items-center justify-center">
                    <span className="text-sm">👥</span>
                  </div>
                  <span className="text-sm font-inter text-goal-text">Social</span>
                </div>
              </div>
            </div>
          </div>

          {/* Features Preview */}
          <div className={`mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 transition-all duration-700 delay-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="bg-white/40 backdrop-blur-sm rounded-3xl p-6 border border-goal-border/30 hover:scale-105 transition-all duration-300">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="font-fredoka font-semibold text-goal-text text-lg mb-2">
                Set Goals Together
              </h3>
              <p className="font-inter text-goal-text/70 text-sm">
                Create savings vaults with friends and family for shared dreams
              </p>
            </div>

            <div className="bg-white/40 backdrop-blur-sm rounded-3xl p-6 border border-goal-border/30 hover:scale-105 transition-all duration-300">
              <div className="w-12 h-12 bg-goal-primary/20 rounded-2xl flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-goal-primary" />
              </div>
              <h3 className="font-fredoka font-semibold text-goal-text text-lg mb-2">
                Earn While You Save
              </h3>
              <p className="font-inter text-goal-text/70 text-sm">
                Up to 12.8% APY on your savings with flexible yield strategies
              </p>
            </div>

            <div className="bg-white/40 backdrop-blur-sm rounded-3xl p-6 border border-goal-border/30 hover:scale-105 transition-all duration-300">
              <div className="text-4xl mb-4">🛡️</div>
              <h3 className="font-fredoka font-semibold text-goal-text text-lg mb-2">
                Risk-Free Guarantee
              </h3>
              <p className="font-inter text-goal-text/70 text-sm">
                Get 100% refunded if goals aren't met. No penalties, ever
              </p>
            </div>
          </div>

        </div>
      </main>

      {/* Wide Sections Container */}
      <div className="relative z-10 container-page py-8">
        {/* Card Vault Section */}
        <div className={`transition-all duration-700 delay-800 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <CardVaultSection />
        </div>

        {/* Protocol Partners Section */}
        <div className={`transition-all duration-700 delay-900 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <ProtocolPartners />
        </div>

        {/* Social Proof - Compact Stats */}
        <div className={`mt-16 bg-gradient-to-r from-goal-accent/20 to-goal-primary/20 rounded-3xl p-6 transition-all duration-700 delay-900 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h3 className="font-fredoka font-bold text-goal-text text-lg mb-4">
            Join thousands of successful savers!
          </h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-goal-text">$2.5M+</div>
              <div className="text-xs text-goal-text/70">Saved</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-goal-text">89%</div>
              <div className="text-xs text-goal-text/70">Success</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-goal-text">5K+</div>
              <div className="text-xs text-goal-text/70">Users</div>
            </div>
          </div>
        </div>
      </div>



      {/* Onboarding Modal */}
      {showOnboarding && (
        <OnboardingWelcome onComplete={handleOnboardingComplete} />
      )}
    </div>
  );
};

export default Index;
