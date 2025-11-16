import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Check, X } from 'lucide-react';
import { supabase, ActivityVariant } from '../lib/supabase';
import ShopifyProductPicker from './ShopifyProductPicker';

interface ActivityVariantsProps {
  activityId: string;
}

export default function ActivityVariants({ activityId }: ActivityVariantsProps) {
  const [variants, setVariants] = useState<ActivityVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    shopify_variant_id: '',
    duration_minutes: 60,
    max_capacity: 1,
    price: '',
    is_active: true,
  });

  useEffect(() => {
    loadVariants();
  }, [activityId]);

  const loadVariants = async () => {
    const { data, error } = await supabase
      .from('activity_variants')
      .select('*')
      .eq('activity_id', activityId)
      .order('order_position', { ascending: true });

    if (!error && data) {
      setVariants(data);
    }
    setLoading(false);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      shopify_variant_id: '',
      duration_minutes: 60,
      max_capacity: 1,
      price: '',
      is_active: true,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (variant: ActivityVariant) => {
    setFormData({
      name: variant.name,
      shopify_variant_id: variant.shopify_variant_id || '',
      duration_minutes: variant.duration_minutes,
      max_capacity: variant.max_capacity,
      price: variant.price?.toString() || '',
      is_active: variant.is_active,
    });
    setEditingId(variant.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    const data = {
      activity_id: activityId,
      name: formData.name,
      shopify_variant_id: formData.shopify_variant_id || null,
      duration_minutes: formData.duration_minutes,
      max_capacity: formData.max_capacity,
      price: formData.price ? parseFloat(formData.price) : null,
      is_active: formData.is_active,
      order_position: variants.length,
      updated_at: new Date().toISOString(),
    };

    if (editingId) {
      await supabase
        .from('activity_variants')
        .update(data)
        .eq('id', editingId);
    } else {
      await supabase
        .from('activity_variants')
        .insert([data]);
    }

    await loadVariants();
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this variant?')) return;

    await supabase
      .from('activity_variants')
      .delete()
      .eq('id', id);

    await loadVariants();
  };

  if (loading) {
    return <div className="text-sm text-slate-500">Loading variants...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Activity Variants</h3>
          <p className="text-sm text-slate-600">Different options for booking this activity</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-3 py-2 bg-slate-900 text-white text-sm rounded-lg hover:bg-slate-800 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Variant
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Variant Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              placeholder="e.g., 1 Participant, 2 Hours"
            />
          </div>

          <ShopifyProductPicker
            selectedVariantId={formData.shopify_variant_id}
            onSelect={(variantId, productTitle, variantTitle) => {
              setFormData({
                ...formData,
                shopify_variant_id: variantId,
                name: formData.name || `${productTitle} - ${variantTitle}`,
              });
            }}
          />

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Duration (min) *
              </label>
              <input
                type="number"
                value={formData.duration_minutes}
                onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Max Capacity *
              </label>
              <input
                type="number"
                value={formData.max_capacity}
                onChange={(e) => setFormData({ ...formData, max_capacity: parseInt(e.target.value) })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Price
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="variant_is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="h-4 w-4 text-slate-900 border-slate-300 rounded focus:ring-slate-900"
            />
            <label htmlFor="variant_is_active" className="ml-2 text-sm text-slate-700">
              Variant is active and bookable
            </label>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={!formData.name}
              className="inline-flex items-center px-3 py-2 bg-slate-900 text-white text-sm rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Check className="h-4 w-4 mr-2" />
              Save Variant
            </button>
            <button
              onClick={resetForm}
              className="inline-flex items-center px-3 py-2 bg-slate-100 text-slate-700 text-sm rounded-lg hover:bg-slate-200 transition-colors"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </button>
          </div>
        </div>
      )}

      {variants.length === 0 && !showForm && (
        <div className="text-center py-8 bg-slate-50 rounded-lg border border-slate-200">
          <p className="text-sm text-slate-500">No variants yet. Add your first variant to get started.</p>
        </div>
      )}

      {variants.length > 0 && (
        <div className="space-y-2">
          {variants.map((variant) => (
            <div
              key={variant.id}
              className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-slate-900">{variant.name}</h4>
                    {!variant.is_active && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-600 rounded-full">
                        Inactive
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-slate-600">
                    <span>{variant.duration_minutes} min</span>
                    <span>Max {variant.max_capacity} people</span>
                    {variant.price && <span>€{variant.price}</span>}
                    {variant.shopify_variant_id && (
                      <span className="text-slate-400">Shopify: {variant.shopify_variant_id}</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 ml-4">
                  <button
                    onClick={() => handleEdit(variant)}
                    className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(variant.id)}
                    className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
