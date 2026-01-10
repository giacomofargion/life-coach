'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LogoutButton } from '@/components/auth/LogoutButton';
import { MobileMenu } from '@/components/navigation/MobileMenu';
import { usePathname } from 'next/navigation';
import { navItems } from '@/components/navigation/navItems';
import { NudgeButton } from '@/components/nudges/NudgeButton';
import { useNudgeCount } from '@/components/nudges/useNudgeCount';

interface NavHeaderProps {
  title: string;
  subtitle?: string;
}

export function NavHeader({ title, subtitle }: NavHeaderProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const { activeCount } = useNudgeCount();

  if (!session) {
    return null;
  }

  // Personalize title for "Life Coach App" when user has a name
  const displayTitle =
    title === 'Life Coach App' && session.user?.name
      ? `${session.user.name}'s Life Coach`
      : title;

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6">
      <div className="flex-1">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif text-foreground mb-3 font-normal tracking-tight">
          {displayTitle}
        </h1>
        {subtitle && (
          <p className="text-base text-muted-foreground">
            {subtitle}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2">
        {/* Desktop Navigation - hidden on mobile, shown on lg and above */}
        <div className="hidden lg:flex flex-wrap gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={pathname === item.href ? 'default' : 'ghost'}
                  className="gap-2 text-foreground hover:bg-accent/50 transition-colors"
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Button>
              </Link>
            );
          })}
          <NudgeButton activeCount={activeCount} />
          <LogoutButton />
        </div>

        {/* Mobile Menu - shown on mobile/tablet, hidden on lg and above */}
        <MobileMenu />
      </div>
    </div>
  );
}
