'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Priority, EffortLevel } from '@/lib/types';
import { ActivityForm } from '@/components/activities/ActivityForm';
import { ActivityList } from '@/components/activities/ActivityList';
import { NavHeader } from '@/components/navigation/NavHeader';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

export default function ActivitiesPage() {
  const router = useRouter();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | undefined>();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchActivities();
  }, []);

  async function fetchActivities() {
    try {
      setLoading(true);
      const response = await fetch('/api/activities');
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error('Failed to fetch activities');
      }
      const data = await response.json();
      setActivities(data.activities || []);
      setError(null);
    } catch (error) {
      console.error('Error fetching activities:', error);
      setError('Failed to load activities');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(data: { name: string; priority: Priority; effort_level: EffortLevel }) {
    try {
      setSubmitting(true);
      setError(null);

      if (editingActivity) {
        // Update existing activity
        const response = await fetch(`/api/activities/${editingActivity.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error('Failed to update activity');
        }

        const result = await response.json();
        setActivities((prev) =>
          prev.map((a) => (a.id === editingActivity.id ? result.activity : a))
        );
      } else {
        // Create new activity
        const response = await fetch('/api/activities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error('Failed to create activity');
        }

        const result = await response.json();
        setActivities((prev) => [result.activity, ...prev]);
      }

      setShowForm(false);
      setEditingActivity(undefined);
    } catch (error) {
      console.error('Error submitting activity:', error);
      setError('Failed to save activity. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleDeleteClick(id: string) {
    setPendingDeleteId(id);
    setIsDeleteDialogOpen(true);
  }

  async function handleConfirmDelete() {
    if (!pendingDeleteId) return;

    try {
      setDeletingId(pendingDeleteId);
      setError(null);

      const response = await fetch(`/api/activities/${pendingDeleteId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete activity');
      }

      setActivities((prev) => prev.filter((a) => a.id !== pendingDeleteId));

      // Close form if we deleted the activity we were editing
      if (editingActivity?.id === pendingDeleteId) {
        setShowForm(false);
        setEditingActivity(undefined);
      }
    } catch (error) {
      console.error('Error deleting activity:', error);
      setError('Failed to delete activity. Please try again.');
    } finally {
      setDeletingId(null);
      setPendingDeleteId(null);
    }
  }

  function handleDeleteDialogChange(open: boolean) {
    setIsDeleteDialogOpen(open);
    if (!open) {
      setPendingDeleteId(null);
    }
  }

  function handleEdit(activity: Activity) {
    setEditingActivity(activity);
    setShowForm(true);
  }

  function handleCancel() {
    setShowForm(false);
    setEditingActivity(undefined);
  }

  function handleNewActivity() {
    setEditingActivity(undefined);
    setShowForm(true);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading activities...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <NavHeader
            title="Your Practices"
            subtitle="Manage the activities that fuel your growth."
          />
        </div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive"
            >
              {error}
            </motion.div>
          )}

          {showForm ? (
            <ActivityForm
              key="form"
              activity={editingActivity}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              onDelete={handleDeleteClick}
              isLoading={submitting}
            />
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <ActivityList
                activities={activities}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
                deletingId={deletingId}
                onAddNew={handleNewActivity}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <ConfirmDialog
          open={isDeleteDialogOpen}
          onOpenChange={handleDeleteDialogChange}
          title="Delete activity?"
          description="Are you sure you want to delete this activity? This action cannot be undone."
          confirmLabel="Delete"
          cancelLabel="Cancel"
          onConfirm={handleConfirmDelete}
          isLoading={deletingId !== null}
          variant="destructive"
        />
      </div>
    </div>
  );
}
