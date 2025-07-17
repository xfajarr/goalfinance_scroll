import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import BottomNavigation from '@/components/BottomNavigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Calendar, DollarSign, Users, Lock, Globe, Share2, TrendingUp, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

const CreateVault = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    goal: '',
    deadline: '',
    isPublic: false,
    category: 'other',
    apyTier: 'medium'
  });
  const [isCreating, setIsCreating] = useState(false);
  const [vaultCreated, setVaultCreated] = useState(false);
  const [shareLink, setShareLink] = useState('');

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

  const apyTiers = [
    { 
      id: 'conservative', 
      name: 'Stable', 
      apy: 3.5, 
      risk: 'Low Risk',
      description: 'Safe & steady returns',
      emoji: '🛡️',
      color: 'border-green-200 hover:border-green-300 hover:bg-green-50/30'
    },
    { 
      id: 'medium', 
      name: 'Balanced', 
      apy: 6.2, 
      risk: 'Medium Risk',
      description: 'Good growth potential',
      emoji: '⚖️',
      color: 'border-blue-200 hover:border-blue-300 hover:bg-blue-50/30'
    },
    { 
      id: 'aggressive', 
      name: 'Growth', 
      apy: 12.8, 
      risk: 'Higher Risk',
      description: 'Maximum earnings',
      emoji: '🚀',
      color: 'border-purple-200 hover:border-purple-300 hover:bg-purple-50/30'
    }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const calculateProjectedYield = () => {
    const selectedTier = apyTiers.find(tier => tier.id === formData.apyTier);
    const principal = parseFloat(formData.goal) || 0;
    const apy = selectedTier?.apy || 0;
    const months = formData.deadline ? 
      Math.ceil((new Date(formData.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 30)) : 12;
    
    return (principal * (apy / 100) * (months / 12));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Creating vault:', formData);
    
    setIsCreating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockVaultId = Math.floor(Math.random() * 1000);
      const link = `${window.location.origin}/join/${mockVaultId}`;
      setShareLink(link);
      setVaultCreated(true);

      // Trigger confetti animation
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE']
      });
    } catch (error) {
      console.error('Failed to create vault:', error);
    } finally {
      setIsCreating(false);
    }
  };

  if (vaultCreated) {
    const projectedYield = calculateProjectedYield();
    
    return (
      <div className="min-h-screen bg-goal-bg pb-20 md:pb-0">
        <Navigation />
        
        <main className="container-narrow py-8">
          <Card className="bg-white/60 backdrop-blur-sm border-goal-border/30 p-section rounded-3xl text-center">
            <div className="w-20 h-20 bg-goal-primary rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-10 h-10 text-goal-heading" />
            </div>

            <h1 className="text-2xl md:text-3xl font-fredoka font-bold text-goal-heading mb-4">
              🎉 Vault Created Successfully!
            </h1>

            <p className="font-inter text-base md:text-lg text-goal-text-secondary mb-6 leading-relaxed">
              Your "{formData.name}" vault is ready! Start inviting friends to save together.
            </p>

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
                    // Show toast notification
                    const event = new CustomEvent('toast', {
                      detail: {
                        title: '✅ Copied!',
                        description: 'Share link copied to clipboard.',
                        className: 'top-4 right-4 bg-goal-primary text-white border-goal-primary shadow-lg',
                      }
                    });
                    window.dispatchEvent(event);
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
                onClick={() => navigate('/dashboard')}
                className="flex-1 bg-goal-primary hover:bg-goal-primary/90 text-goal-text font-fredoka font-semibold rounded-2xl px-6 py-3"
              >
                View Dashboard
              </Button>
              <Button
                onClick={() => {
                  setVaultCreated(false);
                  setFormData({
                    name: '',
                    description: '',
                    goal: '',
                    deadline: '',
                    isPublic: false,
                    category: 'other',
                    apyTier: 'medium'
                  });
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

  const projectedYield = calculateProjectedYield();
  const selectedTier = apyTiers.find(tier => tier.id === formData.apyTier);

  return (
    <div className="min-h-screen bg-goal-bg pb-20 md:pb-0">
      <Navigation />

      <main className="container-narrow py-8">
        <Link
          to="/dashboard"
          className="inline-flex items-center space-x-2 text-goal-text-primary hover:text-goal-heading transition-colors mb-6 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-inter">Back to Dashboard</span>
        </Link>

        <div className="text-center space-component mb-8">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-fredoka font-bold text-goal-heading leading-tight">
            Create Your Dream Vault ✨
          </h1>
          <p className="font-inter text-base md:text-lg text-goal-text-secondary max-w-2xl mx-auto leading-relaxed">
            Set your goal, choose your yield strategy, and watch your savings grow!
          </p>
        </div>

        <Card className="bg-white/60 backdrop-blur-sm border-goal-border/30 p-section rounded-3xl">
          <form onSubmit={handleSubmit} className="space-component">
            {/* Vault Name */}
            <div>
              <label htmlFor="name" className="block font-inter font-semibold text-goal-heading mb-2">
                Vault Name *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Summer Vacation Fund 🏖️"
                className="w-full px-4 py-3 bg-white/50 border border-goal-border/50 rounded-2xl font-inter text-goal-text placeholder-goal-text/60 focus:outline-none focus:ring-2 focus:ring-goal-primary focus:border-transparent"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block font-inter font-semibold text-goal-text mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Tell others about your savings goal..."
                className="w-full px-4 py-3 bg-white/50 border border-goal-border/50 rounded-2xl font-inter text-goal-text placeholder-goal-text/60 focus:outline-none focus:ring-2 focus:ring-goal-primary focus:border-transparent resize-none"
              />
            </div>

            {/* Goal Amount and Deadline */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="goal" className="block font-inter font-semibold text-goal-text mb-2">
                  Goal Amount (USD) *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-goal-text/60" />
                  <input
                    id="goal"
                    name="goal"
                    type="number"
                    required
                    min="1"
                    value={formData.goal}
                    onChange={handleInputChange}
                    placeholder="5000"
                    className="w-full pl-12 pr-4 py-3 bg-white/50 border border-goal-border/50 rounded-2xl font-inter text-goal-text placeholder-goal-text/60 focus:outline-none focus:ring-2 focus:ring-goal-primary focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="deadline" className="block font-inter font-semibold text-goal-text mb-2">
                  Deadline *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-goal-text/60" />
                  <input
                    id="deadline"
                    name="deadline"
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={formData.deadline}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-3 bg-white/50 border border-goal-border/50 rounded-2xl font-inter text-goal-text focus:outline-none focus:ring-2 focus:ring-goal-primary focus:border-transparent"
                  />
                </div>
              </div>
            </div>





            {/* Category - Updated Design */}
            <div>
              <label htmlFor="category" className="block font-inter font-semibold text-goal-text mb-2">
                Category
              </label>
              <div className="relative">
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/50 border border-goal-border/50 rounded-2xl font-inter text-goal-text focus:outline-none focus:ring-2 focus:ring-goal-primary focus:border-transparent appearance-none"
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.emoji} {cat.label}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-5 h-5 text-goal-text/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Privacy Setting */}
            <div className="bg-goal-accent/20 p-6 rounded-2xl">
              <div className="flex items-start space-x-4">
                <input
                  id="isPublic"
                  name="isPublic"
                  type="checkbox"
                  checked={formData.isPublic}
                  onChange={handleInputChange}
                  className="mt-1 h-5 w-5 text-goal-primary bg-white border-2 border-goal-border/50 rounded-lg focus:ring-goal-primary focus:ring-2 focus:border-goal-primary transition-colors"
                />
                <div className="flex-1">
                  <label htmlFor="isPublic" className="flex items-center font-inter font-semibold text-goal-text mb-2 cursor-pointer">
                    <Globe className="w-5 h-5 mr-2" />
                    Make this vault public
                  </label>
                  <p className="font-inter text-sm text-goal-text/70">
                    {formData.isPublic 
                      ? "Anyone can discover and join your vault from the community page"
                      : "Only people with the invite link can join your vault"
                    }
                  </p>
                </div>
                {!formData.isPublic && <Lock className="w-5 h-5 text-goal-text/60 mt-1" />}
              </div>
            </div>

            {/* Fixed Submit Button */}
            <div className="pt-4">
              <Button
                type="submit"
                disabled={isCreating}
                className="w-full h-12 bg-goal-primary hover:bg-goal-primary/90 text-goal-text font-fredoka font-bold text-lg rounded-2xl transition-all duration-300 hover:scale-105 disabled:hover:scale-100 shadow-lg"
              >
                {isCreating ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 border-2 border-goal-text/30 border-t-goal-text rounded-full animate-spin"></div>
                    <span>Creating Your Dream Vault...</span>
                  </div>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Create My Dream Vault! 🚀
                  </>
                )}
              </Button>
            </div>
          </form>
        </Card>

        <Card className="bg-white/40 backdrop-blur-sm border-goal-border/30 p-6 rounded-3xl mt-8">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-goal-primary rounded-2xl flex items-center justify-center flex-shrink-0">
              <Users className="w-6 h-6 text-goal-text" />
            </div>
            <div>
              <h3 className="font-fredoka font-semibold text-goal-text mb-2">
                Ready to invite friends? 🎉
              </h3>
              <p className="font-inter text-goal-text/70 text-sm leading-relaxed">
                After creating your vault, you'll get a shareable link to invite friends and family. 
                Saving together makes goals more achievable and fun!
              </p>
            </div>
          </div>
        </Card>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default CreateVault;
