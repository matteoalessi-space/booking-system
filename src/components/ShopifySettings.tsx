import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Save, CheckCircle, AlertCircle } from 'lucide-react';

interface ShopifySettings {
  id: string;
  shop_domain: string;
  access_token: string;
  api_version: string;
  is_configured: boolean;
}

export default function ShopifySettings() {
  const [settings, setSettings] = useState<ShopifySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [formData, setFormData] = useState({
    shop_domain: '',
    access_token: '',
    api_version: '2024-01',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const { data, error } = await supabase
      .from('shopify_settings')
      .select('*')
      .maybeSingle();

    if (!error && data) {
      setSettings(data);
      setFormData({
        shop_domain: data.shop_domain,
        access_token: data.access_token,
        api_version: data.api_version,
      });
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setTestResult(null);

    const updateData = {
      ...formData,
      is_configured: !!(formData.shop_domain && formData.access_token),
      updated_at: new Date().toISOString(),
    };

    if (settings?.id) {
      await supabase
        .from('shopify_settings')
        .update(updateData)
        .eq('id', settings.id);
    } else {
      await supabase
        .from('shopify_settings')
        .insert([updateData]);
    }

    await loadSettings();
    setSaving(false);
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);

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
        if (data.products && data.products.length > 0) {
          setTestResult({
            success: true,
            message: `Successfully connected! Found ${data.products.length} products in your store.`,
          });
        } else {
          setTestResult({
            success: true,
            message: 'Connection successful, but no products found in your store.',
          });
        }
      } else {
        const error = await response.json();
        setTestResult({
          success: false,
          message: `Connection failed: ${error.error || 'Unknown error'}`,
        });
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }

    setTesting(false);
  };

  if (loading) {
    return <div className="text-center py-12">Loading settings...</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Shopify Integration</h1>
        <p className="text-slate-600 mt-1">
          Connect your Shopify store to automatically sync products and variants
        </p>
      </div>

      {testResult && (
        <div
          className={`mb-6 p-4 rounded-lg border ${
            testResult.success
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {testResult.success ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            <span>{testResult.message}</span>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-6">API Credentials</h2>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Shop Domain *
            </label>
            <input
              type="text"
              value={formData.shop_domain}
              onChange={(e) => setFormData({ ...formData, shop_domain: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              placeholder="your-store.myshopify.com"
            />
            <p className="text-xs text-slate-500 mt-1">
              Your Shopify store domain (e.g., mystore.myshopify.com)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Admin API Access Token *
            </label>
            <input
              type="password"
              value={formData.access_token}
              onChange={(e) => setFormData({ ...formData, access_token: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              placeholder="shpat_..."
            />
            <p className="text-xs text-slate-500 mt-1">
              Generate this in your Shopify admin under Apps → Develop apps
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              API Version
            </label>
            <select
              value={formData.api_version}
              onChange={(e) => setFormData({ ...formData, api_version: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            >
              <option value="2024-01">2024-01</option>
              <option value="2023-10">2023-10</option>
              <option value="2023-07">2023-07</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              <Save className="h-5 w-5 mr-2" />
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
            <button
              onClick={handleTest}
              disabled={testing || !settings?.is_configured}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {testing ? 'Testing...' : 'Test Connection'}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Setup Instructions</h3>
        <ol className="space-y-2 text-sm text-blue-800">
          <li className="flex gap-2">
            <span className="font-bold">1.</span>
            <span>Go to your Shopify admin and navigate to Settings → Apps and sales channels</span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold">2.</span>
            <span>Click "Develop apps" and create a new app</span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold">3.</span>
            <span>Configure Admin API access scopes: read_products, read_orders</span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold">4.</span>
            <span>Install the app and copy the Admin API access token</span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold">5.</span>
            <span>Paste your credentials above and click Save Settings</span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold">6.</span>
            <span>Click Test Connection to verify everything works</span>
          </li>
        </ol>
      </div>
    </div>
  );
}
