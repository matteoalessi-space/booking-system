import { useState, useEffect } from 'react';
import { supabase, Activity } from '../lib/supabase';
import { ArrowLeft, Package } from 'lucide-react';
import ActivityVariants from './ActivityVariants';

interface ActivityFormProps {
  activity: Activity | null;
  onSave: () => void;
  onCancel: () => void;
}

interface ShopifyProduct {
  id: number;
  title: string;
  variants: ShopifyVariant[];
  image?: {
    src: string;
  };
}

interface ShopifyVariant {
  id: number;
  title: string;
  price: string;
  sku?: string;
}

export default function ActivityForm({ activity, onSave, onCancel }: ActivityFormProps) {
  const [step, setStep] = useState(activity ? 2 : 1);
  const [selectedProduct, setSelectedProduct] = useState<ShopifyProduct | null>(null);
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [createdActivityId, setCreatedActivityId] = useState<string | null>(activity?.id || null);

  const [formData, setFormData] = useState({
    name: activity?.name || '',
    description: activity?.description || '',
    duration_minutes: activity?.duration_minutes || 60,
    max_capacity: activity?.max_capacity || 1,
    color: activity?.color || '#3B82F6',
    is_active: activity?.is_active ?? true,
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (step === 1 && products.length === 0) {
      loadProducts();
    }
  }, [step]);

  const loadProducts = async () => {
    setLoadingProducts(true);
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(
        `${supabaseUrl}/functions/v1/shopify-products?action=products`,
        {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      }
    } catch (err) {
      setError('Failed to load Shopify products');
    }
    setLoadingProducts(false);
  };

  const handleProductSelect = (product: ShopifyProduct) => {
    setSelectedProduct(product);
    setFormData({
      ...formData,
      name: product.title,
    });
    setStep(2);
  };

  const handleCreateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const activityData = {
        ...formData,
        description: formData.description || null,
        updated_at: new Date().toISOString(),
      };

      let activityId = createdActivityId;

      if (activity) {
        const { error: updateError } = await supabase
          .from('activities')
          .update(activityData)
          .eq('id', activity.id);

        if (updateError) throw updateError;
        activityId = activity.id;
      } else {
        const { data: newActivity, error: insertError } = await supabase
          .from('activities')
          .insert([activityData])
          .select()
          .single();

        if (insertError) throw insertError;
        activityId = newActivity.id;
        setCreatedActivityId(activityId);
      }

      if (selectedProduct && selectedProduct.variants.length > 0) {
        const variantsToCreate = selectedProduct.variants.map((variant, index) => ({
          activity_id: activityId,
          name: variant.title === 'Default Title' ? selectedProduct.title : variant.title,
          shopify_variant_id: variant.id.toString(),
          duration_minutes: formData.duration_minutes,
          max_capacity: formData.max_capacity,
          price: parseFloat(variant.price),
          is_active: true,
          order_position: index,
        }));

        const { error: variantsError } = await supabase
          .from('activity_variants')
          .insert(variantsToCreate);

        if (variantsError) throw variantsError;
      }

      setStep(3);
      setSaving(false);
    } catch (err: any) {
      setError(err.message || 'Failed to create activity');
      setSaving(false);
    }
  };

  const filteredProducts = products.filter((product) =>
    product.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (step === 1) {
    return (
      <div>
        <button
          onClick={onCancel}
          className="inline-flex items-center text-slate-600 hover:text-slate-900 mb-6"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Activities
        </button>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Select Shopify Product</h2>
            <p className="text-slate-600">Choose a product to create an activity from</p>
          </div>

          <div className="mb-6">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products..."
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            />
          </div>

          {loadingProducts && (
            <div className="text-center py-12 text-slate-500">Loading products...</div>
          )}

          {!loadingProducts && filteredProducts.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              No products found. Make sure Shopify is configured in settings.
            </div>
          )}

          <div className="grid gap-4">
            {filteredProducts.map((product) => (
              <button
                key={product.id}
                onClick={() => handleProductSelect(product)}
                className="border border-slate-200 rounded-lg p-4 hover:border-slate-900 hover:shadow-md transition-all text-left"
              >
                <div className="flex items-center gap-4">
                  {product.image ? (
                    <img
                      src={product.image.src}
                      alt={product.title}
                      className="w-16 h-16 object-cover rounded"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-slate-100 rounded flex items-center justify-center">
                      <Package className="h-8 w-8 text-slate-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">{product.title}</h3>
                    <p className="text-sm text-slate-500">{product.variants.length} variants</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div>
        <button
          onClick={() => activity ? onCancel() : setStep(1)}
          className="inline-flex items-center text-slate-600 hover:text-slate-900 mb-6"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          {activity ? 'Back to Activities' : 'Back to Product Selection'}
        </button>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            {activity ? 'Edit Activity' : 'Create Activity'}
          </h2>

          {selectedProduct && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-3">
                {selectedProduct.image && (
                  <img
                    src={selectedProduct.image.src}
                    alt={selectedProduct.title}
                    className="w-12 h-12 object-cover rounded"
                  />
                )}
                <div>
                  <p className="text-sm text-blue-800 font-medium">Selected Product</p>
                  <p className="text-blue-900 font-semibold">{selectedProduct.title}</p>
                  <p className="text-xs text-blue-700">{selectedProduct.variants.length} variants will be created</p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleCreateActivity} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Activity Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Default Duration (minutes) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                />
                <p className="text-xs text-slate-500 mt-1">Will be applied to all variants</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Default Max Capacity *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.max_capacity}
                  onChange={(e) => setFormData({ ...formData, max_capacity: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                />
                <p className="text-xs text-slate-500 mt-1">Will be applied to all variants</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Calendar Color
              </label>
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-full h-12 border border-slate-300 rounded-lg cursor-pointer"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="h-4 w-4 text-slate-900 border-slate-300 rounded focus:ring-slate-900"
              />
              <label htmlFor="is_active" className="ml-2 text-sm text-slate-700">
                Activity is active and bookable
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {saving ? 'Creating...' : (activity ? 'Save Activity' : 'Create Activity & Variants')}
              </button>
              <button
                type="button"
                onClick={() => activity ? onCancel() : setStep(1)}
                className="px-6 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (step === 3 && createdActivityId) {
    return (
      <div>
        <button
          onClick={onCancel}
          className="inline-flex items-center text-slate-600 hover:text-slate-900 mb-6"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Activities
        </button>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 font-medium">
              Activity created successfully! {selectedProduct?.variants.length || 0} variants have been added.
            </p>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">{formData.name}</h2>
            <p className="text-slate-600">Edit individual variant details below</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <ActivityVariants activityId={createdActivityId} />
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onSave}
            className="px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return null;
}
