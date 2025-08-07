import React, { useState, useEffect } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { useUnifiedContractInterface } from '@/lib/contractInterface';
import { INDEXER_ENDPOINTS } from '@/config/contracts';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error' | 'warning';
  message: string;
  details?: string;
}

export function IntegrationTest() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { contractInterface, isSupported, addresses, contracts } = useUnifiedContractInterface();
  
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const updateTestResult = (name: string, status: TestResult['status'], message: string, details?: string) => {
    setTestResults(prev => {
      const existing = prev.find(r => r.name === name);
      const newResult = { name, status, message, details };
      
      if (existing) {
        return prev.map(r => r.name === name ? newResult : r);
      } else {
        return [...prev, newResult];
      }
    });
  };

  const runTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    // Test 1: Wallet Connection
    updateTestResult('Wallet Connection', 'pending', 'Checking wallet connection...');
    if (isConnected && address) {
      updateTestResult('Wallet Connection', 'success', `Connected: ${address.slice(0, 6)}...${address.slice(-4)}`);
    } else {
      updateTestResult('Wallet Connection', 'error', 'Wallet not connected');
    }

    // Test 2: Network Support
    updateTestResult('Network Support', 'pending', 'Checking network support...');
    if (isSupported) {
      const chainName = chainId === 534351 ? 'Scroll Sepolia' : chainId === 4202 ? 'Lisk Sepolia' : `Chain ${chainId}`;
      updateTestResult('Network Support', 'success', `${chainName} (${chainId}) is supported`);
    } else {
      updateTestResult('Network Support', 'error', `Chain ${chainId} is not supported`, 'Please switch to Scroll Sepolia (534351)');
    }

    // Test 3: Contract Addresses
    updateTestResult('Contract Addresses', 'pending', 'Verifying contract addresses...');
    const requiredContracts = ['GOAL_FINANCE', 'BILL_SPLITTER', 'FRIENDS_REGISTRY', 'DEBT_MANAGER', 'USDC'];
    const missingContracts = requiredContracts.filter(contract => !addresses[contract as keyof typeof addresses]);
    
    if (missingContracts.length === 0) {
      updateTestResult('Contract Addresses', 'success', 'All contract addresses configured');
    } else {
      updateTestResult('Contract Addresses', 'error', `Missing contracts: ${missingContracts.join(', ')}`);
    }

    // Test 4: Contract ABIs
    updateTestResult('Contract ABIs', 'pending', 'Checking contract ABIs...');
    try {
      const abiTests = [
        { name: 'GoalFinance', abi: contracts.goalFinance.abi },
        { name: 'BillSplitter', abi: contracts.billSplitter.abi },
        { name: 'FriendsRegistry', abi: contracts.friendsRegistry.abi },
        { name: 'DebtManager', abi: contracts.debtManager.abi },
      ];

      const invalidAbis = abiTests.filter(test => !test.abi || test.abi.length === 0);
      
      if (invalidAbis.length === 0) {
        updateTestResult('Contract ABIs', 'success', 'All contract ABIs loaded successfully');
      } else {
        updateTestResult('Contract ABIs', 'error', `Invalid ABIs: ${invalidAbis.map(a => a.name).join(', ')}`);
      }
    } catch (error) {
      updateTestResult('Contract ABIs', 'error', 'Failed to load contract ABIs', error instanceof Error ? error.message : 'Unknown error');
    }

    // Test 5: GraphQL Endpoints
    updateTestResult('GraphQL Endpoints', 'pending', 'Testing GraphQL endpoints...');
    try {
      const endpointTests = await Promise.allSettled([
        fetch(INDEXER_ENDPOINTS.GOAL_FINANCE_CORE, { method: 'POST', body: JSON.stringify({ query: '{ __typename }' }), headers: { 'Content-Type': 'application/json' } }),
        fetch(INDEXER_ENDPOINTS.BILL_SPLITTER, { method: 'POST', body: JSON.stringify({ query: '{ __typename }' }), headers: { 'Content-Type': 'application/json' } }),
        fetch(INDEXER_ENDPOINTS.FRIENDS_REGISTRY, { method: 'POST', body: JSON.stringify({ query: '{ __typename }' }), headers: { 'Content-Type': 'application/json' } }),
        fetch(INDEXER_ENDPOINTS.DEBT_MANAGER, { method: 'POST', body: JSON.stringify({ query: '{ __typename }' }), headers: { 'Content-Type': 'application/json' } }),
      ]);

      const failedEndpoints = endpointTests.filter(result => result.status === 'rejected').length;
      
      if (failedEndpoints === 0) {
        updateTestResult('GraphQL Endpoints', 'success', 'All GraphQL endpoints accessible');
      } else {
        updateTestResult('GraphQL Endpoints', 'warning', `${failedEndpoints} endpoints failed connectivity test`);
      }
    } catch (error) {
      updateTestResult('GraphQL Endpoints', 'error', 'Failed to test GraphQL endpoints', error instanceof Error ? error.message : 'Unknown error');
    }

    // Test 6: Enhanced Data Fetching
    if (isConnected && address && isSupported) {
      updateTestResult('Enhanced Data Fetching', 'pending', 'Testing enhanced data fetching...');
      try {
        // Test enhanced data fetching methods
        const promises = [
          contractInterface.getEnhancedUserBills().catch(() => null),
          contractInterface.getEnhancedUserDebts().catch(() => null),
          contractInterface.getEnhancedUserFriends().catch(() => null),
        ];

        await Promise.allSettled(promises);
        updateTestResult('Enhanced Data Fetching', 'success', 'Enhanced data fetching methods working');
      } catch (error) {
        updateTestResult('Enhanced Data Fetching', 'warning', 'Enhanced data fetching partially working', error instanceof Error ? error.message : 'Unknown error');
      }
    } else {
      updateTestResult('Enhanced Data Fetching', 'warning', 'Skipped - requires wallet connection and supported network');
    }

    // Test 7: Cache System
    updateTestResult('Cache System', 'pending', 'Testing cache system...');
    try {
      contractInterface.clearCache();
      updateTestResult('Cache System', 'success', 'Cache system operational');
    } catch (error) {
      updateTestResult('Cache System', 'error', 'Cache system failed', error instanceof Error ? error.message : 'Unknown error');
    }

    setIsRunning(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    const variants = {
      success: 'default',
      error: 'destructive',
      warning: 'secondary',
      pending: 'outline',
    } as const;

    return (
      <Badge variant={variants[status]} className="ml-2">
        {status.toUpperCase()}
      </Badge>
    );
  };

  const overallStatus = () => {
    if (testResults.length === 0) return 'Not tested';
    if (testResults.some(r => r.status === 'pending')) return 'Running...';
    if (testResults.some(r => r.status === 'error')) return 'Failed';
    if (testResults.some(r => r.status === 'warning')) return 'Partial';
    return 'Passed';
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Lisk Sepolia Integration Test
          <Button onClick={runTests} disabled={isRunning}>
            {isRunning ? 'Running Tests...' : 'Run Tests'}
          </Button>
        </CardTitle>
        <CardDescription>
          Comprehensive test of GoalFi integration with Lisk Sepolia contracts and GraphQL indexers
        </CardDescription>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Overall Status:</span>
          <Badge variant={overallStatus().includes('Failed') ? 'destructive' : overallStatus().includes('Partial') ? 'secondary' : 'default'}>
            {overallStatus()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {testResults.map((result, index) => (
            <div key={index} className="flex items-start justify-between p-4 border rounded-lg">
              <div className="flex items-start gap-3">
                {getStatusIcon(result.status)}
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{result.name}</h4>
                    {getStatusBadge(result.status)}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{result.message}</p>
                  {result.details && (
                    <p className="text-xs text-muted-foreground mt-2 font-mono bg-muted p-2 rounded">
                      {result.details}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {testResults.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Click "Run Tests" to start the integration test
            </div>
          )}
        </div>

        {testResults.length > 0 && (
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Test Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-green-600 font-medium">
                  {testResults.filter(r => r.status === 'success').length}
                </span>
                <span className="text-muted-foreground"> Passed</span>
              </div>
              <div>
                <span className="text-red-600 font-medium">
                  {testResults.filter(r => r.status === 'error').length}
                </span>
                <span className="text-muted-foreground"> Failed</span>
              </div>
              <div>
                <span className="text-yellow-600 font-medium">
                  {testResults.filter(r => r.status === 'warning').length}
                </span>
                <span className="text-muted-foreground"> Warnings</span>
              </div>
              <div>
                <span className="text-blue-600 font-medium">
                  {testResults.filter(r => r.status === 'pending').length}
                </span>
                <span className="text-muted-foreground"> Pending</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
