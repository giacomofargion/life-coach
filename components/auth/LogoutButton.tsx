'use client';

import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await signOut({ redirect: false });
    router.push('/login');
    router.refresh();
  }

  return (
    <Button variant="ghost" onClick={handleLogout}>
      Sign out
    </Button>
  );
}
