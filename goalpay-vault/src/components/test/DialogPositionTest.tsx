import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MobileDialog, MobileDialogContent, MobileDialogHeader, MobileDialogTitle, MobileDialogTrigger } from '@/components/ui/mobile-dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

/**
 * Test component to verify dialog positioning and animation fixes
 * This component replicates the purchase tracker dialog to test the fixes
 */
export const DialogPositionTest: React.FC = () => {
  const [regularDialogOpen, setRegularDialogOpen] = useState(false);
  const [mobileDialogOpen, setMobileDialogOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [merchant, setMerchant] = useState('');
  const [selectedMerchant, setSelectedMerchant] = useState<string | null>(null);

  const purchaseAmount = parseFloat(amount) || 0;
  const roundUpAmount = purchaseAmount > 0 ? Math.ceil(purchaseAmount) - purchaseAmount : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const quickAmounts = [4.25, 8.5, 12.67, 15.3, 25.99, 45];

  const merchants = [
    { name: 'Starbucks Coffee', category: 'Food & Drink', icon: Coffee },
    { name: 'Whole Foods Market', category: 'Groceries', icon: ShoppingBag },
    { name: 'Shell Gas Station', category: 'Transportation', icon: Car },
    { name: 'Chipotle Mexican Grill', category: 'Food & Drink', icon: Utensils },
    { name: 'Amazon', category: 'Shopping', icon: ShoppingBag },
    { name: 'CVS Pharmacy', category: 'Health', icon: Pill },
    { name: 'Electric Bill', category: 'Utilities', icon: Zap },
    { name: 'Target', category: 'Shopping', icon: Home },
  ];

  const DialogContent_Component = ({ title, type }: { title: string; type: 'regular' | 'mobile' }) => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-gray-600">
          Testing dialog positioning and animation - {type} dialog
        </p>
      </div>

      {/* Purchase Amount */}
      <div className="space-y-3">
        <Label htmlFor="amount" className="text-sm font-medium">
          Purchase Amount
        </Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
            $
          </span>
          <Input
            id="amount"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="pl-8"
          />
        </div>

        {/* Quick Amount Buttons */}
        <div className="grid grid-cols-3 gap-2">
          {quickAmounts.map((quickAmount) => (
            <Button
              key={quickAmount}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setAmount(quickAmount.toString())}
              className="text-xs"
            >
              {formatCurrency(quickAmount)}
            </Button>
          ))}
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

      {/* Select Merchant */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Select Merchant</Label>
        <div className="grid grid-cols-2 gap-3">
          {merchants.map((merchant) => {
            const Icon = merchant.icon;
            const isSelected = selectedMerchant === merchant.name;
            
            return (
              <Button
                key={merchant.name}
                type="button"
                variant="outline"
                onClick={() => {
                  setSelectedMerchant(merchant.name);
                  setMerchant(merchant.name);
                }}
                className={`p-3 h-auto flex flex-col items-center gap-2 text-center ${
                  isSelected ? 'border-blue-500 bg-blue-50' : ''
                }`}
              >
                <Icon className="w-5 h-5" />
                <div>
                  <div className="font-medium text-xs">{merchant.name}</div>
                  <div className="text-xs text-gray-500">{merchant.category}</div>
                </div>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Scrollbar Demo Section */}
      <Card className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-5 h-5 text-purple-600" />
          <span className="font-medium text-purple-800">Scrollbar Demo</span>
        </div>
        <div className="space-y-2 text-sm text-purple-700">
          <p>This dialog demonstrates custom scrollbar styling:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Thin, elegant scrollbar design</li>
            <li>Smooth hover and active states</li>
            <li>Consistent with your app's design system</li>
            <li>Works on both mobile and desktop</li>
            <li>Supports light and dark themes</li>
          </ul>
          <p className="mt-3 font-medium">Try scrolling to see the custom scrollbar in action!</p>
        </div>
      </Card>

      {/* Additional Content to Force Scrolling */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-800">Additional Features</h4>
        <div className="grid grid-cols-1 gap-3">
          {[1, 2, 3, 4, 5].map((item) => (
            <Card key={item} className="p-3 bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-sm">{item}</span>
                </div>
                <div>
                  <p className="font-medium text-gray-800">Feature {item}</p>
                  <p className="text-sm text-gray-600">
                    This is additional content to demonstrate scrolling behavior in the dialog.
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            if (type === 'regular') {
              setRegularDialogOpen(false);
            } else {
              setMobileDialogOpen(false);
            }
          }}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!amount || !merchant}
          className="flex-1"
        >
          Test Complete
        </Button>
      </div>
    </div>
  );

  return (
    <div className="p-8 space-y-6 max-w-2xl mx-auto">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Dialog Position Test</h1>
        <p className="text-gray-600">
          Test the dialog positioning and animation fixes for both regular and mobile dialogs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Regular Dialog Test */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Regular Dialog</h3>
          <p className="text-sm text-gray-600 mb-4">
            Tests the standard Dialog component used in most places like PurchaseTracker
          </p>
          <Dialog open={regularDialogOpen} onOpenChange={setRegularDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Open Regular Dialog
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white/95 backdrop-blur-sm border-goal-border/30">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-goal-primary" />
                  Track Purchase & Round-up
                </DialogTitle>
              </DialogHeader>
              <DialogContent_Component title="Regular Dialog Test" type="regular" />
            </DialogContent>
          </Dialog>
        </Card>

        {/* Mobile Dialog Test */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Mobile Dialog</h3>
          <p className="text-sm text-gray-600 mb-4">
            Tests the MobileDialog component used in AddFriendDialog
          </p>
          <MobileDialog open={mobileDialogOpen} onOpenChange={setMobileDialogOpen}>
            <MobileDialogTrigger asChild>
              <Button className="w-full">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Open Mobile Dialog
              </Button>
            </MobileDialogTrigger>
            <MobileDialogContent className="bg-white/95 backdrop-blur-sm border-goal-border/30">
              <MobileDialogHeader>
                <MobileDialogTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-goal-primary" />
                  Track Purchase & Round-up
                </MobileDialogTitle>
              </MobileDialogHeader>
              <DialogContent_Component title="Mobile Dialog Test" type="mobile" />
            </MobileDialogContent>
          </MobileDialog>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 bg-blue-50 border-blue-200">
          <h3 className="text-lg font-semibold mb-2 text-blue-800">Expected Behavior</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• <strong>Mobile:</strong> Dialog slides up from bottom, full width</li>
            <li>• <strong>Desktop:</strong> Dialog appears centered, slides up from bottom</li>
            <li>• <strong>Both:</strong> Proper backdrop overlay and smooth animations</li>
            <li>• <strong>Responsive:</strong> Adapts correctly to screen size changes</li>
          </ul>
        </Card>

        <Card className="p-6 bg-purple-50 border-purple-200">
          <h3 className="text-lg font-semibold mb-2 text-purple-800">Scrollbar Styles</h3>
          <ul className="text-sm text-purple-700 space-y-1 mb-4">
            <li>• <strong>dialog-scrollbar-light:</strong> Clean style for light backgrounds</li>
            <li>• <strong>dialog-scrollbar:</strong> Primary color themed scrollbar</li>
            <li>• <strong>dialog-scrollbar-minimal:</strong> Ultra-thin for compact spaces</li>
            <li>• <strong>Responsive:</strong> Works across all browsers and devices</li>
          </ul>

          {/* Mini scrollbar demos */}
          <div className="space-y-3">
            <div>
              <p className="text-xs font-medium text-purple-800 mb-1">Light Style (Default):</p>
              <div className="h-16 overflow-y-auto bg-white rounded border p-2 text-xs scrollbar-styled">
                <div className="space-y-1">
                  {[1,2,3,4,5,6,7,8].map(i => (
                    <div key={i} className="text-gray-600">Scrollable content line {i}</div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-purple-800 mb-1">Primary Style:</p>
              <div className="h-16 overflow-y-auto bg-white rounded border p-2 text-xs scrollbar-primary">
                <div className="space-y-1">
                  {[1,2,3,4,5,6,7,8].map(i => (
                    <div key={i} className="text-gray-600">Scrollable content line {i}</div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-purple-800 mb-1">Minimal Style:</p>
              <div className="h-16 overflow-y-auto bg-white rounded border p-2 text-xs scrollbar-minimal">
                <div className="space-y-1">
                  {[1,2,3,4,5,6,7,8].map(i => (
                    <div key={i} className="text-gray-600">Scrollable content line {i}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DialogPositionTest;
