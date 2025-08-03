
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { WalletButton } from '@/components/wallet/WalletButton';
import { useIsMobile } from '@/hooks/use-mobile';
import { useWalletGuard } from '@/hooks/use-wallet-guard';
import { usePrivy } from '@privy-io/react-auth';
import { Wallet, Users, TrendingUp, Target, Menu, X } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

import FloatingDecorations from '@/components/FloatingDecorations';
import OnboardingWelcome from '@/components/OnboardingWelcome';
import { CloudMoneyIcon } from '@/components/CloudMoneyIcon';
import { CardVaultSection } from '@/components/CardVaultSection';
import { ProtocolPartners } from '@/components/ProtocolPartners';


const Index = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { isConnected } = useWalletGuard();
  const { authenticated } = usePrivy();

  // Auto-navigate to dashboard after successful wallet connection
  useEffect(() => {
    if (authenticated && isConnected && !isMobile) {
      // Small delay to ensure connection is fully established
      const timer = setTimeout(() => {
        navigate('/app/dashboard');
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [authenticated, isConnected, isMobile, navigate]);



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

  // How it Works data
  const steps = [
    {
      title: "Connect Your Wallet",
      description: "Start by connecting your Web3 wallet to our platform. We support MetaMask, WalletConnect, and more. This allows you to securely manage your funds and participate in savings goals.",
      icon: Wallet
    },
    {
      title: "Create or Join a Vault",
      description: "Create your own savings vault with a specific goal in mind, or join an existing public vault. Set your contribution amount and start saving with others!",
      icon: Users
    },
    {
      title: "Save and Earn Yield",
      description: "Contribute funds to your vault and earn yield while you save. Our platform integrates with DeFi protocols to generate returns on your savings.",
      icon: TrendingUp
    },
    {
      title: "Achieve Your Goal",
      description: "Once your vault reaches its goal, celebrate your success! Withdraw your funds along with the earned yield. Start a new vault and continue your savings journey.",
      icon: Target
    }
  ];

  // FAQ data
  const faqs = [
    {
      question: "What is Goal Finance?",
      answer: "Goal Finance is a decentralized savings platform that allows you to create and join shared savings goals with friends, family, or community members. Earn yield while saving together!"
    },
    {
      question: "How does Goal Finance work?",
      answer: "Create a vault, set a goal amount and deadline, invite members, and start saving! Funds are locked in a smart contract and earn yield. If the goal is reached by the deadline, everyone receives their contribution + yield. If not, contributions are returned."
    },
    {
      question: "What are the benefits of saving with Goal Finance?",
      answer: "Earn yield on your savings, stay motivated with shared goals, build community, and achieve financial success together!"
    },
    {
      question: "Is Goal Finance secure?",
      answer: "Yes, Goal Finance uses audited smart contracts and decentralized technology to ensure the security of your funds."
    },
    {
      question: "What cryptocurrencies does Goal Finance support?",
      answer: "Currently, Goal Finance supports saving in USDC on the Ethereum network. More cryptocurrencies and networks will be added soon!"
    },
    {
      question: "How do I create a vault?",
      answer: "Go to the Dashboard and click 'Create Vault'. Fill out the form with your goal details, set privacy settings, and invite members."
    },
    {
      question: "How do I join a vault?",
      answer: "If the vault is public, you can find it on the Community page. If you have an invite link, click the link to join."
    },
    {
      question: "What happens if we don't reach the goal?",
      answer: "If the goal is not reached by the deadline, all contributions are automatically returned to the members."
    },
    {
      question: "Are there any fees for using Goal Finance?",
      answer: "Goal Finance charges a small fee on the yield earned to support the platform's development and maintenance."
    },
    {
      question: "How do I withdraw my funds?",
      answer: "If the goal is reached, your funds (contribution + yield) will be automatically sent to your connected wallet after the deadline. If the goal is not reached, your contribution will be returned."
    }
  ];

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-goal-bg relative">
      <FloatingDecorations />

      {/* Navigation Pills - Responsive */}
      <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 px-4 w-full max-w-screen-sm">
        <div className="bg-white/90 backdrop-blur-md rounded-full px-4 sm:px-6 py-3 shadow-lg border border-goal-border/20">
          <div className="flex items-center justify-between space-x-2 sm:space-x-6">
            <button
              onClick={() => scrollToSection('home')}
              className="text-goal-text hover:text-goal-primary transition-colors font-inter font-medium text-sm sm:text-base"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="text-goal-text hover:text-goal-primary transition-colors font-inter font-medium text-sm sm:text-base whitespace-nowrap"
            >
              How it Works
            </button>
            <button
              onClick={() => scrollToSection('faq')}
              className="text-goal-text hover:text-goal-primary transition-colors font-inter font-medium text-sm sm:text-base"
            >
              FAQ
            </button>
            <button
              onClick={() => navigate('/faucet')}
              className="text-goal-text hover:text-goal-primary transition-colors font-inter font-medium text-sm sm:text-base"
            >
              Faucet
            </button>
            {isMobile === undefined ? (
              <Button
                disabled
                size="sm"
                className="bg-goal-primary/50 text-goal-text font-fredoka font-semibold px-3 sm:px-4 py-2 rounded-full text-sm whitespace-nowrap"
              >
                Loading...
              </Button>
            ) : isMobile ? (
              <Button
                type="button"
                onClick={() => navigate('/welcome')}
                size="sm"
                className="bg-goal-primary hover:bg-goal-primary/90 text-goal-text font-fredoka font-semibold px-3 sm:px-4 py-2 rounded-full text-sm whitespace-nowrap"
              >
                <Wallet className="mr-1 h-3 w-3" />
                Launch App
              </Button>
            ) : (
              <WalletButton
                variant="default"
                size="sm"
                className="bg-goal-primary hover:bg-goal-primary/90 text-goal-text font-fredoka font-semibold px-3 sm:px-4 py-2 rounded-full text-sm whitespace-nowrap"
              />
            )}
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <main id="home" className={`relative z-10 container-narrow pt-16 pb-24 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="text-center">
          {/* Cloud Money Icon */}
          {/* <div className={`flex justify-center transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
            <CloudMoneyIcon size={120} />
          </div> */}

          {/* Goal Finance Icon */}
          <div className={`flex justify-center mt-6 mb-8 transition-all duration-700 delay-300 ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
            <div className="relative">
              <img
                src="/goal_finance_icon_png.png"
                alt="Goal Finance"
                className="w-24 h-24 object-contain hover:scale-110 transition-all duration-300 drop-shadow-lg"
                style={{ animation: 'bounce 1s infinite' }}
              />
              {/* Floating glow effect */}
              <div className="absolute inset-0 w-24 h-24 bg-goal-primary/20 rounded-full blur-xl"></div>
            </div>
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
              Save together. On any chain. For anything.
              <br />
              The fun way to save with friends and reach your dreams.
            </p>

            {/* CTA Buttons */}
            <div className={`pt-8 flex flex-col sm:flex-row gap-4 justify-center transition-all duration-700 delay-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              {isMobile === undefined ? (
                <Button
                  disabled
                  variant="default"
                  size="lg"
                  className="text-lg text-goal-text-primary px-12 py-4 rounded-full shadow-md disabled:opacity-50"
                >
                  Loading...
                </Button>
              ) : isMobile ? (
                <Button
                  type="button"
                  onClick={() => navigate('/welcome')}
                  variant="default"
                  size="lg"
                  className="text-lg text-goal-text-primary px-12 py-4 rounded-full shadow-md hover:shadow-lg hover:scale-[1.02]"
                >
                  <Wallet className="mr-2 h-5 w-5" />
                  Launch App ✨
                </Button>
              ) : (
                <WalletButton
                  variant="default"
                  size="lg"
                  className="text-lg text-goal-text-primary px-12 py-4 rounded-full shadow-md hover:shadow-lg hover:scale-[1.02]"
                />
              )}

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
                Create savings goals with friends and family for shared dreams
              </p>
            </div>

            <div className="bg-white/40 backdrop-blur-sm rounded-3xl p-6 border border-goal-border/30 hover:scale-105 transition-all duration-300">
              <div className="text-4xl mb-4">📈</div>
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
        {/* Card Goals Section */}
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

      {/* How it Works Section */}
      <section id="how-it-works" className="py-16 bg-gradient-to-br from-white/40 via-goal-primary/5 to-goal-accent/20 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-fredoka font-bold text-goal-text mb-4">
              How Goal Finance Works
            </h2>
            <p className="font-inter text-goal-text/70 text-lg max-w-2xl mx-auto">
              Four simple steps to start saving together and achieving your financial goals
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="group relative">
                  <div className="relative bg-white/60 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-goal-border/20 hover:shadow-xl hover:bg-white/70 transition-all duration-300 group-hover:scale-[1.02] h-full">
                    {/* Step Number Badge */}
                    <div className="absolute -top-3 -left-3 w-10 h-10 bg-gradient-to-br from-goal-primary to-goal-primary/80 rounded-xl flex items-center justify-center shadow-lg">
                      <span className="font-fredoka font-bold text-goal-text text-base">
                        {index + 1}
                      </span>
                    </div>

                    {/* Icon Container */}
                    <div className="mb-4 flex justify-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-goal-accent/20 to-goal-primary/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Icon className="w-8 h-8 text-goal-primary" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="text-center">
                      <h3 className="text-xl font-fredoka font-bold text-goal-text mb-3">
                        {step.title}
                      </h3>
                      <p className="font-inter text-goal-text/70 leading-relaxed text-sm">
                        {step.description}
                      </p>
                    </div>

                    {/* Decorative Elements */}
                    <div className="absolute top-3 right-3 w-2 h-2 bg-goal-accent/30 rounded-full"></div>
                    <div className="absolute bottom-3 left-3 w-1.5 h-1.5 bg-goal-primary/20 rounded-full"></div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Call to Action */}
          <div className="text-center mt-12">
            <div className="bg-white/50 backdrop-blur-md rounded-2xl p-6 border border-goal-border/20 max-w-xl mx-auto">
              <h3 className="text-xl font-fredoka font-bold text-goal-text mb-3">
                Ready to Start Your Savings Journey?
              </h3>
              <p className="font-inter text-goal-text/70 mb-4 text-sm">
                Join thousands of users who are already achieving their financial goals together
              </p>
              {isMobile === undefined ? (
                <Button
                  disabled
                  className="bg-goal-primary/50 text-goal-text font-fredoka font-semibold px-6 py-2 rounded-xl shadow-lg"
                >
                  Loading...
                </Button>
              ) : isMobile ? (
                <Button
                  type="button"
                  onClick={() => navigate('/welcome')}
                  className="bg-goal-primary hover:bg-goal-primary/90 text-goal-text font-fredoka font-semibold px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Wallet className="mr-2 h-4 w-4" />
                  Get Started Now
                </Button>
              ) : (
                <WalletButton
                  variant="default"
                  className="bg-goal-primary hover:bg-goal-primary/90 text-goal-text font-fredoka font-semibold px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 bg-gradient-to-br from-goal-bg via-white/10 to-goal-accent/10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-fredoka font-bold text-goal-text mb-4">
              Frequently Asked Questions
            </h2>
            <p className="font-inter text-goal-text/70 text-lg max-w-2xl mx-auto">
              Everything you need to know about saving together with Goal Finance
            </p>
          </div>

          <div className="bg-white/40 backdrop-blur-md rounded-2xl p-6 border border-goal-border/20 shadow-lg">
            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="bg-white/50 backdrop-blur-sm border border-goal-border/20 rounded-xl overflow-hidden hover:bg-white/60 transition-all duration-300"
                >
                  <AccordionTrigger className="font-fredoka font-semibold text-goal-text text-base hover:no-underline px-4 py-3 hover:bg-goal-primary/5 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-1.5 h-1.5 bg-goal-primary rounded-full"></div>
                      <span>{faq.question}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="font-inter text-goal-text/70 px-4 pb-4 pt-1 leading-relaxed text-sm">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {/* Contact Support */}
          <div className="text-center mt-10">
            <div className="bg-white/30 backdrop-blur-md rounded-xl p-5 border border-goal-border/20 max-w-sm mx-auto">
              <h3 className="text-lg font-fredoka font-bold text-goal-text mb-2">
                Still have questions?
              </h3>
              <p className="font-inter text-goal-text/70 text-sm mb-4">
                Our team is here to help you get started
              </p>
              <Button
                variant="outline"
                size="sm"
                className="border-goal-primary text-goal-primary hover:bg-goal-primary hover:text-goal-text font-fredoka font-semibold rounded-lg"
              >
                Contact Support
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Onboarding Modal */}
      {showOnboarding && (
        <OnboardingWelcome onComplete={handleOnboardingComplete} />
      )}
    </div>
  );
};

export default Index;
