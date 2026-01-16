'use client';

import { useState } from 'react';
import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface NudgeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (content: string) => Promise<void>;
  isLoading?: boolean;
}

export function NudgeModal({
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
}: NudgeModalProps) {
  const [content, setContent] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const maxLength = 150;
  const scrollContainerRef = React.useRef<HTMLDivElement | null>(null);

  // Lock body scroll when modal is open
  React.useEffect(() => {
    if (open) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [open]);

  // Make the modal height respond to the *visual viewport* (mobile keyboard).
  // On iOS, the keyboard often reduces visualViewport.height but not 100vh, so without this
  // the dialog appears "covered" and can't scroll unless something inside (like the textarea) scrolls.
  React.useEffect(() => {
    if (!open) return;

    const update = (reason: string) => {
      const el = scrollContainerRef.current;
      if (!el) return;

      const visualHeight = window.visualViewport?.height ?? window.innerHeight;
      el.style.setProperty('--vvh', `${visualHeight}px`);
    };

    update('open');
    const onResize = () => update('window-resize');
    const onVvResize = () => update('visualViewport-resize');

    window.addEventListener('resize', onResize);
    window.visualViewport?.addEventListener('resize', onVvResize);

    return () => {
      window.removeEventListener('resize', onResize);
      window.visualViewport?.removeEventListener('resize', onVvResize);
    };
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || content.trim().length > maxLength) {
      return;
    }

    try {
      await onSubmit(content.trim());
      setIsSuccess(true);
      setContent('');
      // Close modal after brief success animation
      setTimeout(() => {
        setIsSuccess(false);
        onOpenChange(false);
      }, 1500);
    } catch (error) {
      console.error('Error creating nudge:', error);
      // Error handling could be added here if needed
    }
  }

  function handleOpenChange(newOpen: boolean) {
    if (!newOpen && !isLoading) {
      setIsSuccess(false);
      setContent('');
    }
    onOpenChange(newOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        // On mobile, anchor the dialog near the top so it's not centered behind the keyboard.
        className="sm:max-w-md rounded-2xl border-none shadow-2xl bg-card/95 backdrop-blur-sm p-0 flex flex-col max-h-[90vh] top-4 translate-y-0 md:top-[50%] md:translate-y-[-50%]"
        // Use dvh/visual viewport when available; fallback is 90vh from base.
        style={{ maxHeight: 'calc(var(--vvh, 100vh) - 2rem)' }}
      >
        <div
          ref={scrollContainerRef}
          className="overflow-y-auto overscroll-contain touch-pan-y flex-1 min-h-0 p-8"
          style={{ maxHeight: 'calc(var(--vvh, 100vh) - 2rem)' }}
        >
          <AnimatePresence mode="wait">
            {!isSuccess ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
              <DialogHeader className="space-y-4 text-center pb-4">
                <motion.div
                  initial={{ scale: 0, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.1, type: 'spring' }}
                  className="flex justify-center mb-2"
                >
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <Lightbulb className="h-8 w-8 text-primary" />
                  </div>
                </motion.div>
                <DialogTitle className="text-3xl md:text-4xl font-serif font-normal text-primary tracking-tight">
                  Need a Nudge?
                </DialogTitle>
                <DialogDescription className="text-base text-muted-foreground max-w-sm mx-auto">
                  Sometimes we need a gentle reminder. What would you like a nudge about?
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="e.g., 'Call mom', 'Water the plants', 'Review that proposal'"
                    disabled={isLoading}
                    maxLength={maxLength}
                    className="min-h-[100px] resize-none rounded-xl bg-background/50 border-none focus-visible:ring-primary/20 text-base font-serif"
                  />
                  <div className="flex justify-between items-center text-xs text-muted-foreground px-1">
                    <span>Keep it simple and casual</span>
                    <span className={content.length > maxLength - 10 ? 'text-destructive' : ''}>
                      {content.length}/{maxLength}
                    </span>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || !content.trim() || content.trim().length > maxLength}
                  className="w-full h-14 rounded-xl text-lg font-medium shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  size="lg"
                >
                  {isLoading ? 'Setting nudge...' : "I'll remember that"}
                </Button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center py-8 space-y-4"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: 'spring', bounce: 0.4 }}
                className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center"
              >
                <Check className="h-8 w-8 text-primary" />
              </motion.div>
              <DialogTitle className="text-2xl font-serif font-normal text-primary text-center">
                Nudge set!
              </DialogTitle>
              <DialogDescription className="text-center text-muted-foreground">
                You&apos;ll receive a gentle reminder tomorrow at 8am.
              </DialogDescription>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
