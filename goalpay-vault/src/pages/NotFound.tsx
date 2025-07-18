
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Navigation from '@/components/Navigation';
import BottomNavigation from '@/components/BottomNavigation';
import { ArrowLeft, Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-goal-bg pb-32 md:pb-0">
      <Navigation />
      
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-center min-h-[60vh]">
        <Card className="bg-white/60 backdrop-blur-sm border-goal-border/30 p-8 rounded-3xl text-center">
          <div className="w-24 h-24 bg-goal-accent rounded-3xl flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">😕</span>
          </div>
          
          <h1 className="text-3xl font-fredoka font-bold text-goal-text mb-4">
            Page Not Found
          </h1>
          
          <p className="font-inter text-goal-text/70 mb-6">
            Oops! The page you're looking for doesn't exist. 
            It might have been moved or deleted.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              asChild
              variant="outline"
              className="border-goal-border text-goal-text hover:bg-goal-accent rounded-full px-6"
            >
              <Link to="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Link>
            </Button>
            
            <Button
              asChild
              className="bg-goal-primary hover:bg-goal-primary/90 text-goal-text font-fredoka font-semibold rounded-full px-6"
            >
              <Link to="/dashboard">
                <Home className="w-4 h-4 mr-2" />
                Dashboard
              </Link>
            </Button>
          </div>
        </Card>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default NotFound;
