import React from 'react';
import { useTokenSetup } from '../hooks/useTokenSetup';
import { useAccount, useChainId } from 'wagmi';
import { GOAL_FINANCE_CONTRACT } from '../config/contracts';

export function TokenSetupDebug() {
  const { address: userAddress } = useAccount();
  const chainId = useChainId();
  const contractAddress = GOAL_FINANCE_CONTRACT.address;
  
  const {
    setupStatus,
    setupMessage,
    isReady,
    needsSetup,
    hasError,
    usdcAddress,
    isUSDCSupported,
    isOwner,
    contractOwner,
    addUSDCSupport,
    isAddingUSDC,
    refetchSupport,
  } = useTokenSetup();

  const getStatusColor = () => {
    switch (setupStatus) {
      case 'ready': return 'text-green-600';
      case 'needs-setup': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      case 'adding': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = () => {
    switch (setupStatus) {
      case 'ready': return '✅';
      case 'needs-setup': return '⚠️';
      case 'error': return '❌';
      case 'adding': return '🔄';
      default: return '🔍';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-bold mb-4">🔧 Token Setup Debug</h2>
      
      {/* Status */}
      <div className="mb-4">
        <div className={`flex items-center gap-2 text-lg font-semibold ${getStatusColor()}`}>
          <span>{getStatusIcon()}</span>
          <span>Status: {setupStatus.toUpperCase()}</span>
        </div>
        <p className="text-gray-600 mt-1">{setupMessage}</p>
      </div>

      {/* Contract Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-50 p-3 rounded">
          <h3 className="font-semibold text-sm text-gray-700">Chain Info</h3>
          <p className="text-xs text-gray-600">Chain ID: {chainId}</p>
          <p className="text-xs text-gray-600">GoalFinance: {contractAddress}</p>
          <p className="text-xs text-gray-600">USDC: {usdcAddress}</p>
        </div>
        
        <div className="bg-gray-50 p-3 rounded">
          <h3 className="font-semibold text-sm text-gray-700">User Info</h3>
          <p className="text-xs text-gray-600">User: {userAddress}</p>
          <p className="text-xs text-gray-600">Contract Owner: {contractOwner}</p>
          <p className="text-xs text-gray-600">Is Owner: {isOwner ? 'Yes' : 'No'}</p>
        </div>
      </div>

      {/* Token Support Status */}
      <div className="bg-gray-50 p-3 rounded mb-4">
        <h3 className="font-semibold text-sm text-gray-700">Token Support</h3>
        <div className="flex items-center gap-2 mt-1">
          <span>{isUSDCSupported ? '✅' : '❌'}</span>
          <span className="text-xs">USDC Supported: {isUSDCSupported ? 'Yes' : 'No'}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={refetchSupport}
          className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 disabled:opacity-50"
          disabled={setupStatus === 'checking' || setupStatus === 'adding'}
        >
          🔄 Refresh Status
        </button>

        {needsSetup && isOwner && (
          <button
            onClick={addUSDCSupport}
            className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 disabled:opacity-50"
            disabled={isAddingUSDC}
          >
            {isAddingUSDC ? '⏳ Adding...' : '➕ Add USDC Support'}
          </button>
        )}
      </div>

      {/* Instructions */}
      {hasError && !isOwner && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
          <h4 className="font-semibold text-red-800 text-sm">Action Required</h4>
          <p className="text-red-700 text-xs mt-1">
            The USDC token is not supported by the contract. Please contact the contract owner to add USDC support.
          </p>
          <p className="text-red-600 text-xs mt-1">
            Contract Owner: <code className="bg-red-100 px-1 rounded">{contractOwner}</code>
          </p>
        </div>
      )}

      {needsSetup && isOwner && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <h4 className="font-semibold text-yellow-800 text-sm">Setup Required</h4>
          <p className="text-yellow-700 text-xs mt-1">
            As the contract owner, you need to add USDC support before users can create vaults.
          </p>
        </div>
      )}

      {isReady && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
          <h4 className="font-semibold text-green-800 text-sm">Ready to Go!</h4>
          <p className="text-green-700 text-xs mt-1">
            USDC is supported and you can now create vaults.
          </p>
        </div>
      )}
    </div>
  );
}
