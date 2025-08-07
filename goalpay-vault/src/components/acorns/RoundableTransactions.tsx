import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Coins, 
  ExternalLink, 
  CheckCircle, 
  Clock,
  TrendingUp,
  Zap,
  ShoppingCart,
  Palette,
  ArrowUpDown
} from 'lucide-react';
import { useTransactionMonitor, RoundableTransaction } from '@/hooks/useTransactionMonitor';

const getTransactionIcon = (type: RoundableTransaction['type']) => {
  switch (type) {
    case 'nft': return Palette;
    case 'transfer': return ArrowUpDown;
    case 'defi': return TrendingUp;
    case 'contract': return Zap;
    default: return ShoppingCart;
  }
};

const getTransactionColor = (type: RoundableTransaction['type']) => {
  switch (type) {
    case 'nft': return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'transfer': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'defi': return 'bg-green-100 text-green-800 border-green-200';
    case 'contract': return 'bg-orange-100 text-orange-800 border-orange-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const RoundableTransactions: React.FC = () => {
  const { 
    roundableTransactions, 
    stats, 
    isLoading, 
    isMonitoring,
    roundUpTransaction, 
    roundUpMultiple,
    startMonitoring,
    stopMonitoring
  } = useTransactionMonitor();

  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const formatHash = (hash: string) => {
    return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
  };

  const handleSelectTransaction = (hash: string, checked: boolean) => {
    if (checked) {
      setSelectedTransactions(prev => [...prev, hash]);
    } else {
      setSelectedTransactions(prev => prev.filter(h => h !== hash));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTransactions(roundableTransactions.map(tx => tx.hash));
    } else {
      setSelectedTransactions([]);
    }
  };

  const handleRoundUpSelected = async () => {
    if (selectedTransactions.length === 0) return;
    
    await roundUpMultiple(selectedTransactions);
    setSelectedTransactions([]);
  };

  const selectedRoundUpTotal = selectedTransactions.reduce((total, hash) => {
    const tx = roundableTransactions.find(t => t.hash === hash);
    return total + (tx?.roundUpAmount || 0);
  }, 0);

  if (!isMonitoring) {
    return (
      <Card className="p-6 text-center">
        <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Transaction Monitoring Disabled
        </h3>
        <p className="text-gray-600 mb-4">
          Enable monitoring to automatically detect roundable transactions
        </p>
        <Button onClick={startMonitoring} disabled={isLoading}>
          {isLoading ? 'Starting...' : 'Start Monitoring'}
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Header */}
      <Card className="p-6 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Coins className="w-6 h-6 text-green-600" />
            <h3 className="text-lg font-semibold text-green-800">Roundable Transactions</h3>
          </div>
          <Badge className="bg-green-100 text-green-800">
            {stats.roundableTransactions} Available
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Total Transactions</p>
            <p className="text-lg font-semibold text-gray-900">{stats.totalTransactions}</p>
          </div>
          <div>
            <p className="text-gray-600">Roundable</p>
            <p className="text-lg font-semibold text-green-600">{stats.roundableTransactions}</p>
          </div>
          <div>
            <p className="text-gray-600">Potential Round-ups</p>
            <p className="text-lg font-semibold text-blue-600">{formatCurrency(stats.totalRoundUpPotential)}</p>
          </div>
          <div>
            <p className="text-gray-600">Monitoring</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-green-600">Active</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Bulk Actions */}
      {roundableTransactions.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Checkbox
                checked={selectedTransactions.length === roundableTransactions.length}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm font-medium">
                Select All ({roundableTransactions.length} transactions)
              </span>
            </div>
            
            {selectedTransactions.length > 0 && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">
                  {selectedTransactions.length} selected • {formatCurrency(selectedRoundUpTotal)} total
                </span>
                <Button 
                  onClick={handleRoundUpSelected}
                  disabled={isLoading}
                  size="sm"
                >
                  {isLoading ? 'Processing...' : `Round Up ${formatCurrency(selectedRoundUpTotal)}`}
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Transaction List */}
      <div className="space-y-3">
        {roundableTransactions.length === 0 ? (
          <Card className="p-8 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              All Caught Up!
            </h3>
            <p className="text-gray-600">
              No roundable transactions found. New ones will appear here automatically.
            </p>
          </Card>
        ) : (
          roundableTransactions.map((transaction) => {
            const Icon = getTransactionIcon(transaction.type);
            const isSelected = selectedTransactions.includes(transaction.hash);
            
            return (
              <Card 
                key={transaction.hash} 
                className={`p-4 transition-all ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'}`}
              >
                <div className="flex items-center gap-4">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) => handleSelectTransaction(transaction.hash, checked as boolean)}
                  />
                  
                  <div className={`p-2 rounded-lg ${getTransactionColor(transaction.type)}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-gray-900">{transaction.description}</h4>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{formatCurrency(transaction.amount)}</p>
                        <p className="text-sm text-green-600">+{formatCurrency(transaction.roundUpAmount)} round-up</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>{formatDate(transaction.timestamp)}</span>
                      <span className="flex items-center gap-1">
                        <ExternalLink className="w-3 h-3" />
                        {formatHash(transaction.hash)}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {transaction.type.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  
                  <Button
                    size="sm"
                    onClick={() => roundUpTransaction(transaction.hash)}
                    disabled={isLoading}
                    className="ml-2"
                  >
                    Round Up
                  </Button>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Monitoring Controls */}
      <Card className="p-4 bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900">Transaction Monitoring</h4>
            <p className="text-sm text-gray-600">
              Automatically detect new transactions that can be rounded up
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={stopMonitoring}
            size="sm"
          >
            Stop Monitoring
          </Button>
        </div>
      </Card>
    </div>
  );
};
