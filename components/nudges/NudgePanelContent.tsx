'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Lightbulb, Loader2, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import type { Nudge } from '@/lib/types';

interface NudgePanelContentProps {
  activeCount: number;
  activeNudges: Nudge[];
  isLoading: boolean;
  checkedNudgeIds: Set<string>;
  completingId: string | null;
  deletingId: string | null;
  onCheckboxChange: (nudgeId: string, checked: boolean) => void;
  onComplete: (nudge: Nudge) => void;
  onDelete: (nudgeId: string) => void;
  onCreateClick: (e: React.MouseEvent) => void;
}

export function NudgePanelContent({
  activeCount,
  activeNudges,
  isLoading,
  checkedNudgeIds,
  completingId,
  deletingId,
  onCheckboxChange,
  onComplete,
  onDelete,
  onCreateClick,
}: NudgePanelContentProps) {
  return (
    <>
      <div className="p-4 border-b flex-shrink-0">
        <div className="flex items-center gap-2 mb-1">
          <Lightbulb className="h-5 w-5 text-primary flex-shrink-0" />
          <h3 className="font-serif text-lg text-foreground">Your Nudges</h3>
        </div>
        {activeCount > 0 && (
          <p className="text-sm text-muted-foreground">
            {activeCount} active {activeCount === 1 ? 'nudge' : 'nudges'}
          </p>
        )}
      </div>

      <div className="overflow-y-auto flex-1 min-h-0 scrollbar-hide">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : activeNudges.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              No active nudges. Add one to get started!
            </p>
            <Button onClick={onCreateClick} className="w-full" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add your first nudge
            </Button>
          </div>
        ) : (
          <div className="p-2">
            <AnimatePresence>
              {activeNudges.map((nudge) => {
                const isChecked = checkedNudgeIds.has(nudge.id);
                const isCompleting = completingId === nudge.id;
                const isDeleting = deletingId === nudge.id;

                return (
                  <motion.div
                    key={nudge.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="group flex flex-col gap-2 p-3 rounded-lg hover:bg-accent/50 transition-colors touch-manipulation"
                  >
                    <div className="flex items-start gap-3">
                      <div className="pt-1 flex-shrink-0 flex items-center justify-center">
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={(checked) => {
                            onCheckboxChange(nudge.id, checked === true);
                          }}
                          disabled={isCompleting || isDeleting}
                          className="h-5 w-5 cursor-pointer"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground font-serif break-words">
                          {nudge.content}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(nudge.created_at).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity touch-manipulation"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(nudge.id);
                        }}
                        disabled={isDeleting}
                      >
                        {isDeleting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 text-destructive" />
                        )}
                      </Button>
                    </div>

                    {isChecked && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex justify-end"
                      >
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            onComplete(nudge);
                          }}
                          disabled={isCompleting}
                          size="sm"
                          variant="default"
                          className="gap-2"
                        >
                          {isCompleting ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Completing...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="h-4 w-4" />
                              Mark as complete
                            </>
                          )}
                        </Button>
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {activeNudges.length > 0 && (
        <div className="p-4 border-t flex-shrink-0">
          <Button onClick={onCreateClick} className="w-full" size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add new nudge
          </Button>
        </div>
      )}
    </>
  );
}
