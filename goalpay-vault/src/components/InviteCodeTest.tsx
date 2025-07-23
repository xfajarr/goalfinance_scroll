import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useInviteCode } from '@/hooks/useInviteCode';
import { useAccount } from 'wagmi';

export const InviteCodeTest = () => {
  const { address } = useAccount();
  const [testInviteCode, setTestInviteCode] = useState('');
  const [vaultPreview, setVaultPreview] = useState<any>(null);
  const [joinAmount, setJoinAmount] = useState('10');
  const [useNativeToken, setUseNativeToken] = useState(true);

  const {
    validateInviteCode,
    isValidating,
    validateError,
    joinVaultByInvite,
    isJoining,
    joinError,
    joinTxHash,
  } = useInviteCode();

  const handleValidateCode = async () => {
    if (!testInviteCode.trim()) return;
    
    try {
      const preview = await validateInviteCode(testInviteCode);
      setVaultPreview(preview);
    } catch (error) {
      console.error('Validation failed:', error);
      setVaultPreview(null);
    }
  };

  const handleJoinVault = async () => {
    if (!testInviteCode.trim() || !joinAmount) return;
    
    try {
      await joinVaultByInvite(testInviteCode, joinAmount, useNativeToken);
    } catch (error) {
      console.error('Join failed:', error);
    }
  };

  const formatInviteCode = (code: string) => {
    if (code.startsWith('0x') && code.length === 66) {
      return `${code.slice(0, 10)}...${code.slice(-8)} (On-chain bytes32)`;
    }
    return `${code} (Legacy format)`;
  };

  return (
    <Card className="max-w-2xl mx-auto mt-8 bg-white/60 backdrop-blur-sm border-goal-border/30">
      <CardHeader>
        <CardTitle className="text-goal-heading font-fredoka">🧪 Invite Code Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Connection Status */}
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-sm">
            <strong>Wallet:</strong> {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Not connected'}
          </p>
        </div>

        {/* Invite Code Input */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-goal-text">Test Invite Code:</label>
          <div className="flex gap-2">
            <Input
              value={testInviteCode}
              onChange={(e) => setTestInviteCode(e.target.value)}
              placeholder="Enter invite code (0x... or GOAL...)"
              className="flex-1"
            />
            <Button 
              onClick={handleValidateCode}
              disabled={isValidating || !testInviteCode.trim()}
              className="bg-goal-primary hover:bg-goal-primary/90"
            >
              {isValidating ? 'Validating...' : 'Validate'}
            </Button>
          </div>
          {testInviteCode && (
            <p className="text-xs text-gray-600">
              Format: {formatInviteCode(testInviteCode)}
            </p>
          )}
        </div>

        {/* Validation Error */}
        {validateError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-700 text-sm">
              <strong>Validation Error:</strong> {validateError.message}
            </p>
          </div>
        )}

        {/* Vault Preview */}
        {vaultPreview && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-800 mb-2">✅ Vault Found!</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><strong>Name:</strong> {vaultPreview.name}</div>
              <div><strong>ID:</strong> {vaultPreview.id.toString()}</div>
              <div><strong>Target:</strong> {vaultPreview.targetAmount.toString()}</div>
              <div><strong>Current:</strong> {vaultPreview.currentAmount.toString()}</div>
              <div><strong>Members:</strong> {vaultPreview.memberCount.toString()}</div>
              <div><strong>Public:</strong> {vaultPreview.isPublic ? 'Yes' : 'No'}</div>
              <div><strong>Creator:</strong> {vaultPreview.creator.slice(0, 6)}...{vaultPreview.creator.slice(-4)}</div>
              <div><strong>Token:</strong> {vaultPreview.tokenSymbol}</div>
            </div>
            <p className="text-green-700 text-sm mt-2">
              <strong>Description:</strong> {vaultPreview.description}
            </p>
          </div>
        )}

        {/* Join Vault Section */}
        {vaultPreview && (
          <div className="border-t pt-4">
            <h3 className="font-semibold text-goal-text mb-3">💰 Join Vault</h3>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={joinAmount}
                  onChange={(e) => setJoinAmount(e.target.value)}
                  placeholder="Amount to deposit"
                  className="flex-1"
                />
                <div className="flex items-center gap-2">
                  <label className="text-sm">
                    <input
                      type="checkbox"
                      checked={useNativeToken}
                      onChange={(e) => setUseNativeToken(e.target.checked)}
                      className="mr-1"
                    />
                    Use MNT (native)
                  </label>
                </div>
              </div>
              <Button 
                onClick={handleJoinVault}
                disabled={isJoining || !joinAmount || !address}
                className="w-full bg-goal-primary hover:bg-goal-primary/90"
              >
                {isJoining ? 'Joining...' : `Join with ${joinAmount} ${useNativeToken ? 'MNT' : 'USDC'}`}
              </Button>
            </div>
          </div>
        )}

        {/* Join Error */}
        {joinError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-700 text-sm">
              <strong>Join Error:</strong> {joinError.message}
            </p>
          </div>
        )}

        {/* Join Success */}
        {joinTxHash && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-green-700 text-sm">
              <strong>✅ Join Successful!</strong>
            </p>
            <a
              href={`https://sepolia.mantlescan.xyz/tx/${joinTxHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline text-sm font-mono"
            >
              {joinTxHash.slice(0, 10)}...{joinTxHash.slice(-8)}
            </a>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <h4 className="font-semibold text-blue-800 mb-2">📋 How to Test:</h4>
          <ol className="text-blue-700 text-sm space-y-1 list-decimal list-inside">
            <li>Create a vault first to get an invite code</li>
            <li>Copy the invite code from the success message</li>
            <li>Paste it here and click "Validate"</li>
            <li>If valid, enter an amount and click "Join"</li>
            <li>Check the transaction on Mantle Sepolia explorer</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};
