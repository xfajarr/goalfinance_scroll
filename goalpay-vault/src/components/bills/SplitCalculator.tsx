import React, { useState, useEffect } from 'react';
import { Address } from 'viem';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Calculator, AlertCircle, CheckCircle, RotateCcw } from 'lucide-react';
import { SplitMode } from '@/config/contracts';
import { SelectedFriend } from '@/components/friends/FriendSearch';
import { ParticipantShare, billUtils } from '@/hooks/useBillSplitter';
import { useAccount } from 'wagmi';

interface SplitCalculatorProps {
  splitMode: SplitMode;
  totalAmount: string;
  participants: SelectedFriend[];
  currency: string;
  onSharesChange: (shares: ParticipantShare[]) => void;
  isValid: boolean;
}

interface ParticipantCalculation {
  address: Address;
  displayName: string;
  percentage: number;
  exactAmount: string;
  calculatedAmount: number;
}

export function SplitCalculator({
  splitMode,
  totalAmount,
  participants,
  currency,
  onSharesChange,
  isValid,
}: SplitCalculatorProps) {
  const { address: currentUserAddress } = useAccount();
  const [calculations, setCalculations] = useState<ParticipantCalculation[]>([]);

  const totalAmountNum = Number(totalAmount) || 0;
  const allParticipants = [
    { address: currentUserAddress as Address, displayName: 'You' },
    ...participants,
  ];

  // Initialize calculations
  useEffect(() => {
    const initialCalculations: ParticipantCalculation[] = allParticipants.map((participant) => ({
      address: participant.address,
      displayName: participant.displayName,
      percentage: splitMode === SplitMode.PERCENTAGE ? 100 / allParticipants.length : 0,
      exactAmount: splitMode === SplitMode.EXACT ? (totalAmountNum / allParticipants.length).toFixed(2) : '0',
      calculatedAmount: totalAmountNum / allParticipants.length,
    }));

    setCalculations(initialCalculations);
  }, [splitMode, totalAmountNum, allParticipants.length]);

  // Update shares when calculations change
  useEffect(() => {
    const shares: ParticipantShare[] = calculations.map((calc) => ({
      participant: calc.address,
      share: splitMode === SplitMode.PERCENTAGE 
        ? billUtils.percentageToBasisPoints(calc.percentage)
        : billUtils.parseAmount(calc.exactAmount),
    }));

    onSharesChange(shares);
  }, [calculations, splitMode, onSharesChange]);

  const updateCalculation = (address: Address, field: 'percentage' | 'exactAmount', value: string | number) => {
    setCalculations(prev => prev.map(calc => {
      if (calc.address === address) {
        const updated = { ...calc };
        
        if (field === 'percentage') {
          updated.percentage = Number(value);
          updated.calculatedAmount = (totalAmountNum * updated.percentage) / 100;
        } else if (field === 'exactAmount') {
          updated.exactAmount = value.toString();
          updated.calculatedAmount = Number(value);
          updated.percentage = totalAmountNum > 0 ? (Number(value) / totalAmountNum) * 100 : 0;
        }
        
        return updated;
      }
      return calc;
    }));
  };

  const resetToEqual = () => {
    const equalPercentage = 100 / allParticipants.length;
    const equalAmount = totalAmountNum / allParticipants.length;

    setCalculations(prev => prev.map(calc => ({
      ...calc,
      percentage: equalPercentage,
      exactAmount: equalAmount.toFixed(2),
      calculatedAmount: equalAmount,
    })));
  };

  const getTotalPercentage = () => {
    return calculations.reduce((sum, calc) => sum + calc.percentage, 0);
  };

  const getTotalExactAmount = () => {
    return calculations.reduce((sum, calc) => sum + Number(calc.exactAmount), 0);
  };

  const getValidationStatus = () => {
    if (splitMode === SplitMode.PERCENTAGE) {
      const total = getTotalPercentage();
      return {
        isValid: Math.abs(total - 100) < 0.01,
        message: total === 100 ? 'Perfect split!' : `Total: ${total.toFixed(1)}% (should be 100%)`,
      };
    } else if (splitMode === SplitMode.EXACT) {
      const total = getTotalExactAmount();
      return {
        isValid: Math.abs(total - totalAmountNum) < 0.01,
        message: total === totalAmountNum ? 'Perfect split!' : `Total: ${total.toFixed(2)} ${currency} (should be ${totalAmountNum})`,
      };
    }
    return { isValid: true, message: '' };
  };

  const validation = getValidationStatus();

  if (splitMode === SplitMode.EQUAL) {
    const amountPerPerson = totalAmountNum / allParticipants.length;

    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-2">
          <Calculator className="w-4 h-4 text-goal-primary" />
          <span className="font-fredoka font-medium text-goal-text text-sm">Equal Split</span>
        </div>
        <div className="space-y-1">
          {allParticipants.map((participant) => (
            <div key={participant.address} className="flex items-center justify-between py-1">
              <span className="text-sm font-inter text-goal-text">{participant.displayName}</span>
              <Badge variant="secondary" className="bg-goal-primary/20 text-goal-text border-goal-border/30 text-xs">
                {amountPerPerson.toFixed(2)} {currency}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calculator className="w-4 h-4 text-goal-primary" />
          <span className="font-fredoka font-medium text-goal-text text-sm">
            {splitMode === SplitMode.PERCENTAGE ? 'Percentage Split' : 'Exact Amount Split'}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={resetToEqual}
          className="border-goal-border/30 text-goal-text hover:bg-goal-accent/20 font-inter text-xs h-7 px-2 rounded-lg"
        >
          <RotateCcw className="w-3 h-3 mr-1" />
          Reset to Equal
        </Button>
      </div>

      <div className="space-y-3">
        {calculations.map((calc) => (
          <div key={calc.address} className="space-y-2 bg-white/40 backdrop-blur-sm border border-goal-border/20 rounded-lg p-3">
            <Label className="text-sm font-fredoka font-medium text-goal-text">{calc.displayName}</Label>
            
            {splitMode === SplitMode.PERCENTAGE ? (
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Slider
                    value={[calc.percentage]}
                    onValueChange={([value]) => updateCalculation(calc.address, 'percentage', value)}
                    max={100}
                    step={0.1}
                    className="flex-1"
                  />
                  <div className="flex items-center gap-1 min-w-[80px]">
                    <Input
                      type="number"
                      value={calc.percentage.toFixed(1)}
                      onChange={(e) => updateCalculation(calc.address, 'percentage', e.target.value)}
                      className="bg-white/60 border-goal-border/30 rounded-lg focus:ring-goal-primary focus:border-goal-primary font-inter text-goal-text w-16 h-7 text-xs"
                      min="0"
                      max="100"
                      step="0.1"
                    />
                    <span className="text-xs text-goal-text/60 font-inter">%</span>
                  </div>
                </div>
                <div className="text-xs text-goal-text/60 font-inter">
                  Amount: {calc.calculatedAmount.toFixed(2)} {currency}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={calc.exactAmount}
                    onChange={(e) => updateCalculation(calc.address, 'exactAmount', e.target.value)}
                    className="bg-white/60 border-goal-border/30 rounded-lg focus:ring-goal-primary focus:border-goal-primary font-inter text-goal-text placeholder:text-goal-text/50 flex-1 h-7"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                  <span className="text-sm text-goal-text/60 font-inter min-w-[40px]">{currency}</span>
                </div>
                <div className="text-xs text-goal-text/60 font-inter">
                  Percentage: {calc.percentage.toFixed(1)}%
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Validation Status */}
      <div className={`flex items-center gap-2 p-2 rounded-lg ${
        validation.isValid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
      }`}>
        {validation.isValid ? (
          <CheckCircle className="w-4 h-4 text-green-600" />
        ) : (
          <AlertCircle className="w-4 h-4 text-red-600" />
        )}
        <span className={`text-sm font-inter ${validation.isValid ? 'text-green-700' : 'text-red-700'}`}>
          {validation.message}
        </span>
      </div>
    </div>
  );
}
