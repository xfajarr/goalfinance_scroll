import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  TrendingUp, 
  Calendar, 
  PiggyBank,
  Shield,
  Zap,
  Target
} from 'lucide-react';
import { useAcorns } from '@/hooks/useAcorns';
import { useMockMorpho } from '@/hooks/useMockMorpho';
import { PortfolioType } from '@/config/contracts';

interface AcornsSettingsProps {
  onClose: () => void;
}

const PORTFOLIO_OPTIONS = [
  {
    type: PortfolioType.CONSERVATIVE,
    name: 'Conservative',
    apy: '4%',
    description: 'Lower risk, steady growth',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: Shield,
  },
  {
    type: PortfolioType.MODERATE,
    name: 'Moderate',
    apy: '6%',
    description: 'Balanced risk and reward',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: TrendingUp,
  },
  {
    type: PortfolioType.AGGRESSIVE,
    name: 'Aggressive',
    apy: '8%',
    description: 'Higher risk, higher potential returns',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: Zap,
  },
];

export const AcornsSettings: React.FC<AcornsSettingsProps> = ({ onClose }) => {
  const {
    userAccount,
    stats,
    changePortfolio,
    setRecurringInvestment,
    investRoundUps,
    claimYield,
    isLoading
  } = useAcorns();

  const {
    yieldInfo,
    userPosition,
    claimYield: claimMorphoYield,
    updateYieldRates,
    isLoading: morphoLoading
  } = useMockMorpho();

  const [selectedPortfolio, setSelectedPortfolio] = useState<PortfolioType>(
    userAccount?.portfolio || PortfolioType.MODERATE
  );
  const [recurringAmount, setRecurringAmount] = useState('');
  const [recurringInterval, setRecurringInterval] = useState('7');
  const [autoInvestEnabled, setAutoInvestEnabled] = useState(false);

  const handlePortfolioChange = async () => {
    if (selectedPortfolio !== userAccount?.portfolio) {
      await changePortfolio(selectedPortfolio);
    }
  };

  const handleRecurringSetup = async () => {
    const amount = parseFloat(recurringAmount);
    const interval = parseInt(recurringInterval);
    
    if (amount > 0 && interval > 0) {
      await setRecurringInvestment(amount, interval);
      setRecurringAmount('');
    }
  };

  const handleInvestRoundUps = async () => {
    await investRoundUps();
  };

  const handleClaimYield = async () => {
    await claimYield();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  if (!userAccount?.isRegistered) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Acorns Settings
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <PiggyBank className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Acorns Not Enabled</h3>
            <p className="text-gray-600 mb-4">
              Register for Acorns to access settings and start micro-investing
            </p>
            <Button onClick={onClose}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Acorns Settings
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="portfolio" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="recurring">Recurring</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
          </TabsList>

          {/* Portfolio Settings */}
          <TabsContent value="portfolio" className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Portfolio Type</h3>
              <p className="text-sm text-gray-600 mb-4">
                Choose your investment strategy based on your risk tolerance
              </p>
            </div>

            <div className="space-y-3">
              {PORTFOLIO_OPTIONS.map((option) => {
                const Icon = option.icon;
                const isSelected = selectedPortfolio === option.type;
                const isCurrent = userAccount.portfolio === option.type;

                return (
                  <Card
                    key={option.type}
                    className={`p-4 cursor-pointer transition-all ${
                      isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedPortfolio(option.type)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Icon className="w-6 h-6 text-gray-600" />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{option.name}</h4>
                            <Badge className={option.color}>{option.apy} APY</Badge>
                            {isCurrent && (
                              <Badge variant="outline">Current</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{option.description}</p>
                        </div>
                      </div>
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                      }`}>
                        {isSelected && <div className="w-2 h-2 bg-white rounded-full m-0.5" />}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {selectedPortfolio !== userAccount.portfolio && (
              <Button 
                onClick={handlePortfolioChange}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Updating...' : 'Update Portfolio'}
              </Button>
            )}
          </TabsContent>

          {/* Recurring Investment Settings */}
          <TabsContent value="recurring" className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Recurring Investment</h3>
              <p className="text-sm text-gray-600 mb-4">
                Set up automatic investments to grow your portfolio consistently
              </p>
            </div>

            {/* Current Recurring Settings */}
            {userAccount.recurringEnabled && (
              <Card className="p-4 bg-green-50 border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-800">Active Recurring Investment</span>
                </div>
                <p className="text-sm text-green-700">
                  {formatCurrency(parseFloat(userAccount.recurringAmount.toString()) / 1e6)} every{' '}
                  {parseInt(userAccount.recurringInterval.toString()) / (24 * 60 * 60)} days
                </p>
              </Card>
            )}

            {/* Set Up New Recurring Investment */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amount">Amount ($)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="1"
                    placeholder="50.00"
                    value={recurringAmount}
                    onChange={(e) => setRecurringAmount(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="interval">Interval (days)</Label>
                  <Input
                    id="interval"
                    type="number"
                    min="1"
                    placeholder="7"
                    value={recurringInterval}
                    onChange={(e) => setRecurringInterval(e.target.value)}
                  />
                </div>
              </div>

              <Button 
                onClick={handleRecurringSetup}
                disabled={!recurringAmount || !recurringInterval || isLoading}
                className="w-full"
              >
                {isLoading ? 'Setting up...' : 'Set Up Recurring Investment'}
              </Button>
            </div>

            {/* Auto-Invest Round-ups */}
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Auto-Invest Round-ups</h4>
                  <p className="text-sm text-gray-600">
                    Automatically invest round-ups when they reach $5
                  </p>
                </div>
                <Switch
                  checked={autoInvestEnabled}
                  onCheckedChange={setAutoInvestEnabled}
                />
              </div>
            </Card>
          </TabsContent>

          {/* Quick Actions */}
          <TabsContent value="actions" className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Quick Actions</h3>
              <p className="text-sm text-gray-600 mb-4">
                Manage your investments and earnings
              </p>
            </div>

            {/* Current Stats */}
            <Card className="p-4 bg-gray-50">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Pending Round-ups</p>
                  <p className="text-lg font-semibold">{formatCurrency(stats?.pendingRoundUps || 0)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Current Yield</p>
                  <p className="text-lg font-semibold text-green-600">+{formatCurrency(stats?.currentYield || 0)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Total Invested</p>
                  <p className="text-lg font-semibold">{formatCurrency(stats?.totalInvested || 0)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Portfolio Value</p>
                  <p className="text-lg font-semibold">{formatCurrency(stats?.portfolioValue || 0)}</p>
                </div>
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleInvestRoundUps}
                disabled={!stats?.pendingRoundUps || stats.pendingRoundUps === 0 || isLoading}
                className="w-full flex items-center gap-2"
                variant="default"
              >
                <Target className="w-4 h-4" />
                Invest Round-ups ({formatCurrency(stats?.pendingRoundUps || 0)})
              </Button>

              <Button
                onClick={handleClaimYield}
                disabled={!stats?.currentYield || stats.currentYield === 0 || isLoading}
                className="w-full flex items-center gap-2"
                variant="outline"
              >
                <TrendingUp className="w-4 h-4" />
                Claim Yield ({formatCurrency(stats?.currentYield || 0)})
              </Button>
            </div>

            {/* Portfolio Summary */}
            <Card className="p-4 border-blue-200 bg-blue-50">
              <div className="flex items-center gap-2 mb-2">
                <PiggyBank className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-800">Portfolio Summary</span>
              </div>
              <div className="text-sm text-blue-700">
                <p>Portfolio Type: <strong>{stats?.portfolioType}</strong></p>
                <p>Purchases Tracked: <strong>{stats?.purchaseCount || 0}</strong></p>
                <p>Total Round-ups: <strong>{formatCurrency(stats?.totalRoundUps || 0)}</strong></p>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
