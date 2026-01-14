'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { User, Lock, Mail, Trash2, Settings as SettingsIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useFormSubmit } from '@/lib/hooks/useFormSubmit';

const updateUsernameSchema = z.object({
  name: z.string().min(1, 'Name is required'),
});

const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

const updateEmailSchema = z.object({
  newEmail: z.string().email('Please enter a valid email address'),
});

type UpdateUsernameFormValues = z.infer<typeof updateUsernameSchema>;
type UpdatePasswordFormValues = z.infer<typeof updatePasswordSchema>;
type UpdateEmailFormValues = z.infer<typeof updateEmailSchema>;

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Reusable alert components for consistency
function SuccessAlert({ message }: { message: string }) {
  return (
    <div className="rounded-lg bg-emerald-600 border border-emerald-700 p-4 text-sm text-white font-medium">
      {message}
    </div>
  );
}

function ErrorAlert({ message }: { message: string }) {
  return (
    <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive">
      {message}
    </div>
  );
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<'username' | 'password' | 'email' | 'delete'>('username');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Form submit hooks for each section
  const usernameSubmit = useFormSubmit();
  const passwordSubmit = useFormSubmit();
  const emailSubmit = useFormSubmit();
  const deleteSubmit = useFormSubmit();

  const usernameForm = useForm<UpdateUsernameFormValues>({
    resolver: zodResolver(updateUsernameSchema),
    defaultValues: {
      name: session?.user?.name || '',
    },
  });

  // Extract stable methods to avoid re-renders
  const { reset: resetUsernameForm, getValues: getUsernameFormValues } = usernameForm;

  const passwordForm = useForm<UpdatePasswordFormValues>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const emailForm = useForm<UpdateEmailFormValues>({
    resolver: zodResolver(updateEmailSchema),
    defaultValues: {
      newEmail: '',
    },
  });

  // Update username form when session changes (only when modal opens or session updates after save)
  useEffect(() => {
    if (open && session?.user?.name) {
      const currentValue = getUsernameFormValues('name');
      if (currentValue !== session.user.name) {
        resetUsernameForm({ name: session.user.name });
      }
    }
  }, [open, session?.user?.name, resetUsernameForm, getUsernameFormValues]);

  async function handleUpdateUsername(values: UpdateUsernameFormValues) {
    await usernameSubmit.execute(
      async () => {
        const response = await fetch('/api/auth/update-username', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to update username');
        }

        return data;
      },
      {
        successMessage: 'Username updated successfully',
        onSuccess: async () => {
          await update();
          router.refresh();
        },
      }
    );
  }

  async function handleUpdatePassword(values: UpdatePasswordFormValues) {
    await passwordSubmit.execute(
      async () => {
        const response = await fetch('/api/auth/update-password', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            currentPassword: values.currentPassword,
            newPassword: values.newPassword,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to update password');
        }

        return data;
      },
      {
        successMessage: 'Password updated successfully',
        onSuccess: () => {
          passwordForm.reset();
        },
      }
    );
  }

  async function handleUpdateEmail(values: UpdateEmailFormValues) {
    await emailSubmit.execute(
      async () => {
        const response = await fetch('/api/auth/update-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to initiate email change');
        }

        return data;
      },
      {
        successMessage: 'Verification email sent to your new email address. Please check your inbox.',
        onSuccess: () => {
          emailForm.reset();
        },
      }
    );
  }

  async function handleDeleteAccount() {
    await deleteSubmit.execute(
      async () => {
        const response = await fetch('/api/auth/delete-account', {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete account');
        }

        return response;
      },
      {
        onSuccess: async () => {
          await signOut({ redirect: false });
          router.refresh();
          router.push('/login');
          onOpenChange(false);
          setShowDeleteDialog(false);
        },
      }
    );
  }

  function handleSectionChange(sectionId: typeof activeSection) {
    setActiveSection(sectionId);
    // Clear all form states when switching sections
    usernameSubmit.reset();
    passwordSubmit.reset();
    emailSubmit.reset();
    deleteSubmit.reset();
  }

  const sections = [
    { id: 'username' as const, label: 'Username', icon: User },
    { id: 'password' as const, label: 'Password', icon: Lock },
    { id: 'email' as const, label: 'Email', icon: Mail },
    { id: 'delete' as const, label: 'Delete Account', icon: Trash2 },
  ];

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border-none shadow-2xl bg-card/95 backdrop-blur-sm p-0">
          <DialogHeader className="px-8 pt-8 pb-4 border-b border-border">
            <DialogTitle className="text-2xl md:text-3xl font-serif font-normal text-foreground tracking-tight flex items-center gap-3">
              <SettingsIcon className="h-6 w-6" />
              Settings
            </DialogTitle>
            <DialogDescription className="text-base text-muted-foreground">
              Manage your account settings
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col sm:flex-row">
            {/* Sidebar Navigation */}
            <div className="w-full sm:w-48 border-b sm:border-b-0 sm:border-r border-border p-4 sm:p-6 space-y-2">
              {sections.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => handleSectionChange(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-accent text-accent-foreground'
                        : 'hover:bg-accent/50 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{section.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Content Area */}
            <div className="flex-1 p-6 sm:p-8">
              {/* Username Section */}
              {activeSection === 'username' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Change Username</h3>
                    <p className="text-sm text-muted-foreground">
                      Update your display name.
                    </p>
                  </div>
                  <Form {...usernameForm}>
                    <form
                      onSubmit={usernameForm.handleSubmit(handleUpdateUsername)}
                      className="space-y-4"
                    >
                      {usernameSubmit.success && <SuccessAlert message={usernameSubmit.success} />}
                      {usernameSubmit.error && <ErrorAlert message={usernameSubmit.error} />}
                      <FormField
                        control={usernameForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input
                                type="text"
                                placeholder="Your name"
                                {...field}
                                disabled={usernameSubmit.isLoading}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" disabled={usernameSubmit.isLoading}>
                        {usernameSubmit.isLoading ? 'Updating...' : 'Update Username'}
                      </Button>
                    </form>
                  </Form>
                </div>
              )}

              {/* Password Section */}
              {activeSection === 'password' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Change Password</h3>
                    <p className="text-sm text-muted-foreground">
                      Update your password. You&apos;ll need to enter your current password.
                    </p>
                  </div>
                  <Form {...passwordForm}>
                    <form
                      onSubmit={passwordForm.handleSubmit(handleUpdatePassword)}
                      className="space-y-4"
                    >
                      {passwordSubmit.success && <SuccessAlert message={passwordSubmit.success} />}
                      {passwordSubmit.error && <ErrorAlert message={passwordSubmit.error} />}
                      <FormField
                        control={passwordForm.control}
                        name="currentPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Password</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="Enter current password"
                                {...field}
                                disabled={passwordSubmit.isLoading}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={passwordForm.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>New Password</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="At least 8 characters"
                                {...field}
                                disabled={passwordSubmit.isLoading}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={passwordForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm New Password</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="Confirm your new password"
                                {...field}
                                disabled={passwordSubmit.isLoading}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" disabled={passwordSubmit.isLoading}>
                        {passwordSubmit.isLoading ? 'Updating...' : 'Update Password'}
                      </Button>
                    </form>
                  </Form>
                </div>
              )}

              {/* Email Section */}
              {activeSection === 'email' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Change Email</h3>
                    <p className="text-sm text-muted-foreground">
                      Update your email address. A verification email will be sent to your new address.
                    </p>
                    {session?.user?.email && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Current email: <span className="font-medium">{session.user.email}</span>
                      </p>
                    )}
                  </div>
                  <Form {...emailForm}>
                    <form
                      onSubmit={emailForm.handleSubmit(handleUpdateEmail)}
                      className="space-y-4"
                    >
                      {emailSubmit.success && <SuccessAlert message={emailSubmit.success} />}
                      {emailSubmit.error && <ErrorAlert message={emailSubmit.error} />}
                      <FormField
                        control={emailForm.control}
                        name="newEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>New Email</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="new@example.com"
                                {...field}
                                disabled={emailSubmit.isLoading}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" disabled={emailSubmit.isLoading}>
                        {emailSubmit.isLoading ? 'Sending...' : 'Send Verification Email'}
                      </Button>
                    </form>
                  </Form>
                </div>
              )}

              {/* Delete Account Section */}
              {activeSection === 'delete' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-destructive">Delete Account</h3>
                    <p className="text-sm text-muted-foreground">
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                  </div>
                  {deleteSubmit.error && <ErrorAlert message={deleteSubmit.error} />}
                  <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 space-y-4">
                    <p className="text-sm text-destructive font-medium">
                      Warning: This will permanently delete:
                    </p>
                    <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 ml-2">
                      <li>Your account and profile information</li>
                      <li>All your activities</li>
                      <li>All your sessions</li>
                      <li>All your nudges</li>
                    </ul>
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => setShowDeleteDialog(true)}
                      className="w-full sm:w-auto"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Account
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Account"
        description="Are you sure you want to delete your account? This action cannot be undone. All your data including activities, sessions, and nudges will be permanently deleted."
        confirmLabel="Delete Account"
        cancelLabel="Cancel"
        onConfirm={handleDeleteAccount}
        isLoading={deleteSubmit.isLoading}
        variant="destructive"
      />
    </>
  );
}
