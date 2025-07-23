import { useAccount, useChainId, useReadContract } from 'wagmi';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GOAL_FINANCE_CONTRACT } from '@/config/contracts';
import { useGetVaultsByCreator, useGetTotalVaultCount } from '@/hooks/useVaultReads';
import GoalFinanceABI from '@/contracts/abis/GoalFinance.json';
import { clearAllCache } from '@/utils/clearCache';
import { useState } from 'react';

export const ContractDebug = () => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const [showDebug, setShowDebug] = useState(false);

  const contractAddress = GOAL_FINANCE_CONTRACT.address;
  
  const { 
    data: userVaultIds, 
    isLoading: isLoadingUserVaults, 
    error: userVaultsError 
  } = useGetVaultsByCreator(address);

  const {
    data: totalVaults,
    isLoading: isLoadingTotal,
    error: totalError
  } = useGetTotalVaultCount();

  // Test basic contract connectivity
  const {
    data: nextVaultId,
    isLoading: isLoadingNext,
    error: nextError
  } = useReadContract({
    address: contractAddress,
    abi: GoalFinanceABI,
    functionName: 'getTotalVaultCount',
    args: [],
    query: {
      enabled: !!contractAddress,
    },
  });

  // Test getVault function with vault ID 1 (if it exists)
  const {
    data: testVault,
    isLoading: isLoadingTestVault,
    error: testVaultError
  } = useReadContract({
    address: contractAddress,
    abi: GoalFinanceABI,
    functionName: 'getVault',
    args: [1n],
    query: {
      enabled: !!contractAddress && nextVaultId && Number(nextVaultId) > 1,
    },
  });

  if (!showDebug) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button 
          onClick={() => setShowDebug(true)}
          variant="outline"
          size="sm"
          className="bg-white/90 backdrop-blur-sm"
        >
          Debug Contract
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96">
      <Card className="bg-white/95 backdrop-blur-sm border p-4 text-xs">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold">Contract Debug</h3>
          <Button 
            onClick={() => setShowDebug(false)}
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
          >
            ×
          </Button>
        </div>
        
        <div className="space-y-2">
          <div>
            <strong>Network:</strong> {chainId} 
            {chainId === 5003 ? ' (Mantle Sepolia)' : ' (Unknown)'}
          </div>
          
          <div>
            <strong>Wallet:</strong> {isConnected ? '✅ Connected' : '❌ Not Connected'}
          </div>
          
          <div>
            <strong>Address:</strong> {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'None'}
          </div>
          
          <div>
            <strong>GoalFinance Address:</strong>
            <div className="break-all">{contractAddress || 'Not found'}</div>
          </div>

          <div>
            <strong>USDC Address:</strong>
            <div className="break-all">0x77B2693ea846571259FA89CBe4DD8e18f3F61787</div>
          </div>
          
          <hr className="my-2" />
          
          <div>
            <strong>Total Vaults:</strong> 
            {isLoadingTotal ? ' Loading...' : 
             totalError ? ` Error: ${totalError.message}` : 
             totalVaults ? ` ${totalVaults.toString()}` : ' 0'}
          </div>
          
          <div>
            <strong>Next Vault ID:</strong>
            {isLoadingNext ? ' Loading...' :
             nextError ? ` Error: ${nextError.message}` :
             nextVaultId ? ` ${nextVaultId.toString()}` : ' Unknown'}
          </div>

          <div>
            <strong>Test Vault (ID 1):</strong>
            {isLoadingTestVault ? ' Loading...' :
             testVaultError ? ` Error: ${testVaultError.message}` :
             testVault ? ` Found: ${(testVault as {vaultName: string}).vaultName}` : ' Not found'}
          </div>

          <div>
            <strong>User Vaults:</strong>
            {isLoadingUserVaults ? ' Loading...' :
             userVaultsError ? ` Error: ${userVaultsError.message}` :
             userVaultIds ? ` ${(userVaultIds as bigint[]).length} vaults` : ' 0 vaults'}
          </div>
          
          {userVaultsError && (
            <div className="text-red-600 text-xs mt-2">
              <strong>Error Details:</strong>
              <div className="break-all">{userVaultsError.message}</div>
            </div>
          )}
          
          {totalError && (
            <div className="text-red-600 text-xs mt-2">
              <strong>Total Error:</strong>
              <div className="break-all">{totalError.message}</div>
            </div>
          )}

          {nextError && (
            <div className="text-red-600 text-xs mt-2">
              <strong>Contract Error:</strong>
              <div className="break-all">{nextError.message}</div>
            </div>
          )}

          <hr className="my-2" />

          <div className="text-xs">
            <strong>Status:</strong>
            {nextError ? (
              <span className="text-red-600"> ❌ Contract not accessible</span>
            ) : nextVaultId !== undefined ? (
              <span className="text-green-600"> ✅ New contract with auto-member creator!</span>
            ) : (
              <span className="text-yellow-600"> ⏳ Checking...</span>
            )}
          </div>

          <div className="text-xs mt-2 p-2 bg-green-50 rounded border border-green-200">
            <strong className="text-green-800">🎉 New Features:</strong>
            <div className="text-green-700 mt-1">
              • Creator automatically becomes a member<br/>
              • No need to join your own vault<br/>
              • Can add funds immediately after creation
            </div>
          </div>

          <div className="text-xs mt-2 p-2 bg-yellow-50 rounded border border-yellow-200">
            <strong className="text-yellow-800">⚠️ Note:</strong>
            <div className="text-yellow-700 mt-1">
              Old vaults from previous contract won't work.<br/>
              Create new vaults with the updated contract.
            </div>
          </div>

          <Button
            onClick={clearAllCache}
            variant="outline"
            size="sm"
            className="w-full mt-2 text-xs"
          >
            🔄 Clear All Cache & Refresh
          </Button>
        </div>
      </Card>
    </div>
  );
};
