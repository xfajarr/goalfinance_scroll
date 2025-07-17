
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Vault, TrendingUp, Shield, Users } from 'lucide-react';

export const CardVaultSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const vaultCards = [
    {
      title: "Emergency Fund Vault",
      description: "Build your safety net with guaranteed protection",
      apy: "5.2%",
      minAmount: "$100",
      icon: Shield,
      color: "from-blue-500 to-blue-600"
    },
    {
      title: "Growth Vault",
      description: "Maximize your savings with higher yield strategies",
      apy: "12.8%",
      minAmount: "$500",
      icon: TrendingUp,
      color: "from-green-500 to-green-600"
    },
    {
      title: "Community Vault",
      description: "Save together with friends and family",
      apy: "8.4%",
      minAmount: "$50",
      icon: Users,
      color: "from-purple-500 to-purple-600"
    },
    {
      title: "Goal Vault",
      description: "Dedicated savings for your biggest dreams",
      apy: "7.1%",
      minAmount: "$250",
      icon: Vault,
      color: "from-orange-500 to-orange-600"
    }
  ];

  // Auto-slide effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % vaultCards.length);
    }, 4000); // Slide every 4 seconds

    return () => clearInterval(interval);
  }, [vaultCards.length]);

  const nextCard = () => {
    setCurrentIndex((prev) => (prev + 1) % vaultCards.length);
  };

  const prevCard = () => {
    setCurrentIndex((prev) => (prev - 1 + vaultCards.length) % vaultCards.length);
  };

  return (
    <div className="mt-16 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-fredoka font-bold text-goal-text mb-3">
          Choose Your Vault
        </h2>
        <p className="text-base font-inter text-goal-text/70 max-w-xl mx-auto">
          Different vaults for different goals. Start with any amount and watch your savings grow.
        </p>
      </div>

      <div className="relative">
        <div className="overflow-hidden">
          <div 
            className="flex transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * 33.333}%)` }}
          >
            {vaultCards.map((vault, index) => {
              const Icon = vault.icon;
              return (
                <div key={index} className="w-1/3 flex-shrink-0 px-3">
                  <Card className="bg-white/60 backdrop-blur-sm border-goal-border/30 p-5 rounded-3xl hover:scale-105 transition-all duration-300 h-full">
                    <div className={`w-12 h-12 bg-gradient-to-br ${vault.color} rounded-2xl flex items-center justify-center mb-4`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    
                    <h3 className="font-fredoka font-bold text-goal-text text-lg mb-2">
                      {vault.title}
                    </h3>
                    
                    <p className="font-inter text-goal-text/70 text-sm mb-4 leading-relaxed">
                      {vault.description}
                    </p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="font-inter text-goal-text/60 text-xs">APY</span>
                        <span className="font-fredoka font-bold text-goal-text text-base">{vault.apy}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-inter text-goal-text/60 text-xs">Min Amount</span>
                        <span className="font-inter text-goal-text font-semibold text-sm">{vault.minAmount}</span>
                      </div>
                    </div>
                    
                    <Button className="w-full bg-goal-primary hover:bg-goal-primary/90 text-goal-text font-fredoka font-semibold rounded-2xl py-2 text-sm">
                      Start Saving
                    </Button>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>

        {/* Navigation buttons */}
        <button
          onClick={prevCard}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors z-10"
        >
          <ChevronLeft className="w-5 h-5 text-goal-text" />
        </button>

        <button
          onClick={nextCard}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors z-10"
        >
          <ChevronRight className="w-5 h-5 text-goal-text" />
        </button>
      </div>

      {/* Dots indicator */}
      <div className="flex justify-center space-x-2">
        {vaultCards.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentIndex ? 'bg-goal-primary' : 'bg-goal-primary/30'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
