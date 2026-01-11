'use client';

import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NudgePopover } from './NudgePopover';

interface NudgeButtonProps {
  activeCount?: number;
  className?: string;
}

export function NudgeButton({ activeCount = 0, className }: NudgeButtonProps) {
  return (
    <NudgePopover activeCount={activeCount}>
      <Button
        variant="ghost"
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
    </NudgePopover>
  );
}
