import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, GripVertical, ChevronUp, ChevronDown } from 'lucide-react';
import { supabase, Activity, BookingFormField } from '../lib/supabase';

interface FormFieldsEditorProps {
  activity: Activity;
  onBack: () => void;
}

export default function FormFieldsEditor({ activity, onBack }: FormFieldsEditorProps) {
  const [fields, setFields] = useState<BookingFormField[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFields();
  }, []);

  const loadFields = async () => {
    const { data, error } = await supabase
      .from('booking_form_fields')
      .select('*')
      .eq('activity_id', activity.id)
      .order('order_position', { ascending: true });

    if (!error && data) {
      setFields(data);
    }
    setLoading(false);
  };

  const addField = async () => {
    const newField = {
      activity_id: activity.id,
      field_label: 'New Field',
      field_type: 'text' as const,
      field_options: {},
      is_required: false,
      placeholder: '',
      order_position: fields.length,
    };

    const { data, error } = await supabase
      .from('booking_form_fields')
      .insert([newField])
      .select()
      .single();

    if (!error && data) {
      setFields([...fields, data]);
    }
  };

  const updateField = async (id: string, updates: Partial<BookingFormField>) => {
    const { error } = await supabase
      .from('booking_form_fields')
      .update(updates)
      .eq('id', id);

    if (!error) {
      setFields(fields.map((f) => (f.id === id ? { ...f, ...updates } : f)));
    }
  };

  const deleteField = async (id: string) => {
    const { error } = await supabase
      .from('booking_form_fields')
      .delete()
      .eq('id', id);

    if (!error) {
      setFields(fields.filter((f) => f.id !== id));
    }
  };

  const moveField = async (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === fields.length - 1)
    ) {
      return;
    }

    const newFields = [...fields];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newFields[index], newFields[targetIndex]] = [newFields[targetIndex], newFields[index]];

    const updates = newFields.map((field, idx) => ({
      id: field.id,
      order_position: idx,
    }));

    for (const update of updates) {
      await supabase
        .from('booking_form_fields')
        .update({ order_position: update.order_position })
        .eq('id', update.id);
    }

    setFields(newFields.map((f, idx) => ({ ...f, order_position: idx })));
  };

  const updateSelectOptions = (id: string, optionsText: string) => {
    const options = optionsText.split('\n').filter((o) => o.trim());
    updateField(id, {
      field_options: { select_options: options },
    });
  };

  if (loading) {
    return <div className="text-center py-12">Loading form fields...</div>;
  }

  return (
    <div>
      <button
        onClick={onBack}
        className="inline-flex items-center text-slate-600 hover:text-slate-900 mb-6"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back to Activities
      </button>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Custom Form Fields - {activity.name}
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Add custom questions to collect specific information for this activity
            </p>
          </div>
          <button
            onClick={addField}
            className="inline-flex items-center px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Field
          </button>
        </div>

        <div className="space-y-4">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="border border-slate-200 rounded-lg p-4 hover:border-slate-300 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="flex flex-col gap-1 mt-2">
                  <button
                    onClick={() => moveField(index, 'up')}
                    disabled={index === 0}
                    className="text-slate-400 hover:text-slate-600 disabled:opacity-30"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <GripVertical className="h-4 w-4 text-slate-400" />
                  <button
                    onClick={() => moveField(index, 'down')}
                    disabled={index === fields.length - 1}
                    className="text-slate-400 hover:text-slate-600 disabled:opacity-30"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex-1 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Field Label *
                      </label>
                      <input
                        type="text"
                        value={field.field_label}
                        onChange={(e) => updateField(field.id, { field_label: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Field Type *
                      </label>
                      <select
                        value={field.field_type}
                        onChange={(e) =>
                          updateField(field.id, {
                            field_type: e.target.value as BookingFormField['field_type'],
                          })
                        }
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                      >
                        <option value="text">Text</option>
                        <option value="textarea">Text Area</option>
                        <option value="email">Email</option>
                        <option value="phone">Phone</option>
                        <option value="number">Number</option>
                        <option value="date">Date</option>
                        <option value="select">Dropdown</option>
                        <option value="checkbox">Checkbox</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Placeholder Text
                    </label>
                    <input
                      type="text"
                      value={field.placeholder || ''}
                      onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    />
                  </div>

                  {field.field_type === 'select' && (
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Options (one per line)
                      </label>
                      <textarea
                        value={(field.field_options.select_options || []).join('\n')}
                        onChange={(e) => updateSelectOptions(field.id, e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                        placeholder="Option 1&#10;Option 2&#10;Option 3"
                      />
                    </div>
                  )}

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id={`required-${field.id}`}
                      checked={field.is_required}
                      onChange={(e) => updateField(field.id, { is_required: e.target.checked })}
                      className="h-4 w-4 text-slate-900 border-slate-300 rounded focus:ring-slate-900"
                    />
                    <label htmlFor={`required-${field.id}`} className="ml-2 text-sm text-slate-700">
                      Required field
                    </label>
                  </div>
                </div>

                <button
                  onClick={() => deleteField(field.id)}
                  className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}

          {fields.length === 0 && (
            <div className="text-center py-12 border border-slate-200 rounded-lg bg-slate-50">
              <p className="text-slate-500">
                No custom fields yet. Add fields to collect specific information for this activity.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
