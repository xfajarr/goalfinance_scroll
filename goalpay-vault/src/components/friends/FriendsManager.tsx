import React, { useState, useMemo } from 'react';
import { Address } from 'viem';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Users,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Copy,
  ExternalLink,
  Loader2,
  UserPlus,
} from 'lucide-react';
import { useFriendsData, useFriendsRegistry, Friend } from '@/hooks/useFriendsRegistry';
import { AddFriendButton } from './AddFriendDialog';
import { toast } from '@/components/ui/sonner';

interface FriendsManagerProps {
  className?: string;
}

export function FriendsManager({ className }: FriendsManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [friendToDelete, setFriendToDelete] = useState<Friend | null>(null);
  
  const { friends, friendCount, isLoading } = useFriendsData();
  const { removeFriend, isLoading: isRemoving } = useFriendsRegistry();

  // Filter friends based on search term
  const filteredFriends = useMemo(() => {
    if (!searchTerm.trim()) return friends;
    
    const term = searchTerm.toLowerCase();
    return friends.filter(friend => 
      friend.displayName.toLowerCase().includes(term) ||
      friend.friendAddress.toLowerCase().includes(term) ||
      friend.notes.toLowerCase().includes(term)
    );
  }, [friends, searchTerm]);

  const handleCopyAddress = async (address: Address) => {
    try {
      await navigator.clipboard.writeText(address);
      toast.success('Address copied to clipboard');
    } catch (err) {
      toast.error('Failed to copy address');
    }
  };

  const handleViewOnExplorer = (address: Address) => {
    // TODO: Use chain-specific explorer URL
    const explorerUrl = `https://sepolia.mantlescan.xyz/address/${address}`;
    window.open(explorerUrl, '_blank');
  };

  const handleDeleteFriend = async (friend: Friend) => {
    try {
      await removeFriend(friend.friendAddress);
      setFriendToDelete(null);
      toast.success(`Removed ${friend.displayName} from friends`);
    } catch (err) {
      toast.error('Failed to remove friend');
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (timestamp: number | bigint) => {
    // Convert BigInt to number safely
    const timestampNum = typeof timestamp === 'bigint' ? Number(timestamp) : timestamp;
    return new Date(timestampNum * 1000).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className={`${className}`}>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-goal-primary" />
          <span className="ml-2 text-goal-text/70 font-inter">Loading friends...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-goal-primary rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5 text-goal-text" />
          </div>
          <div>
            <h2 className="text-xl font-fredoka font-bold text-goal-text">
              Friends
            </h2>
            <p className="text-sm text-goal-text/70 font-inter">
              {friendCount} {friendCount === 1 ? 'friend' : 'friends'}
            </p>
          </div>
        </div>
        <AddFriendButton onSuccess={() => {
          // Refresh will happen automatically due to wagmi cache invalidation
        }} />
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-goal-text-secondary" />
        <Input
          placeholder="Search friends by name or address..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-white/60 border-goal-border/30 rounded-xl focus:ring-goal-primary focus:border-goal-primary font-inter text-goal-text placeholder:text-goal-text/50"
        />
      </div>

      {/* Friends List */}
      {filteredFriends.length === 0 ? (
        <div className="p-8 text-center">
          {friends.length === 0 ? (
            <div className="space-y-4">
              <div className="w-16 h-16 bg-goal-accent rounded-full flex items-center justify-center mx-auto">
                <UserPlus className="w-8 h-8 text-goal-text-secondary" />
              </div>
              <div>
                <h3 className="font-fredoka font-bold text-goal-text mb-2">
                  No friends yet
                </h3>
                <p className="text-goal-text/70 font-inter mb-4">
                  Add friends to easily split bills and track debts together.
                </p>
                <AddFriendButton />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-16 h-16 bg-goal-accent rounded-full flex items-center justify-center mx-auto">
                <Search className="w-8 h-8 text-goal-text-secondary" />
              </div>
              <div>
                <h3 className="font-fredoka font-bold text-goal-text mb-2">
                  No friends found
                </h3>
                <p className="text-goal-text/70 font-inter">
                  Try adjusting your search terms.
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredFriends.map((friend) => (
            <Card key={friend.friendAddress} className="bg-white/60 backdrop-blur-sm border-goal-border/30 p-4 rounded-2xl hover:shadow-md transition-all duration-200 hover:bg-white/70">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* Avatar */}
                  <div className="w-10 h-10 bg-goal-primary rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-goal-text font-bold text-sm">
                      {friend.displayName.charAt(0).toUpperCase()}
                    </span>
                  </div>

                  {/* Friend Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-fredoka font-semibold text-goal-text truncate">
                        {friend.displayName}
                      </h3>
                      {friend.isMutual && (
                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 border-green-200">
                          <UserCheck className="w-3 h-3 mr-1" />
                          Mutual
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-goal-text/70 font-mono truncate">
                      {formatAddress(friend.friendAddress)}
                    </p>
                    {friend.notes && (
                      <p className="text-xs text-goal-text/60 font-inter mt-1 truncate">
                        {friend.notes}
                      </p>
                    )}
                    <p className="text-xs text-goal-text/60 font-inter mt-1">
                      Added {formatDate(friend.addedAt)}
                    </p>
                  </div>
                </div>

                {/* Actions Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleCopyAddress(friend.friendAddress)}>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Address
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleViewOnExplorer(friend.friendAddress)}>
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View on Explorer
                    </DropdownMenuItem>
                    <Separator className="my-1" />
                    <DropdownMenuItem>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Friend
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setFriendToDelete(friend)}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove Friend
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!friendToDelete} onOpenChange={() => setFriendToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Friend</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {friendToDelete?.displayName} from your friends list?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => friendToDelete && handleDeleteFriend(friendToDelete)}
              disabled={isRemoving}
              className="bg-red-600 hover:bg-red-700"
            >
              {isRemoving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Removing...
                </>
              ) : (
                'Remove Friend'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
