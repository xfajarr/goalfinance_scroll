import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePrivy } from '@privy-io/react-auth';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAnimationStages } from '@/hooks/use-animation-stages';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';

// Animation configuration constants
const ANIMATION_CONFIG = {
  stages: 5,
  timings: [100, 300, 600, 850, 1050, 1200],
  stageDurations: {
    initial: 100,
    icon: 300,
    title: 600, 
    subtitle: 850,
    button: 1050,
    terms: 1200
  }
};

const Welcome = () => {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const navigate = useNavigate();
  const { login, authenticated, user, ready } = usePrivy();
  const isMobile = useIsMobile();
  
  // Use custom hook for cleaner animation management
  const { isLoaded, currentStage: animationStage } = useAnimationStages({
    enabled: isMobile === true,
    stages: ANIMATION_CONFIG.stages,
    timings: ANIMATION_CONFIG.timings
  });

  // Helper function to get animation classes
  const getAnimationClasses = (stage: number, baseClasses = '') => {
    const isVisible = animationStage >= stage;
    return `${baseClasses} transition-spring ${
      isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'
    }`;
  };

  useEffect(() => {
    // Redirect to home if accessed on desktop
    if (isMobile === false) {
      navigate('/');
      return;
    }
  }, [isMobile, navigate]);

  useEffect(() => {
    // Redirect to dashboard if already authenticated
    if (ready && authenticated && user) {
      navigate('/dashboard');
    }
  }, [ready, authenticated, user, navigate]);

  const handleGetStarted = async () => {
    if (isLoggingIn) return;
    
    setIsLoggingIn(true);
    try {
      await login();
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignIn = async () => {
    if (isLoggingIn) return;
    
    setIsLoggingIn(true);
    try {
      await login();
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  // Show soft loading state until Privy is ready or if not mobile
  if (!ready || isMobile === undefined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-goal-bg/70 via-white to-goal-soft/60 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-white/80 rounded-2xl shadow-md flex items-center justify-center mb-6 mx-auto border border-goal-border/5">
            <Loader2 className="w-8 h-8 animate-spin text-goal-text-primary/70" />
          </div>
          <p className="text-goal-text-primary/60 font-inter font-medium">Loading Goal Finance...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if redirecting (not mobile)
  if (isMobile === false) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-goal-bg/70 via-white to-goal-soft/60 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute top-20 right-10 w-32 h-32 bg-goal-primary/5 rounded-full blur-3xl transition-all duration-[2s] ease-out ${animationStage >= 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}></div>
        <div className={`absolute bottom-32 left-8 w-24 h-24 bg-goal-accent/5 rounded-full blur-2xl transition-all duration-[2s] ease-out delay-300 ${animationStage >= 2 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}></div>
        <div className={`absolute top-1/2 left-1/2 w-40 h-40 bg-goal-soft/10 rounded-full blur-3xl transition-all duration-[2.5s] ease-out delay-500 ${animationStage >= 3 ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}></div>
      </div>

      {/* Back button - enhanced animations */}
      <div className={`absolute top-8 left-8 z-20 transition-all duration-700 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        <Button
          onClick={handleBackToHome}
          variant="ghost"
          size="sm"
          className="text-goal-text-secondary/70 hover:text-goal-text-primary/80 hover:bg-goal-soft/30 transition-all duration-300 rounded-full px-4 py-2 backdrop-blur-sm border border-goal-border/10 shadow-sm hover:shadow-md hover:scale-105 active:scale-95"
        >
          <ArrowLeft size={16} className="mr-2" />
          <span className="font-inter font-medium text-sm">Back</span>
        </Button>
      </div>

      {/* Main content - enhanced animations with spring-like effects */}
      <div className={`relative z-10 flex flex-col items-center justify-center min-h-screen px-8 transition-all duration-1000 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
        
        {/* Enhanced icon container with multiple animation stages */}
        <div className={`mb-12 transition-spring ${animationStage >= 1 ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-75 rotate-12'}`}>
          <div className="relative">
            {/* Animated glow effect */}
            <div className={`absolute inset-0 bg-gradient-to-r from-goal-primary/20 to-goal-accent/20 rounded-full blur-xl transition-smooth ${animationStage >= 1 ? 'opacity-100 scale-110 animate-smooth-glow' : 'opacity-0 scale-90'}`}></div>
            
            {/* Main container - enhanced styling with pulse effect */}
            <div className={`relative w-60 h-60 flex items-center justify-center transition-spring ${animationStage >= 1 ? 'scale-100' : 'scale-85'}`}>
              <img
                src="/goal_finance_icon_png.png"
                alt="Goal Finance"
                className={`w-100 h-100 object-contain filter drop-shadow-lg transition-smooth ${animationStage >= 1 ? 'opacity-95 scale-100 animate-soft-pulse' : 'opacity-0 scale-90'}`}
              />
              {/* Subtle rotating ring */}
              <div className={`absolute inset-4 border border-goal-primary/10 rounded-full transition-all duration-[3s] ease-in-out ${animationStage >= 1 ? 'opacity-100 rotate-180' : 'opacity-0 rotate-0'}`}></div>
            </div>
          </div>
        </div>

        {/* Enhanced brand name section with staggered animations */}
        <div className={getAnimationClasses(2, 'mb-6')}>
          <h1 className={`text-4xl font-bold text-goal-heading/80 font-fredoka tracking-tight mb-2 ${animationStage >= 2 ? 'animate-gentle-bounce' : ''}`}>
            Goal Finance
          </h1>
          <div className={`w-12 h-0.5 bg-gradient-to-r from-goal-primary/40 to-goal-accent/40 rounded-full mx-auto transition-spring ${animationStage >= 2 ? 'opacity-70 scale-x-100' : 'opacity-0 scale-x-0'}`}></div>
        </div>

        {/* Enhanced messaging with smooth entry */}
        <div className={`text-center mb-12 max-w-sm transition-spring ${animationStage >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <p className={`text-goal-subheading/70 text-lg leading-relaxed font-inter mb-3 font-medium transition-smooth ${animationStage >= 3 ? 'opacity-100' : 'opacity-0'}`}>
            Learn to achieve your{' '}
            <span className={`text-goal-text-primary/80 font-semibold transition-smooth delay-200 ${animationStage >= 3 ? 'opacity-100' : 'opacity-0'}`}>financial goals</span>{' '}
            with friends
          </p>
          <p className={`text-goal-text-secondary/60 text-sm font-inter leading-relaxed transition-smooth delay-300 ${animationStage >= 3 ? 'opacity-100' : 'opacity-0'}`}>
            Save together, earn yield, celebrate success
          </p>
        </div>

        {/* Enhanced buttons with bounce-in effect */}
        <div className={`w-full max-w-sm space-y-4 transition-spring ${animationStage >= 4 ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}`}>
          {/* Primary button - enhanced styling and animations */}
          <Button
            onClick={handleGetStarted}
            disabled={isLoggingIn}
            className={`w-full bg-goal-text-primary text-white hover:from-goal-heading/80 hover:to-goal-text-primary/80 disabled:from-goal-text-muted/50 disabled:to-goal-text-muted/50 disabled:text-goal-text-secondary/70 font-fredoka font-semibold text-base py-6 rounded-2xl shadow-md hover:shadow-xl transition-spring transform ${!isLoggingIn ? 'hover:scale-105 hover:-translate-y-1' : ''} disabled:hover:scale-100 disabled:hover:translate-y-0 active:scale-95`}
            size="lg"
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                <span>Connecting...</span>
              </>
            ) : (
              <span>Let's start saving</span>
            )}
          </Button>
        </div>

        {/* Enhanced terms section with gentle fade-in */}
        <div className={`mt-8 text-center max-w-sm transition-smooth ${animationStage >= 5 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <p className="text-xs text-goal-text-muted/50 leading-relaxed font-inter">
            By continuing, you agree to Goal Finance's{' '}
            <a href="#" className="text-goal-text/60 underline decoration-1 underline-offset-2 hover:text-goal-text-primary/70 transition-spring hover:decoration-2">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-goal-text/60 underline decoration-1 underline-offset-2 hover:text-goal-text-primary/70 transition-spring hover:decoration-2">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
