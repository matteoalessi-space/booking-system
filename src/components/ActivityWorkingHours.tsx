import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Save, X, Clock } from 'lucide-react';

interface ActivityWorkingHoursProps {
  activityId: string;
  activityName: string;
  onClose: () => void;
}

interface ActivityOverride {
  id?: string;
  activity_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

interface DefaultHours {
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

export default function ActivityWorkingHours({ activityId, activityName, onClose }: ActivityWorkingHoursProps) {
  const [overrides, setOverrides] = useState<ActivityOverride[]>([]);
  const [defaultHours, setDefaultHours] = useState<DefaultHours[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const dayNames = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];

  useEffect(() => {
    loadData();
  }, [activityId]);

  const loadData = async () => {
    const [defaultRes, overridesRes] = await Promise.all([
      supabase.from('working_hours').select('*').order('day_of_week'),
      supabase
        .from('activity_availability_overrides')
        .select('*')
        .eq('activity_id', activityId)
        .is('specific_date', null)
        .order('day_of_week'),
    ]);

    if (defaultRes.data) setDefaultHours(defaultRes.data);
    if (overridesRes.data) setOverrides(overridesRes.data);

    setLoading(false);
  };

  const getEffectiveHours = (dayOfWeek: number) => {
    const override = overrides.find((o) => o.day_of_week === dayOfWeek);
    if (override) {
      return {
        start_time: override.start_time,
        end_time: override.end_time,
        is_active: override.is_available,
        isOverridden: true,
      };
    }

    const defaultDay = defaultHours.find((h) => h.day_of_week === dayOfWeek);
    return {
      start_time: defaultDay?.start_time || '09:00',
      end_time: defaultDay?.end_time || '17:00',
      is_active: defaultDay?.is_active ?? true,
      isOverridden: false,
    };
  };

  const toggleOverride = (dayOfWeek: number) => {
    const existing = overrides.find((o) => o.day_of_week === dayOfWeek);

    if (existing) {
      setOverrides(overrides.filter((o) => o.day_of_week !== dayOfWeek));
    } else {
      const defaultDay = defaultHours.find((h) => h.day_of_week === dayOfWeek);
      setOverrides([
        ...overrides,
        {
          activity_id: activityId,
          day_of_week: dayOfWeek,
          start_time: defaultDay?.start_time || '09:00:00',
          end_time: defaultDay?.end_time || '17:00:00',
          is_available: defaultDay?.is_active ?? true,
        },
      ]);
    }
  };

  const updateOverride = (dayOfWeek: number, field: string, value: any) => {
    setOverrides(
      overrides.map((o) =>
        o.day_of_week === dayOfWeek ? { ...o, [field]: value } : o
      )
    );
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      await supabase
        .from('activity_availability_overrides')
        .delete()
        .eq('activity_id', activityId)
        .is('specific_date', null);

      if (overrides.length > 0) {
        const { error } = await supabase
          .from('activity_availability_overrides')
          .insert(overrides.map(({ id, ...rest }) => rest));

        if (error) {
          console.error('Error saving overrides:', error);
          alert('Errore nel salvataggio: ' + error.message);
          setSaving(false);
          return;
        }
      }

      alert('Orari personalizzati salvati con successo!');
      onClose();
    } catch (err) {
      console.error('Error:', err);
      alert('Si è verificato un errore durante il salvataggio');
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">
          <p>Caricamento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Clock className="h-6 w-6" />
              Orari Specifici per Attività
            </h2>
            <p className="text-slate-600 mt-1">{activityName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Nota:</strong> Qui puoi personalizzare gli orari di disponibilità per questa attività specifica.
              I giorni non personalizzati useranno gli orari predefiniti globali.
            </p>
          </div>

          <div className="space-y-4">
            {[0, 1, 2, 3, 4, 5, 6].map((dayOfWeek) => {
              const effective = getEffectiveHours(dayOfWeek);
              const isOverridden = effective.isOverridden;

              return (
                <div
                  key={dayOfWeek}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    isOverridden
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="w-40">
                      <label className="flex items-center cursor-pointer gap-2">
                        <input
                          type="checkbox"
                          checked={isOverridden}
                          onChange={() => toggleOverride(dayOfWeek)}
                          className="h-5 w-5 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-base font-semibold text-slate-900">
                          {dayNames[dayOfWeek]}
                        </span>
                      </label>
                      {isOverridden && (
                        <span className="text-xs text-blue-600 ml-7">Personalizzato</span>
                      )}
                      {!isOverridden && (
                        <span className="text-xs text-slate-500 ml-7">Predefinito</span>
                      )}
                    </div>

                    <div className="flex-1 flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-slate-700">Dalle:</label>
                        <input
                          type="time"
                          value={effective.start_time}
                          onChange={(e) => updateOverride(dayOfWeek, 'start_time', e.target.value)}
                          disabled={!isOverridden}
                          className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100 disabled:text-slate-400"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-slate-700">Alle:</label>
                        <input
                          type="time"
                          value={effective.end_time}
                          onChange={(e) => updateOverride(dayOfWeek, 'end_time', e.target.value)}
                          disabled={!isOverridden}
                          className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100 disabled:text-slate-400"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={effective.is_active}
                          onChange={(e) => updateOverride(dayOfWeek, 'is_available', e.target.checked)}
                          disabled={!isOverridden}
                          className="h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 disabled:opacity-50"
                        />
                        <label className="text-sm font-medium text-slate-700">Disponibile</label>
                      </div>

                      {!effective.is_active && (
                        <span className="text-sm text-red-600 font-medium">Chiuso</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
          >
            Annulla
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="h-5 w-5 mr-2" />
            {saving ? 'Salvataggio...' : 'Salva Modifiche'}
          </button>
        </div>
      </div>
    </div>
  );
}
