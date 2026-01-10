'use client';

import { useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NudgeModal } from './NudgeModal';

interface NudgeButtonProps {
  activeCount?: number;
  className?: string;
  onModalOpen?: () => void;
}

export function NudgeButton({ activeCount = 0, className, onModalOpen }: NudgeButtonProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(content: string) {
    setIsLoading(true);
    try {
      const response = await fetch('/api/nudges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error('Failed to create nudge');
      }

      // Refresh the active count by triggering a page refresh or refetch
      // For now, we'll just close the modal and let the parent refresh
      window.dispatchEvent(new CustomEvent('nudgeCreated'));
    } catch (error) {
      console.error('Error creating nudge:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  function handleOpen() {
    setOpen(true);
    if (onModalOpen) {
      onModalOpen();
    }
  }

  return (
    <>
      <Button
        variant="ghost"
        onClick={handleOpen}
        className={`gap-2 text-foreground hover:bg-accent/50 transition-colors relative ${className || ''}`}
      >
        <Bell className="h-4 w-4 md:h-5 md:w-5" />
        <span className="text-base md:text-sm">Need a Nudge?</span>
        {activeCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
            {activeCount > 9 ? '9+' : activeCount}
          </span>
        )}
      </Button>

      <NudgeModal
        open={open}
        onOpenChange={setOpen}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </>
  );
}
