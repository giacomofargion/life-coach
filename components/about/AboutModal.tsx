'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface AboutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AboutModal({ open, onOpenChange }: AboutModalProps) {
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

  // Match NudgeModal visual viewport handling
  React.useEffect(() => {
    if (!open) return;

    const update = () => {
      const el = scrollContainerRef.current;
      if (!el) return;

      const visualHeight = window.visualViewport?.height ?? window.innerHeight;
      el.style.setProperty('--vvh', `${visualHeight}px`);
    };

    update();
    const onResize = () => update();
    const onVvResize = () => update();

    window.addEventListener('resize', onResize);
    window.visualViewport?.addEventListener('resize', onVvResize);

    return () => {
      window.removeEventListener('resize', onResize);
      window.visualViewport?.removeEventListener('resize', onVvResize);
    };
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md rounded-2xl border-none shadow-2xl bg-card/95 backdrop-blur-sm p-0 flex flex-col max-h-[90vh] top-4 translate-y-0 md:top-[50%] md:translate-y-[-50%]"
        style={{ maxHeight: 'calc(var(--vvh, 100vh) - 2rem)' }}
      >
        <div
          ref={scrollContainerRef}
          className="overflow-y-auto overscroll-contain touch-pan-y flex-1 min-h-0 p-8"
          style={{ maxHeight: 'calc(var(--vvh, 100vh) - 2rem)' }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key="about"
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
                    <Info className="h-8 w-8 text-primary" />
                  </div>
                </motion.div>
                <DialogTitle className="text-3xl md:text-4xl font-serif font-normal text-primary tracking-tight">
                  About
                </DialogTitle>
                <DialogDescription className="text-base text-muted-foreground max-w-sm mx-auto">
                Nudge Me Gently helps you plan mindful sessions, track activities, and stay on track with gentle reminders. It’s designed to reduce decision paralysis, so you can choose tasks based on your energy level and take one small next step. It’s for days when you want guidance, not more to‑do lists.
                </DialogDescription>
              </DialogHeader>

              <Button
                type="button"
                onClick={() => onOpenChange(false)}
                className="w-full h-14 rounded-xl text-lg font-medium shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                size="lg"
              >
                Close
              </Button>
            </motion.div>
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
