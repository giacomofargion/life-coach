'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import { Menu, X, Plus, Activity, Calendar, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { signOut } from 'next-auth/react';
import Link from 'next/link';

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Ensure portal only renders on client
  useEffect(() => {
    setMounted(true);
  }, []);

  async function handleLogout() {
    await signOut({ redirect: false });
    router.refresh();
    await router.push('/login');
    setIsOpen(false);
  }

  function handleLinkClick() {
    setIsOpen(false);
  }

  function handleBackdropClick() {
    setIsOpen(false);
  }

  // Render backdrop and menu via portal to escape stacking context issues
  const menuContent = (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[9998] lg:hidden"
            onClick={handleBackdropClick}
          />
        )}
      </AnimatePresence>

      {/* Menu Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{
              duration: 0.4,
              ease: 'easeOut',
            }}
            className="fixed top-4 right-4 z-[9999] w-[calc(100vw-2rem)] max-w-sm bg-card border-2 rounded-xl shadow-2xl lg:hidden"
          >
            <nav className="p-5 flex flex-col gap-8">
              <Link href="/" onClick={handleLinkClick}>
                <Button
                  variant={pathname === '/' ? 'default' : 'ghost'}
                  className="w-full justify-start gap-3 h-12 text-base"
                >
                  <Plus className="h-5 w-5" />
                  <span>New Session</span>
                </Button>
              </Link>

              <Link href="/activities" onClick={handleLinkClick}>
                <Button
                  variant={pathname === '/activities' ? 'default' : 'ghost'}
                  className="w-full justify-start gap-3 h-12 text-base"
                >
                  <Activity className="h-5 w-5" />
                  <span>Manage Activities</span>
                </Button>
              </Link>

              <Link href="/history" onClick={handleLinkClick}>
                <Button
                  variant={pathname === '/history' ? 'default' : 'ghost'}
                  className="w-full justify-start gap-3 h-12 text-base"
                >
                  <Calendar className="h-5 w-5" />
                  <span>Session History</span>
                </Button>
              </Link>

              <div className="pt-2 mt-2 border-t">
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="w-full justify-start gap-3 h-12 text-base text-destructive hover:text-destructive"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Sign out</span>
                </Button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );

  return (
    <>
      {/* Hamburger Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden relative z-[10000]"
        aria-label="Toggle menu"
        aria-expanded={isOpen}
      >
        <motion.div
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          {isOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </motion.div>
      </Button>

      {/* Portal renders menu at document body level to escape stacking contexts */}
      {mounted && createPortal(menuContent, document.body)}
    </>
  );
}
