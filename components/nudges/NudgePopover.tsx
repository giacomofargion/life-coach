'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Nudge } from '@/lib/types';
import { NudgeModal } from './NudgeModal';
import { useNudges } from './useNudges';
import { NudgePanelContent } from './NudgePanelContent';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface NudgePopoverProps {
  children: React.ReactNode;
  activeCount: number;
}

export function NudgePopover({ children, activeCount }: NudgePopoverProps) {
  const [open, setOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingNudgeId, setPendingNudgeId] = useState<string | null>(null);
  // Track which nudges have their checkbox checked (but not yet completed)
  const [checkedNudgeIds, setCheckedNudgeIds] = useState<Set<string>>(new Set());
  const { nudges, isLoading } = useNudges();

  // Filter only active nudges for display
  const activeNudges = nudges.filter(n => !n.is_completed);

  // Handle checkbox change - just update checked state, don't complete yet
  function handleCheckboxChange(nudgeId: string, checked: boolean) {
    setCheckedNudgeIds(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(nudgeId);
      } else {
        newSet.delete(nudgeId);
      }
      return newSet;
    });
  }

  async function handleComplete(nudge: Nudge) {
    if (nudge.is_completed) return;

    setCompletingId(nudge.id);
    try {
      const response = await fetch(`/api/nudges/${nudge.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_completed: true }),
      });

      if (!response.ok) {
        throw new Error('Failed to complete nudge');
      }

      // Remove from checked set
      setCheckedNudgeIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(nudge.id);
        return newSet;
      });

      window.dispatchEvent(new CustomEvent('nudgeCompleted'));
    } catch (error) {
      console.error('Error completing nudge:', error);
    } finally {
      setCompletingId(null);
    }
  }

  function handleDelete(nudgeId: string) {
    setPendingNudgeId(nudgeId);
    setIsConfirmOpen(true);
  }

  async function handleConfirmDelete() {
    if (!pendingNudgeId) return;

    setDeletingId(pendingNudgeId);
    try {
      const response = await fetch(`/api/nudges/${pendingNudgeId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete nudge');
      }

      // Remove from checked set
      setCheckedNudgeIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(pendingNudgeId);
        return newSet;
      });

      window.dispatchEvent(new CustomEvent('nudgeDeleted'));
    } catch (error) {
      console.error('Error deleting nudge:', error);
    } finally {
      setDeletingId(null);
      setPendingNudgeId(null);
    }
  }

  async function handleCreate(content: string) {
    setIsCreating(true);
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

      window.dispatchEvent(new CustomEvent('nudgeCreated'));
      setShowCreateModal(false);
      setOpen(false);
    } catch (error) {
      console.error('Error creating nudge:', error);
      throw error;
    } finally {
      setIsCreating(false);
    }
  }

  function handleOpenChange(newOpen: boolean) {
    setOpen(newOpen);
    // Clear checked state when popover closes
    if (!newOpen) {
      setCheckedNudgeIds(new Set());
    }
  }

  function handleCreateClick(e: React.MouseEvent) {
    e.stopPropagation();
    setOpen(false);
    setShowCreateModal(true);
  }

  function handleConfirmOpenChange(newOpen: boolean) {
    setIsConfirmOpen(newOpen);
    if (!newOpen) {
      // Clear pending nudge ID when modal is closed (cancel or outside click)
      setPendingNudgeId(null);
    }
  }

  return (
    <>
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          {children}
        </PopoverTrigger>
        <PopoverContent
          className="w-[calc(100vw-2rem)] sm:w-80 md:w-96 p-0 max-h-[80vh] flex flex-col"
          align="end"
          sideOffset={8}
          side="bottom"
          alignOffset={0}
        >
          <NudgePanelContent
            activeCount={activeCount}
            activeNudges={activeNudges}
            isLoading={isLoading}
            checkedNudgeIds={checkedNudgeIds}
            completingId={completingId}
            deletingId={deletingId}
            onCheckboxChange={handleCheckboxChange}
            onComplete={handleComplete}
            onDelete={handleDelete}
            onCreateClick={handleCreateClick}
          />
        </PopoverContent>
      </Popover>

      <NudgeModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSubmit={handleCreate}
        isLoading={isCreating}
      />

      <ConfirmDialog
        open={isConfirmOpen}
        onOpenChange={handleConfirmOpenChange}
        title="Delete nudge?"
        description="Are you sure you want to delete this nudge? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleConfirmDelete}
        isLoading={deletingId !== null}
        variant="destructive"
      />
    </>
  );
}
