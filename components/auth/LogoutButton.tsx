'use client';

import { signOut } from 'next-auth/react';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await signOut({ redirect: false });
    // Refresh router cache to clear any server-side session data
    router.refresh();
    await router.push('/login');
  }

  return (
    <Button variant="ghost" onClick={handleLogout} className="gap-2">
      <LogOut className="h-4 w-4" />
      <span>Sign out</span>
    </Button>
  );
}
