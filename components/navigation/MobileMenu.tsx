'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import { Menu, X, LogOut, Settings, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { navItems } from '@/components/navigation/navItems';
import { MobileNudgeMenuItem } from '@/components/nudges/MobileNudgeMenuItem';
import { useNudgeCount } from '@/components/nudges/useNudgeCount';
import { SettingsModal } from '@/components/settings/SettingsModal';
import { AboutModal } from '@/components/about/AboutModal';

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const overflowSnapshotRef = useRef<{
    body: string;
    bodyX: string;
    docX: string;
  } | null>(null);
  const closeRequestedRef = useRef(false);
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
      const originalOverflow = overflowSnapshotRef.current?.body ?? document.body.style.overflow;
      const originalOverflowX = overflowSnapshotRef.current?.bodyX ?? document.body.style.overflowX;
      const originalDocOverflowX = overflowSnapshotRef.current?.docX ?? document.documentElement.style.overflowX;
      // Lock scroll
      document.body.style.overflow = 'hidden';
      document.body.style.overflowX = 'hidden';
      document.documentElement.style.overflowX = 'clip';

      // Cleanup function to restore original overflow
      return () => {
        if (closeRequestedRef.current) {
          return;
        }
        document.body.style.overflow = originalOverflow;
        document.body.style.overflowX = originalOverflowX;
        document.documentElement.style.overflowX = originalDocOverflowX;
        overflowSnapshotRef.current = null;
      };
    }
  }, [isOpen]);

  async function handleLogout() {
    await signOut({ redirect: false });
    router.refresh();
    router.push('/login');
    handleClose();
  }

  function handleSettingsClick() {
    setShowSettingsModal(true);
    handleClose();
  }

  function handleAboutClick() {
    setShowAboutModal(true);
    handleClose();
  }

  function handleLinkClick() {
    handleClose();
  }

  function handleToggleClick() {
    if (!isOpen && !overflowSnapshotRef.current) {
      overflowSnapshotRef.current = {
        body: document.body.style.overflow,
        bodyX: document.body.style.overflowX,
        docX: document.documentElement.style.overflowX,
      };
      document.body.style.overflow = 'hidden';
      document.body.style.overflowX = 'hidden';
      document.documentElement.style.overflowX = 'clip';
    }
    if (isOpen) {
      closeRequestedRef.current = true;
    }
    setIsOpen(!isOpen);
  }

  function handleBackdropClick() {
    handleClose();
  }

  function handleClose() {
    closeRequestedRef.current = true;
    setIsOpen(false);
  }

  // Render backdrop and sidebar via portal to escape stacking context issues
  const sidebarContent = (
    <div
      data-mobile-overlay="true"
      className="fixed inset-0 overflow-x-clip z-9998"
    >
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm z-9998 pointer-events-auto"
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
            data-mobile-sidebar="true"
            onAnimationComplete={() => {
              if (!isOpen && closeRequestedRef.current && overflowSnapshotRef.current) {
                document.body.style.overflow = overflowSnapshotRef.current.body;
                document.body.style.overflowX = overflowSnapshotRef.current.bodyX;
                document.documentElement.style.overflowX = overflowSnapshotRef.current.docX;
                closeRequestedRef.current = false;
                overflowSnapshotRef.current = null;
              }
            }}
            className="absolute top-0 right-0 h-full w-[380px] max-w-[85vw] bg-card/95 backdrop-blur-sm border-l border-border z-9999 shadow-2xl pointer-events-auto"
          >
            <nav className="h-full flex flex-col p-8 pt-16 pb-24 md:pb-8">
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
              <div className="flex flex-col gap-4 flex-1 overflow-y-auto min-h-0">
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
                        <div className={`flex items-center gap-4 px-5 py-3 text-card-foreground transition-colors rounded-lg group ${
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
                          <Icon className="h-5 w-5" />
                          <span className="text-base font-medium uppercase tracking-wide">
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
                className="pt-4 mt-4 border-t border-border space-y-3"
              >
                <Button
                  variant="ghost"
                  onClick={handleAboutClick}
                  className="w-full justify-start gap-3 px-5 py-3 h-auto text-base font-medium uppercase tracking-wide hover:bg-accent hover:text-accent-foreground"
                >
                  <Info className="h-5 w-5" />
                  <span>About</span>
                </Button>

                <Button
                  variant="ghost"
                  onClick={handleSettingsClick}
                  className="w-full justify-start gap-3 px-5 py-3 h-auto text-base font-medium uppercase tracking-wide hover:bg-accent hover:text-accent-foreground"
                >
                  <Settings className="h-5 w-5" />
                  <span>Settings</span>
                </Button>

                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="w-full justify-start gap-3 px-5 py-3 h-auto text-base font-medium uppercase tracking-wide text-destructive hover:bg-accent hover:text-destructive"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Sign out</span>
                </Button>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  // Hamburger button - always visible in top-right corner
  const buttonContent = (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggleClick}
      className={`fixed top-4 right-4 pointer-events-auto bg-background/80 backdrop-blur-sm hover:bg-background/90 h-12 w-12 ${
        isOpen ? 'z-10001' : 'z-10000'
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

      {/* Settings Modal */}
      <SettingsModal
        open={showSettingsModal}
        onOpenChange={setShowSettingsModal}
      />

      {/* About Modal */}
      <AboutModal
        open={showAboutModal}
        onOpenChange={setShowAboutModal}
      />
    </>
  );
}
