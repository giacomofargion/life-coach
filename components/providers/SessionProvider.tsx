'use client';

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';
import { NudgeProvider } from '@/components/nudges/NudgeContext';

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextAuthSessionProvider>
      <NudgeProvider>{children}</NudgeProvider>
    </NextAuthSessionProvider>
  );
}
