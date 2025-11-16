import { useState, useEffect } from 'react';
import { Search, Package } from 'lucide-react';

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

interface ShopifyProductPickerProps {
  selectedVariantId: string;
  onSelect: (variantId: string, productTitle: string, variantTitle: string) => void;
}

export default function ShopifyProductPicker({ selectedVariantId, onSelect }: ShopifyProductPickerProps) {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPicker, setShowPicker] = useState(false);

  const loadProducts = async () => {
    setLoading(true);
    setError(null);

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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch products');
      }

      const data = await response.json();
      setProducts(data.products || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
    }

    setLoading(false);
  };

  useEffect(() => {
    if (showPicker && products.length === 0) {
      loadProducts();
    }
  }, [showPicker]);

  const filteredProducts = products.filter((product) =>
    product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.variants.some((v) => v.title.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSelectVariant = (product: ShopifyProduct, variant: ShopifyVariant) => {
    onSelect(variant.id.toString(), product.title, variant.title);
    setShowPicker(false);
  };

  if (!showPicker) {
    return (
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Shopify Product/Variant
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={selectedVariantId}
            onChange={(e) => onSelect(e.target.value, '', '')}
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            placeholder="Variant ID or browse products"
          />
          <button
            type="button"
            onClick={() => setShowPicker(true)}
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors inline-flex items-center"
          >
            <Package className="h-5 w-5 mr-2" />
            Browse
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-slate-900">Select Shopify Product</h3>
            <button
              onClick={() => setShowPicker(false)}
              className="text-slate-500 hover:text-slate-700"
            >
              ✕
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading && (
            <div className="text-center py-12 text-slate-500">Loading products...</div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
              {error}
              <div className="mt-2">
                <button
                  onClick={loadProducts}
                  className="text-sm underline hover:no-underline"
                >
                  Try again
                </button>
              </div>
            </div>
          )}

          {!loading && !error && filteredProducts.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              {searchTerm ? 'No products found matching your search' : 'No products found in your store'}
            </div>
          )}

          <div className="space-y-4">
            {filteredProducts.map((product) => (
              <div key={product.id} className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="bg-slate-50 p-4 border-b border-slate-200">
                  <div className="flex items-center gap-3">
                    {product.image && (
                      <img
                        src={product.image.src}
                        alt={product.title}
                        className="w-12 h-12 object-cover rounded"
                      />
                    )}
                    <div>
                      <h4 className="font-semibold text-slate-900">{product.title}</h4>
                      <p className="text-sm text-slate-500">{product.variants.length} variants</p>
                    </div>
                  </div>
                </div>

                <div className="divide-y divide-slate-200">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => handleSelectVariant(product, variant)}
                      className="w-full p-4 hover:bg-slate-50 transition-colors text-left"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium text-slate-900">{variant.title}</div>
                          {variant.sku && (
                            <div className="text-sm text-slate-500">SKU: {variant.sku}</div>
                          )}
                          <div className="text-xs text-slate-400 mt-1">ID: {variant.id}</div>
                        </div>
                        <div className="text-lg font-semibold text-slate-900">€{variant.price}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
