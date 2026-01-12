'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NudgeModal } from '@/components/nudges/NudgeModal';
import { useNudges } from '@/components/nudges/useNudges';
import type { Nudge } from '@/lib/types';
import { NudgePanelContent } from '@/components/nudges/NudgePanelContent';

interface MobileNudgeMenuItemProps {
  activeCount?: number;
  className?: string;
  isDarkSidebar?: boolean;
}

export function MobileNudgeMenuItem({ activeCount = 0, className, isDarkSidebar = false }: MobileNudgeMenuItemProps) {
  const [open, setOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [checkedNudgeIds, setCheckedNudgeIds] = useState<Set<string>>(new Set());

  const { nudges, isLoading } = useNudges();
  const activeNudges = nudges.filter((n) => !n.is_completed);

  function handleCheckboxChange(nudgeId: string, checked: boolean) {
    setCheckedNudgeIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(nudgeId);
      else next.delete(nudgeId);
      return next;
    });
  }

  async function handleComplete(nudge: Nudge) {
    if (nudge.is_completed) return;

    setCompletingId(nudge.id);
    try {
      const response = await fetch(`/api/nudges/${nudge.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_completed: true }),
      });
      if (!response.ok) throw new Error('Failed to complete nudge');

      setCheckedNudgeIds((prev) => {
        const next = new Set(prev);
        next.delete(nudge.id);
        return next;
      });

      window.dispatchEvent(new CustomEvent('nudgeCompleted'));
    } catch (error) {
      console.error('Error completing nudge:', error);
    } finally {
      setCompletingId(null);
    }
  }

  async function handleDelete(nudgeId: string) {
    if (!confirm('Are you sure you want to delete this nudge?')) return;

    setDeletingId(nudgeId);
    try {
      const response = await fetch(`/api/nudges/${nudgeId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete nudge');

      setCheckedNudgeIds((prev) => {
        const next = new Set(prev);
        next.delete(nudgeId);
        return next;
      });

      window.dispatchEvent(new CustomEvent('nudgeDeleted'));
    } catch (error) {
      console.error('Error deleting nudge:', error);
    } finally {
      setDeletingId(null);
    }
  }

  async function handleCreate(content: string) {
    setIsCreating(true);
    try {
      const response = await fetch('/api/nudges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      if (!response.ok) throw new Error('Failed to create nudge');

      window.dispatchEvent(new CustomEvent('nudgeCreated'));
      setShowCreateModal(false);
    } finally {
      setIsCreating(false);
    }
  }

  function handleCreateClick(e: React.MouseEvent) {
    e.stopPropagation();
    setOpen(false);
    setShowCreateModal(true);
  }

  return (
    <>
      <div className="w-full">
        {isDarkSidebar ? (
          <div
            className="flex items-center gap-4 px-6 py-5 text-card-foreground hover:bg-accent hover:text-accent-foreground transition-colors rounded-lg group cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setOpen((prev) => {
                const next = !prev;
                if (!next) setCheckedNudgeIds(new Set());
                return next;
              });
            }}
            aria-expanded={open}
          >
            <div className="w-2 h-2 bg-transparent" />
            <Bell className="h-6 w-6 flex-shrink-0" />
            <span className="flex-1 text-left text-xl font-medium uppercase tracking-wide">
              Need a Nudge?
            </span>
            <ChevronDown
              className={`h-5 w-5 opacity-70 transition-transform ${open ? 'rotate-180' : ''}`}
              style={{ pointerEvents: 'none' }}
            />
            {activeCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                {activeCount > 9 ? '9+' : activeCount}
              </span>
            )}
          </div>
        ) : (
          <Button
            variant="ghost"
            className={`w-full justify-start gap-3 h-12 text-base relative ${className || ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setOpen((prev) => {
                const next = !prev;
                if (!next) setCheckedNudgeIds(new Set());
                return next;
              });
            }}
            aria-expanded={open}
          >
            <Bell className="h-5 w-5 flex-shrink-0" />
            <span className="flex-1 text-left">Need a Nudge?</span>
            <ChevronDown
              className={`h-4 w-4 opacity-70 transition-transform ${open ? 'rotate-180' : ''}`}
              style={{ pointerEvents: 'none' }}
            />

            {activeCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                {activeCount > 9 ? '9+' : activeCount}
              </span>
            )}
          </Button>
        )}

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className={`mt-2 overflow-hidden rounded-xl border shadow-md ${
                isDarkSidebar
                  ? 'bg-card/95 backdrop-blur-sm border-border text-card-foreground'
                  : 'bg-popover text-popover-foreground'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="max-h-[60vh] flex flex-col">
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
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <NudgeModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSubmit={handleCreate}
        isLoading={isCreating}
      />
    </>
  );
}
