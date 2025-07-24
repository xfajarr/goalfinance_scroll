
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Vault, TrendingUp, Shield, Users } from 'lucide-react';

export const CardVaultSection = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const vaultCards = [
    {
      title: "Emergency Fund Vault",
      description: "Build your safety net with guaranteed protection",
      apy: "5.2%",
      minAmount: "$100",
      icon: Shield,
      color: "from-goal-primary to-goal-accent"
    },
    {
      title: "Growth Vault",
      description: "Maximize your savings with higher yield strategies",
      apy: "12.8%",
      minAmount: "$500",
      icon: TrendingUp,
      color: "from-goal-primary to-goal-accent"
    },
    {
      title: "Community Vault",
      description: "Save together with friends and family",
      apy: "8.4%",
      minAmount: "$50",
      icon: Users,
      color: "from-goal-primary to-goal-accent"
    },
    {
      title: "Goal Vault",
      description: "Dedicated savings for your biggest dreams",
      apy: "7.1%",
      minAmount: "$250",
      icon: Vault,
      color: "from-goal-primary to-goal-accent"
    }
  ];

  // Duplicate the array to create seamless loop
  const duplicatedVaults = [...vaultCards, ...vaultCards];

  return (
    <div className={`mt-16 space-y-6 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-fredoka font-bold text-goal-text-primary mb-3">
          Choose Your Goals Vault
        </h2>
        <p className="text-base font-inter text-goal-text-secondary max-w-xl mx-auto">
          Different vaults for different goals. Start with any amount and watch your savings grow.
        </p>
      </div>

      {/* Animated Vault Carousel with Gradient Edges */}
      <div className="relative overflow-hidden py-4 scroll-container">
        {/* Left Gradient */}
        <div className="absolute left-0 top-0 bottom-0 w-28 bg-gradient-to-r from-goal-bg via-goal-accent/60 to-transparent z-10 pointer-events-none"></div>

        {/* Right Gradient */}
        <div className="absolute right-0 top-0 bottom-0 w-28 bg-gradient-to-l from-goal-bg via-goal-accent/60 to-transparent z-10 pointer-events-none"></div>

        <div className="flex animate-scroll-left space-x-6 pl-6" style={{ width: 'max-content' }}>
          {duplicatedVaults.map((vault, index) => {
            const Icon = vault.icon;
            return (
              <div
                key={`${vault.title}-${index}`}
                className="flex-shrink-0 min-w-[320px] md:min-w-[380px] lg:min-w-[420px] hover:scale-[1.02] transition-all duration-200"
              >
                <Card className="bg-goal-accent/60 backdrop-blur-sm border border-goal-border/50 p-6 rounded-3xl h-full">
                  <div className={`w-12 h-12 bg-gradient-to-br ${vault.color} rounded-2xl flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6 text-goal-heading" />
                  </div>

                  <h3 className="font-fredoka font-bold text-goal-heading text-lg mb-2">
                    {vault.title}
                  </h3>

                  <p className="font-inter text-goal-text-secondary text-sm mb-4 leading-relaxed">
                    {vault.description}
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="font-inter text-goal-text-muted text-xs">APY</span>
                      <span className="font-fredoka font-bold text-goal-heading text-base">{vault.apy}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-inter text-goal-text-muted text-xs">Min Amount</span>
                      <span className="font-inter text-goal-heading font-semibold text-sm">{vault.minAmount}</span>
                    </div>
                  </div>

                  <Button className="w-full bg-goal-primary hover:bg-goal-primary/90 text-goal-heading font-fredoka font-semibold rounded-2xl py-2 text-sm">
                    Start Saving
                  </Button>
                </Card>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
