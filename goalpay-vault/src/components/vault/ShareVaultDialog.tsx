import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Share2,
  Copy,
  QrCode,
  Twitter,
  Facebook,
  MessageCircle,
  Mail,
  Check,
  ExternalLink,
  Send
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useShareVault } from '@/hooks/useShareVault';
import { useToast } from '@/hooks/use-toast';
import { ShareVaultData } from '@/contracts/types';

interface ShareVaultDialogProps {
  vaultId: bigint;
  vaultName: string;
  vaultDescription: string;
  children: React.ReactNode;
}

export const ShareVaultDialog = ({
  vaultId,
  vaultName,
  vaultDescription,
  children,
}: ShareVaultDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [shareData, setShareData] = useState<ShareVaultData | null>(null);
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});
  
  const { generateShareData, isLoading, error } = useShareVault();
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && !shareData) {
      loadShareData();
    }
  }, [isOpen]);

  const loadShareData = async () => {
    try {
      const data = await generateShareData(vaultId);
      setShareData(data);
    } catch (error) {
      toast({
        title: 'Failed to Generate Share Data',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    }
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStates({ ...copiedStates, [type]: true });
      toast({
        title: '✅ Copied!',
        description: `${type} copied to clipboard.`,
        className: 'top-4 right-4 bg-goal-primary text-white border-goal-primary shadow-lg',
      });

      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopiedStates({ ...copiedStates, [type]: false });
      }, 2000);
    } catch (error) {
      toast({
        title: '❌ Copy Failed',
        description: 'Please try again.',
        variant: 'destructive',
        className: 'top-4 right-4 bg-gradient-to-r from-red-500 to-rose-500 text-white border-red-400 shadow-lg',
      });
    }
  };

  const shareOnSocial = (platform: string) => {
    if (!shareData) return;

    const text = `🚀 Join my savings squad for "${vaultName}"! 💰 Let's crush our financial goals together with Goal Finance! 🎯✨`;
    const url = shareData.shareUrl;

    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      email: `mailto:?subject=${encodeURIComponent(`Join my savings goal: ${vaultName}`)}&body=${encodeURIComponent(`${text}\n\n${url}`)}`,
    };

    const shareUrl = shareUrls[platform as keyof typeof shareUrls];
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  // QR code is now generated using the QRCodeSVG component directly

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-w-[95vw] bg-white/95 backdrop-blur-sm border-goal-border/30 rounded-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-3 font-fredoka text-goal-text text-lg">
            <div className="w-10 h-10 bg-goal-primary rounded-full flex items-center justify-center shadow-lg">
              <Share2 className="w-5 h-5 text-white" />
            </div>
            Share Vault
          </DialogTitle>
          <DialogDescription className="font-inter text-goal-text/80 text-sm">
            🚀 Invite your squad to join "<span className="font-semibold text-goal-text">{vaultName}</span>" and crush your savings goals together! 💪
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <div className="w-6 h-6 border-2 border-goal-primary/30 border-t-goal-primary rounded-full animate-spin" />
          </div>
        ) : error ? (
          <Card className="p-3 bg-red-50 border-red-200 rounded-xl">
            <p className="font-inter text-sm text-red-700">
              Failed to generate share data. Please try again.
            </p>
            <Button
              onClick={loadShareData}
              variant="outline"
              size="sm"
              className="mt-2 text-xs"
            >
              Retry
            </Button>
          </Card>
        ) : shareData ? (
          <div className="space-y-4">
            {/* Share Link */}
            <div className="space-y-2">
              <h4 className="font-fredoka font-bold text-goal-text text-sm">🔗 Magic Share Link</h4>
              <div className="flex gap-2">
                <Input
                  value={shareData.shareUrl}
                  readOnly
                  className="font-mono text-xs bg-white/70 border-goal-border/60 rounded-lg flex-1 min-w-0"
                />
                <Button
                  onClick={() => copyToClipboard(shareData.shareUrl, 'Link')}
                  variant="outline"
                  size="sm"
                  className="border-goal-primary/60 hover:bg-goal-primary/10 rounded-lg px-3 font-semibold"
                >
                  {copiedStates.Link ? (
                    <Check className="w-3 h-3 text-green-600 mr-1" />
                  ) : (
                    <Copy className="w-3 h-3 mr-1" />
                  )}
                  <span className="text-xs">Copy</span>
                </Button>
              </div>
            </div>

            {/* QR Code */}
            <div className="space-y-2">
              <h4 className="font-fredoka font-bold text-goal-text text-sm flex items-center gap-2">
                <QrCode className="w-4 h-4 text-goal-primary" />
                QR Code
              </h4>
              <div className="flex justify-center">
                <Card className="p-3 bg-white/70 border-goal-border/40 rounded-lg">
                  {shareData && (
                    <QRCodeSVG
                      value={shareData.shareUrl}
                      size={112} // 28 * 4 for better resolution
                      bgColor="#ffffff"
                      fgColor="#8B5CF6" // goal-primary color
                      level="M"
                      includeMargin={true}
                      title="Scan to join vault"
                    />
                  )}
                </Card>
              </div>
            </div>

            {/* Social Sharing */}
            <div className="space-y-2">
              <h4 className="font-fredoka font-bold text-goal-text text-sm">📱 Spread the Word</h4>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => shareOnSocial('twitter')}
                  variant="outline"
                  size="sm"
                  className="border-goal-border hover:bg-goal-accent hover:border-goal-primary rounded-2xl text-xs font-semibold"
                >
                  <Twitter className="w-3 h-3 mr-1 text-blue-500" />
                  Twitter
                </Button>
                <Button
                  onClick={() => shareOnSocial('facebook')}
                  variant="outline"
                  size="sm"
                  className="border-goal-border hover:bg-goal-accent hover:border-goal-primary rounded-2xl text-xs font-semibold"
                >
                  <Facebook className="w-3 h-3 mr-1 text-blue-600" />
                  Facebook
                </Button>
                <Button
                  onClick={() => shareOnSocial('whatsapp')}
                  variant="outline"
                  size="sm"
                  className="border-goal-border hover:bg-goal-accent hover:border-goal-primary rounded-2xl text-xs font-semibold"
                >
                  <MessageCircle className="w-3 h-3 mr-1 text-green-600" />
                  WhatsApp
                </Button>
                <Button
                  onClick={() => shareOnSocial('telegram')}
                  variant="outline"
                  size="sm"
                  className="border-goal-border hover:bg-goal-accent hover:border-goal-primary rounded-2xl text-xs font-semibold"
                >
                  <Send className="w-3 h-3 mr-1 text-blue-500" />
                  Telegram
                </Button>
              </div>
              <div className="grid grid-cols-1 gap-2 mt-2">
                <Button
                  onClick={() => shareOnSocial('email')}
                  variant="outline"
                  size="sm"
                  className="border-goal-border hover:bg-goal-accent hover:border-goal-primary rounded-2xl text-xs font-semibold"
                >
                  <Mail className="w-3 h-3 mr-1 text-gray-600" />
                  Email
                </Button>
              </div>
            </div>

            {/* Invite Code */}
            <Card className="p-3 bg-goal-accent/20 border-goal-border/40 rounded-2xl">
              <div className="space-y-2">
                <h5 className="font-fredoka font-bold text-goal-text text-sm">
                  🎯 Secret Invite Code
                </h5>
                <div className="flex gap-2">
                  <Input
                    value={shareData.inviteCode}
                    readOnly
                    className="font-mono text-sm bg-white/70 border-goal-border/60 rounded-2xl flex-1 font-bold text-goal-text"
                  />
                  <Button
                    onClick={() => copyToClipboard(shareData.inviteCode, 'Code')}
                    variant="outline"
                    size="sm"
                    className="border-goal-primary/60 hover:bg-goal-primary/10 rounded-2xl px-3 font-semibold"
                  >
                    {copiedStates.Code ? (
                      <Check className="w-3 h-3 text-goal-primary mr-1" />
                    ) : (
                      <Copy className="w-3 h-3 mr-1" />
                    )}
                    <span className="text-xs">Copy</span>
                  </Button>
                </div>
                <p className="font-inter text-xs text-goal-text/70 font-medium">
                  Share this special code with friends who want to join the savings party! 🎉
                </p>
              </div>
            </Card>
          </div>
        ) : null}

        <div className="flex justify-end pt-2">
          <Button
            onClick={() => setIsOpen(false)}
            variant="outline"
            size="sm"
            className="border-goal-primary/60 text-goal-text hover:bg-goal-primary/10 rounded-lg font-semibold"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
