import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  MobileDialog,
  MobileDialogContent,
  MobileDialogDescription,
  MobileDialogHeader,
  MobileDialogTitle,
  MobileDialogTrigger,
} from '@/components/ui/mobile-dialog';
import { BillCreationForm } from '@/components/bills/BillCreationForm';
import { AddFriendDialog } from '@/components/friends/AddFriendDialog';
import { Plus, UserPlus, ArrowUp } from 'lucide-react';

export default function TestSlideAnimation() {
  const [showCreateBill, setShowCreateBill] = useState(false);

  return (
    <div className="min-h-screen bg-goal-bg p-4">
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-fredoka font-bold text-goal-text mb-2">
            Slide-Up Animation Test
          </h1>
          <p className="text-goal-text/70 font-inter">
            Testing slide-up animation from bottom to top
          </p>
        </div>

        <div className="space-y-4">
          {/* Create Bill Dialog Test */}
          <MobileDialog open={showCreateBill} onOpenChange={setShowCreateBill}>
            <MobileDialogTrigger asChild>
              <Button
                className="w-full bg-goal-primary hover:bg-goal-primary/90 text-goal-text font-fredoka font-semibold rounded-xl transition-all duration-300 hover:scale-105"
              >
                <Plus className="w-4 h-4 mr-2" />
                Test Create Bill (Slide Up)
              </Button>
            </MobileDialogTrigger>
            <MobileDialogContent className="bg-white/95 backdrop-blur-sm border-goal-border/30">
              <MobileDialogHeader>
                <MobileDialogTitle className="font-fredoka font-bold text-goal-text">Create New Bill</MobileDialogTitle>
                <MobileDialogDescription className="text-goal-text/70">
                  This dialog slides up from the bottom!
                </MobileDialogDescription>
              </MobileDialogHeader>
              <BillCreationForm
                onSuccess={() => setShowCreateBill(false)}
                onCancel={() => setShowCreateBill(false)}
              />
            </MobileDialogContent>
          </MobileDialog>

          {/* Add Friend Dialog Test */}
          <AddFriendDialog>
            <Button
              className="w-full bg-goal-accent hover:bg-goal-accent/90 text-goal-text font-fredoka font-semibold rounded-xl transition-all duration-300 hover:scale-105"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Test Add Friend (Slide Up)
            </Button>
          </AddFriendDialog>
        </div>

        <div className="bg-white/60 backdrop-blur-sm border border-goal-border/30 rounded-3xl p-6">
          <h2 className="font-fredoka font-bold text-goal-text mb-4 flex items-center gap-2">
            <ArrowUp className="w-5 h-5" />
            Slide-Up Animation Features
          </h2>
          <ul className="space-y-2 text-goal-text/80 font-inter text-sm">
            <li>✅ Slides up from bottom on mobile</li>
            <li>✅ Smooth 300ms animation duration</li>
            <li>✅ Rounded top corners on mobile</li>
            <li>✅ Full-width on mobile, centered on desktop</li>
            <li>✅ Backdrop blur and transparency effects</li>
            <li>✅ Responsive behavior (mobile vs desktop)</li>
          </ul>
        </div>

        <div className="text-center">
          <p className="text-goal-text/60 font-inter text-xs">
            On mobile: Dialog slides up from bottom<br/>
            On desktop: Dialog appears centered with slide-up effect
          </p>
        </div>
      </div>
    </div>
  );
}
