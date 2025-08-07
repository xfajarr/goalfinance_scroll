import { useState, useEffect, useCallback } from 'react';
import { useAccount, usePublicClient } from 'wagmi';
import { formatUnits, parseUnits } from 'viem';
import { toast } from 'sonner';

export interface RoundableTransaction {
  hash: string;
  amount: number;
  roundUpAmount: number;
  timestamp: Date;
  to: string;
  type: 'transfer' | 'contract' | 'nft' | 'defi';
  description: string;
  isRounded: boolean;
  blockNumber: bigint;
}

export interface TransactionMonitorStats {
  totalTransactions: number;
  roundableTransactions: number;
  totalRoundUpPotential: number;
  pendingRoundUps: number;
}

// Mock data for demonstration
const MOCK_TRANSACTIONS: RoundableTransaction[] = [
  {
    hash: '0x1234...5678',
    amount: 5.27,
    roundUpAmount: 0.73,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    to: '0xabcd...ef01',
    type: 'nft',
    description: 'NFT Purchase - CryptoPunk #1234',
    isRounded: false,
    blockNumber: 12345678n,
  },
  {
    hash: '0x2345...6789',
    amount: 2.58,
    roundUpAmount: 0.42,
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    to: '0xbcde...f012',
    type: 'transfer',
    description: 'Token Transfer',
    isRounded: false,
    blockNumber: 12345677n,
  },
  {
    hash: '0x3456...789a',
    amount: 12.89,
    roundUpAmount: 0.11,
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    to: '0xcdef...0123',
    type: 'defi',
    description: 'Uniswap Swap - ETH to USDC',
    isRounded: false,
    blockNumber: 12345676n,
  },
  {
    hash: '0x4567...89ab',
    amount: 25.00,
    roundUpAmount: 0.00,
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    to: '0xdef0...1234',
    type: 'contract',
    description: 'Smart Contract Interaction',
    isRounded: false,
    blockNumber: 12345675n,
  },
  {
    hash: '0x5678...9abc',
    amount: 8.33,
    roundUpAmount: 0.67,
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    to: '0xef01...2345',
    type: 'transfer',
    description: 'Payment to Friend',
    isRounded: true, // Already rounded up
    blockNumber: 12345674n,
  },
];

