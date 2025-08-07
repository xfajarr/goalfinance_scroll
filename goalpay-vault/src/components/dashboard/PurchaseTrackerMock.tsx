import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { 
  ShoppingCart, 
  Coffee, 
  Car, 
  Utensils, 
  ShoppingBag,
  Calculator,
  TrendingUp,
  Pill,
  Zap,
  Home
} from 'lucide-react';
import { useAcornsMock } from '@/hooks/useAcornsMock';

interface PurchaseTrackerMockProps {
  onClose: () => void;
}

const MERCHANT_SUGGESTIONS = [
  { name: 'Starbucks Coffee', icon: Coffee, category: 'Food & Drink' },
  { name: 'Whole Foods Market', icon: ShoppingBag, category: 'Groceries' },
  { name: 'Shell Gas Station', icon: Car, category: 'Transportation' },
  { name: 'Chipotle Mexican Grill', icon: Utensils, category: 'Food & Drink' },
  { name: 'Amazon', icon: ShoppingCart, category: 'Shopping' },
  { name: 'CVS Pharmacy', icon: Pill, category: 'Health' },
  { name: 'Electric Bill', icon: Zap, category: 'Utilities' },
  { name: 'Target', icon: Home, category: 'Shopping' },
];

const QUICK_AMOUNTS = [4.25, 8.50, 12.67, 15.30, 25.99, 45.00];

export const PurchaseTrackerMock: React.FC<PurchaseTrackerMockProps> = ({ onClose }) => {
  const [amount, setAmount] = useState('');
  const [merchant, setMerchant] = useState('');
  const [selectedMerchant, setSelectedMerchant] = useState<string | null>(null);
  
  const { simulatePurchase, calculateRoundUp, isLoading, stats } = useAcornsMock();

  const purchaseAmount = parseFloat(amount) || 0;
  const roundUpAmount = calculateRoundUp(purchaseAmount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !merchant) return;

    try {
      await simulatePurchase(purchaseAmount, merchant);
      onClose();
    } catch (error) {
      console.error('Failed to track purchase:', error);
    }
  };

  const handleMerchantSelect = (merchantName: string) => {
    setMerchant(merchantName);
    setSelectedMerchant(merchantName);
  };

  const handleQuickAmount = (quickAmount: number) => {
    setAmount(quickAmount.toString());
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Track Purchase & Round-up
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Amount Input */}
          <div className="space-y-3">
            <Label htmlFor="amount">Purchase Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-8"
                required
              />
            </div>

            {/* Quick Amount Buttons */}
            <div className="grid grid-cols-3 gap-2">
              {QUICK_AMOUNTS.map((quickAmount) => (
                <Button
                  key={quickAmount}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAmount(quickAmount)}
                  className="text-xs"
                >
                  ${quickAmount}
                </Button>
              ))}
            </div>
          </div>

          {/* Round-up Preview */}
          {purchaseAmount > 0 && (
            <Card className="p-4 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-800">Round-up Preview</span>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {formatCurrency(roundUpAmount)}
                </Badge>
              </div>
              <div className="text-sm text-green-700">
                {roundUpAmount > 0 ? (
                  <>
                    {formatCurrency(purchaseAmount)} rounds up to {formatCurrency(Math.ceil(purchaseAmount))}
                  </>
                ) : (
                  'No round-up needed (already a whole dollar)'
                )}
              </div>
              {roundUpAmount > 0 && (
                <div className="mt-2 text-xs text-green-600">
                  This spare change will be added to your Acorns portfolio
                </div>
              )}
            </Card>
          )}

          {/* Merchant Selection */}
          <div className="space-y-3">
            <Label>Select Merchant</Label>
            
            {/* Quick Select Merchants */}
            <div className="grid grid-cols-2 gap-2">
              {MERCHANT_SUGGESTIONS.map((suggestion) => {
                const Icon = suggestion.icon;
                const isSelected = selectedMerchant === suggestion.name;
                
                return (
                  <Button
                    key={suggestion.name}
                    type="button"
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleMerchantSelect(suggestion.name)}
                    className="flex items-center gap-2 justify-start h-auto p-3"
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <div className="text-left">
                      <div className="text-xs font-medium truncate">{suggestion.name}</div>
                      <div className="text-xs text-gray-500">{suggestion.category}</div>
                    </div>
                  </Button>
                );
              })}
            </div>

            {/* Custom Merchant Input */}
            <div className="space-y-2">
              <Label htmlFor="merchant" className="text-sm text-gray-600">
                Or enter custom merchant
              </Label>
              <Input
                id="merchant"
                placeholder="Enter merchant name"
                value={merchant}
                onChange={(e) => {
                  setMerchant(e.target.value);
                  setSelectedMerchant(null);
                }}
                required
              />
            </div>
          </div>

          {/* Current Stats */}
          {stats && (
            <Card className="p-4 bg-gray-50">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-gray-800">Your Acorns Stats</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Pending Round-ups</p>
                  <p className="font-semibold">{formatCurrency(stats.pendingRoundUps)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Total Invested</p>
                  <p className="font-semibold">{formatCurrency(stats.totalInvested)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Portfolio Value</p>
                  <p className="font-semibold">{formatCurrency(stats.portfolioValue)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Purchases Tracked</p>
                  <p className="font-semibold">{stats.purchaseCount}</p>
                </div>
              </div>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!amount || !merchant || isLoading}
              className="flex-1"
            >
              {isLoading ? 'Tracking...' : 'Track Purchase'}
            </Button>
          </div>

          {/* Investment Preview */}
          {roundUpAmount > 0 && (
            <div className="text-center text-sm text-gray-600 border-t pt-4">
              <p>
                This will add <strong>{formatCurrency(roundUpAmount)}</strong> to your pending round-ups.
              </p>
              <p className="mt-1">
                Total pending after this purchase: <strong>{formatCurrency((stats?.pendingRoundUps || 0) + roundUpAmount)}</strong>
              </p>
              <div className="mt-2 p-2 bg-blue-50 rounded text-blue-700 text-xs">
                💡 Tip: Round-ups are automatically invested in your {stats?.portfolioType || 'selected'} portfolio
              </div>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};
