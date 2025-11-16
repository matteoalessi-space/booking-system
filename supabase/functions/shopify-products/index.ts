import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface ShopifySettings {
  shop_domain: string;
  access_token: string;
  api_version: string;
  is_configured: boolean;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: settings } = await supabase
      .from('shopify_settings')
      .select('*')
      .single();

    if (!settings || !settings.is_configured) {
      return new Response(
        JSON.stringify({ error: 'Shopify not configured' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const shopifySettings = settings as ShopifySettings;
    const url = new URL(req.url);
    const action = url.searchParams.get('action') || 'products';

    if (action === 'products') {
      const allProducts: any[] = [];
      let pageInfo: string | null = null;
      let hasNextPage = true;

      while (hasNextPage) {
        let productsUrl = `https://${shopifySettings.shop_domain}/admin/api/${shopifySettings.api_version}/products.json?limit=250`;
        
        if (pageInfo) {
          productsUrl += `&page_info=${pageInfo}`;
        }
        
        const response = await fetch(productsUrl, {
          headers: {
            'X-Shopify-Access-Token': shopifySettings.access_token,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Shopify API error: ${response.status}`);
        }

        const data = await response.json();
        allProducts.push(...(data.products || []));

        const linkHeader = response.headers.get('Link');
        if (linkHeader) {
          const nextLink = linkHeader.split(',').find((link: string) => link.includes('rel="next"'));
          if (nextLink) {
            const match = nextLink.match(/page_info=([^&>]+)/);
            if (match) {
              pageInfo = match[1];
            } else {
              hasNextPage = false;
            }
          } else {
            hasNextPage = false;
          }
        } else {
          hasNextPage = false;
        }

        if (allProducts.length >= 1000) {
          hasNextPage = false;
        }
      }
      
      return new Response(
        JSON.stringify({ products: allProducts }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (action === 'product') {
      const productId = url.searchParams.get('id');
      if (!productId) {
        return new Response(
          JSON.stringify({ error: 'Product ID required' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const productUrl = `https://${shopifySettings.shop_domain}/admin/api/${shopifySettings.api_version}/products/${productId}.json`;
      
      const response = await fetch(productUrl, {
        headers: {
          'X-Shopify-Access-Token': shopifySettings.access_token,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Shopify API error: ${response.status}`);
      }

      const data = await response.json();
      
      return new Response(
        JSON.stringify(data),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});