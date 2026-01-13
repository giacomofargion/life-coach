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

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<'username' | 'password' | 'email' | 'delete'>('username');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [usernameSuccess, setUsernameSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSuccess, setEmailSuccess] = useState<string | null>(null);
  const [isUsernameLoading, setIsUsernameLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [isEmailLoading, setIsEmailLoading] = useState(false);

  const usernameForm = useForm<UpdateUsernameFormValues>({
    resolver: zodResolver(updateUsernameSchema),
    defaultValues: {
      name: session?.user?.name || '',
    },
  });

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
      const currentValue = usernameForm.getValues('name');
      if (currentValue !== session.user.name) {
        usernameForm.reset({ name: session.user.name });
      }
    }
  }, [open, session?.user?.name, usernameForm]);

  async function handleUpdateUsername(values: UpdateUsernameFormValues) {
    setIsUsernameLoading(true);
    setUsernameError(null);
    setUsernameSuccess(null);

    try {
      const response = await fetch('/api/auth/update-username', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        setUsernameError(data.error || 'Failed to update username');
        setIsUsernameLoading(false);
        return;
      }

      setUsernameSuccess('Username updated successfully');
      // Update session to reflect new username
      await update();
      router.refresh();
      setIsUsernameLoading(false);
    } catch (error) {
      setUsernameError('An unexpected error occurred. Please try again.');
      setIsUsernameLoading(false);
    }
  }

  async function handleUpdatePassword(values: UpdatePasswordFormValues) {
    setIsPasswordLoading(true);
    setPasswordError(null);
    setPasswordSuccess(null);

    try {
      const response = await fetch('/api/auth/update-password', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setPasswordError(data.error || 'Failed to update password');
        setIsPasswordLoading(false);
        return;
      }

      setPasswordSuccess('Password updated successfully');
      passwordForm.reset();
      setIsPasswordLoading(false);
    } catch (error) {
      setPasswordError('An unexpected error occurred. Please try again.');
      setIsPasswordLoading(false);
    }
  }

  async function handleUpdateEmail(values: UpdateEmailFormValues) {
    setIsEmailLoading(true);
    setEmailError(null);
    setEmailSuccess(null);

    try {
      const response = await fetch('/api/auth/update-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        setEmailError(data.error || 'Failed to initiate email change');
        setIsEmailLoading(false);
        return;
      }

      setEmailSuccess('Verification email sent to your new email address. Please check your inbox.');
      emailForm.reset();
      setIsEmailLoading(false);
    } catch (error) {
      setEmailError('An unexpected error occurred. Please try again.');
      setIsEmailLoading(false);
    }
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
      onOpenChange(false);
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Failed to delete account. Please try again.');
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
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
                    onClick={() => {
                      setActiveSection(section.id);
                      // Clear errors/success when switching sections
                      setUsernameError(null);
                      setUsernameSuccess(null);
                      setPasswordError(null);
                      setPasswordSuccess(null);
                      setEmailError(null);
                      setEmailSuccess(null);
                    }}
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
                      {usernameSuccess && (
                        <div className="rounded-lg bg-emerald-600 dark:bg-emerald-700 border border-emerald-700 dark:border-emerald-600 p-4 text-sm text-white font-medium">
                          {usernameSuccess}
                        </div>
                      )}
                      {usernameError && (
                        <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive">
                          {usernameError}
                        </div>
                      )}
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
                                disabled={isUsernameLoading}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" disabled={isUsernameLoading}>
                        {isUsernameLoading ? 'Updating...' : 'Update Username'}
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
                      Update your password. You'll need to enter your current password.
                    </p>
                  </div>
                  <Form {...passwordForm}>
                    <form
                      onSubmit={passwordForm.handleSubmit(handleUpdatePassword)}
                      className="space-y-4"
                    >
                      {passwordSuccess && (
                        <div className="rounded-lg bg-emerald-600 dark:bg-emerald-700 border border-emerald-700 dark:border-emerald-600 p-4 text-sm text-white font-medium">
                          {passwordSuccess}
                        </div>
                      )}
                      {passwordError && (
                        <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive">
                          {passwordError}
                        </div>
                      )}
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
                                disabled={isPasswordLoading}
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
                                disabled={isPasswordLoading}
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
                                disabled={isPasswordLoading}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" disabled={isPasswordLoading}>
                        {isPasswordLoading ? 'Updating...' : 'Update Password'}
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
                      {emailSuccess && (
                        <div className="rounded-lg bg-emerald-600 dark:bg-emerald-700 border border-emerald-700 dark:border-emerald-600 p-4 text-sm text-white font-medium">
                          {emailSuccess}
                        </div>
                      )}
                      {emailError && (
                        <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive">
                          {emailError}
                        </div>
                      )}
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
                                disabled={isEmailLoading}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" disabled={isEmailLoading}>
                        {isEmailLoading ? 'Sending...' : 'Send Verification Email'}
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
        isLoading={isDeleting}
        variant="destructive"
      />
    </>
  );
}
