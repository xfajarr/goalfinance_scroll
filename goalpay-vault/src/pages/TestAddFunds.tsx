import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Navigation from '@/components/Navigation';
import BottomNavigation from '@/components/BottomNavigation';
import { useAddFunds } from '@/hooks/useAddFunds';
import { useGetVault } from '@/hooks/useVaultReads';

import { formatUnits, parseUnits, Address } from 'viem';
import { useAccount } from 'wagmi';
import { 
  DollarSign, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Target, 
  Users, 
  Calendar,
  Wallet,
  Shield,
  Plus
} from 'lucide-react';

const TestAddFunds = () => {
  const { address, isConnected } = useAccount();
  const [vaultId, setVaultId] = useState('1');
  const [amount, setAmount] = useState('');
  const [testResults, setTestResults] = useState<{
    vaultLookup: 'pass' | 'fail' | 'pending';
    addFunds: 'pass' | 'fail' | 'pending';
  }>({
    vaultLookup: 'pending',
    addFunds: 'pending'
  });

  // Get vault info
  const vaultIdBigInt = vaultId ? BigInt(vaultId) : undefined;
  const { 
    data: vaultInfo, 
    isLoading: isLoadingVault, 
    error: vaultError,
    refetch: refetchVault 
  } = useGetVault(vaultIdBigInt);

  // Add funds hook (new contract structure - no vault address needed)
  const {
    addFunds,
    isLoading: isAddingFunds,
    isConfirming,
    isSuccess,
    error: addFundsError,
    txHash,
    reset
  } = useAddFunds();

  // Note: USDC allowance check is now handled by the GoalFinance contract
  // No need for individual vault address allowances

  // Test vault lookup
  const testVaultLookup = async () => {
    if (!vaultId) {
      alert('Please enter a vault ID');
      return;
    }

    try {
      setTestResults(prev => ({ ...prev, vaultLookup: 'pending' }));
      await refetchVault();
      
      if (vaultInfo && vaultInfo.name && vaultInfo.name !== '') {
        setTestResults(prev => ({ ...prev, vaultLookup: 'pass' }));
      } else {
        setTestResults(prev => ({ ...prev, vaultLookup: 'fail' }));
      }
    } catch (error) {
      console.error('Vault lookup failed:', error);
      setTestResults(prev => ({ ...prev, vaultLookup: 'fail' }));
    }
  };

  // Test add funds
  const testAddFunds = async () => {
    if (!amount || !vaultIdBigInt) {
      alert('Please enter an amount and ensure vault ID is valid');
      return;
    }

    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      setTestResults(prev => ({ ...prev, addFunds: 'pending' }));

      console.log('🚀 Starting add funds test...', {
        amount,
        vaultId: vaultIdBigInt?.toString(),
        isNativeToken: false
      });

      if (!vaultIdBigInt) {
        throw new Error('Vault ID is required');
      }

      await addFunds(vaultIdBigInt, amount, false); // false for USDC

      setTestResults(prev => ({ ...prev, addFunds: 'pass' }));
    } catch (error) {
      console.error('Add funds failed:', error);
      setTestResults(prev => ({ ...prev, addFunds: 'fail' }));
    }
  };

  // Note: Allowance checks are now handled by the GoalFinance contract

  // Add network to wallet
  const addNetworkToWallet = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: '0x138B', // 5003 in hex
            chainName: 'Mantle Sepolia Testnet',
            nativeCurrency: {
              name: 'MNT',
              symbol: 'MNT',
              decimals: 18,
            },
            rpcUrls: ['https://purple-sparkling-diagram.mantle-sepolia.quiknode.pro/f22ce1388f7416cd81d8bf303a531bd88b336258'],
            blockExplorerUrls: ['https://sepolia.mantlescan.xyz'],
          }],
        });
        alert('Network added to wallet successfully!');
      } else {
        alert('No wallet detected');
      }
    } catch (error) {
      console.error('Failed to add network:', error);
      alert('Failed to add network to wallet');
    }
  };

  const getStatusIcon = (status: 'pass' | 'fail' | 'pending') => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'fail':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'pending':
        return <Loader2 className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: 'pass' | 'fail' | 'pending') => {
    switch (status) {
      case 'pass':
        return 'bg-green-50 border-green-200';
      case 'fail':
        return 'bg-red-50 border-red-200';
      case 'pending':
        return 'bg-gray-50 border-gray-200';
    }
  };

  // For the new contract, we don't need to check approval for native tokens
  // USDC approval is handled by the user separately if needed

  return (
    <div className="min-h-screen bg-goal-bg pb-32 md:pb-0">
      <Navigation />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-fredoka font-bold text-goal-text mb-2">
            💰 Add Funds Test Suite
          </h1>
          <p className="text-goal-text/80">
            Test the complete add funds flow with USDC approval and vault contribution
          </p>
        </div>

        {/* Connection Status */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Connection Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Wallet Status</p>
                  <p className="text-sm text-gray-600">
                    {isConnected ? `Connected: ${address?.slice(0, 10)}...` : 'Not connected'}
                  </p>
                </div>
                <Badge variant={isConnected ? "default" : "destructive"}>
                  {isConnected ? "Connected" : "Disconnected"}
                </Badge>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">🔧 Network Configuration</h4>
                <p className="text-sm text-blue-700 mb-3">
                  If you're getting RPC errors, add the correct Mantle Sepolia network to your wallet:
                </p>
                <Button
                  onClick={addNetworkToWallet}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  🌐 Add Mantle Sepolia Network to Wallet
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Input Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Test Inputs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Vault ID</label>
                <Input
                  placeholder="Enter vault ID (e.g., 1)"
                  value={vaultId}
                  onChange={(e) => setVaultId(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Amount (USDC)</label>
                <Input
                  type="number"
                  placeholder="Enter amount (e.g., 100)"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="0.01"
                  step="0.01"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Steps */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Step 1: Vault Lookup */}
          <Card className={getStatusColor(testResults.vaultLookup)}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon(testResults.vaultLookup)}
                Step 1: Load Vault
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={testVaultLookup} 
                disabled={!vaultId || isLoadingVault}
                className="w-full"
              >
                {isLoadingVault ? 'Loading...' : 'Load Vault'}
              </Button>
              
              {vaultError && (
                <div className="text-red-600 text-sm">
                  Error: {vaultError.message}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Step 2: Add Funds */}
          <Card className={getStatusColor(testResults.addFunds)}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon(testResults.addFunds)}
                Step 2: Add Funds
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={testAddFunds} 
                disabled={!amount || !vaultAddress || !isConnected || isAddingFunds}
                className="w-full"
              >
                {isAddingFunds || isConfirming ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>
                      {isAddingFunds ? 'Submitting...' : 'Confirming...'}
                    </span>
                  </div>
                ) : (
                  'Add Funds'
                )}
              </Button>
              
              {addFundsError && (
                <div className="text-red-600 text-sm">
                  Error: {addFundsError.message}
                </div>
              )}

              {(approvalTxHash || contributionTxHash) && (
                <div className="space-y-2 pt-2 border-t">
                  <h4 className="font-semibold text-sm">Transaction Hashes:</h4>
                  {approvalTxHash && (
                    <div className="text-blue-600 text-sm font-mono">
                      <strong>Approval:</strong> {approvalTxHash.slice(0, 10)}...{approvalTxHash.slice(-8)}
                    </div>
                  )}
                  {contributionTxHash && (
                    <div className="text-green-600 text-sm font-mono">
                      <strong>Contribution:</strong> {contributionTxHash.slice(0, 10)}...{contributionTxHash.slice(-8)}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Vault Info */}
        {vaultInfo && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Vault Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Target className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <h3 className="font-semibold text-blue-800 text-sm">Target</h3>
                  <p className="text-lg font-bold text-blue-600">
                    ${formatUnits(vaultInfo.targetAmount, 6)}
                  </p>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Users className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                  <h3 className="font-semibold text-purple-800 text-sm">Members</h3>
                  <p className="text-lg font-bold text-purple-600">
                    {vaultInfo.memberCount.toString()}
                  </p>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Shield className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <h3 className="font-semibold text-green-800 text-sm">Status</h3>
                  <p className="text-lg font-bold text-green-600">
                    {vaultInfo.isActive ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div><strong>Name:</strong> {vaultInfo.vaultName}</div>
                <div><strong>Description:</strong> {vaultInfo.description}</div>
                <div><strong>Vault Address:</strong> {vaultInfo.vaultAddress}</div>
                <div><strong>Creator:</strong> {vaultInfo.creator}</div>
                <div><strong>Public:</strong> {vaultInfo.isPublic ? 'Yes' : 'No'}</div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* USDC Allowance Info */}
        {vaultAddress && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                USDC Allowance Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Current Allowance:</span>
                  <span className="font-mono">${formatUnits(currentAllowance || 0n, 6)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Vault Address:</span>
                  <span className="font-mono text-xs">{vaultAddress}</span>
                </div>
                <div className="pt-2">
                  <Button
                    onClick={checkAllowance}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    🔄 Refresh Allowance
                  </Button>
                </div>
                {amount && (
                  <>
                    <div className="flex justify-between">
                      <span>Required Amount:</span>
                      <span className="font-mono">${amount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Token Type:</span>
                      <Badge variant="default">
                        USDC (ERC20)
                      </Badge>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Debug Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🐛 Debug Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div><strong>Is Loading:</strong> {isAddingFunds ? 'Yes' : 'No'}</div>
              <div><strong>Is Confirming:</strong> {isConfirming ? 'Yes' : 'No'}</div>
              <div><strong>Is Success:</strong> {isSuccess ? 'Yes' : 'No'}</div>
              <div><strong>Vault Loaded:</strong> {vaultInfo ? 'Yes' : 'No'}</div>
              <div><strong>Vault ID:</strong> {vaultIdBigInt?.toString() || 'Not set'}</div>
              {addFundsError && (
                <div className="text-red-600">
                  <strong>Error:</strong> {addFundsError.message}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>How to Test</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Important Prerequisites</h4>
                <p className="text-sm text-yellow-700">
                  <strong>You must join the vault first</strong> before you can add funds.
                  Use the <a href="/test-join-vault" className="underline font-medium">Join Vault test page</a> to join a vault using an invite code.
                </p>
              </div>

              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Connect your wallet using the connect button in the navigation</li>
                <li><strong>Join a vault first</strong> using the <a href="/test-join-vault" className="underline text-blue-600">Join Vault page</a></li>
                <li>Enter the same vault ID you joined and click "Load Vault"</li>
                <li>Enter an amount in USDC and click "Add Funds"</li>
                <li>If approval is needed, approve USDC spending first</li>
                <li>Confirm the add funds transaction in your wallet</li>
                <li>Check the transaction hash and vault balance updates</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default TestAddFunds;
