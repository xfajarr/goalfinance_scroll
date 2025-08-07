import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RoundableTransactions } from '@/components/acorns/RoundableTransactions';
import BottomNavigation from '@/components/BottomNavigation';
import { Container } from '@/components/layout-components';

const RoundableTransactionsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-goal-bg pb-32 md:pb-8">
      {/* Header */}
      <Container size="xl" className="pt-6 pb-4">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/app/dashboard">
            <Button variant="ghost" size="sm" className="p-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-fredoka font-bold text-goal-heading">
              Transaction Round-ups
            </h1>
            <p className="text-goal-text-secondary text-sm">
              Automatically detected transactions that can be rounded up
            </p>
          </div>
        </div>
      </Container>

      {/* Main Content */}
      <Container size="xl">
        <RoundableTransactions />
      </Container>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default RoundableTransactionsPage;
