'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Activity, Calendar, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LogoutButton } from '@/components/auth/LogoutButton';
import { MobileMenu } from '@/components/navigation/MobileMenu';
import { usePathname } from 'next/navigation';

interface NavHeaderProps {
  title: string;
  subtitle?: string;
}

export function NavHeader({ title, subtitle }: NavHeaderProps) {
  const { data: session } = useSession();
  const pathname = usePathname();

  if (!session) {
    return null;
  }

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6">
      <div className="flex-1">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif text-foreground mb-3 font-normal tracking-tight">
          {title}
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
          <Link href="/">
            <Button
              variant={pathname === '/' ? 'default' : 'ghost'}
              className="gap-2 text-foreground hover:bg-accent/50 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>New Session</span>
            </Button>
          </Link>
          <Link href="/activities">
            <Button
              variant={pathname === '/activities' ? 'default' : 'ghost'}
              className="gap-2 text-foreground hover:bg-accent/50 transition-colors"
            >
              <Activity className="h-4 w-4" />
              <span>Manage Activities</span>
            </Button>
          </Link>
          <Link href="/history">
            <Button
              variant={pathname === '/history' ? 'default' : 'ghost'}
              className="gap-2 text-foreground hover:bg-accent/50 transition-colors"
            >
              <Calendar className="h-4 w-4" />
              <span>Session History</span>
            </Button>
          </Link>
          <LogoutButton />
        </div>

        {/* Mobile Menu - shown on mobile/tablet, hidden on lg and above */}
        <MobileMenu />
      </div>
    </div>
  );
}
