import React, { useState } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useCreateVault } from '@/hooks/useCreateVault';
import { GoalType } from '@/contracts/types';
import { CONTRACT_ADDRESSES } from '@/config/wagmi';
import Navigation from '@/components/Navigation';
import BottomNavigation from '@/components/BottomNavigation';
import { AlertCircle, CheckCircle, Loader2, Info } from 'lucide-react';

const DebugVaultCreation = () => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const contractAddresses = CONTRACT_ADDRESSES[chainId];

  const {
    createVault,
    isLoading,
    isConfirming,
    isSuccess,
    error,
    txHash,
    vaultId,
    inviteCode,
    reset
  } = useCreateVault();

  const [formData, setFormData] = useState({
    name: 'Test Vault',
    description: 'A test vault for debugging',
    targetAmount: '100',
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
    isPublic: true,
    goalType: GoalType.GROUP,
    tokenType: 'usdc'
  });

  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(`[DEBUG] ${message}`);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleCreateVault = async () => {
    try {
      setLogs([]);
      addLog('🚀 Starting vault creation...');
      
      if (!isConnected) {
        addLog('❌ Wallet not connected');
        return;
      }

      addLog(`📍 Chain ID: ${chainId}`);
      addLog(`📍 Contract Address: ${contractAddresses?.GOAL_FINANCE || 'NOT FOUND'}`);
      addLog(`👤 User Address: ${address}`);

      const deadlineDate = new Date(formData.deadline);
      addLog(`📅 Deadline: ${deadlineDate.toISOString()}`);

      // Determine token address
      // Note: GoalFinance contract doesn't support native tokens
      const token = contractAddresses?.USDC || '0x33665BB084Eb3a01aA2E4eCE2FAd292dCe683e34';

      addLog(`💰 Token: ${token} (USDC only - native tokens not supported)`);
      addLog(`🎯 Goal Type: ${formData.goalType}`);
      addLog(`👁️ Public: ${formData.isPublic}`);
      addLog(`💵 Target Amount: ${formData.targetAmount}`);

      const params = {
        vaultName: formData.name,
        description: formData.description,
        targetAmount: formData.targetAmount,
        deadline: deadlineDate,
        isPublic: formData.isPublic,
        goalType: formData.goalType,
        token: token as `0x${string}`
      };

      addLog('📝 Calling createVault with params:');
      addLog(JSON.stringify(params, null, 2));
      addLog('⛽ Gas limit set to: 150,000,000 (150M gas)');

      await createVault(params);
      addLog('✅ createVault call completed');

    } catch (err) {
      addLog(`❌ Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const resetAll = () => {
    reset();
    setLogs([]);
  };

  return (
    <div className="min-h-screen bg-goal-bg pb-20 md:pb-0">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-fredoka font-bold text-goal-heading mb-2">
            🔧 Vault Creation Debug Tool
          </h1>
          <p className="text-goal-text-secondary">
            Debug vault creation issues with detailed logging
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form Section */}
          <Card className="bg-white/60 backdrop-blur-sm border-goal-border/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5" />
                Vault Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Vault Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter vault name"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter description"
                />
              </div>

              <div>
                <Label htmlFor="targetAmount">Target Amount</Label>
                <Input
                  id="targetAmount"
                  name="targetAmount"
                  type="number"
                  value={formData.targetAmount}
                  onChange={handleInputChange}
                  placeholder="Enter target amount"
                />
              </div>

              <div>
                <Label htmlFor="deadline">Deadline</Label>
                <Input
                  id="deadline"
                  name="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <Label htmlFor="tokenType">Token Type</Label>
                <div className="w-full p-2 border rounded-md bg-gray-50">
                  USDC (Only supported token)
                </div>
              </div>

              <div>
                <Label htmlFor="goalType">Goal Type</Label>
                <select
                  id="goalType"
                  name="goalType"
                  value={formData.goalType}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                >
                  <option value={GoalType.GROUP}>Group</option>
                  <option value={GoalType.PERSONAL}>Personal</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  id="isPublic"
                  name="isPublic"
                  type="checkbox"
                  checked={formData.isPublic}
                  onChange={handleInputChange}
                />
                <Label htmlFor="isPublic">Public Vault</Label>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleCreateVault}
                  disabled={!isConnected || isLoading || isConfirming}
                  className="flex-1"
                >
                  {isLoading || isConfirming ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {isLoading ? 'Creating...' : 'Confirming...'}
                    </div>
                  ) : (
                    'Create Vault'
                  )}
                </Button>
                <Button onClick={resetAll} variant="outline">
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Status Section */}
          <Card className="bg-white/60 backdrop-blur-sm border-goal-border/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {isSuccess ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : error ? (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                ) : (
                  <Info className="w-5 h-5" />
                )}
                Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Connected</Label>
                  <Badge variant={isConnected ? "default" : "destructive"}>
                    {isConnected ? "Yes" : "No"}
                  </Badge>
                </div>
                <div>
                  <Label>Chain ID</Label>
                  <Badge variant="outline">{chainId}</Badge>
                </div>
                <div>
                  <Label>Loading</Label>
                  <Badge variant={isLoading ? "default" : "outline"}>
                    {isLoading ? "Yes" : "No"}
                  </Badge>
                </div>
                <div>
                  <Label>Confirming</Label>
                  <Badge variant={isConfirming ? "default" : "outline"}>
                    {isConfirming ? "Yes" : "No"}
                  </Badge>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-800 font-medium">Error:</p>
                  <p className="text-red-600 text-sm">{error.message}</p>
                </div>
              )}

              {isSuccess && vaultId && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-green-800 font-medium">Success!</p>
                  <p className="text-green-600 text-sm">Vault ID: {vaultId.toString()}</p>
                  {inviteCode && (
                    <p className="text-green-600 text-sm">Invite Code: {inviteCode}</p>
                  )}
                </div>
              )}

              {txHash && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-blue-800 font-medium">Transaction:</p>
                  <p className="text-blue-600 text-sm font-mono break-all">{txHash}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Logs Section */}
        <Card className="mt-6 bg-white/60 backdrop-blur-sm border-goal-border/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Debug Logs</CardTitle>
              <Button onClick={clearLogs} variant="outline" size="sm">
                Clear Logs
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900 text-green-400 p-4 rounded-md font-mono text-sm max-h-96 overflow-y-auto">
              {logs.length === 0 ? (
                <p className="text-gray-500">No logs yet. Click "Create Vault" to start debugging.</p>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="mb-1">
                    {log}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default DebugVaultCreation;
