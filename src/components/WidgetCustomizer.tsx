import { useState } from 'react';
import { ArrowLeft, Eye } from 'lucide-react';
import { supabase, Activity } from '../lib/supabase';

interface WidgetCustomizerProps {
  activity: Activity;
  onBack: () => void;
  onSave: () => void;
}

export default function WidgetCustomizer({ activity, onBack, onSave }: WidgetCustomizerProps) {
  const [formData, setFormData] = useState({
    widget_primary_color: activity.widget_primary_color || '#3B82F6',
    widget_background_color: activity.widget_background_color || '#FFFFFF',
    widget_text_color: activity.widget_text_color || '#1F2937',
    widget_button_color: activity.widget_button_color || '#3B82F6',
    widget_button_text_color: activity.widget_button_text_color || '#FFFFFF',
    widget_title: activity.widget_title || '',
    widget_description: activity.widget_description || '',
    widget_header_image: activity.widget_header_image || '',
  });
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const data = {
      ...formData,
      widget_title: formData.widget_title || null,
      widget_description: formData.widget_description || null,
      widget_header_image: formData.widget_header_image || null,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('activities')
      .update(data)
      .eq('id', activity.id);

    setSaving(false);
    if (!error) onSave();
  };

  return (
    <div>
      <button
        onClick={onBack}
        className="inline-flex items-center text-slate-600 hover:text-slate-900 mb-6"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back to Activities
      </button>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            Widget Customization - {activity.name}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Widget Title
              </label>
              <input
                type="text"
                value={formData.widget_title}
                onChange={(e) => setFormData({ ...formData, widget_title: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                placeholder="Leave empty to use activity name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Widget Description
              </label>
              <textarea
                value={formData.widget_description}
                onChange={(e) => setFormData({ ...formData, widget_description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                placeholder="Instructions or welcome message for customers"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Header Image URL
              </label>
              <input
                type="url"
                value={formData.widget_header_image}
                onChange={(e) => setFormData({ ...formData, widget_header_image: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="border-t border-slate-200 pt-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Colors</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Primary Color
                  </label>
                  <input
                    type="color"
                    value={formData.widget_primary_color}
                    onChange={(e) => setFormData({ ...formData, widget_primary_color: e.target.value })}
                    className="w-full h-12 border border-slate-300 rounded-lg cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Background Color
                  </label>
                  <input
                    type="color"
                    value={formData.widget_background_color}
                    onChange={(e) => setFormData({ ...formData, widget_background_color: e.target.value })}
                    className="w-full h-12 border border-slate-300 rounded-lg cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Text Color
                  </label>
                  <input
                    type="color"
                    value={formData.widget_text_color}
                    onChange={(e) => setFormData({ ...formData, widget_text_color: e.target.value })}
                    className="w-full h-12 border border-slate-300 rounded-lg cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Button Color
                  </label>
                  <input
                    type="color"
                    value={formData.widget_button_color}
                    onChange={(e) => setFormData({ ...formData, widget_button_color: e.target.value })}
                    className="w-full h-12 border border-slate-300 rounded-lg cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Button Text Color
                  </label>
                  <input
                    type="color"
                    value={formData.widget_button_text_color}
                    onChange={(e) => setFormData({ ...formData, widget_button_text_color: e.target.value })}
                    className="w-full h-12 border border-slate-300 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {saving ? 'Saving...' : 'Save Customization'}
              </button>
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="px-6 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium inline-flex items-center"
              >
                <Eye className="h-5 w-5 mr-2" />
                Preview
              </button>
            </div>
          </form>
        </div>

        {showPreview && (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Preview</h3>
            <div
              className="rounded-lg overflow-hidden shadow-lg"
              style={{ backgroundColor: formData.widget_background_color }}
            >
              {formData.widget_header_image && (
                <img
                  src={formData.widget_header_image}
                  alt="Header"
                  className="w-full h-32 object-cover"
                />
              )}
              <div className="p-6">
                <h4
                  className="text-2xl font-bold mb-2"
                  style={{ color: formData.widget_primary_color }}
                >
                  {formData.widget_title || activity.name}
                </h4>
                {formData.widget_description && (
                  <p className="mb-4" style={{ color: formData.widget_text_color }}>
                    {formData.widget_description}
                  </p>
                )}
                <div className="space-y-3 mb-4">
                  <div
                    className="p-3 rounded border"
                    style={{
                      borderColor: formData.widget_primary_color + '40',
                      color: formData.widget_text_color,
                    }}
                  >
                    Sample time slot
                  </div>
                </div>
                <button
                  className="w-full py-3 rounded-lg font-medium"
                  style={{
                    backgroundColor: formData.widget_button_color,
                    color: formData.widget_button_text_color,
                  }}
                >
                  Book Now
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
