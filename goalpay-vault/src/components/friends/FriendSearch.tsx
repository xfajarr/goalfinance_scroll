import React, { useState, useMemo } from 'react';
import { Address } from 'viem';
import { Check, Search, User, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useFriendsData, Friend } from '@/hooks/useFriendsRegistry';

export interface SelectedFriend {
  address: Address;
  displayName: string;
}

interface FriendSearchProps {
  selectedFriends: SelectedFriend[];
  onSelectionChange: (friends: SelectedFriend[]) => void;
  maxSelections?: number;
  placeholder?: string;
  className?: string;
  showSelectedCount?: boolean;
}

export function FriendSearch({
  selectedFriends,
  onSelectionChange,
  maxSelections,
  placeholder = "Search friends...",
  className,
  showSelectedCount = true,
}: FriendSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const { friends, isLoading, error } = useFriendsData();

  // Debug logging to help identify issues
  React.useEffect(() => {
    console.log('FriendSearch - Friends loaded:', friends.length);
    console.log('FriendSearch - Selected friends:', selectedFriends.length);
  }, [friends.length, selectedFriends.length]);

  // Filter friends based on search term
  const filteredFriends = useMemo(() => {
    if (!searchTerm.trim()) return friends;
    
    const term = searchTerm.toLowerCase();
    return friends.filter(friend => 
      friend.displayName.toLowerCase().includes(term) ||
      friend.friendAddress.toLowerCase().includes(term)
    );
  }, [friends, searchTerm]);

  const handleFriendToggle = React.useCallback((friend: Friend) => {
    // Use case-insensitive address comparison for better reliability
    const isSelected = selectedFriends.some(f =>
      f.address.toLowerCase() === friend.friendAddress.toLowerCase()
    );

    if (isSelected) {
      // Remove friend using case-insensitive comparison
      const newSelection = selectedFriends.filter(f =>
        f.address.toLowerCase() !== friend.friendAddress.toLowerCase()
      );
      onSelectionChange(newSelection);
    } else {
      // Add friend (check max limit)
      if (maxSelections && selectedFriends.length >= maxSelections) {
        return; // Don't add if at max limit
      }

      const newSelection = [
        ...selectedFriends,
        {
          address: friend.friendAddress,
          displayName: friend.displayName,
        }
      ];
      onSelectionChange(newSelection);
    }
  }, [selectedFriends, maxSelections, onSelectionChange]);

  const handleRemoveSelected = React.useCallback((address: Address) => {
    // Use case-insensitive address comparison
    onSelectionChange(selectedFriends.filter(f =>
      f.address.toLowerCase() !== address.toLowerCase()
    ));
  }, [selectedFriends, onSelectionChange]);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className={className}>
      {/* Search Input */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-goal-text/50" />
        <Input
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-white/60 border-goal-border/30 rounded-xl focus:ring-goal-primary focus:border-goal-primary font-inter text-goal-text placeholder:text-goal-text/50 h-9 pl-10"
        />
      </div>

      {/* Selected Friends */}
      {selectedFriends.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-fredoka font-medium text-goal-text">
              Selected Friends
            </span>
            {showSelectedCount && (
              <Badge variant="secondary" className="bg-goal-accent text-goal-text border-goal-border/30 font-inter text-xs">
                {selectedFriends.length}
                {maxSelections && ` / ${maxSelections}`}
              </Badge>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedFriends.map((friend) => (
              <Badge
                key={friend.address}
                variant="default"
                className="bg-goal-primary/20 text-goal-text border-goal-border/30 flex items-center gap-1 pr-1 rounded-lg font-inter text-xs"
              >
                <span className="truncate max-w-[120px]">{friend.displayName}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-transparent text-goal-text/70 hover:text-goal-text"
                  onClick={() => handleRemoveSelected(friend.address)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Debug info for development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mb-2 p-2 bg-gray-100 rounded text-xs">
          <div>Total friends: {friends.length}</div>
          <div>Selected: {selectedFriends.length}</div>
          <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
          <div>Error: {error ? 'Yes' : 'No'}</div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm text-red-600 font-inter">
            Failed to load friends. Please check your wallet connection.
          </p>
        </div>
      )}

      {/* Friends List */}
      <div className="bg-white/40 backdrop-blur-sm border border-goal-border/20 rounded-xl">
        <ScrollArea className="h-[200px]">
          {isLoading ? (
            <div className="p-3 text-center text-goal-text/70 font-inter">
              Loading friends...
            </div>
          ) : filteredFriends.length === 0 ? (
            <div className="p-3 text-center text-goal-text/70 font-inter">
              {friends.length === 0 ? (
                <div className="space-y-2">
                  <User className="w-6 h-6 mx-auto opacity-50" />
                  <p className="text-sm">No friends added yet</p>
                  <p className="text-xs">Add friends to split bills with them</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Search className="w-6 h-6 mx-auto opacity-50" />
                  <p className="text-sm">No friends found</p>
                  <p className="text-xs">Try a different search term</p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-2">
              {filteredFriends.map((friend) => {
                // Use case-insensitive address comparison
                const isSelected = selectedFriends.some(f =>
                  f.address.toLowerCase() === friend.friendAddress.toLowerCase()
                );
                const isDisabled = !isSelected && maxSelections && selectedFriends.length >= maxSelections;

                return (
                  <div
                    key={friend.friendAddress}
                    className={`flex items-center space-x-3 p-2 rounded-lg transition-colors ${
                      isSelected
                        ? 'bg-goal-primary/10 border border-goal-primary/20'
                        : isDisabled
                          ? 'opacity-50'
                          : 'hover:bg-goal-accent/30'
                    }`}
                  >
                    <Checkbox
                      checked={isSelected}
                      disabled={isDisabled}
                      onCheckedChange={() => {
                        if (!isDisabled) {
                          handleFriendToggle(friend);
                        }
                      }}
                      className="cursor-pointer"
                    />

                    <div className="w-6 h-6 bg-goal-primary rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-goal-text font-bold text-xs">
                        {friend.displayName.charAt(0).toUpperCase()}
                      </span>
                    </div>

                    <div
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isDisabled) {
                          handleFriendToggle(friend);
                        }
                      }}
                    >
                      <p className="font-fredoka font-medium text-sm text-goal-text truncate">
                        {friend.displayName}
                      </p>
                      <p className="text-xs text-goal-text/60 font-mono truncate">
                        {formatAddress(friend.friendAddress)}
                      </p>
                    </div>

                    {friend.isMutual && (
                      <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 border-green-200">
                        Mutual
                      </Badge>
                    )}

                    {isSelected && (
                      <Check className="w-4 h-4 text-goal-primary flex-shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Max Selection Warning */}
      {maxSelections && selectedFriends.length >= maxSelections && (
        <p className="text-xs text-muted-foreground mt-2">
          Maximum {maxSelections} friends can be selected
        </p>
      )}
    </div>
  );
}

// Simplified friend selector for single selection
interface FriendSelectorProps {
  selectedFriend: SelectedFriend | null;
  onSelectionChange: (friend: SelectedFriend | null) => void;
  placeholder?: string;
  className?: string;
}

export function FriendSelector({
  selectedFriend,
  onSelectionChange,
  placeholder = "Select a friend...",
  className,
}: FriendSelectorProps) {
  const selectedFriends = selectedFriend ? [selectedFriend] : [];
  
  const handleSelectionChange = (friends: SelectedFriend[]) => {
    onSelectionChange(friends.length > 0 ? friends[0] : null);
  };

  return (
    <FriendSearch
      selectedFriends={selectedFriends}
      onSelectionChange={handleSelectionChange}
      maxSelections={1}
      placeholder={placeholder}
      className={className}
      showSelectedCount={false}
    />
  );
}

// Quick friend picker for small spaces
interface QuickFriendPickerProps {
  onSelect: (friend: SelectedFriend) => void;
  excludeAddresses?: Address[];
  className?: string;
}

export function QuickFriendPicker({ onSelect, excludeAddresses = [], className }: QuickFriendPickerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const { friends, isLoading } = useFriendsData();

  const availableFriends = useMemo(() => {
    return friends.filter(friend => !excludeAddresses.includes(friend.friendAddress));
  }, [friends, excludeAddresses]);

  const filteredFriends = useMemo(() => {
    if (!searchTerm.trim()) return availableFriends.slice(0, 5); // Show only first 5
    
    const term = searchTerm.toLowerCase();
    return availableFriends
      .filter(friend => 
        friend.displayName.toLowerCase().includes(term) ||
        friend.friendAddress.toLowerCase().includes(term)
      )
      .slice(0, 5);
  }, [availableFriends, searchTerm]);

  const handleSelect = (friend: Friend) => {
    onSelect({
      address: friend.friendAddress,
      displayName: friend.displayName,
    });
    setSearchTerm('');
  };

  return (
    <div className={className}>
      <div className="relative mb-2">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Quick add friend..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 h-8"
        />
      </div>

      {searchTerm && (
        <Card className="border">
          <div className="max-h-[200px] overflow-y-auto">
            {isLoading ? (
              <div className="p-2 text-center text-xs text-muted-foreground">
                Loading...
              </div>
            ) : filteredFriends.length === 0 ? (
              <div className="p-2 text-center text-xs text-muted-foreground">
                No friends found
              </div>
            ) : (
              <div className="p-1">
                {filteredFriends.map((friend) => (
                  <div
                    key={friend.friendAddress}
                    className="flex items-center space-x-2 p-2 rounded hover:bg-accent cursor-pointer"
                    onClick={() => handleSelect(friend)}
                  >
                    <div className="w-6 h-6 bg-goal-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-xs">
                        {friend.displayName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-xs truncate">
                        {friend.displayName}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
