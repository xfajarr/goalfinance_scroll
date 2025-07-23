import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useAddFunds } from '@/hooks/useAddFunds';
import { useJoinVault } from '@/hooks/useJoinVault';
import { Loader2, Plus, UserPlus, CheckCircle, XCircle } from 'lucide-react';

const TestVaultOperations = () => {
  const { address, isConnected } = useAccount();
  const { toast } = useToast();

  // Add Funds Test State
  const [addFundsVaultId, setAddFundsVaultId] = useState('');
  const [addFundsAmount, setAddFundsAmount] = useState('');
  const [addFundsNative, setAddFundsNative] = useState(false);

  // Join Vault Test State
  const [joinVaultId, setJoinVaultId] = useState('');
  const [joinAmount, setJoinAmount] = useState('');
  const [joinInviteCode, setJoinInviteCode] = useState('');
  const [joinNative, setJoinNative] = useState(false);

  // Hooks
  const {
    addFunds,
    isLoading: isAddingFunds,
    isConfirming: isConfirmingAddFunds,
    isSuccess: isAddFundsSuccess,
    error: addFundsError,
    txHash: addFundsTxHash,
    reset: resetAddFunds
  } = useAddFunds();

  const {
    joinVaultAndDeposit,
    isLoading: isJoiningVault,
    isConfirming: isConfirmingJoin,
    isSuccess: isJoinSuccess,
    error: joinError,
    txHash: joinTxHash,
    reset: resetJoin
  } = useJoinVault();

  const handleAddFunds = async () => {
    if (!addFundsVaultId || !addFundsAmount) {
      toast({
        title: 'Missing Information',
        description: 'Please provide vault ID and amount',
        variant: 'destructive',
      });
      return;
    }

    try {
      await addFunds(BigInt(addFundsVaultId), addFundsAmount, addFundsNative);
    } catch (error) {
      console.error('Add funds failed:', error);
    }
  };

  const handleJoinVault = async () => {
    if (!joinVaultId || !joinAmount || !joinInviteCode) {
      toast({
        title: 'Missing Information',
        description: 'Please provide vault ID, amount, and invite code',
        variant: 'destructive',
      });
      return;
    }

    try {
      await joinVaultAndDeposit(BigInt(joinVaultId), joinAmount, joinInviteCode, joinNative);
    } catch (error) {
      console.error('Join vault failed:', error);
    }
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Wallet Not Connected</CardTitle>
            <CardDescription>Please connect your wallet to test vault operations</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Test Vault Operations</h1>
        <p className="text-muted-foreground mt-2">
          Test addFunds and joinVaultAndDeposit functions with the new GoalFinance contract
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Connected: {address}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Add Funds Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Test Add Funds
            </CardTitle>
            <CardDescription>
              Test the addFunds function for existing vault members
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="addFundsVaultId">Vault ID</Label>
              <Input
                id="addFundsVaultId"
                value={addFundsVaultId}
                onChange={(e) => setAddFundsVaultId(e.target.value)}
                placeholder="Enter vault ID (e.g., 1)"
              />
            </div>

            <div>
              <Label htmlFor="addFundsAmount">Amount</Label>
              <Input
                id="addFundsAmount"
                value={addFundsAmount}
                onChange={(e) => setAddFundsAmount(e.target.value)}
                placeholder="Enter amount (e.g., 100)"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="addFundsNative"
                checked={addFundsNative}
                onCheckedChange={(checked) => setAddFundsNative(checked as boolean)}
              />
              <Label htmlFor="addFundsNative">Use Native Token (ETH/MNT)</Label>
            </div>

            <Button
              onClick={handleAddFunds}
              disabled={isAddingFunds || isConfirmingAddFunds}
              className="w-full"
            >
              {isAddingFunds || isConfirmingAddFunds ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isAddingFunds ? 'Adding Funds...' : 'Confirming...'}
                </>
              ) : (
                'Add Funds'
              )}
            </Button>

            {/* Add Funds Status */}
            {addFundsError && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <XCircle className="h-4 w-4" />
                Error: {addFundsError.message}
              </div>
            )}

            {isAddFundsSuccess && (
              <div className="flex items-center gap-2 text-green-600 text-sm">
                <CheckCircle className="h-4 w-4" />
                Funds added successfully!
              </div>
            )}

            {addFundsTxHash && (
              <div className="text-xs text-muted-foreground font-mono bg-muted p-2 rounded">
                TX: {addFundsTxHash.slice(0, 10)}...{addFundsTxHash.slice(-8)}
              </div>
            )}

            {(addFundsError || isAddFundsSuccess) && (
              <Button variant="outline" onClick={resetAddFunds} className="w-full">
                Reset
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Join Vault Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Test Join Vault
            </CardTitle>
            <CardDescription>
              Test the joinVaultAndDeposit function for new members
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="joinVaultId">Vault ID</Label>
              <Input
                id="joinVaultId"
                value={joinVaultId}
                onChange={(e) => setJoinVaultId(e.target.value)}
                placeholder="Enter vault ID (e.g., 1)"
              />
            </div>

            <div>
              <Label htmlFor="joinAmount">Amount</Label>
              <Input
                id="joinAmount"
                value={joinAmount}
                onChange={(e) => setJoinAmount(e.target.value)}
                placeholder="Enter amount (e.g., 50)"
              />
            </div>

            <div>
              <Label htmlFor="joinInviteCode">Invite Code</Label>
              <Input
                id="joinInviteCode"
                value={joinInviteCode}
                onChange={(e) => setJoinInviteCode(e.target.value)}
                placeholder="Enter invite code (0x...)"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="joinNative"
                checked={joinNative}
                onCheckedChange={(checked) => setJoinNative(checked as boolean)}
              />
              <Label htmlFor="joinNative">Use Native Token (ETH/MNT)</Label>
            </div>

            <Button
              onClick={handleJoinVault}
              disabled={isJoiningVault || isConfirmingJoin}
              className="w-full"
            >
              {isJoiningVault || isConfirmingJoin ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isJoiningVault ? 'Joining Vault...' : 'Confirming...'}
                </>
              ) : (
                'Join Vault & Deposit'
              )}
            </Button>

            {/* Join Vault Status */}
            {joinError && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <XCircle className="h-4 w-4" />
                Error: {joinError.message}
              </div>
            )}

            {isJoinSuccess && (
              <div className="flex items-center gap-2 text-green-600 text-sm">
                <CheckCircle className="h-4 w-4" />
                Successfully joined vault!
              </div>
            )}

            {joinTxHash && (
              <div className="text-xs text-muted-foreground font-mono bg-muted p-2 rounded">
                TX: {joinTxHash.slice(0, 10)}...{joinTxHash.slice(-8)}
              </div>
            )}

            {(joinError || isJoinSuccess) && (
              <Button variant="outline" onClick={resetJoin} className="w-full">
                Reset
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contract Information</CardTitle>
          <CardDescription>
            Testing with GoalFinance contract at 0x3d183CDCbF78BA6e39eb0e51C44d233265786e0A
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>addFunds Function:</strong>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Parameters: vaultId, amount</li>
                <li>Payable: Yes (for native tokens)</li>
                <li>For USDC: amount in wei (6 decimals)</li>
                <li>For ETH/MNT: send as value, amount = 0</li>
              </ul>
            </div>
            <div>
              <strong>joinVaultAndDeposit Function:</strong>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Parameters: vaultId, amount, inviteCode</li>
                <li>Payable: Yes (for native tokens)</li>
                <li>Invite code: bytes32 format</li>
                <li>Joins vault and deposits in one transaction</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestVaultOperations;
