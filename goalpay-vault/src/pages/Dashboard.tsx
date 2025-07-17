
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import BottomNavigation from '@/components/BottomNavigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus } from 'lucide-react';

// Import modular components
import { QuickStats } from '@/components/dashboard/quick-stats';
import { VaultCard } from '@/components/vault/vault-card';
import { ActivityItem } from '@/components/activity/activity-item';
import { MonthlySummary } from '@/components/dashboard/monthly-summary';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { AchievementsPreview } from '@/components/dashboard/achievements-preview';
import { SectionHeader } from '@/components/ui/section-header';

// Import constants
import { DASHBOARD_STATS, MONTHLY_SUMMARY, MOCK_VAULTS, MOCK_ACTIVITY } from '@/constants/dashboard';

const Dashboard = () => {
  const [myVaults] = useState(MOCK_VAULTS);
  const [recentActivity] = useState(MOCK_ACTIVITY);

  return (
    <div className="min-h-screen bg-goal-bg pb-20 md:pb-0">
      <Navigation />

      <main className="container-content py-8">
        {/* Welcome Section */}
        <SectionHeader
          title="Welcome back, Alex! 👋"
          subtitle="You're making great progress on your savings goals!"
          className="mb-8"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-section">
            {/* Quick Stats */}
            <QuickStats
              totalSaved={DASHBOARD_STATS.totalSaved}
              earnedYield={DASHBOARD_STATS.earnedYield}
              activeGoals={DASHBOARD_STATS.activeGoals}
              friends={DASHBOARD_STATS.friends}
            />

            {/* My Vaults */}
            <Card className="bg-white/60 backdrop-blur-sm border-goal-border/30 p-8 rounded-3xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-fredoka font-bold text-goal-text">My Vaults</h2>
                <Link to="/create-vault">
                  <Button className="bg-goal-primary hover:bg-goal-primary/90 text-goal-text font-fredoka font-semibold rounded-full px-6 py-3 transition-all duration-300 hover:scale-105">
                    <Plus className="w-5 h-5 mr-2" />
                    Create Vault
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {myVaults.map((vault) => (
                  <VaultCard key={vault.id} vault={vault} />
                ))}
              </div>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-white/60 backdrop-blur-sm border-goal-border/30 p-section rounded-3xl">
              <h2 className="text-2xl md:text-3xl font-fredoka font-bold text-goal-heading mb-6">Recent Activity</h2>

              <div className="space-element">
                {recentActivity.map((activity) => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-component">
            {/* Monthly Summary */}
            <MonthlySummary
              saved={MONTHLY_SUMMARY.saved}
              yieldEarned={MONTHLY_SUMMARY.yieldEarned}
              goalsReached={MONTHLY_SUMMARY.goalsReached}
            />

            {/* Quick Actions */}
            <QuickActions />

            {/* Achievements Preview */}
            <AchievementsPreview />
          </div>
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default Dashboard;
