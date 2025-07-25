import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { parseUnits } from 'viem';

import BottomNavigation from '@/components/BottomNavigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Calendar, DollarSign, Users, Lock, Share2, TrendingUp, Sparkles, Target } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCreateVault, getGoalTypeFromString } from '@/hooks/useCreateVault';
import { GoalType } from '@/contracts/types';
import { useWalletGuard } from '@/hooks/useWalletGuard';
import { CONTRACT_ADDRESSES, NATIVE_TOKEN } from '@/config/contracts';
import { useChainId } from 'wagmi';
import { WalletGuardDialog } from '@/components/WalletGuardDialog';
import { toast } from '@/components/ui/sonner';

const CreateVault = () => {
  const navigate = useNavigate();
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const {
    createVault,
    isLoading,
    isConfirming,
    isSuccess,
    error,
    txHash,
    vaultId,
    inviteCode,
    reset
  } = useCreateVault();

  // Wallet guard for protecting goal creation
  const { requireWalletConnection, showConnectDialog, setShowConnectDialog } = useWalletGuard();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    goal: '',
    deadline: '',
    isPublic: false, // Always private by default
    category: 'other',
    goalType: 'group', // Changed from apyTier to goalType
    tokenType: 'usdc' // 'usdc' or 'native'
  });
  const [goalCreated, setGoalCreated] = useState(false);
  const [shareLink, setShareLink] = useState('');

  // Watch for successful goal creation
  useEffect(() => {
    console.log('🔍 Success state check:', { isSuccess, vaultId, txHash, inviteCode });

    if (isSuccess && txHash) {
      // Show immediate success notification even if goal ID is not yet available
      if (!goalCreated) {
        console.log('🎉 Transaction confirmed! Setting up success state...');

        // Set goal created state immediately
        setGoalCreated(true);

        // Generate share link (use goal ID if available, otherwise use transaction hash)
        const link = vaultId
          ? `${window.location.origin}/join/${vaultId}`
          : `${window.location.origin}/join/tx/${txHash}`;
        setShareLink(link);

        // Show success toast with transaction info
        toast('🎉 Goal Created Successfully!', {
          description: (
            <div className="space-y-3">
              <p className="font-semibold text-green-800">Your goal has been created and is ready to use!</p>
              {vaultId && (
                <div className="text-sm text-gray-600">
                  <strong>Vault ID:</strong> {vaultId.toString()}
                </div>
              )}
              {inviteCode && (
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <div className="text-sm font-medium text-blue-800 mb-1">
                    🎫 Invite Code (Share with friends):
                  </div>
                  <div className="font-mono text-xs text-blue-900 bg-white p-2 rounded border break-all">
                    {inviteCode}
                  </div>
                  <div className="text-xs text-blue-600 mt-1">
                    💡 Friends can use this code to join your goal!
                  </div>
                </div>
              )}
              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <div className="text-sm font-medium text-green-800 mb-1">
                  ✅ Transaction Confirmed:
                </div>
                <a
                  href={`https://sepolia.mantlescan.xyz/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline text-sm font-mono"
                >
                  {txHash.slice(0, 10)}...{txHash.slice(-8)}
                </a>
              </div>
            </div>
          ),
          duration: 15000, // Longer duration to read all info
        });

        // Trigger confetti animation
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE', '#10B981', '#34D399']
        });

        // Additional confetti burst after a short delay
        setTimeout(() => {
          confetti({
            particleCount: 100,
            spread: 50,
            origin: { y: 0.7 },
            colors: ['#F59E0B', '#FBBF24', '#FCD34D']
          });
        }, 500);
      }
    }
  }, [isSuccess, vaultId, txHash, inviteCode, goalCreated]);

  // Watch for errors and display them
  useEffect(() => {
    if (error) {
      console.error('❌ Goal creation error:', error);
      toast('❌ Goal Creation Failed', {
        description: (
          <div className="space-y-2">
            <p className="font-medium">Failed to create goal</p>
            <p className="text-sm text-gray-600">{error.message}</p>
            <p className="text-xs text-gray-500">Please check your wallet connection and try again.</p>
          </div>
        ),
        duration: 8000,
      });
    }
  }, [error]);

  // Debug logging for state changes
  useEffect(() => {
    console.log('🔍 CreateGoal state update:', {
      isLoading,
      isConfirming,
      isSuccess,
      goalCreated,
      txHash: txHash ? `${txHash.slice(0, 10)}...` : null,
      vaultId: vaultId?.toString(),
      inviteCode: inviteCode ? `${inviteCode.slice(0, 10)}...` : null,
      error: error?.message
    });
  }, [isLoading, isConfirming, isSuccess, goalCreated, txHash, vaultId, inviteCode, error]);

  const categories = [
    { value: 'travel', label: 'Travel & Adventure', emoji: '✈️' },
    { value: 'electronics', label: 'Electronics & Gadgets', emoji: '📱' },
    { value: 'housing', label: 'Housing & Real Estate', emoji: '🏠' },
    { value: 'education', label: 'Education & Learning', emoji: '📚' },
    { value: 'emergency', label: 'Emergency Fund', emoji: '🚨' },
    { value: 'vehicle', label: 'Vehicle & Transportation', emoji: '🚗' },
    { value: 'health', label: 'Health & Wellness', emoji: '💪' },
    { value: 'other', label: 'Other', emoji: '🎯' }
  ];

  const goalTypes = [
    {
      id: 'group',
      name: 'Group Goal',
      description: 'Save together with friends or family',
      emoji: '👥',
      color: 'border-purple-200 hover:border-purple-300 hover:bg-purple-50/30',
      examples: 'Group dinner, vacation, events'
    },
    {
      id: 'personal',
      name: 'Personal Goal',
      description: 'Save for your individual goals',
      emoji: '🎯',
      color: 'border-blue-200 hover:border-blue-300 hover:bg-blue-50/30',
      examples: 'New laptop, solo trip, hobby'
    }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Use wallet guard to check connection and show dialog if needed
    requireWalletConnection(async () => {
      await performGoalCreation();
    });
  };

  const performGoalCreation = async () => {
    try {
      const deadlineDate = new Date(formData.deadline);
      const goalType = getGoalTypeFromString(formData.goalType);

      // For GROUP goals, target amount is required. For PERSONAL goals, it can be optional
      if (goalType === GoalType.GROUP && (!formData.goal || parseFloat(formData.goal) <= 0)) {
        throw new Error('Target amount is required for group goals');
      }

      if (deadlineDate <= new Date()) {
        throw new Error('Deadline must be in the future');
      }

      // Determine token based on selection
      const contractAddresses = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES];
      const token = formData.tokenType === 'native'
        ? NATIVE_TOKEN
        : contractAddresses?.USDC;

      // Validate token address is available
      if (!token) {
        throw new Error(`${formData.tokenType === 'native' ? 'Native token' : 'USDC'} is not supported on this chain`);
      }

      console.log('🚀 Starting goal creation with params:', {
        goalName: formData.name,
        description: formData.description,
        targetAmount: formData.goal || '0',
        deadline: deadlineDate,
        isPublic: formData.isPublic,
        goalType: goalType,
        token: token,
        penaltyRate: 2
      });

      // Show immediate feedback that transaction is being processed
      // toast('🚀 Creating Your Goal...', {
      //   description: 'Please confirm the transaction in your wallet and wait for confirmation.',
      //   duration: 5000,
      // });

      await createVault({
        vaultName: formData.name,
        description: formData.description,
        targetAmount: formData.goal || '0',
        deadline: deadlineDate,
        isPublic: formData.isPublic,
        goalType: goalType,
        token: token,
        penaltyRate: 2 // Default 2% penalty rate
      });

      console.log('✅ Goal creation transaction submitted successfully!');

    } catch (error) {
      console.error('Failed to create goal:', error);

      // Show error toast
      toast('❌ Goal Creation Failed', {
        description: error instanceof Error ? error.message : 'Failed to create goal. Please try again.',
        duration: 8000,
      });
    }
  };

  if (goalCreated) {
    
    return (
      <div className="min-h-screen bg-goal-bg pb-20 md:pb-0">
        
        <main className="container-narrow py-8">
          <Card className="bg-white/60 backdrop-blur-sm border-goal-border/30 p-section rounded-3xl text-center">
            <div className="w-20 h-20 bg-goal-primary rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-10 h-10 text-goal-heading" />
            </div>

            <h1 className="text-2xl md:text-3xl font-fredoka font-bold text-goal-heading mb-4">
              🎉 Goal Created Successfully!
            </h1>

            <p className="font-inter text-base md:text-lg text-goal-text-secondary mb-6 leading-relaxed">
              Your "{formData.name}" goal is ready! Start inviting friends to save together.
            </p>

            {/* Goal Details */}
            <div className="bg-goal-accent/10 p-4 rounded-2xl mb-6 text-left">
              <h3 className="font-fredoka font-bold text-goal-text mb-3">📊 Goal Details</h3>
              <div className="space-y-2 text-sm">
                {vaultId && (
                  <div className="flex justify-between">
                    <span className="text-goal-text/70">Goal ID:</span>
                    <span className="font-mono font-semibold text-goal-text">{vaultId.toString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-goal-text/70">Goal Amount:</span>
                  <span className="font-semibold text-goal-text">${formData.goal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-goal-text/70">Token:</span>
                  <span className="font-semibold text-goal-text">
                    {formData.tokenType === 'native' ? 'MNT' : 'USDC'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-goal-text/70">Privacy:</span>
                  <span className="font-semibold text-goal-text">
                    {formData.isPublic ? 'Public' : 'Private'}
                  </span>
                </div>
                {txHash && (
                  <div className="pt-2 border-t border-goal-border/20">
                    <span className="text-goal-text/70 text-xs">Transaction:</span>
                    <a
                      href={`https://sepolia.mantlescan.xyz/tx/${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-blue-600 hover:text-blue-800 underline text-xs font-mono mt-1"
                    >
                      {txHash.slice(0, 20)}...{txHash.slice(-20)}
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-goal-accent/20 p-4 rounded-2xl mb-6">
              <p className="font-inter text-sm font-semibold text-goal-text mb-2">Share Link:</p>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={shareLink}
                  readOnly
                  className="flex-1 px-3 py-2 bg-white/70 border border-goal-border/50 rounded-2xl font-mono text-sm text-goal-text"
                />
                <Button
                  onClick={async () => {
                    await navigator.clipboard.writeText(shareLink);
                    toast('✅ Copied!', {
                      description: 'Share link copied to clipboard.',
                      duration: 3000,
                    });
                  }}
                  size="sm"
                  className="bg-goal-primary hover:bg-goal-primary/90 text-white rounded-2xl px-3 font-semibold"
                >
                  <Share2 className="w-4 h-4 mr-1" />
                  Copy
                </Button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => {
                  if (vaultId) {
                    navigate(`/goal/${vaultId}`);
                  } else {
                    navigate('/dashboard');
                  }
                }}
                className="flex-1 bg-goal-primary hover:bg-goal-primary/90 text-goal-text font-fredoka font-semibold rounded-2xl px-6 py-3"
              >
                View My Goal
              </Button>
              <Button
                onClick={() => navigate('/dashboard')}
                variant="outline"
                className="flex-1 border-goal-border text-goal-text hover:bg-goal-accent rounded-2xl px-6 py-3"
              >
                View Dashboard
              </Button>
              <Button
                onClick={() => {
                  setGoalCreated(false);
                  setFormData({
                    name: '',
                    description: '',
                    goal: '',
                    deadline: '',
                    isPublic: false,
                    category: 'other',
                    goalType: 'group',
                    tokenType: 'usdc'
                  });
                  reset(); // Reset the contract hook state
                }}
                variant="outline"
                className="flex-1 border-goal-border text-goal-text hover:bg-goal-accent rounded-2xl px-6 py-3"
              >
                Create Another
              </Button>
            </div>
          </Card>
        </main>

        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-goal-bg pb-32 md:pb-0">

      <main className="container-narrow py-8">
        <Link
          to="/dashboard"
          className="inline-flex items-center space-x-2 text-goal-text-primary hover:text-goal-heading transition-colors mb-6 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-inter">Back to Dashboard</span>
        </Link>

        {/* Kawaii Header Section */}
        <div className="text-center space-component mb-8">
         

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-fredoka font-bold text-goal-text leading-tight mb-4">
            Create Your Dream Goal
          </h1>
          <p className="font-inter text-base md:text-lg text-goal-text/70 max-w-2xl mx-auto leading-relaxed">
            Turn your dreams into reality! Set your goal, invite friends, and watch your savings grow together
          </p>

          {/* Progress Steps Indicator */}
          <div className="flex items-center justify-center space-x-2 mt-6">
            <div className="flex items-center space-x-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full border border-goal-border/30">
              <div className="w-2 h-2 bg-goal-primary rounded-full"></div>
              <span className="font-inter text-xs text-goal-text font-medium">Step 1: Create</span>
              <ArrowRight className="w-3 h-3 text-goal-text/50" />
              <div className="w-2 h-2 bg-goal-text/30 rounded-full"></div>
              <span className="font-inter text-xs text-goal-text/50">Step 2: Share</span>
              <ArrowRight className="w-3 h-3 text-goal-text/50" />
              <div className="w-2 h-2 bg-goal-text/30 rounded-full"></div>
              <span className="font-inter text-xs text-goal-text/50">Step 3: Save</span>
            </div>
          </div>
        </div>

        <Card className="bg-white/70 backdrop-blur-sm border-goal-border/20 p-8 rounded-3xl shadow-xl relative overflow-hidden">
          {/* Cute background decorations */}

          <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
            {/* Goal Name */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-goal-primary rounded-full flex items-center justify-center">
                  <span className="text-goal-text text-xs font-bold">1</span>
                </div>
                <label htmlFor="name" className="font-fredoka font-bold text-goal-text text-lg">
                  What's your dream called?
                </label>
              </div>
              <div className="relative group">
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Summer Vacation Fund 🏖️"
                  className="w-full px-6 py-4 bg-white/80 border-2 border-goal-border/30 rounded-2xl font-inter text-goal-text placeholder-goal-text/50 focus:outline-none focus:ring-2 focus:ring-goal-primary/50 focus:border-goal-primary/50 transition-all duration-200 hover:shadow-sm"
                />

              </div>
              <p className="font-inter text-xs text-goal-text/60 ml-8">
                Give your goal a fun, memorable name that inspires you!
              </p>
            </div>

            {/* Description */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-goal-primary rounded-full flex items-center justify-center">
                  <span className="text-goal-text text-xs font-bold">2</span>
                </div>
                <label htmlFor="description" className="font-fredoka font-bold text-goal-text text-lg">
                  Tell your story!
                </label>
              </div>
              <div className="relative group">
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Share what makes this goal special to you..."
                  className="w-full px-6 py-4 bg-white/80 border-2 border-goal-border/30 rounded-2xl font-inter text-goal-text placeholder-goal-text/50 focus:outline-none focus:ring-2 focus:ring-goal-primary/50 focus:border-goal-primary/50 transition-all duration-200 hover:shadow-sm resize-none"
                />

              </div>
              <p className="font-inter text-xs text-goal-text/60 ml-8">
                A compelling story helps others connect with your goal!
              </p>
            </div>

            {/* Goal Amount and Deadline */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-6 h-6 bg-goal-primary rounded-full flex items-center justify-center">
                  <span className="text-goal-text text-xs font-bold">3</span>
                </div>
                <h3 className="font-fredoka font-bold text-goal-text text-lg">
                  Set your targets!
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label htmlFor="goal" className="font-fredoka font-semibold text-goal-text flex items-center">
                    <DollarSign className="w-4 h-4 mr-1 text-green-500" />
                    {formData.goalType === 'group' ? 'Group' : 'Personal'} Goal Amount* 
                  </label>
                  {formData.goalType === 'personal' && (
                    <div className="bg-blue-50/80 border border-blue-200/50 rounded-xl p-3">
                      <p className="text-xs text-blue-700 font-inter">
                        Personal goals can be flexible! Set a target or leave it open-ended.
                      </p>
                    </div>
                  )}
                  <div className="relative group">
                    <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                    <input
                      id="goal"
                      name="goal"
                      type="number"
                      required={formData.goalType === 'group'}
                      min="1"
                      value={formData.goal}
                      onChange={handleInputChange}
                      placeholder={formData.goalType === 'group' ? "5000" : "Optional target amount"}
                      className="w-full pl-12 pr-6 py-4 bg-white/80 border-2 border-goal-border/30 rounded-2xl font-inter text-goal-text placeholder-goal-text/50 focus:outline-none focus:ring-2 focus:ring-goal-primary/50 focus:border-goal-primary/50 transition-all duration-200 hover:shadow-sm"
                    />
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-goal-text/30">
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label htmlFor="deadline" className="font-fredoka font-semibold text-goal-text flex items-center">
                    <Calendar className="w-4 h-4 mr-1 text-purple-500" />
                    Deadline*
                  </label>
                  <div className="relative group">
                    <input
                      id="deadline"
                      name="deadline"
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={formData.deadline}
                      onChange={handleInputChange}
                      className="w-full px-6 py-4 bg-white/80 border-2 border-goal-border/30 rounded-2xl font-inter text-goal-text focus:outline-none focus:ring-2 focus:ring-goal-primary/50 focus:border-goal-primary/50 transition-all duration-200 hover:shadow-sm"
                    />
                  </div>
                  <p className="font-inter text-xs text-goal-text/60">
                    When do you want to achieve this goal?
                  </p>
                </div>
              </div>
            </div>





            {/* Category - Kawaii Design */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-goal-primary rounded-full flex items-center justify-center">
                  <span className="text-goal-text text-xs font-bold">4</span>
                </div>
                <label htmlFor="category" className="font-fredoka font-bold text-goal-text text-lg">
                  Pick your vibe!
                </label>
              </div>
              <div className="relative group">
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-6 py-4 bg-white/80 border-2 border-goal-border/30 rounded-2xl font-inter text-goal-text focus:outline-none focus:ring-2 focus:ring-goal-primary/50 focus:border-goal-primary/50 transition-all duration-200 hover:shadow-sm appearance-none cursor-pointer"
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.emoji} {cat.label}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-goal-text/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
              <p className="font-inter text-xs text-goal-text/60 ml-8">
                Choose a category that matches your goal's personality!
              </p>
            </div>

            {/* Goal Type Selection - Compact Design */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-goal-primary rounded-full flex items-center justify-center">
                  <span className="text-goal-text text-xs font-bold">5</span>
                </div>
                <label className="font-fredoka font-bold text-goal-text text-lg">
                  Choose your Goal type
                </label>
              </div>

              {/* Compact Goal Type Selection */}
              <div className="grid grid-cols-2 gap-3">
                {goalTypes.map((type) => (
                  <div
                    key={type.id}
                    className={`relative cursor-pointer transition-all duration-200 ${
                      formData.goalType === type.id
                        ? 'bg-goal-primary/15 border-goal-primary ring-2 ring-goal-primary/20'
                        : 'bg-white/70 border-goal-border/40 hover:border-goal-primary/60 hover:bg-goal-primary/5'
                    } border-2 rounded-xl p-3 group`}
                    onClick={() => setFormData(prev => ({ ...prev, goalType: type.id }))}
                  >
                    {/* Selection indicator */}
                    <div className={`absolute top-2 right-2 w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                      formData.goalType === type.id
                        ? 'bg-goal-primary border-goal-primary'
                        : 'border-goal-border/50 group-hover:border-goal-primary/60'
                    }`}>
                      {formData.goalType === type.id && (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-start space-x-2">
                      <div className="text-xl mt-0.5">
                        {type.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-fredoka font-bold text-goal-heading text-sm mb-1">
                          {type.name}
                        </h3>
                        <p className="font-inter text-xs text-goal-text-secondary leading-tight">
                          {type.description}
                        </p>
                        <p className="font-inter text-xs text-goal-text-muted mt-1">
                          <span className="font-medium">e.g.</span> {type.examples}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Token Type Selection */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-goal-primary rounded-full flex items-center justify-center">
                  <span className="text-goal-text text-xs font-bold">6</span>
                </div>
                <label className="font-fredoka font-bold text-goal-text text-lg">
                  Token Type
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* USDC Option */}
                <div
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    formData.tokenType === 'usdc'
                      ? 'bg-goal-primary/10 border-goal-primary'
                      : 'bg-goal-soft/60 border-goal-border/30 hover:border-goal-primary/50'
                  }`}
                  onClick={() => setFormData(prev => ({ ...prev, tokenType: 'usdc' }))}
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 flex items-center justify-center">
                      <img src="/usdc-logo.svg" alt="USDC" className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-fredoka font-bold text-goal-heading text-sm mb-1">
                        USDC
                      </h3>
                      <p className="font-inter text-xs text-goal-text-secondary leading-tight">
                        Stable USD coin - Perfect for savings goals
                      </p>
                    </div>
                    {formData.tokenType === 'usdc' && (
                      <div className="w-5 h-5 bg-goal-primary rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* MNT Option */}
                <div
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    formData.tokenType === 'native'
                      ? 'bg-goal-primary/10 border-goal-primary'
                      : 'bg-goal-soft/60 border-goal-border/30 hover:border-goal-primary/50'
                  }`}
                  onClick={() => setFormData(prev => ({ ...prev, tokenType: 'native' }))}
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 flex items-center justify-center">
                      <img src="/mantle-mnt-logo.svg" alt="MNT" className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-fredoka font-bold text-goal-heading text-sm mb-1">
                        MNT
                      </h3>
                      <p className="font-inter text-xs text-goal-text-secondary leading-tight">
                        Native Mantle token - Gas-efficient deposits
                      </p>
                    </div>
                    {formData.tokenType === 'native' && (
                      <div className="w-5 h-5 bg-goal-primary rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Privacy Setting - Hidden for now, defaults to private */}
            {/*
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-goal-primary rounded-full flex items-center justify-center">
                  <span className="text-goal-text text-xs font-bold">6</span>
                </div>
                <h3 className="font-fredoka font-bold text-goal-text text-lg">
                  Privacy settings
                </h3>
              </div>

              <div className="bg-goal-soft/60 border-2 border-goal-border/30 p-6 rounded-2xl relative overflow-hidden">
                <div className="absolute top-3 right-3 text-sm opacity-10">✨</div>

                <div className="flex items-start space-x-4">
                  <div className="relative">
                    <input
                      id="isPublic"
                      name="isPublic"
                      type="checkbox"
                      checked={formData.isPublic}
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                    <label
                      htmlFor="isPublic"
                      className={`flex items-center justify-center w-12 h-6 rounded-full cursor-pointer transition-all duration-300 ${
                        formData.isPublic
                          ? 'bg-goal-primary'
                          : 'bg-gray-300'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                        formData.isPublic ? 'translate-x-3' : '-translate-x-3'
                      }`}>
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-xs">
                            {formData.isPublic ? '🌍' : '🔒'}
                          </span>
                        </div>
                      </div>
                    </label>
                  </div>

                  <div className="flex-1">
                    <label htmlFor="isPublic" className="flex items-center font-fredoka font-bold text-goal-text mb-2 cursor-pointer">
                      {formData.isPublic ? (
                        <>
                          <Globe className="w-5 h-5 mr-2 text-blue-500" />
                          Public Goal - Everyone can join!
                        </>
                      ) : (
                        <>
                          <Lock className="w-5 h-5 mr-2 text-gray-500" />
                          Private Goal - Invite only
                        </>
                      )}
                    </label>
                    <p className="font-inter text-sm text-goal-text/70 leading-relaxed">
                      {formData.isPublic
                        ? "Your goal will appear in the community page for others to discover and join!"
                        : "Only people with your special invite link can join your goal."
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
            */}

            {/* Cute Error Display */}
            {error && (
              <div className="bg-red-50/80 border-2 border-red-200/50 rounded-2xl p-5 relative overflow-hidden">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-red-400 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm">!</span>
                  </div>
                  <div>
                    <p className="font-fredoka font-bold text-red-700 mb-1">Oops! Something went wrong</p>
                    <p className="font-inter text-sm text-red-600">
                      {error.message}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Cute Transaction Status */}
            {txHash && (
              <div className="bg-goal-soft/60 border-2 border-goal-border/30 rounded-2xl p-5 relative overflow-hidden">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm">📝</span>
                  </div>
                  <div>
                    <p className="font-fredoka font-bold text-blue-700 mb-2">
                      Transaction submitted!
                    </p>
                    <p className="text-xs text-blue-500 font-mono break-all bg-white/60 p-2 rounded-lg">
                      {txHash}
                    </p>
                    {isConfirming && (
                      <p className="font-inter text-sm text-blue-600 mt-2 flex items-center">
                        <span className="animate-spin mr-2">⏳</span>
                        Waiting for confirmation...
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-6">
              <Button
                type="submit"
                disabled={isLoading || isConfirming || !isConnected}
                className="w-full h-14 bg-goal-primary hover:bg-goal-primary/90 text-goal-text font-fredoka font-bold text-lg rounded-2xl transition-all duration-200 hover:shadow-md disabled:hover:shadow-none shadow-sm disabled:opacity-50 relative overflow-hidden"
              >
                <div className="relative">
                  {!isConnected ? (
                    <div className="flex items-center justify-center">
                      <Lock className="w-5 h-5 mr-2" />
                      Connect Wallet First
                    </div>
                  ) : isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-goal-text/30 border-t-goal-text rounded-full animate-spin"></div>
                      <span>Creating your goal...</span>
                    </div>
                  ) : isConfirming ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-goal-text/30 border-t-goal-text rounded-full animate-spin"></div>
                      <span>Almost there...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <Sparkles className="w-5 h-5 mr-2" />
                      Create My Dream Goal!
                    </div>
                  )}
                </div>
              </Button>
            </div>
          </form>
        </Card>

        {/* Cute Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <Card className="bg-goal-soft/60 backdrop-blur-sm border-2 border-goal-border/30 p-6 rounded-2xl relative overflow-hidden">
            <div className="absolute top-2 right-2 text-lg opacity-20 animate-bounce">🎉</div>
            <div className="flex items-start space-x-4">
              <div className="w-14 h-14 bg-goal-primary rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm">
                <Users className="w-7 h-7 text-goal-text" />
              </div>
              <div>
                <h3 className="font-fredoka font-bold text-goal-text mb-2 text-lg">
                  Ready to invite friends?
                </h3>
                <p className="font-inter text-goal-text/70 text-sm leading-relaxed">
                  After creating your goal, you'll get a magical shareable link!
                  Invite friends and family to join your savings adventure!
                </p>
              </div>
            </div>
          </Card>

          <Card className="bg-goal-soft/60 backdrop-blur-sm border-2 border-goal-border/30 p-6 rounded-2xl relative overflow-hidden">
            <div className="absolute top-2 right-2 opacity-20 animate-pulse">
              <DollarSign className="w-5 h-5 text-goal-text" />
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-14 h-14 bg-goal-accent rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm">
                <TrendingUp className="w-7 h-7 text-goal-text" />
              </div>
              <div>
                <h3 className="font-fredoka font-bold text-goal-text mb-2 text-lg">
                  Watch your savings grow!
                </h3>
                <p className="font-inter text-goal-text/70 text-sm leading-relaxed">
                  Your goal will earn yield while you save! Track progress together
                  and celebrate milestones as a team!
                </p>
              </div>
            </div>
          </Card>
        </div>
      </main>

      <BottomNavigation />

      {/* Wallet Guard Dialog */}
      <WalletGuardDialog
        isOpen={showConnectDialog}
        onOpenChange={setShowConnectDialog}
        title="Connect Wallet to Create Goal"
        description="You need to connect your wallet to create a savings goal. Connect now to start building your financial goals!"
        actionText="Create Goal"
      />
    </div>
  );
};

export default CreateVault;