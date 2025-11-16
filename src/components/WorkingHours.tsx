import { useState, useEffect } from 'react';
import { supabase, WorkingHours as WorkingHoursType } from '../lib/supabase';
import { Save, Calendar } from 'lucide-react';
import DateOverrides from './DateOverrides';

export default function WorkingHours() {
  const [hours, setHours] = useState<WorkingHoursType[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'weekly' | 'dates'>('weekly');

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    loadHours();
  }, []);

  const loadHours = async () => {
    const { data, error } = await supabase
      .from('working_hours')
      .select('*')
      .order('day_of_week', { ascending: true });

    if (!error && data) {
      setHours(data);
    }
    setLoading(false);
  };

  const updateHours = (dayOfWeek: number, field: string, value: any) => {
    setHours(
      hours.map((h) =>
        h.day_of_week === dayOfWeek ? { ...h, [field]: value } : h
      )
    );
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      for (const hour of hours) {
        const { error } = await supabase
          .from('working_hours')
          .update({
            start_time: hour.start_time,
            end_time: hour.end_time,
            is_active: hour.is_active,
          })
          .eq('day_of_week', hour.day_of_week);

        if (error) {
          console.error('Error updating working hours:', error);
          alert('Failed to save working hours: ' + error.message);
          setSaving(false);
          return;
        }
      }
      alert('Working hours saved successfully!');
    } catch (err) {
      console.error('Error:', err);
      alert('An error occurred while saving working hours');
    }

    setSaving(false);
  };

  if (loading) {
    return <div className="text-center py-12">Loading working hours...</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Working Hours</h1>
        <p className="text-slate-600">Manage your availability schedule</p>
      </div>

      <div className="flex gap-2 mb-6 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('weekly')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'weekly'
              ? 'text-slate-900 border-b-2 border-slate-900'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Weekly Schedule
        </button>
        <button
          onClick={() => setActiveTab('dates')}
          className={`px-4 py-2 font-medium transition-colors inline-flex items-center gap-2 ${
            activeTab === 'dates'
              ? 'text-slate-900 border-b-2 border-slate-900'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Calendar className="h-4 w-4" />
          Specific Dates
        </button>
      </div>

      {activeTab === 'dates' ? (
        <DateOverrides />
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <p className="text-slate-600">Set your default availability for each day of the week</p>
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="h-5 w-5 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="divide-y divide-slate-200">
          {hours.map((hour) => (
            <div key={hour.day_of_week} className="p-6 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-6">
                <div className="w-32">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hour.is_active}
                      onChange={(e) => updateHours(hour.day_of_week, 'is_active', e.target.checked)}
                      className="h-5 w-5 text-slate-900 border-slate-300 rounded focus:ring-slate-900"
                    />
                    <span className="ml-3 text-lg font-medium text-slate-900">
                      {dayNames[hour.day_of_week]}
                    </span>
                  </label>
                </div>

                <div className="flex-1 flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-slate-700">From:</label>
                    <input
                      type="time"
                      value={hour.start_time}
                      onChange={(e) => updateHours(hour.day_of_week, 'start_time', e.target.value)}
                      disabled={!hour.is_active}
                      className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent disabled:bg-slate-100 disabled:text-slate-400"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-slate-700">To:</label>
                    <input
                      type="time"
                      value={hour.end_time}
                      onChange={(e) => updateHours(hour.day_of_week, 'end_time', e.target.value)}
                      disabled={!hour.is_active}
                      className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent disabled:bg-slate-100 disabled:text-slate-400"
                    />
                  </div>

                  {!hour.is_active && (
                    <span className="text-sm text-slate-500 font-medium">Closed</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> These are your default working hours. You can override them for specific
              activities in the Activities section by clicking the palette icon.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
