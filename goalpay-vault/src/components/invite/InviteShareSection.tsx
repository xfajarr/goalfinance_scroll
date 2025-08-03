import React from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Copy, Link, QrCode } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

interface InviteShareSectionProps {
  inviteCode?: string;
  shareLink?: string;
  vaultId?: string;
  goalName?: string;
  className?: string;
}

export const InviteShareSection: React.FC<InviteShareSectionProps> = ({
  inviteCode,
  shareLink,
  vaultId,
  goalName,
  className = ''
}) => {
  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast(`✅ ${type} Copied!`, {
        description: `${type} has been copied to your clipboard.`,
        duration: 3000,
      });
    } catch (error) {
      console.error('Failed to copy:', error);
      toast(`❌ Failed to copy ${type}`, {
        description: 'Please try again or copy manually.',
        duration: 3000,
      });
    }
  };

  if (!inviteCode && !shareLink) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <h3 className="font-fredoka font-bold text-goal-text text-lg mb-1">
          📤 Share Your Goal
        </h3>
        <p className="font-inter text-sm text-goal-text/70">
          Invite friends to join {goalName ? `"${goalName}"` : 'your savings goal'}
        </p>
      </div>

      {/* Invite Code Section */}
      {inviteCode && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-4 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <div className="bg-blue-500 text-white rounded-full p-1 mr-2">
                <QrCode className="w-4 h-4" />
              </div>
              <p className="font-inter text-sm font-semibold text-blue-800">
                🎫 Invite Code
              </p>
            </div>
            <Button
              onClick={() => copyToClipboard(inviteCode, 'Invite Code')}
              size="sm"
              className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-3 py-1 text-xs"
            >
              <Copy className="w-3 h-3 mr-1" />
              Copy
            </Button>
          </div>
          
          <div className="bg-white/60 p-3 rounded-xl border border-blue-200/50">
            <p className="font-mono text-sm font-bold text-blue-900 break-all text-center">
              {inviteCode.length > 30 ? `${inviteCode.slice(0, 15)}...${inviteCode.slice(-15)}` : inviteCode}
            </p>
          </div>
          
          <p className="font-inter text-xs text-blue-600 text-center mt-2">
            💡 Friends can use this code to join your goal
          </p>
        </div>
      )}

      {/* Share Link Section */}
      {shareLink && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 p-4 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <div className="bg-green-500 text-white rounded-full p-1 mr-2">
                <Link className="w-4 h-4" />
              </div>
              <p className="font-inter text-sm font-semibold text-green-800">
                🔗 Direct Invite Link
              </p>
            </div>
            <Button
              onClick={() => copyToClipboard(shareLink, 'Invite Link')}
              size="sm"
              className="bg-green-500 hover:bg-green-600 text-white rounded-lg px-3 py-1 text-xs"
            >
              <Share2 className="w-3 h-3 mr-1" />
              Copy
            </Button>
          </div>
          
          <div className="bg-white/60 p-3 rounded-xl border border-green-200/50">
            <p className="font-mono text-xs text-green-900 break-all text-center">
              {shareLink.length > 50 ? `${shareLink.slice(0, 25)}...${shareLink.slice(-25)}` : shareLink}
            </p>
          </div>
          
          <p className="font-inter text-xs text-green-600 text-center mt-2">
            🚀 One-click join link - includes invite code automatically
          </p>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        {inviteCode && (
          <Button
            onClick={() => copyToClipboard(inviteCode, 'Invite Code')}
            variant="outline"
            className="bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-800 rounded-xl py-2"
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy Code
          </Button>
        )}
        
        {shareLink && (
          <Button
            onClick={() => copyToClipboard(shareLink, 'Share Link')}
            variant="outline"
            className="bg-green-50 hover:bg-green-100 border-green-200 text-green-800 rounded-xl py-2"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Copy Link
          </Button>
        )}
      </div>

      {/* Info Footer */}
      <div className="bg-goal-accent/20 p-3 rounded-xl">
        <p className="font-inter text-xs text-goal-text/70 text-center">
          <strong>💡 Pro Tip:</strong> The invite link is easier to share - it includes the code automatically!
        </p>
      </div>
    </div>
  );
};

export default InviteShareSection;
