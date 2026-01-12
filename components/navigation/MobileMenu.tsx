'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import { Menu, X, LogOut, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { navItems } from '@/components/navigation/navItems';
import { MobileNudgeMenuItem } from '@/components/nudges/MobileNudgeMenuItem';
import { useNudgeCount } from '@/components/nudges/useNudgeCount';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { activeCount } = useNudgeCount();

  // Ensure portal only renders on client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      // Save the original overflow value
      const originalOverflow = document.body.style.overflow;
      // Lock scroll
      document.body.style.overflow = 'hidden';

      // Cleanup function to restore original overflow
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  async function handleLogout() {
    await signOut({ redirect: false });
    router.refresh();
    router.push('/login');
    setIsOpen(false);
  }

  async function handleDeleteAccount() {
    setIsDeleting(true);
    try {
      const response = await fetch('/api/auth/delete-account', {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete account');
      }

      // Sign out and redirect to login
      await signOut({ redirect: false });
      router.refresh();
      router.push('/login');
      setIsOpen(false);
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Failed to delete account. Please try again.');
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  }

  function handleLinkClick() {
    setIsOpen(false);
  }

  function handleBackdropClick() {
    setIsOpen(false);
  }

  // Render backdrop and sidebar via portal to escape stacking context issues
  const sidebarContent = (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[9998]"
            onClick={handleBackdropClick}
          />
        )}
      </AnimatePresence>

      {/* Sidebar Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{
              duration: 0.4,
              ease: [0.4, 0, 0.2, 1],
            }}
            className="fixed top-0 right-0 h-full w-[380px] max-w-[85vw] bg-card/95 backdrop-blur-sm border-l border-border z-[9999] shadow-2xl"
          >
            <nav className="h-full flex flex-col p-8 pt-16">
              {/* Close button in sidebar */}
              <div className="absolute top-4 right-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="hover:bg-accent h-12 w-12"
                  aria-label="Close menu"
                >
                  <X className="h-8 w-8" />
                </Button>
              </div>

              {/* Navigation Items */}
              <div className="flex flex-col gap-10 flex-1">
                {navItems.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: index * 0.05,
                        duration: 0.3,
                      }}
                    >
                      <Link href={item.href} onClick={handleLinkClick}>
                        <div className={`flex items-center gap-6 px-6 py-5 text-card-foreground transition-colors rounded-lg group ${
                          isActive
                            ? 'bg-accent text-accent-foreground'
                            : 'hover:bg-accent hover:text-accent-foreground'
                        }`}>
                          {isActive && (
                            <div className="w-2 h-2 bg-destructive rounded-sm" />
                          )}
                          {!isActive && (
                            <div className="w-2 h-2 bg-transparent" />
                          )}
                          <Icon className="h-6 w-6" />
                          <span className="text-xl font-medium uppercase tracking-wide">
                            {item.label}
                          </span>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: navItems.length * 0.05,
                    duration: 0.3,
                  }}
                  className="w-full"
                >
                  <MobileNudgeMenuItem
                    activeCount={activeCount}
                    className="w-full"
                    isDarkSidebar={true}
                  />
                </motion.div>
              </div>

              {/* Sign out section */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  delay: (navItems.length + 1) * 0.05,
                  duration: 0.3,
                }}
                className="pt-6 mt-6 border-t border-border space-y-4"
              >
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="w-full justify-start gap-4 px-6 py-5 h-auto text-xl font-medium uppercase tracking-wide text-destructive hover:bg-accent hover:text-destructive"
                >
                  <LogOut className="h-6 w-6" />
                  <span>Sign out</span>
                </Button>

                {/* Delete Account Button */}
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowDeleteDialog(true);
                    setIsOpen(false);
                  }}
                  className="w-full justify-start gap-4 px-6 py-5 h-auto text-xl font-medium uppercase tracking-wide text-destructive/80 hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-6 w-6" />
                  <span>Delete Account</span>
                </Button>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );

  // Hamburger button - always visible in top-right corner
  const buttonContent = (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setIsOpen(!isOpen)}
      className={`fixed top-4 right-4 pointer-events-auto bg-background/80 backdrop-blur-sm hover:bg-background/90 h-12 w-12 ${
        isOpen ? 'z-[10001]' : 'z-[10000]'
      }`}
      aria-label="Toggle menu"
      aria-expanded={isOpen}
    >
      <div className="relative w-8 h-8 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ opacity: 0, rotate: -90, scale: 0.8 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 90, scale: 0.8 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <X className="h-8 w-8 text-foreground" style={{ pointerEvents: 'none' }} />
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              initial={{ opacity: 0, rotate: 90, scale: 0.8 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: -90, scale: 0.8 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Menu className="h-8 w-8 text-foreground" style={{ pointerEvents: 'none' }} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Button>
  );

  return (
    <>
      {/* Hamburger Button - always visible in top-right */}
      {mounted ? createPortal(buttonContent, document.body) : buttonContent}

      {/* Portal renders sidebar at document body level to escape stacking contexts */}
      {mounted && createPortal(sidebarContent, document.body)}

      {/* Delete Account Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Account"
        description="Are you sure you want to delete your account? This action cannot be undone. All your data including activities, sessions, and nudges will be permanently deleted."
        confirmLabel="Delete Account"
        cancelLabel="Cancel"
        onConfirm={handleDeleteAccount}
        isLoading={isDeleting}
        variant="destructive"
      />
    </>
  );
}
