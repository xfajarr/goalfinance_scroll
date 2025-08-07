import React from 'react';
import { UnifiedDashboardMock } from '@/components/dashboard/UnifiedDashboardMock';

/**
 * AcornsDemo Page
 * 
 * Demonstrates the complete Acorns micro-investing experience with mock data.
 * This page showcases:
 * - Unified dashboard with goal savings + Acorns portfolio
 * - Purchase tracking with round-up calculation
 * - Portfolio management (Conservative/Moderate/Aggressive)
 * - Recurring investment setup
 * - Yield generation and claiming
 * - Multi-token support
 * - Complete user flow from registration to investment
 */
const AcornsDemo: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">🌰</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">GoalPay Acorns Demo</h1>
                <p className="text-sm text-gray-600">Micro-investing with mock data</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                Demo Mode
              </div>
              <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                Mock Data
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Features Banner */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="text-center">
            <h2 className="text-lg font-semibold mb-2">🚀 Acorns Features Demo</h2>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <span className="flex items-center gap-1">
                ✅ Round-up Transactions
              </span>
              <span className="flex items-center gap-1">
                ✅ Micro-investing
              </span>
              <span className="flex items-center gap-1">
                ✅ Portfolio Management
              </span>
              <span className="flex items-center gap-1">
                ✅ Recurring Investments
              </span>
              <span className="flex items-center gap-1">
                ✅ Yield Generation
              </span>
              <span className="flex items-center gap-1">
                ✅ Multi-token Support
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">🎮 How to Use This Demo</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-blue-800">
            <div>
              <h4 className="font-medium mb-1">1. Track Purchases</h4>
              <p>Click "Track Purchase" to simulate spending and see round-ups calculated automatically</p>
            </div>
            <div>
              <h4 className="font-medium mb-1">2. Invest Round-ups</h4>
              <p>Watch spare change accumulate and invest it with one click into your portfolio</p>
            </div>
            <div>
              <h4 className="font-medium mb-1">3. Manage Portfolio</h4>
              <p>Switch between Conservative (4%), Moderate (6%), and Aggressive (8%) portfolios</p>
            </div>
            <div>
              <h4 className="font-medium mb-1">4. Set Recurring</h4>
              <p>Configure automatic weekly or monthly investments to grow consistently</p>
            </div>
            <div>
              <h4 className="font-medium mb-1">5. Claim Yields</h4>
              <p>See your investments grow with compound interest and claim earnings</p>
            </div>
            <div>
              <h4 className="font-medium mb-1">6. View History</h4>
              <p>Track all purchases, round-ups, and investment activity in detailed history</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Demo Content */}
      <UnifiedDashboardMock />

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              🌰 Ready to Deploy Acorns Features?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Smart Contracts</h4>
                <ul className="text-gray-600 space-y-1">
                  <li>✅ AcornsVault.sol</li>
                  <li>✅ MockMorpho.sol</li>
                  <li>✅ Multi-token support</li>
                  <li>✅ Comprehensive tests</li>
                </ul>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Frontend Components</h4>
                <ul className="text-gray-600 space-y-1">
                  <li>✅ Unified Dashboard</li>
                  <li>✅ Purchase Tracker</li>
                  <li>✅ Portfolio Settings</li>
                  <li>✅ React Hooks</li>
                </ul>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Integration Ready</h4>
                <ul className="text-gray-600 space-y-1">
                  <li>✅ Wagmi integration</li>
                  <li>✅ TypeScript support</li>
                  <li>✅ Error handling</li>
                  <li>✅ Production ready</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-medium">
                🚀 This demo shows the complete Acorns experience with mock data. 
                Switch to real smart contract integration by replacing useAcornsMock with useAcorns hook!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcornsDemo;
