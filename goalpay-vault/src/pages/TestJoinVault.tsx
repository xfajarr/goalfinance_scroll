import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Navigation from '@/components/Navigation';
import BottomNavigation from '@/components/BottomNavigation';
import { useInviteCode, VaultPreview } from '@/hooks/useInviteCode';
import { extractVaultIdFromInviteCode, generateFrontendInviteCode } from '@/utils/inviteCodeUtils';
import { formatUnits, parseUnits } from 'viem';
import { useAccount } from 'wagmi';
import { 
  UserPlus, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Target, 
  Users, 
  Calendar,
  DollarSign,
  Share2
} from 'lucide-react';

const TestJoinVault = () => {
  const { address, isConnected } = useAccount();
  const [inviteCode, setInviteCode] = useState('');
  const [personalGoal, setPersonalGoal] = useState('');
  const [vaultPreview, setVaultPreview] = useState<VaultPreview | null>(null);
  const [joinSuccess, setJoinSuccess] = useState(false);
  const [testResults, setTestResults] = useState<{
    validation: 'pass' | 'fail' | 'pending';
    joining: 'pass' | 'fail' | 'pending';
    publicJoining: 'pass' | 'fail' | 'pending';
  }>({
    validation: 'pending',
    joining: 'pending',
    publicJoining: 'pending'
  });

  const [publicVaultId, setPublicVaultId] = useState('');

  const {
    validateInviteCode,
    isValidating,
    joinVaultByInvite,
    joinPublicVault,
    isJoining,
    validateError,
    joinError
  } = useInviteCode();

  // Test vault validation
  const testValidation = async () => {
    if (!inviteCode.trim()) {
      alert('Please enter an invite code');
      return;
    }

    try {
      setTestResults(prev => ({ ...prev, validation: 'pending' }));
      const result = await validateInviteCode(inviteCode.trim());
      
      if (result) {
        setVaultPreview(result);
        setTestResults(prev => ({ ...prev, validation: 'pass' }));
      } else {
        setTestResults(prev => ({ ...prev, validation: 'fail' }));
      }
    } catch (error) {
      console.error('Validation failed:', error);
      setTestResults(prev => ({ ...prev, validation: 'fail' }));
    }
  };

  // Test vault joining
  const testJoining = async () => {
    if (!vaultPreview) {
      alert('Please validate an invite code first');
      return;
    }

    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      setTestResults(prev => ({ ...prev, joining: 'pending' }));
      
      let personalGoalAmount: bigint | undefined;
      if (personalGoal && parseFloat(personalGoal) > 0) {
        personalGoalAmount = parseUnits(personalGoal, 6); // USDC has 6 decimals
      }

      await joinVaultByInvite(inviteCode.trim(), personalGoalAmount);
      
      setJoinSuccess(true);
      setTestResults(prev => ({ ...prev, joining: 'pass' }));
    } catch (error) {
      console.error('Joining failed:', error);
      setTestResults(prev => ({ ...prev, joining: 'fail' }));
    }
  };

  // Generate sample invite codes for testing
  const generateSampleCodes = () => {
    const samples = [
      generateFrontendInviteCode(BigInt(1)),
      generateFrontendInviteCode(BigInt(2)),
      generateFrontendInviteCode(BigInt(3))
    ];
    return samples;
  };

  const sampleCodes = generateSampleCodes();

  // Test public vault joining
  const testPublicVaultJoining = async () => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    if (!publicVaultId.trim()) {
      alert('Please enter a public vault ID');
      return;
    }

    try {
      setTestResults(prev => ({ ...prev, publicJoining: 'pending' }));

      let personalGoalAmount: bigint | undefined;
      if (personalGoal && parseFloat(personalGoal) > 0) {
        personalGoalAmount = parseUnits(personalGoal, 6); // USDC has 6 decimals
      }

      await joinPublicVault(BigInt(publicVaultId), personalGoalAmount);

      setTestResults(prev => ({ ...prev, publicJoining: 'pass' }));
      console.log('✅ Successfully joined public vault');
    } catch (error) {
      console.error('Public vault joining failed:', error);
      setTestResults(prev => ({ ...prev, publicJoining: 'fail' }));
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

  if (joinSuccess) {
    return (
      <div className="min-h-screen bg-goal-bg pb-32 md:pb-0">
        <Navigation />
        <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="bg-green-50 border-green-200 p-8 rounded-3xl text-center">
            <div className="w-20 h-20 bg-green-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-fredoka font-bold text-green-800 mb-4">
              🎉 Successfully Joined Vault!
            </h1>
            <p className="text-green-700 mb-6">
              You've successfully joined "{vaultPreview?.name}" using the invite code system.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => window.location.href = `/vault/${vaultPreview?.id}`}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-2xl px-6 py-3"
              >
                View Vault
              </Button>
              <Button
                onClick={() => {
                  setJoinSuccess(false);
                  setVaultPreview(null);
                  setInviteCode('');
                  setPersonalGoal('');
                  setTestResults({ validation: 'pending', joining: 'pending' });
                }}
                variant="outline"
                className="flex-1 border-green-300 text-green-700 hover:bg-green-100 rounded-2xl px-6 py-3"
              >
                Test Another
              </Button>
            </div>
          </Card>
        </main>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-goal-bg pb-32 md:pb-0">
      <Navigation />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-fredoka font-bold text-goal-text mb-2">
            🚪 Join Vault Test Suite
          </h1>
          <p className="text-goal-text/80">
            Test the complete vault joining flow using invite codes
          </p>
        </div>

        {/* Connection Status */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Connection Status</CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        {/* Sample Invite Codes */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Sample Invite Codes
            </CardTitle>
            <CardDescription>
              Try these sample invite codes (they may or may not exist on-chain)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {sampleCodes.map((code, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Vault {index + 1}</p>
                  <p className="font-mono text-sm break-all">{code}</p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2 w-full"
                    onClick={() => setInviteCode(code)}
                  >
                    Use This Code
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Input Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Test Inputs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Invite Code</label>
              <Input
                placeholder="Enter invite code (e.g., GOAL123ABC4XYZ)"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                className="font-mono"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Personal Goal Amount (Optional)</label>
              <Input
                type="number"
                placeholder="Enter amount in USDC (e.g., 1000)"
                value={personalGoal}
                onChange={(e) => setPersonalGoal(e.target.value)}
              />
              <p className="text-xs text-gray-600">
                Only needed for PERSONAL type vaults. Leave empty for GROUP vaults.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Test Steps */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Step 1: Validation */}
          <Card className={getStatusColor(testResults.validation)}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon(testResults.validation)}
                Step 1: Validate Invite Code
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={testValidation} 
                disabled={!inviteCode || isValidating}
                className="w-full"
              >
                {isValidating ? 'Validating...' : 'Validate Code'}
              </Button>
              
              {validateError && (
                <div className="text-red-600 text-sm">
                  Error: {validateError.message}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Step 2: Joining */}
          <Card className={getStatusColor(testResults.joining)}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon(testResults.joining)}
                Step 2: Join Vault
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={testJoining} 
                disabled={!vaultPreview || !isConnected || isJoining}
                className="w-full"
              >
                {isJoining ? 'Joining...' : 'Join Vault'}
              </Button>
              
              {joinError && (
                <div className="text-red-600 text-sm">
                  Error: {joinError.message}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Public Vault Joining Test - HIDDEN FOR NOW */}
        {/*
        <Card className={`mb-6 ${getStatusColor(testResults.publicJoining)}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon(testResults.publicJoining)}
              Public Vault Joining Test (Hidden)
            </CardTitle>
            <CardDescription>
              Public vault functionality is disabled for now
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              Public vault joining is temporarily disabled. Only invite-based joining is supported.
            </p>
          </CardContent>
        </Card>
        */}

        {/* Vault Preview */}
        {vaultPreview && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Vault Preview
              </CardTitle>
              <CardDescription>
                Ready to join: {vaultPreview.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Target className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <h3 className="font-semibold text-blue-800 text-sm">Target</h3>
                  <p className="text-lg font-bold text-blue-600">
                    ${formatUnits(vaultPreview.targetAmount || 0n, 6)}
                  </p>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <DollarSign className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <h3 className="font-semibold text-green-800 text-sm">Current</h3>
                  <p className="text-lg font-bold text-green-600">
                    ${formatUnits(vaultPreview.currentAmount || 0n, 6)}
                  </p>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Users className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                  <h3 className="font-semibold text-purple-800 text-sm">Members</h3>
                  <p className="text-lg font-bold text-purple-600">
                    {vaultPreview.memberCount.toString()}
                  </p>
                </div>
                
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <Calendar className="h-6 w-6 mx-auto mb-2 text-orange-600" />
                  <h3 className="font-semibold text-orange-800 text-sm">Status</h3>
                  <p className="text-lg font-bold text-orange-600">
                    {vaultPreview.isPublic ? 'Public' : 'Private'}
                  </p>
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-sm text-gray-700">{vaultPreview.description}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>How to Test</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Connect your wallet using the connect button in the navigation</li>
              <li>Enter an invite code (use sample codes or create your own)</li>
              <li>Click "Validate Code" to check if the vault exists</li>
              <li>If validation passes, optionally set a personal goal amount</li>
              <li>Click "Join Vault" to complete the joining process</li>
              <li>Check the transaction in your wallet and confirm</li>
            </ol>
          </CardContent>
        </Card>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default TestJoinVault;