export const useTransactionMonitor = () => {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  
  const [transactions, setTransactions] = useState<RoundableTransaction[]>(MOCK_TRANSACTIONS);
  const [isLoading, setIsLoading] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [lastCheckedBlock, setLastCheckedBlock] = useState<bigint>(0n);

  // Calculate round-up amount
  const calculateRoundUp = useCallback((amount: number): number => {
    const dollars = Math.floor(amount);
    const cents = amount - dollars;
    
    if (cents === 0) return 0;
    return 1 - cents;
  }, []);

  // Get transaction type and description
  const getTransactionInfo = useCallback((tx: any): { type: RoundableTransaction['type'], description: string } => {
    // This is a simplified version - in reality, you'd analyze the transaction data
    if (tx.to === null) {
      return { type: 'contract', description: 'Contract Deployment' };
    }
    
    if (tx.value && tx.value > 0n) {
      return { type: 'transfer', description: 'ETH Transfer' };
    }
    
    // Check if it's an ERC20 transfer, NFT transaction, etc.
    // This would require decoding the transaction input data
    return { type: 'contract', description: 'Smart Contract Interaction' };
  }, []);

  // Monitor new transactions (mock implementation)
  const startMonitoring = useCallback(async () => {
    if (!address || isMonitoring) return;
    
    setIsMonitoring(true);
    setIsLoading(true);
    
    try {
      // In a real implementation, you would:
      // 1. Get the latest block number
      // 2. Fetch transactions for the user's address
      // 3. Filter for transactions with roundable amounts
      // 4. Set up a subscription for new blocks
      
      // Mock: Simulate finding new transactions
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For demo, we'll just use the mock data
      // toast.success('🔍 Transaction monitoring started');
      
    } catch (error) {
      console.error('Failed to start monitoring:', error);
      toast.error('Failed to start transaction monitoring');
    } finally {
      setIsLoading(false);
    }
  }, [address, isMonitoring]);

  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
    toast.info('⏹️ Transaction monitoring stopped');
  }, []);

  // Round up a specific transaction
  const roundUpTransaction = useCallback(async (transactionHash: string) => {
    setIsLoading(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setTransactions(prev => prev.map(tx => 
        tx.hash === transactionHash 
          ? { ...tx, isRounded: true }
          : tx
      ));
      
      const transaction = transactions.find(tx => tx.hash === transactionHash);
      if (transaction) {
        toast.success(`💰 Rounded up $${transaction.roundUpAmount.toFixed(2)} from transaction`);
      }
      
    } catch (error) {
      console.error('Failed to round up transaction:', error);
      toast.error('Failed to round up transaction');
    } finally {
      setIsLoading(false);
    }
  }, [transactions]);

  // Round up multiple transactions
  const roundUpMultiple = useCallback(async (transactionHashes: string[]) => {
    setIsLoading(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      let totalRoundUp = 0;
      
      setTransactions(prev => prev.map(tx => {
        if (transactionHashes.includes(tx.hash) && !tx.isRounded) {
          totalRoundUp += tx.roundUpAmount;
          return { ...tx, isRounded: true };
        }
        return tx;
      }));
      
      toast.success(`💰 Rounded up $${totalRoundUp.toFixed(2)} from ${transactionHashes.length} transactions`);
      
    } catch (error) {
      console.error('Failed to round up transactions:', error);
      toast.error('Failed to round up transactions');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get roundable transactions (not yet rounded)
  const getRoundableTransactions = useCallback(() => {
    return transactions.filter(tx => !tx.isRounded && tx.roundUpAmount > 0);
  }, [transactions]);

  // Get stats
  const getStats = useCallback((): TransactionMonitorStats => {
    const roundableTransactions = getRoundableTransactions();
    const totalRoundUpPotential = roundableTransactions.reduce((sum, tx) => sum + tx.roundUpAmount, 0);
    
    return {
      totalTransactions: transactions.length,
      roundableTransactions: roundableTransactions.length,
      totalRoundUpPotential,
      pendingRoundUps: totalRoundUpPotential,
    };
  }, [transactions, getRoundableTransactions]);

  // Auto-start monitoring when address is available
  useEffect(() => {
    if (address && !isMonitoring) {
      // Auto-start monitoring in demo mode
      // In production, this might be user-controlled
      startMonitoring();
    }
  }, [address, isMonitoring, startMonitoring]);

  // Simulate new transactions periodically (for demo)
  useEffect(() => {
    if (!isMonitoring) return;
    
    const interval = setInterval(() => {
      // Randomly add a new transaction (10% chance every 30 seconds)
      if (Math.random() < 0.1) {
        const newTransaction: RoundableTransaction = {
          hash: `0x${Math.random().toString(16).substr(2, 8)}...${Math.random().toString(16).substr(2, 4)}`,
          amount: Math.random() * 50 + 1, // $1-$51
          roundUpAmount: 0,
          timestamp: new Date(),
          to: `0x${Math.random().toString(16).substr(2, 8)}...${Math.random().toString(16).substr(2, 4)}`,
          type: ['transfer', 'contract', 'nft', 'defi'][Math.floor(Math.random() * 4)] as any,
          description: 'New Transaction Detected',
          isRounded: false,
          blockNumber: BigInt(Math.floor(Math.random() * 1000000) + 12345678),
        };
        
        newTransaction.roundUpAmount = calculateRoundUp(newTransaction.amount);
        
        if (newTransaction.roundUpAmount > 0) {
          setTransactions(prev => [newTransaction, ...prev]);
          toast.info(`🔍 New roundable transaction detected: $${newTransaction.roundUpAmount.toFixed(2)} round-up available`);
        }
      }
    }, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, [isMonitoring, calculateRoundUp]);

  return {
    // Data
    transactions,
    roundableTransactions: getRoundableTransactions(),
    stats: getStats(),
    
    // State
    isLoading,
    isMonitoring,
    
    // Actions
    startMonitoring,
    stopMonitoring,
    roundUpTransaction,
    roundUpMultiple,
    calculateRoundUp,
  };
};
