import React, { useState } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { CONTRACT_ADDRESSES } from '../config/contracts';

export default function VaultCreationV2() {
  const { address: userAddress } = useAccount();
  const chainId = useChainId();
  const contractAddresses = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES];

  const [formData, setFormData] = useState({
    vaultName: '',
    description: '',
    targetAmount: '',
    deadline: '',
    isPublic: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    alert('Form submitted! This is a simplified test version.');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Create Vault V2 (Simplified Test)</h1>

        {/* Debug Info */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">🔧 Debug Info</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3 rounded">
              <h3 className="font-semibold text-sm text-gray-700">Chain Info</h3>
              <p className="text-xs text-gray-600">Chain ID: {chainId}</p>
              <p className="text-xs text-gray-600">GoalFinance: {contractAddresses?.GOAL_FINANCE}</p>
              <p className="text-xs text-gray-600">USDC: {contractAddresses?.USDC}</p>
            </div>

            <div className="bg-gray-50 p-3 rounded">
              <h3 className="font-semibold text-sm text-gray-700">User Info</h3>
              <p className="text-xs text-gray-600">User: {userAddress || 'Not connected'}</p>
            </div>
          </div>
        </div>

        {/* Vault Creation Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Create New Vault (Test Form)</h2>

          {/* Form */}
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
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter vault name"
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
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter vault description"
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
                step="0.01"
                min="0.01"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="100.00"
                required
              />
            </div>

            <div>
              <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-1">
                Deadline
              </label>
              <input
                type="datetime-local"
                id="deadline"
                name="deadline"
                value={formData.deadline}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              🚀 Test Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
