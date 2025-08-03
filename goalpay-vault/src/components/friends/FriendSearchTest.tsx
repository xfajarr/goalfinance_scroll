import React, { useState } from 'react';
import { FriendSearch, SelectedFriend } from './FriendSearch';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

/**
 * Test component for FriendSearch functionality
 * This component helps verify that friend selection works properly
 */
export function FriendSearchTest() {
  const [selectedFriends, setSelectedFriends] = useState<SelectedFriend[]>([]);

  const handleReset = () => {
    setSelectedFriends([]);
  };

  const handleTestSelection = () => {
    // Add a test friend for demonstration
    const testFriend: SelectedFriend = {
      address: '0x1234567890123456789012345678901234567890',
      displayName: 'Test Friend',
    };
    setSelectedFriends([testFriend]);
  };

  return (
    <Card className="p-6 max-w-md mx-auto">
      <h2 className="text-lg font-fredoka font-bold mb-4">Friend Selection Test</h2>
      
      <div className="space-y-4">
        <FriendSearch
          selectedFriends={selectedFriends}
          onSelectionChange={setSelectedFriends}
          placeholder="Search and select friends..."
        />
        
        <div className="flex gap-2">
          <Button onClick={handleReset} variant="outline" size="sm">
            Reset Selection
          </Button>
          <Button onClick={handleTestSelection} variant="outline" size="sm">
            Add Test Friend
          </Button>
        </div>
        
        <div className="text-sm text-gray-600">
          <p>Selected friends: {selectedFriends.length}</p>
          {selectedFriends.map((friend, index) => (
            <div key={friend.address} className="mt-1">
              {index + 1}. {friend.displayName} ({friend.address.slice(0, 6)}...{friend.address.slice(-4)})
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
