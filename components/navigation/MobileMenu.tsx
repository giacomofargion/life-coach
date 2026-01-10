'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import { Menu, X, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { navItems } from '@/components/navigation/navItems';

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [buttonPosition, setButtonPosition] = useState<{ top: number; right: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  const pathname = usePathname();

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
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href} onClick={handleLinkClick}>
                    <Button
                      variant={pathname === item.href ? 'default' : 'ghost'}
                      className="w-full justify-start gap-3 h-12 text-base"
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </Button>
                  </Link>
                );
              })}

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

  // Render hamburger button via portal when menu is open to ensure it stays above the menu panel
  const buttonContent = (
    <Button
      variant="ghost"
      size="icon"
      ref={buttonRef}
      onClick={() => {
        const newState = !isOpen;

        if (!isOpen && buttonRef.current) {
          // Capture button position before opening menu
          const rect = buttonRef.current.getBoundingClientRect();
          setButtonPosition({ top: rect.top, right: window.innerWidth - rect.right });
        }

        setIsOpen(newState);
      }}
      className={`lg:hidden relative pointer-events-auto ${isOpen ? 'z-[10001]' : 'z-[10000]'}`}
      aria-label="Toggle menu"
      aria-expanded={isOpen}
      style={isOpen && buttonPosition ? { position: 'fixed', top: `${buttonPosition.top}px`, right: `${buttonPosition.right}px`, zIndex: 10001 } : undefined}
    >
        <div className="relative w-6 h-6 flex items-center justify-center">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ opacity: 0, rotate: -90, scale: 0.8 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <X className="h-6 w-6 text-foreground" style={{ pointerEvents: 'none' }} />
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              initial={{ opacity: 0, rotate: 90, scale: 0.8 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Menu className="h-6 w-6 text-foreground" style={{ pointerEvents: 'none' }} />
            </motion.div>
          )}
        </div>
      </Button>
  );

  return (
    <>
      {/* Hamburger Button - render via portal when menu is open to stay above menu panel */}
      {mounted && isOpen ? (
        createPortal(buttonContent, document.body)
      ) : (
        buttonContent
      )}

      {/* Portal renders menu at document body level to escape stacking contexts */}
      {mounted && createPortal(menuContent, document.body)}
    </>
  );
}
