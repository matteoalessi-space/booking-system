import { useState, useEffect } from 'react';
import { supabase, WorkingHoursDateOverride } from '../lib/supabase';
import { Plus, Trash2, Calendar } from 'lucide-react';

export default function DateOverrides() {
  const [overrides, setOverrides] = useState<WorkingHoursDateOverride[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    specific_date: '',
    start_time: '09:00',
    end_time: '17:00',
    is_open: true,
    label: '',
  });

  useEffect(() => {
    loadOverrides();
  }, []);

  const loadOverrides = async () => {
    const { data, error } = await supabase
      .from('working_hours_date_overrides')
      .select('*')
      .order('specific_date', { ascending: true });

    if (!error && data) {
      setOverrides(data);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase
      .from('working_hours_date_overrides')
      .insert([{
        specific_date: formData.specific_date,
        start_time: formData.start_time,
        end_time: formData.end_time,
        is_open: formData.is_open,
        label: formData.label || null,
      }]);

    if (error) {
      alert('Failed to add date override: ' + error.message);
      return;
    }

    setFormData({
      specific_date: '',
      start_time: '09:00',
      end_time: '17:00',
      is_open: true,
      label: '',
    });
    setShowForm(false);
    loadOverrides();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this date override?')) {
      return;
    }

    const { error } = await supabase
      .from('working_hours_date_overrides')
      .delete()
      .eq('id', id);

    if (error) {
      alert('Failed to delete date override: ' + error.message);
      return;
    }

    loadOverrides();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('it-IT', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return <div className="text-center py-12">Loading date overrides...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Specific Date Overrides</h2>
          <p className="text-slate-600 mt-1">
            Override working hours for specific dates (e.g., holidays, special events)
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Date Override
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">New Date Override</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.specific_date}
                onChange={(e) => setFormData({ ...formData, specific_date: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Label (Optional)
              </label>
              <input
                type="text"
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                placeholder="e.g., Immacolata, Christmas Eve"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_open}
                onChange={(e) => setFormData({ ...formData, is_open: e.target.checked })}
                className="h-5 w-5 text-slate-900 border-slate-300 rounded focus:ring-slate-900"
              />
              <span className="ml-3 text-sm font-medium text-slate-900">
                Open on this date
              </span>
            </label>
          </div>

          {formData.is_open && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Opening Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Closing Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                />
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              Add Override
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {overrides.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
          <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600">No date overrides configured yet.</p>
          <p className="text-slate-500 text-sm mt-2">
            Add date-specific exceptions to your regular working hours.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <div className="divide-y divide-slate-200">
            {overrides.map((override) => (
              <div key={override.id} className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-slate-900">
                        {formatDate(override.specific_date)}
                      </h3>
                      {override.label && (
                        <span className="px-3 py-1 bg-slate-100 text-slate-700 text-sm rounded-full">
                          {override.label}
                        </span>
                      )}
                    </div>
                    <div className="text-slate-600">
                      {override.is_open ? (
                        <span>
                          Open: {override.start_time.substring(0, 5)} - {override.end_time.substring(0, 5)}
                        </span>
                      ) : (
                        <span className="text-red-600 font-medium">Closed</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(override.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete override"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Date-specific overrides take priority over regular working hours.
          Use this to handle holidays, special events, or one-time schedule changes.
        </p>
      </div>
    </div>
  );
}
