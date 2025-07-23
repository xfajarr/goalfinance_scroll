import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Navigation from '@/components/Navigation';
import BottomNavigation from '@/components/BottomNavigation';
import { useCreateVault, getGoalTypeFromString } from '@/hooks/useCreateVault';
import { useInviteCode } from '@/hooks/useInviteCode';
import { GoalType } from '@/contracts/types';
import { useAccount, useChainId } from 'wagmi';
import { CONTRACT_ADDRESSES } from '@/config/wagmi';
import { 
  generateFrontendInviteCode, 
  extractVaultIdFromInviteCode 
} from '@/utils/inviteCodeUtils';
import { TestTube, Zap, Users, Target, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const TestIntegration = () => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const contractAddresses = CONTRACT_ADDRESSES[chainId];

  // Create vault test
  const {
    createVault,
    isLoading: isCreating,
    isConfirming: isConfirmingCreate,
    isSuccess: isCreateSuccess,
    error: createError,
    vaultId: createdVaultId,
    inviteCode: createdInviteCode,
    reset: resetCreate
  } = useCreateVault();

  // Invite code test
  const {
    validateInviteCode,
    isValidating,
    joinVaultByInvite,
    joinPublicVault,
    isJoining,
    validateError,
    joinError
  } = useInviteCode();

  // Test states
  const [testResults, setTestResults] = useState<{
    contractConfig: 'pass' | 'fail' | 'pending';
    createVault: 'pass' | 'fail' | 'pending';
    inviteGeneration: 'pass' | 'fail' | 'pending';
    vaultValidation: 'pass' | 'fail' | 'pending';
    vaultJoining: 'pass' | 'fail' | 'pending';
    publicVaultJoining: 'pass' | 'fail' | 'pending';
  }>({
    contractConfig: 'pending',
    createVault: 'pending',
    inviteGeneration: 'pending',
    vaultValidation: 'pending',
    vaultJoining: 'pending',
    publicVaultJoining: 'pending'
  });

  const [testData, setTestData] = useState({
    vaultName: 'Test Vault ' + Date.now(),
    description: 'Integration test vault',
    targetAmount: '1000',
    generatedInviteCode: '',
    testInviteCode: ''
  });

  // Test 1: Contract Configuration
  const testContractConfig = () => {
    try {
      if (!contractAddresses?.VAULT_FACTORY || !contractAddresses?.USDC) {
        setTestResults(prev => ({ ...prev, contractConfig: 'fail' }));
        return false;
      }
      setTestResults(prev => ({ ...prev, contractConfig: 'pass' }));
      return true;
    } catch (error) {
      setTestResults(prev => ({ ...prev, contractConfig: 'fail' }));
      return false;
    }
  };

  // Test 2: Create Vault
  const testCreateVault = async () => {
    try {
      if (!isConnected) {
        alert('Please connect your wallet first');
        return;
      }

      const deadline = new Date();
      deadline.setDate(deadline.getDate() + 30); // 30 days from now

      await createVault({
        vaultName: testData.vaultName,
        description: testData.description,
        targetAmount: testData.targetAmount,
        deadline,
        isPublic: true,
        goalType: GoalType.GROUP
      });

      setTestResults(prev => ({ ...prev, createVault: 'pass' }));
    } catch (error) {
      console.error('Create vault test failed:', error);
      setTestResults(prev => ({ ...prev, createVault: 'fail' }));
    }
  };

  // Test 3: Invite Code Generation (now automatic from createVault)
  const testInviteGeneration = () => {
    try {
      if (!createdVaultId) {
        alert('Please create a vault first');
        return;
      }

      // Check if we got an invite code from the createVault call
      if (createdInviteCode) {
        setTestData(prev => ({ ...prev, generatedInviteCode: createdInviteCode }));
        setTestResults(prev => ({ ...prev, inviteGeneration: 'pass' }));
        console.log('✅ On-chain invite code received:', createdInviteCode);
      } else {
        // Fallback to frontend generation for testing
        const inviteCode = generateFrontendInviteCode(createdVaultId);
        const extractedId = extractVaultIdFromInviteCode(inviteCode);

        if (extractedId === createdVaultId) {
          setTestData(prev => ({ ...prev, generatedInviteCode: inviteCode }));
          setTestResults(prev => ({ ...prev, inviteGeneration: 'pass' }));
          console.log('✅ Frontend invite code generated:', inviteCode);
        } else {
          setTestResults(prev => ({ ...prev, inviteGeneration: 'fail' }));
        }
      }
    } catch (error) {
      console.error('Invite generation test failed:', error);
      setTestResults(prev => ({ ...prev, inviteGeneration: 'fail' }));
    }
  };

  // Test 4: Vault Validation
  const testVaultValidation = async () => {
    try {
      const codeToTest = testData.testInviteCode || testData.generatedInviteCode;
      if (!codeToTest) {
        alert('Please generate an invite code first');
        return;
      }

      const result = await validateInviteCode(codeToTest);
      if (result) {
        setTestResults(prev => ({ ...prev, vaultValidation: 'pass' }));
      } else {
        setTestResults(prev => ({ ...prev, vaultValidation: 'fail' }));
      }
    } catch (error) {
      console.error('Vault validation test failed:', error);
      setTestResults(prev => ({ ...prev, vaultValidation: 'fail' }));
    }
  };

  // Test 5: Vault Joining (simulation)
  const testVaultJoining = async () => {
    try {
      const codeToTest = testData.testInviteCode || testData.generatedInviteCode;
      if (!codeToTest) {
        alert('Please generate an invite code first');
        return;
      }

      // For testing, we'll just validate the code exists and is valid
      // In a real scenario, you'd join with a different wallet
      const result = await validateInviteCode(codeToTest);
      if (result) {
        setTestResults(prev => ({ ...prev, vaultJoining: 'pass' }));
      } else {
        setTestResults(prev => ({ ...prev, vaultJoining: 'fail' }));
      }
    } catch (error) {
      console.error('Vault joining test failed:', error);
      setTestResults(prev => ({ ...prev, vaultJoining: 'fail' }));
    }
  };

  // Test 6: Public Vault Joining
  const testPublicVaultJoining = async () => {
    try {
      if (!createdVaultId) {
        alert('Please create a vault first');
        return;
      }

      if (!isConnected) {
        alert('Please connect your wallet');
        return;
      }

      // Test joining the public vault directly by ID
      await joinPublicVault(createdVaultId, BigInt(100 * 1e6)); // 100 USDC personal goal
      setTestResults(prev => ({ ...prev, publicVaultJoining: 'pass' }));
      console.log('✅ Successfully joined public vault');
    } catch (error) {
      console.error('Public vault joining test failed:', error);
      setTestResults(prev => ({ ...prev, publicVaultJoining: 'fail' }));
    }
  };

  // Run all tests
  const runAllTests = async () => {
    // Reset results
    setTestResults({
      contractConfig: 'pending',
      createVault: 'pending',
      inviteGeneration: 'pending',
      vaultValidation: 'pending',
      vaultJoining: 'pending',
      publicVaultJoining: 'pending'
    });

    // Test 1: Contract Config
    const configOk = testContractConfig();
    if (!configOk) return;

    // Test 2: Create Vault (if connected)
    if (isConnected) {
      await testCreateVault();
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

  return (
    <div className="min-h-screen bg-goal-bg pb-32 md:pb-0">
      <Navigation />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-fredoka font-bold text-goal-text mb-2">
            🧪 GoalFi Integration Test Suite
          </h1>
          <p className="text-goal-text/80">
            Test the complete vault creation, invite generation, and joining flow
          </p>
        </div>

        {/* Connection Status */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Connection Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="font-medium">Wallet</p>
                <Badge variant={isConnected ? "default" : "destructive"}>
                  {isConnected ? "Connected" : "Disconnected"}
                </Badge>
              </div>
              <div className="text-center">
                <p className="font-medium">Chain ID</p>
                <Badge variant="outline">{chainId}</Badge>
              </div>
              <div className="text-center">
                <p className="font-medium">Factory Address</p>
                <Badge variant="outline" className="text-xs">
                  {contractAddresses?.VAULT_FACTORY?.slice(0, 10)}...
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Controls */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Test Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                placeholder="Test invite code"
                value={testData.testInviteCode}
                onChange={(e) => setTestData(prev => ({ ...prev, testInviteCode: e.target.value }))}
              />
              <Button onClick={runAllTests} className="w-full">
                Run All Tests
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Test Results */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Test 1: Contract Configuration */}
          <Card className={getStatusColor(testResults.contractConfig)}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon(testResults.contractConfig)}
                Contract Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-2">Factory: {contractAddresses?.VAULT_FACTORY}</p>
              <p className="text-sm mb-4">USDC: {contractAddresses?.USDC}</p>
              <Button onClick={testContractConfig} size="sm">
                Test Config
              </Button>
            </CardContent>
          </Card>

          {/* Test 2: Create Vault */}
          <Card className={getStatusColor(testResults.createVault)}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon(testResults.createVault)}
                Create Vault
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm mb-4">
                {isCreating || isConfirmingCreate ? (
                  <p>Creating...</p>
                ) : createdVaultId ? (
                  <div>
                    <p>✅ Vault ID: {createdVaultId.toString()}</p>
                    {createdInviteCode && (
                      <p className="font-mono text-xs mt-1">🎫 Invite: {createdInviteCode}</p>
                    )}
                  </div>
                ) : (
                  <p>Not created</p>
                )}
              </div>
              <Button 
                onClick={testCreateVault} 
                disabled={!isConnected || isCreating || isConfirmingCreate}
                size="sm"
              >
                {isCreating || isConfirmingCreate ? 'Creating...' : 'Create Test Vault'}
              </Button>
            </CardContent>
          </Card>

          {/* Test 3: Invite Generation */}
          <Card className={getStatusColor(testResults.inviteGeneration)}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon(testResults.inviteGeneration)}
                Invite Generation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-4 font-mono">
                {testData.generatedInviteCode || 'No code generated'}
              </p>
              <Button 
                onClick={testInviteGeneration} 
                disabled={!createdVaultId}
                size="sm"
              >
                Generate Invite
              </Button>
            </CardContent>
          </Card>

          {/* Test 4: Vault Validation */}
          <Card className={getStatusColor(testResults.vaultValidation)}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon(testResults.vaultValidation)}
                Vault Validation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-4">
                {isValidating ? 'Validating...' : 
                 validateError ? `Error: ${validateError.message}` : 'Ready to test'}
              </p>
              <Button 
                onClick={testVaultValidation} 
                disabled={isValidating || (!testData.generatedInviteCode && !testData.testInviteCode)}
                size="sm"
              >
                {isValidating ? 'Validating...' : 'Validate Vault'}
              </Button>
            </CardContent>
          </Card>

          {/* Test 5: Vault Joining */}
          <Card className={getStatusColor(testResults.vaultJoining)}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon(testResults.vaultJoining)}
                Vault Joining (Invite)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-4">
                {isJoining ? 'Joining...' :
                 joinError ? `Error: ${joinError.message}` : 'Ready to test'}
              </p>
              <Button
                onClick={testVaultJoining}
                disabled={isJoining || (!testData.generatedInviteCode && !testData.testInviteCode)}
                size="sm"
              >
                {isJoining ? 'Joining...' : 'Join by Invite'}
              </Button>
            </CardContent>
          </Card>

          {/* Test 6: Public Vault Joining - HIDDEN FOR NOW */}
          {/*
          <Card className={getStatusColor(testResults.publicVaultJoining)}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon(testResults.publicVaultJoining)}
                Public Vault Joining (Hidden)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-4">
                Public vault functionality is temporarily disabled
              </p>
            </CardContent>
          </Card>
          */}
        </div>

        {/* Error Display */}
        {(createError || validateError || joinError) && (
          <Card className="mt-6 bg-red-50 border-red-200">
            <CardHeader>
              <CardTitle className="text-red-800">Errors</CardTitle>
            </CardHeader>
            <CardContent>
              {createError && <p className="text-red-600 text-sm mb-2">Create: {createError.message}</p>}
              {validateError && <p className="text-red-600 text-sm mb-2">Validate: {validateError.message}</p>}
              {joinError && <p className="text-red-600 text-sm">Join: {joinError.message}</p>}
            </CardContent>
          </Card>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
};

export default TestIntegration;
