import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Palette, ExternalLink, Clock } from 'lucide-react';
import { supabase, Activity } from '../lib/supabase';
import ActivityForm from './ActivityForm';
import WidgetCustomizer from './WidgetCustomizer';
import FormFieldsEditor from './FormFieldsEditor';
import ActivityWorkingHours from './ActivityWorkingHours';

export default function ActivityManager() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [customizingActivity, setCustomizingActivity] = useState<Activity | null>(null);
  const [editingFields, setEditingFields] = useState<Activity | null>(null);
  const [editingHours, setEditingHours] = useState<Activity | null>(null);

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setActivities(data);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this activity?')) return;

    const { error } = await supabase
      .from('activities')
      .delete()
      .eq('id', id);

    if (!error) {
      loadActivities();
    }
  };

  const handleSave = () => {
    loadActivities();
    setShowForm(false);
    setEditingActivity(null);
  };

  if (customizingActivity) {
    return (
      <WidgetCustomizer
        activity={customizingActivity}
        onBack={() => setCustomizingActivity(null)}
        onSave={() => {
          loadActivities();
          setCustomizingActivity(null);
        }}
      />
    );
  }

  if (editingFields) {
    return (
      <FormFieldsEditor
        activity={editingFields}
        onBack={() => setEditingFields(null)}
      />
    );
  }

  if (showForm) {
    return (
      <ActivityForm
        activity={editingActivity}
        onSave={handleSave}
        onCancel={() => {
          setShowForm(false);
          setEditingActivity(null);
        }}
      />
    );
  }

  if (loading) {
    return <div className="text-center py-12">Loading activities...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Activities</h1>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Activity
        </button>
      </div>

      <div className="grid gap-4">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: activity.color }}
                  />
                  <h3 className="text-xl font-semibold text-slate-900">{activity.name}</h3>
                  {!activity.is_active && (
                    <span className="px-2 py-1 text-xs font-medium bg-slate-100 text-slate-600 rounded-full">
                      Inactive
                    </span>
                  )}
                </div>
                {activity.description && (
                  <p className="text-slate-600 mb-3">{activity.description}</p>
                )}
                <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                  <span>Duration: {activity.duration_minutes} minutes</span>
                  <span>Capacity: {activity.max_capacity} people</span>
                  {activity.shopify_variant_id && (
                    <span>Shopify Variant: {activity.shopify_variant_id}</span>
                  )}
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <a
                  href={`/widget.html?activityId=${activity.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                  title="View Widget"
                >
                  <ExternalLink className="h-5 w-5" />
                </a>
                <button
                  onClick={() => setEditingHours(activity)}
                  className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Custom Working Hours"
                >
                  <Clock className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setEditingFields(activity)}
                  className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Edit Form Fields"
                >
                  <Edit2 className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setCustomizingActivity(activity)}
                  className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Customize Widget"
                >
                  <Palette className="h-5 w-5" />
                </button>
                <button
                  onClick={() => {
                    setEditingActivity(activity);
                    setShowForm(true);
                  }}
                  className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Edit Activity"
                >
                  <Edit2 className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDelete(activity.id)}
                  className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete Activity"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {activities.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
            <p className="text-slate-500">No activities yet. Create your first activity to get started.</p>
          </div>
        )}
      </div>

      {editingHours && (
        <ActivityWorkingHours
          activityId={editingHours.id}
          activityName={editingHours.name}
          onClose={() => setEditingHours(null)}
        />
      )}
    </div>
  );
}
