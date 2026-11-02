import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const SHOPIFY_API_VERSION = '2025-07';
const SHOPIFY_STORE_PERMANENT_DOMAIN = 'orive-co-k30qg.myshopify.com';
const SHOPIFY_STOREFRONT_URL = `https://${SHOPIFY_STORE_PERMANENT_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;
// Storefront token is intentionally NOT used client-side.
// Requests are proxied via a backend function which uses a server-stored secret.

export interface ShopifyProduct {
  node: {
    id: string;
    title: string;
    description: string;
    handle: string;
    priceRange: {
      minVariantPrice: {
        amount: string;
        currencyCode: string;
      };
    };
    images: {
      edges: Array<{
        node: {
          url: string;
          altText: string | null;
        };
      }>;
    };
    variants: {
      edges: Array<{
        node: {
          id: string;
          title: string;
          price: {
            amount: string;
            currencyCode: string;
          };
          availableForSale: boolean;
          selectedOptions: Array<{
            name: string;
            value: string;
          }>;
        };
      }>;
    };
    options: Array<{
      name: string;
      values: string[];
    }>;
  };
}

const STOREFRONT_QUERY = `
  query GetProducts($first: Int!) {
    products(first: $first) {
      edges {
        node {
          id
          title
          description
          handle
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          images(first: 5) {
            edges {
              node {
                url
                altText
              }
            }
          }
          variants(first: 10) {
            edges {
              node {
                id
                title
                price {
                  amount
                  currencyCode
                }
                availableForSale
                selectedOptions {
                  name
                  value
                }
              }
            }
          }
          options {
            name
            values
          }
        }
      }
    }
  }
`;

const PRODUCT_BY_HANDLE_QUERY = `
  query GetProductByHandle($handle: String!) {
    productByHandle(handle: $handle) {
      id
      title
      description
      handle
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
      images(first: 5) {
        edges {
          node {
            url
            altText
          }
        }
      }
      variants(first: 10) {
        edges {
          node {
            id
            title
            price {
              amount
              currencyCode
            }
            availableForSale
            selectedOptions {
              name
              value
            }
          }
        }
      }
      options {
        name
        values
      }
    }
  }
`;

const CART_CREATE_MUTATION = `
  mutation cartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        id
        checkoutUrl
        totalQuantity
        cost {
          totalAmount {
            amount
            currencyCode
          }
        }
        lines(first: 100) {
          edges {
            node {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  price {
                    amount
                    currencyCode
                  }
                  product {
                    title
                    handle
                  }
                }
              }
            }
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export async function storefrontApiRequest(query: string, variables: any = {}) {
  // Prefer proxying through backend to avoid client-side token configuration.
  // This also allows rate limiting and centralized error handling.
  const { data, error } = await supabase.functions.invoke("shopify-storefront", {
    body: { query, variables },
  });

  if (error) {
    // If proxy isn't reachable, fall back to the direct call (best-effort).
    // This keeps local/dev behavior working when the backend function isn't available.
    console.warn("Shopify proxy failed, falling back to direct request:", error);

    const response = await fetch(SHOPIFY_STOREFRONT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, variables }),
    });

    if (response.status === 402) {
      toast.error("Shopify: Payment required", {
        description: "Shopify API access requires an active Shopify billing plan. Your store needs to be upgraded to a paid plan.",
      });
      return;
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const json = await response.json();
    if (json.errors) {
      throw new Error(`Error calling Shopify: ${json.errors.map((e: any) => e.message).join(', ')}`);
    }

    return json;
  }

  // supabase.functions.invoke returns parsed JSON as `data`.
  // Mirror the previous return shape.
  if ((data as any)?.errors) {
    throw new Error(`Error calling Shopify: ${(data as any).errors.map((e: any) => e.message).join(', ')}`);
  }

  return data;
}

const PAYMENT_SETTINGS_QUERY = `
  query ShopPaymentSettings {
    shop {
      paymentSettings {
        acceptedCardBrands
        supportedDigitalWallets
      }
    }
  }
`;

const CARD_LABELS: Record<string, string> = {
  VISA: "Visa",
  MASTERCARD: "Mastercard",
  AMERICAN_EXPRESS: "Amex",
  DISCOVER: "Discover",
  JCB: "JCB",
  DINERS_CLUB: "Diners",
};

const WALLET_LABELS: Record<string, string> = {
  SHOPIFY_PAY: "Shop Pay",
  APPLE_PAY: "Apple Pay",
  GOOGLE_PAY: "Google Pay",
  AMAZON_PAY: "Amazon Pay",
};

let cachedPaymentMethods: string[] | undefined;

export async function fetchShopPaymentMethods(): Promise<string[]> {
  if (cachedPaymentMethods) return cachedPaymentMethods;
  try {
    const data = await storefrontApiRequest(PAYMENT_SETTINGS_QUERY);
    const settings = data?.data?.shop?.paymentSettings;
    const cards = (settings?.acceptedCardBrands || [])
      .map((brand: string) => CARD_LABELS[brand] || "")
      .filter(Boolean);
    const wallets = (settings?.supportedDigitalWallets || [])
      .map((wallet: string) => WALLET_LABELS[wallet] || "")
      .filter(Boolean);
    cachedPaymentMethods = [...new Set([...cards, ...wallets])];
  } catch {
    cachedPaymentMethods = [];
  }
  return cachedPaymentMethods;
}

export async function fetchProducts(limit: number = 12): Promise<ShopifyProduct[]> {
  const data = await storefrontApiRequest(STOREFRONT_QUERY, { first: limit });
  return data.data.products.edges;
}

export async function fetchProductByHandle(handle: string): Promise<ShopifyProduct | null> {
  const data = await storefrontApiRequest(PRODUCT_BY_HANDLE_QUERY, { handle });
  if (!data.data.productByHandle) return null;
  return { node: data.data.productByHandle };
}

export async function createStorefrontCheckout(items: any[]): Promise<string> {
  try {
    const lines = items.map(item => ({
      quantity: item.quantity,
      merchandiseId: item.variantId,
    }));

    const cartData = await storefrontApiRequest(CART_CREATE_MUTATION, {
      input: { lines },
    });

    if (cartData.data.cartCreate.userErrors.length > 0) {
      throw new Error(`Cart creation failed: ${cartData.data.cartCreate.userErrors.map(e => e.message).join(', ')}`);
    }

    const cart = cartData.data.cartCreate.cart;
    
    if (!cart.checkoutUrl) {
      throw new Error('No checkout URL returned from Shopify');
    }

    const url = new URL(cart.checkoutUrl);
    url.searchParams.set('channel', 'online_store');
    const checkoutUrl = url.toString();
    return checkoutUrl;
  } catch (error) {
    console.error('Error creating storefront checkout:', error);
    throw error;
  }
}

// Fetch products by tag (for filtering experiences, sessions, etc.)
export async function fetchProductsByTag(tag: string, limit: number = 20): Promise<ShopifyProduct[]> {
  try {
    const data = await storefrontApiRequest(STOREFRONT_QUERY, {
      first: limit,
      query: `tag:${tag}`,
    });

    return data.data.products.edges || [];
  } catch (error) {
    console.error(`Error fetching products with tag ${tag}:`, error);
    return [];
  }
}
