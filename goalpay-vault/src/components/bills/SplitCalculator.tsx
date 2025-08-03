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
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 rounded-lg bg-goal-primary/20">
            <Calculator className="w-4 h-4 text-goal-primary" />
          </div>
          <span className="font-fredoka font-semibold text-goal-text">Equal Split Breakdown</span>
        </div>
        <div className="space-y-2">
          {allParticipants.map((participant, index) => (
            <div
              key={participant.address}
              className="flex items-center justify-between p-3 bg-white/60 rounded-lg border border-goal-border/20 transition-all duration-200 hover:shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-goal-primary/20 flex items-center justify-center">
                  <span className="text-xs font-fredoka font-semibold text-goal-primary">
                    {participant.displayName === 'You' ? 'Y' : participant.displayName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="font-inter font-medium text-goal-text">{participant.displayName}</span>
              </div>
              <Badge variant="secondary" className="bg-goal-primary text-white border-0 font-fredoka font-semibold px-3 py-1">
                {amountPerPerson.toFixed(2)} {currency}
              </Badge>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 bg-goal-accent/30 rounded-lg border border-goal-border/20">
          <div className="flex items-center justify-between">
            <span className="font-inter font-medium text-goal-text/80">Total Amount</span>
            <span className="font-fredoka font-bold text-goal-text">{totalAmountNum.toFixed(2)} {currency}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-goal-primary/20">
            <Calculator className="w-4 h-4 text-goal-primary" />
          </div>
          <span className="font-fredoka font-semibold text-goal-text">
            {splitMode === SplitMode.PERCENTAGE ? 'Percentage Split Breakdown' : 'Exact Amount Split Breakdown'}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={resetToEqual}
          className="border-goal-border/30 text-goal-text hover:bg-goal-accent/20 font-fredoka text-xs h-8 px-3 rounded-lg transition-all duration-200 hover:scale-105"
        >
          <RotateCcw className="w-3 h-3 mr-1" />
          Reset to Equal
        </Button>
      </div>

      <div className="space-y-3">
        {calculations.map((calc) => (
          <div key={calc.address} className="space-y-3 bg-white/60 backdrop-blur-sm border border-goal-border/20 rounded-xl p-4 transition-all duration-200 hover:shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-goal-primary/20 flex items-center justify-center">
                <span className="text-xs font-fredoka font-semibold text-goal-primary">
                  {calc.displayName === 'You' ? 'Y' : calc.displayName.charAt(0).toUpperCase()}
                </span>
              </div>
              <Label className="font-fredoka font-semibold text-goal-text">{calc.displayName}</Label>
            </div>
            
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
                <div className="mt-3 p-2 bg-goal-accent/20 rounded-lg border border-goal-border/10">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-inter text-goal-text/70">Amount to pay:</span>
                    <Badge className="bg-goal-primary text-white border-0 font-fredoka font-semibold">
                      {calc.calculatedAmount.toFixed(2)} {currency}
                    </Badge>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={calc.exactAmount}
                    onChange={(e) => updateCalculation(calc.address, 'exactAmount', e.target.value)}
                    className="bg-white/80 border-goal-border/30 rounded-lg focus:ring-goal-primary focus:border-goal-primary font-inter text-goal-text placeholder:text-goal-text/50 flex-1 h-9"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                  <span className="text-sm text-goal-text/60 font-fredoka font-medium min-w-[50px]">{currency}</span>
                </div>
                <div className="p-2 bg-goal-accent/20 rounded-lg border border-goal-border/10">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-inter text-goal-text/70">Percentage of total:</span>
                    <span className="text-xs font-fredoka font-semibold text-goal-text">{calc.percentage.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Validation Status */}
      <div className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 ${
        validation.isValid
          ? 'bg-green-50/80 border-green-200 shadow-sm'
          : 'bg-red-50/80 border-red-200 shadow-sm'
      }`}>
        <div className={`p-1.5 rounded-lg ${
          validation.isValid ? 'bg-green-100' : 'bg-red-100'
        }`}>
          {validation.isValid ? (
            <CheckCircle className="w-4 h-4 text-green-600" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600" />
          )}
        </div>
        <span className={`font-fredoka font-medium ${validation.isValid ? 'text-green-700' : 'text-red-700'}`}>
          {validation.message}
        </span>
      </div>

      {/* Total Summary */}
      <div className="mt-4 p-4 bg-goal-accent/30 rounded-xl border border-goal-border/20">
        <div className="flex items-center justify-between">
          <span className="font-fredoka font-semibold text-goal-text">Total Amount</span>
          <span className="font-fredoka font-bold text-lg text-goal-text">{totalAmountNum.toFixed(2)} {currency}</span>
        </div>
      </div>
    </div>
  );
}
