import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Navigation from '@/components/Navigation';
import BottomNavigation from '@/components/BottomNavigation';
import { useAccount, useChainId } from 'wagmi';
import { CONTRACT_ADDRESSES } from '@/config/wagmi';
import { 
  TestTube, 
  Zap, 
  Search, 
  UserPlus, 
  Settings, 
  CheckCircle,
  ExternalLink,
  Rocket,
  Code
} from 'lucide-react';

const TestSuite = () => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const contractAddresses = CONTRACT_ADDRESSES[chainId];

  const testPages = [
    {
      title: 'Integration Test',
      description: 'Overall system integration testing',
      path: '/test-integration',
      icon: <TestTube className="h-6 w-6" />,
      color: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
      features: ['Contract config', 'Wallet connection', 'Basic functionality']
    },
    {
      title: 'Invite Codes',
      description: 'Test invite code generation and parsing',
      path: '/test-invite-codes',
      icon: <Zap className="h-6 w-6 text-green-600" />,
      color: 'bg-green-50 border-green-200 hover:bg-green-100',
      features: ['Instant generation', 'Code parsing', 'Performance testing']
    },
    {
      title: 'Find Vault',
      description: 'Test vault discovery functionality',
      path: '/test-find-vault',
      icon: <Search className="h-6 w-6 text-purple-600" />,
      color: 'bg-purple-50 border-purple-200 hover:bg-purple-100',
      features: ['Direct lookup', 'Invite validation', 'Vault preview']
    },
    {
      title: 'Join Vault',
      description: 'Test complete vault joining flow',
      path: '/test-join-vault',
      icon: <UserPlus className="h-6 w-6 text-orange-600" />,
      color: 'bg-orange-50 border-orange-200 hover:bg-orange-100',
      features: ['Code validation', 'Vault joining', 'Personal goals']
    },
    {
      title: 'Add Funds',
      description: 'Test USDC approval and vault contribution',
      path: '/test-add-funds',
      icon: <DollarSign className="h-6 w-6 text-emerald-600" />,
      color: 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100',
      features: ['USDC approval', 'Vault contribution', 'Two-step process']
    }
  ];

  const mainPages = [
    {
      title: 'Dashboard',
      description: 'Main user dashboard',
      path: '/dashboard',
      icon: <Settings className="h-5 w-5" />
    },
    {
      title: 'Create Vault',
      description: 'Create new savings vault',
      path: '/create',
      icon: <Rocket className="h-5 w-5" />
    }
  ];

  return (
    <div className="min-h-screen bg-goal-bg pb-32 md:pb-0">
      <Navigation />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-fredoka font-bold text-goal-text mb-4">
            🧪 GoalFi Test Suite
          </h1>
          <p className="text-goal-text/80 text-lg mb-6">
            Comprehensive testing environment for the new offchain invite code system
          </p>
          
          {/* Status Cards */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4 text-center">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <h3 className="font-semibold text-green-800">Contract Deployed</h3>
                <p className="text-sm text-green-600">Factory: {contractAddresses?.VAULT_FACTORY?.slice(0, 10)}...</p>
              </CardContent>
            </Card>
            
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4 text-center">
                <Code className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <h3 className="font-semibold text-blue-800">Frontend Updated</h3>
                <p className="text-sm text-blue-600">All hooks and components integrated</p>
              </CardContent>
            </Card>
            
            <Card className={isConnected ? "bg-green-50 border-green-200" : "bg-orange-50 border-orange-200"}>
              <CardContent className="p-4 text-center">
                <div className={`h-8 w-8 mx-auto mb-2 rounded-full flex items-center justify-center ${
                  isConnected ? 'bg-green-600' : 'bg-orange-600'
                }`}>
                  <span className="text-white text-sm font-bold">
                    {isConnected ? '✓' : '!'}
                  </span>
                </div>
                <h3 className={`font-semibold ${isConnected ? 'text-green-800' : 'text-orange-800'}`}>
                  Wallet {isConnected ? 'Connected' : 'Disconnected'}
                </h3>
                <p className={`text-sm ${isConnected ? 'text-green-600' : 'text-orange-600'}`}>
                  {isConnected ? address?.slice(0, 10) + '...' : 'Connect to test'}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Test Pages */}
        <div className="mb-8">
          <h2 className="text-2xl font-fredoka font-bold text-goal-text mb-6 text-center">
            🧪 Test Pages
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {testPages.map((page, index) => (
              <Card key={index} className={`${page.color} transition-all duration-200 hover:shadow-lg`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    {page.icon}
                    {page.title}
                  </CardTitle>
                  <CardDescription className="text-gray-700">
                    {page.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {page.features.map((feature, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                    
                    <Link to={page.path}>
                      <Button className="w-full" variant="outline">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open Test Page
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Main Application Pages */}
        <div className="mb-8">
          <h2 className="text-2xl font-fredoka font-bold text-goal-text mb-6 text-center">
            🚀 Main Application
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {mainPages.map((page, index) => (
              <Card key={index} className="bg-white/60 backdrop-blur-sm border-goal-border/30 hover:shadow-lg transition-all duration-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    {page.icon}
                    {page.title}
                  </CardTitle>
                  <CardDescription>
                    {page.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link to={page.path}>
                    <Button className="w-full bg-goal-primary hover:bg-goal-primary/90 text-white">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open {page.title}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Contract Information */}
        <Card className="bg-gray-50 border-gray-200">
          <CardHeader>
            <CardTitle>📋 Contract Information</CardTitle>
            <CardDescription>
              Current deployment details for Mantle Sepolia
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">GoalVaultFactory (NEW)</h4>
                <p className="font-mono text-xs break-all mb-2">
                  {contractAddresses?.VAULT_FACTORY}
                </p>
                <a 
                  href={`https://sepolia.mantlescan.xyz/address/${contractAddresses?.VAULT_FACTORY}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-xs"
                >
                  View on Explorer ↗
                </a>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">MockUSDC (Preserved)</h4>
                <p className="font-mono text-xs break-all mb-2">
                  {contractAddresses?.USDC}
                </p>
                <a 
                  href={`https://sepolia.mantlescan.xyz/address/${contractAddresses?.USDC}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-xs"
                >
                  View on Explorer ↗
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>📖 Testing Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">🔗 1. Connect Wallet</h4>
                <p>Connect your MetaMask wallet to Mantle Sepolia testnet to test all functionality.</p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">🧪 2. Run Tests</h4>
                <p>Visit each test page to verify different aspects of the system work correctly.</p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">🚀 3. Try Main App</h4>
                <p>Use the dashboard and create vault pages to test the real user experience.</p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">⚡ 4. Test Performance</h4>
                <p>Notice how invite code generation is now instant (vs 2-15 seconds before)!</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default TestSuite;
