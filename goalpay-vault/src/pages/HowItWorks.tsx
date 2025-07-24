

import BottomNavigation from '@/components/BottomNavigation';
import { Wallet, Users, TrendingUp, Target } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      title: "Connect Your Wallet",
      description: "Start by connecting your Web3 wallet to our platform. We support MetaMask, WalletConnect, and more. This allows you to securely manage your funds and participate in savings goals.",
      icon: Wallet,
      image: "photo-1581091226825-a6a2a5aee158"
    },
    {
      title: "Create or Join a Vault",
      description: "Create your own savings vault with a specific goal in mind, or join an existing public vault. Set your contribution amount and start saving with others!",
      icon: Users,
      image: "photo-1488590528505-98d2b5aba04b"
    },
    {
      title: "Save and Earn Yield",
      description: "Contribute funds to your vault and earn yield while you save. Our platform integrates with DeFi protocols to generate returns on your savings.",
      icon: TrendingUp,
      image: "photo-1461749280684-dccba630e2f6"
    },
    {
      title: "Achieve Your Goal",
      description: "Once your vault reaches its goal, celebrate your success! Withdraw your funds along with the earned yield. Start a new vault and continue your savings journey.",
      icon: Target,
      image: "photo-1498050108023-c5249f4df085"
    }
  ];

  return (
    <div className="min-h-screen bg-goal-bg pb-20 md:pb-0">
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-fredoka font-bold text-goal-text mb-4">
            How GoalPay Works
          </h1>
          <p className="font-inter text-goal-text/70 text-lg">
            Learn how to create, join, and achieve your savings goals with our platform.
          </p>
        </div>

        <div className="space-y-16">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className={`flex flex-col ${index % 2 === 1 ? 'md:flex-row-reverse' : 'md:flex-row'} items-center space-y-6 md:space-y-0 md:space-x-8`}>
                <div className="w-full md:w-1/2">
                  <div className="relative">
                    <img
                      src={`https://images.unsplash.com/${step.image}?auto=format&fit=crop&w=600&h=400`}
                      alt={step.title}
                      className="rounded-3xl shadow-lg w-full h-64 object-cover"
                    />
                    <div className="absolute top-4 left-4 w-12 h-12 bg-goal-primary rounded-2xl flex items-center justify-center shadow-lg">
                      <Icon className="w-6 h-6 text-goal-text" />
                    </div>
                    <div className="absolute top-4 right-4 w-8 h-8 bg-goal-accent rounded-full flex items-center justify-center font-fredoka font-bold text-goal-text">
                      {index + 1}
                    </div>
                  </div>
                </div>
                <div className="w-full md:w-1/2">
                  <h2 className="text-2xl md:text-3xl font-fredoka font-bold text-goal-text mb-4">
                    {step.title}
                  </h2>
                  <p className="font-inter text-goal-text/70 leading-relaxed text-lg">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default HowItWorks;
