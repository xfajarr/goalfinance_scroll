import React, { useState } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { useCreateVault } from '../hooks/useCreateVault';
import { GoalType } from '../contracts/types';
import { CONTRACT_ADDRESSES } from '../config/contracts';

export default function TestVaultCreation() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const contractAddresses = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES];

  const [formData, setFormData] = useState({
    vaultName: 'Test Vault',
    description: 'Test vault for Mantle Sepolia',
    targetAmount: '100',
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
    isPublic: true,
  });

  const {
    createVault,
    isLoading,
    error,
    vaultId,
    inviteCode,
    txHash,
    isConfirmed,
  } = useCreateVault();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    if (chainId !== 5003) {
      alert('Please switch to Mantle Sepolia testnet (Chain ID: 5003)');
      return;
    }

    try {
      await createVault({
        vaultName: formData.vaultName,
        description: formData.description,
        targetAmount: formData.targetAmount,
        deadline: new Date(formData.deadline),
        isPublic: formData.isPublic,
        goalType: GoalType.INDIVIDUAL,
      });
    } catch (err) {
      console.error('Failed to create vault:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Test Vault Creation - Mantle Sepolia</h1>
        
        {/* Network Status */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">🌐 Network Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3 rounded">
              <h3 className="font-semibold text-sm text-gray-700">Connection Status</h3>
              <p className="text-xs text-gray-600">
                {isConnected ? '✅ Connected' : '❌ Not Connected'}
              </p>
              <p className="text-xs text-gray-600">User: {address || 'None'}</p>
            </div>
            
            <div className="bg-gray-50 p-3 rounded">
              <h3 className="font-semibold text-sm text-gray-700">Network Info</h3>
              <p className="text-xs text-gray-600">Chain ID: {chainId}</p>
              <p className="text-xs text-gray-600">
                Network: {chainId === 5003 ? '✅ Mantle Sepolia' : '❌ Wrong Network'}
              </p>
            </div>
            
            <div className="bg-gray-50 p-3 rounded">
              <h3 className="font-semibold text-sm text-gray-700">Contract Addresses</h3>
              <p className="text-xs text-gray-600">
                GoalFinance: {contractAddresses?.GOAL_FINANCE || 'Not available'}
              </p>
              <p className="text-xs text-gray-600">
                USDC: {contractAddresses?.USDC || 'Not available'}
              </p>
            </div>
            
            <div className="bg-gray-50 p-3 rounded">
              <h3 className="font-semibold text-sm text-gray-700">Transaction Status</h3>
              <p className="text-xs text-gray-600">
                Loading: {isLoading ? '⏳ Yes' : '✅ No'}
              </p>
              <p className="text-xs text-gray-600">
                Confirmed: {isConfirmed ? '✅ Yes' : '❌ No'}
              </p>
            </div>
          </div>
        </div>

        {/* Transaction Results */}
        {txHash && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-800 mb-2">📝 Transaction Submitted</h3>
            <p className="text-blue-700 text-sm mb-2">
              Hash: <code className="bg-blue-100 px-1 rounded">{txHash}</code>
            </p>
            <a 
              href={`https://sepolia.mantlescan.xyz/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline text-sm"
            >
              🔗 View on Mantle Sepolia Explorer
            </a>
          </div>
        )}

        {isConfirmed && vaultId && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-green-800 mb-2">🎉 Vault Created Successfully!</h3>
            <p className="text-green-700 text-sm">Vault ID: {vaultId.toString()}</p>
            {inviteCode && (
              <p className="text-green-700 text-sm">Invite Code: {inviteCode}</p>
            )}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-red-800 mb-2">❌ Error</h3>
            <p className="text-red-700 text-sm">{error.message}</p>
          </div>
        )}

        {/* Vault Creation Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Create Test Vault</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="vaultName" className="block text-sm font-medium text-gray-700 mb-1">
                Vault Name
              </label>
              <input
                type="text"
                id="vaultName"
                name="vaultName"
                value={formData.vaultName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="targetAmount" className="block text-sm font-medium text-gray-700 mb-1">
                Target Amount (USDC)
              </label>
              <input
                type="number"
                id="targetAmount"
                name="targetAmount"
                value={formData.targetAmount}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-1">
                Deadline
              </label>
              <input
                type="date"
                id="deadline"
                name="deadline"
                value={formData.deadline}
                onChange={handleInputChange}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isPublic"
                name="isPublic"
                checked={formData.isPublic}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-700">
                Make vault public
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading || !isConnected || chainId !== 5003}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '⏳ Creating Vault...' : '🚀 Create Test Vault'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
