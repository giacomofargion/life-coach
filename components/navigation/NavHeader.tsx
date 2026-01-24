'use client';

import { useSession } from 'next-auth/react';
import { MobileMenu } from '@/components/navigation/MobileMenu';

interface NavHeaderProps {
  title: string;
  subtitle?: string;
}

export function NavHeader({ title, subtitle }: NavHeaderProps) {
  const { data: session } = useSession();

  if (!session) {
    return null;
  }

  // Personalize title for "Life Coach App" when user has a name
  const personalizedName =
    title === 'Life Coach App' ? session.user?.name : undefined;

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6">
      <div className="flex-1">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif text-foreground mb-3 font-normal tracking-tight">
          {personalizedName ? (
            <>
              Nudge{' '}
              <span className="rounded-full bg-primary/15 px-2.5 py-1 text-primary font-semibold shadow-[0_0_18px_rgba(16,185,129,0.35)]">
                {personalizedName}
              </span>{' '}
              Gently
            </>
          ) : (
            title
          )}
        </h1>
        {subtitle && (
          <p className="text-base text-muted-foreground">
            {subtitle}
          </p>
        )}
      </div>
      {/* Hamburger menu button is always visible and positioned in MobileMenu component */}
      <MobileMenu />
    </div>
  );
}
