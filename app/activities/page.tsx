'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Activity, Priority, EffortLevel } from '@/lib/types';
import { ActivityForm } from '@/components/activities/ActivityForm';
import { ActivityList } from '@/components/activities/ActivityList';
import { Button } from '@/components/ui/button';
import { LogoutButton } from '@/components/auth/LogoutButton';

export default function ActivitiesPage() {
  const router = useRouter();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | undefined>();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this activity?')) {
      return;
    }

    try {
      setDeletingId(id);
      setError(null);

      const response = await fetch(`/api/activities/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete activity');
      }

      setActivities((prev) => prev.filter((a) => a.id !== id));
    } catch (error) {
      console.error('Error deleting activity:', error);
      setError('Failed to delete activity. Please try again.');
    } finally {
      setDeletingId(null);
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
    <div className="min-h-screen p-6 md:p-8 bg-gradient-to-br from-[#f5f3f0] via-[#f8f6f3] to-[#f0f2f0]">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12">
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-serif font-normal text-foreground mb-3">
              Your Practices
            </h1>
            <p className="text-base text-muted-foreground">
              Manage the activities that fuel your growth.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <LogoutButton />
          </div>
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
              onDelete={async (id) => {
                await handleDelete(id);
                setShowForm(false);
                setEditingActivity(undefined);
              }}
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
                onDelete={handleDelete}
                deletingId={deletingId}
                onAddNew={handleNewActivity}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
