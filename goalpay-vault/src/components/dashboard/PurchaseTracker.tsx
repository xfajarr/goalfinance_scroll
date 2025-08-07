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
  TrendingUp
} from 'lucide-react';
import { useAcorns } from '@/hooks/useAcorns';
import { PortfolioType } from '@/config/contracts';

interface PurchaseTrackerProps {
  onClose: () => void;
}

const MERCHANT_SUGGESTIONS = [
  { name: 'Coffee Shop', icon: Coffee, category: 'Food & Drink' },
  { name: 'Grocery Store', icon: ShoppingBag, category: 'Groceries' },
  { name: 'Gas Station', icon: Car, category: 'Transportation' },
  { name: 'Restaurant', icon: Utensils, category: 'Food & Drink' },
  { name: 'Online Store', icon: ShoppingCart, category: 'Shopping' },
];

export const PurchaseTracker: React.FC<PurchaseTrackerProps> = ({ onClose }) => {
  const [amount, setAmount] = useState('');
  const [merchant, setMerchant] = useState('');
  const [selectedMerchant, setSelectedMerchant] = useState<string | null>(null);
  
  const { simulatePurchase, calculateRoundUp, isLoading, stats } = useAcorns();

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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Track Purchase
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Amount Input */}
          <div className="space-y-2">
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
          </div>

          {/* Round-up Preview */}
          {purchaseAmount > 0 && (
            <Card className="p-4 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-800">Round-up Preview</span>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {formatCurrency(roundUpAmount)}
                </Badge>
              </div>
              <div className="mt-2 text-sm text-green-700">
                {roundUpAmount > 0 ? (
                  <>
                    {formatCurrency(purchaseAmount)} rounds up to {formatCurrency(Math.ceil(purchaseAmount))}
                  </>
                ) : (
                  'No round-up needed (already a whole dollar)'
                )}
              </div>
            </Card>
          )}

          {/* Merchant Selection */}
          <div className="space-y-3">
            <Label>Merchant</Label>
            
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
                    className="flex items-center gap-2 justify-start"
                  >
                    <Icon className="w-4 h-4" />
                    <span className="truncate">{suggestion.name}</span>
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
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};
