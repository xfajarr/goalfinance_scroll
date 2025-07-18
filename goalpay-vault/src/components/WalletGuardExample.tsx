import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useWalletGuard } from '@/hooks/useWalletGuard';
import { WalletGuardDialog } from '@/components/WalletGuardDialog';
import { Wallet, Plus, Target, DollarSign } from 'lucide-react';

/**
 * Example component demonstrating how to use the wallet guard
 * This shows how to protect any action that requires wallet connection
 */
export const WalletGuardExample = () => {
  const { isConnected, requireWalletConnection, showConnectDialog, setShowConnectDialog } = useWalletGuard();

  const handleCreateVault = () => {
    requireWalletConnection(() => {
      // This action will only execute if wallet is connected
      console.log('Creating vault...');
      alert('Vault creation started! (This would be the actual vault creation logic)');
    });
  };

  const handleJoinVault = () => {
    requireWalletConnection(() => {
      // This action will only execute if wallet is connected
      console.log('Joining vault...');
      alert('Joining vault! (This would be the actual vault joining logic)');
    });
  };

  const handleAddFunds = () => {
    requireWalletConnection(() => {
      // This action will only execute if wallet is connected
      console.log('Adding funds...');
      alert('Adding funds! (This would be the actual add funds logic)');
    });
  };

  return (
    <div className="space-y-4">
      <Card className="p-6 bg-white/60 backdrop-blur-sm border-goal-border/30 rounded-3xl">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-goal-primary rounded-3xl flex items-center justify-center mx-auto">
            <Wallet className="w-8 h-8 text-goal-text" />
          </div>
          
          <div>
            <h3 className="font-fredoka font-bold text-goal-text text-lg mb-2">
              Wallet Guard Demo
            </h3>
            <p className="font-inter text-goal-text/70 text-sm">
              {isConnected 
                ? "✅ Wallet connected! Try the actions below." 
                : "❌ Wallet not connected. Actions will show connect dialog."
              }
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Button
              onClick={handleCreateVault}
              className="bg-goal-primary hover:bg-goal-primary/90 text-goal-text font-fredoka font-semibold rounded-2xl py-3 transition-all duration-300 hover:scale-105"
            >
              <Target className="w-4 h-4 mr-2" />
              Create Vault
            </Button>

            <Button
              onClick={handleJoinVault}
              className="bg-purple-500 hover:bg-purple-500/90 text-white font-fredoka font-semibold rounded-2xl py-3 transition-all duration-300 hover:scale-105"
            >
              <Plus className="w-4 h-4 mr-2" />
              Join Vault
            </Button>

            <Button
              onClick={handleAddFunds}
              className="bg-green-500 hover:bg-green-500/90 text-white font-fredoka font-semibold rounded-2xl py-3 transition-all duration-300 hover:scale-105"
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Add Funds
            </Button>
          </div>
        </div>
      </Card>

      {/* Wallet Guard Dialog */}
      <WalletGuardDialog
        isOpen={showConnectDialog}
        onOpenChange={setShowConnectDialog}
        title="Connect Wallet Required"
        description="You need to connect your wallet to perform this action. Connect now to continue!"
        actionText="Perform Action"
      />
    </div>
  );
};
