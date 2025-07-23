import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Navigation from '@/components/Navigation';
import BottomNavigation from '@/components/BottomNavigation';
import { useInviteCode, VaultPreview } from '@/hooks/useInviteCode';
import { useGetVault, useGetVaultsPaginated } from '@/hooks/useVaultReads';
import { extractVaultIdFromInviteCode, generateFrontendInviteCode } from '@/utils/inviteCodeUtils';
import { formatUnits } from 'viem';
import { Search, CheckCircle, AlertCircle, Loader2, Eye, Users, Target, Calendar } from 'lucide-react';

const TestFindVault = () => {
  const [vaultId, setVaultId] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [foundVault, setFoundVault] = useState<VaultPreview | null>(null);
  const [testResults, setTestResults] = useState<{
    directLookup: 'pass' | 'fail' | 'pending';
    inviteCodeLookup: 'pass' | 'fail' | 'pending';
    publicVaultDiscovery: 'pass' | 'fail' | 'pending';
  }>({
    directLookup: 'pending',
    inviteCodeLookup: 'pending',
    publicVaultDiscovery: 'pending'
  });

  const [paginationTest, setPaginationTest] = useState({
    offset: 0,
    limit: 5,
    currentPage: 1
  });

  const { validateInviteCode, isValidating, validateError } = useInviteCode();

  // Direct vault lookup by ID
  const vaultIdBigInt = vaultId ? BigInt(vaultId) : undefined;
  const {
    data: directVaultData,
    isLoading: isLoadingDirect,
    error: directError,
    refetch: refetchDirect
  } = useGetVault(vaultIdBigInt);

  // Public vault discovery with pagination
  const {
    data: publicVaultsData,
    isLoading: isLoadingPublic,
    error: publicError,
    refetch: refetchPublic
  } = useGetVaultsPaginated(paginationTest.offset, paginationTest.limit);

  // Test direct vault lookup by ID
  const testDirectLookup = async () => {
    if (!vaultId) {
      alert('Please enter a vault ID');
      return;
    }

    try {
      setTestResults(prev => ({ ...prev, directLookup: 'pending' }));
      await refetchDirect();
      
      if (directVaultData && directVaultData.vaultAddress !== '0x0000000000000000000000000000000000000000') {
        setTestResults(prev => ({ ...prev, directLookup: 'pass' }));
      } else {
        setTestResults(prev => ({ ...prev, directLookup: 'fail' }));
      }
    } catch (error) {
      console.error('Direct lookup failed:', error);
      setTestResults(prev => ({ ...prev, directLookup: 'fail' }));
    }
  };

  // Test invite code lookup
  const testInviteCodeLookup = async () => {
    if (!inviteCode) {
      alert('Please enter an invite code');
      return;
    }

    try {
      setTestResults(prev => ({ ...prev, inviteCodeLookup: 'pending' }));
      const result = await validateInviteCode(inviteCode);
      
      if (result) {
        setFoundVault(result);
        setTestResults(prev => ({ ...prev, inviteCodeLookup: 'pass' }));
      } else {
        setTestResults(prev => ({ ...prev, inviteCodeLookup: 'fail' }));
      }
    } catch (error) {
      console.error('Invite code lookup failed:', error);
      setTestResults(prev => ({ ...prev, inviteCodeLookup: 'fail' }));
    }
  };

  // Generate test invite code from vault ID
  const generateTestInviteCode = () => {
    if (!vaultId) {
      alert('Please enter a vault ID first');
      return;
    }

    const code = generateFrontendInviteCode(BigInt(vaultId));
    setInviteCode(code);
  };

  // Extract vault ID from invite code
  const extractVaultId = () => {
    if (!inviteCode) {
      alert('Please enter an invite code first');
      return;
    }

    const extractedId = extractVaultIdFromInviteCode(inviteCode);
    if (extractedId) {
      setVaultId(extractedId.toString());
    } else {
      alert('Invalid invite code format');
    }
  };

  // Test public vault discovery with pagination
  const testPublicVaultDiscovery = async () => {
    try {
      setTestResults(prev => ({ ...prev, publicVaultDiscovery: 'pending' }));
      await refetchPublic();

      if (publicVaultsData && Array.isArray(publicVaultsData) && publicVaultsData.length >= 0) {
        setTestResults(prev => ({ ...prev, publicVaultDiscovery: 'pass' }));
        console.log('✅ Public vault discovery successful:', publicVaultsData.length, 'vaults found');
      } else {
        setTestResults(prev => ({ ...prev, publicVaultDiscovery: 'fail' }));
      }
    } catch (error) {
      console.error('Public vault discovery failed:', error);
      setTestResults(prev => ({ ...prev, publicVaultDiscovery: 'fail' }));
    }
  };

  // Pagination controls
  const nextPage = () => {
    setPaginationTest(prev => ({
      ...prev,
      offset: prev.offset + prev.limit,
      currentPage: prev.currentPage + 1
    }));
  };

  const prevPage = () => {
    if (paginationTest.offset > 0) {
      setPaginationTest(prev => ({
        ...prev,
        offset: Math.max(0, prev.offset - prev.limit),
        currentPage: Math.max(1, prev.currentPage - 1)
      }));
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
            🔍 Find Vault Test Suite
          </h1>
          <p className="text-goal-text/80">
            Test vault discovery functionality using direct ID lookup and invite codes
          </p>
        </div>

        {/* Input Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Test Inputs</CardTitle>
            <CardDescription>
              Enter a vault ID or invite code to test the discovery functionality
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Vault ID</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter vault ID (e.g., 1)"
                    value={vaultId}
                    onChange={(e) => setVaultId(e.target.value)}
                  />
                  <Button onClick={generateTestInviteCode} variant="outline" size="sm">
                    Generate Code
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Invite Code</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter invite code (e.g., GOAL123ABC4XYZ)"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    className="font-mono text-sm"
                  />
                  <Button onClick={extractVaultId} variant="outline" size="sm">
                    Extract ID
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Results */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Direct Vault Lookup */}
          <Card className={getStatusColor(testResults.directLookup)}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon(testResults.directLookup)}
                Direct Vault Lookup
              </CardTitle>
              <CardDescription>
                Find vault by ID using getVault function
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={testDirectLookup} 
                disabled={!vaultId || isLoadingDirect}
                className="w-full"
              >
                {isLoadingDirect ? 'Looking up...' : 'Test Direct Lookup'}
              </Button>
              
              {directError && (
                <div className="text-red-600 text-sm">
                  Error: {directError.message}
                </div>
              )}
              
              {directVaultData && (
                <div className="space-y-2 text-sm">
                  <div><strong>Name:</strong> {directVaultData.vaultName}</div>
                  <div><strong>Creator:</strong> {directVaultData.creator.slice(0, 10)}...</div>
                  <div><strong>Target:</strong> ${formatUnits(directVaultData.targetAmount, 6)}</div>
                  <div><strong>Public:</strong> {directVaultData.isPublic ? 'Yes' : 'No'}</div>
                  <div><strong>Active:</strong> {directVaultData.isActive ? 'Yes' : 'No'}</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Invite Code Lookup */}
          <Card className={getStatusColor(testResults.inviteCodeLookup)}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon(testResults.inviteCodeLookup)}
                Invite Code Lookup
              </CardTitle>
              <CardDescription>
                Find vault using invite code validation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={testInviteCodeLookup} 
                disabled={!inviteCode || isValidating}
                className="w-full"
              >
                {isValidating ? 'Validating...' : 'Test Invite Code'}
              </Button>
              
              {validateError && (
                <div className="text-red-600 text-sm">
                  Error: {validateError.message}
                </div>
              )}
              
              {foundVault && (
                <div className="space-y-2 text-sm">
                  <div><strong>Name:</strong> {foundVault.name}</div>
                  <div><strong>Creator:</strong> {foundVault.creator.slice(0, 10)}...</div>
                  <div><strong>Target:</strong> ${formatUnits(foundVault.targetAmount, 6)}</div>
                  <div><strong>Current:</strong> ${formatUnits(foundVault.currentAmount, 6)}</div>
                  <div><strong>Public:</strong> {foundVault.isPublic ? 'Yes' : 'No'}</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Public Vault Discovery - HIDDEN FOR NOW */}
          {/*
          <Card className={getStatusColor(testResults.publicVaultDiscovery)}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon(testResults.publicVaultDiscovery)}
                Public Vault Discovery (Hidden)
              </CardTitle>
              <CardDescription>
                Public vault functionality is disabled for now
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">
                Public vault discovery is temporarily disabled. Only private vaults with invite codes are supported.
              </p>
            </CardContent>
          </Card>
          */}
        </div>

        {/* Vault Preview */}
        {(directVaultData || foundVault) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Vault Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Target className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <h3 className="font-semibold text-blue-800">Target Amount</h3>
                  <p className="text-2xl font-bold text-blue-600">
                    ${directVaultData ? formatUnits(directVaultData.targetAmount, 6) : 
                       foundVault ? formatUnits(foundVault.targetAmount, 6) : '0'}
                  </p>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Users className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <h3 className="font-semibold text-green-800">Members</h3>
                  <p className="text-2xl font-bold text-green-600">
                    {directVaultData ? directVaultData.memberCount.toString() : 
                     foundVault ? foundVault.memberCount.toString() : '0'}
                  </p>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Calendar className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                  <h3 className="font-semibold text-purple-800">Status</h3>
                  <p className="text-lg font-bold text-purple-600">
                    {directVaultData ? (directVaultData.isActive ? 'Active' : 'Inactive') : 
                     foundVault ? 'Active' : 'Unknown'}
                  </p>
                </div>
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
              <li>Enter a vault ID (try 1, 2, 3, etc.) and click "Test Direct Lookup"</li>
              <li>Or enter an invite code and click "Test Invite Code"</li>
              <li>Use "Generate Code" to create an invite code from a vault ID</li>
              <li>Use "Extract ID" to get the vault ID from an invite code</li>
              <li>Check if both methods find the same vault successfully</li>
            </ol>
          </CardContent>
        </Card>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default TestFindVault;
