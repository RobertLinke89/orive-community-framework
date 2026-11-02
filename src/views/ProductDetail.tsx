"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, ExternalLink } from "lucide-react";
import { Layout } from "@/components/Layout";
import { DetailBreadcrumb } from "@/components/DetailBreadcrumb";
import { CartDrawer } from "@/components/CartDrawer";
import { OfferingStickyCta } from "@/components/OfferingStickyCta";
import { ShopImageStage } from "@/components/ShopImageStage";
import { ShopProductCard } from "@/components/ShopProductCard";
import { ShopProductStory } from "@/components/ShopProductStory";
import { ShopBuyBoxTrust } from "@/components/ShopBuyBoxTrust";
import { shopStoryOf } from "@/data/shopProductCopy";
import { offersForHandle, withAffiliateParams } from "@/data/shopExternalOffers";
import { Button } from "@/components/ui/button";
import { fallbackShopProducts, shopImagesOf } from "@/data/shopProducts";
import { useLanguage } from "@/hooks/useLanguage";
import { fetchProductByHandle, fetchProducts, fetchShopPaymentMethods, type ShopifyProduct } from "@/lib/shopify";
import {
  extractShopAbout,
  extractShopFacts,
  formatShopPrice,
  pickRelatedProducts,
  shopCategoryLabel,
  shopCategoryOf,
} from "@/lib/shopDisplay";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";

export default function ProductDetail() {
  const params = (useParams<{ handle: string }>() || {}) as { handle?: string };
  const { handle } = params;
  const { language, copy } = useLanguage();
  const isDe = language === "de";
  const [product, setProduct] = useState<ShopifyProduct | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [paymentMethods, setPaymentMethods] = useState<string[]>([]);
  const addItem = useCartStore((state) => state.addItem);
  const { createCheckout, isLoading: checkoutLoading } = useCartStore();

  useEffect(() => {
    const loadProduct = async () => {
      if (!handle) return;
      try {
        let data = await fetchProductByHandle(handle);
        if (!data) {
          data = fallbackShopProducts.find((item) => item.node.handle === handle) || null;
        }
        setProduct(data);

        try {
          const related = await fetchProducts(8);
          const combined = [...related];
          for (const fallback of fallbackShopProducts) {
            if (!combined.some((item) => item.node.handle === fallback.node.handle)) {
              combined.push(fallback);
            }
          }
          setRelatedProducts(data ? pickRelatedProducts(combined, data) : combined.slice(0, 4));
        } catch {
          setRelatedProducts(data ? pickRelatedProducts(fallbackShopProducts, data) : fallbackShopProducts.slice(0, 4));
        }
      } catch {
        const local = fallbackShopProducts.find((item) => item.node.handle === handle) || null;
        setProduct(local);
        setRelatedProducts(local ? pickRelatedProducts(fallbackShopProducts, local) : fallbackShopProducts.slice(0, 4));
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [handle]);

  useEffect(() => {
    fetchShopPaymentMethods().then(setPaymentMethods).catch(() => setPaymentMethods([]));
  }, []);

  const addToCart = (count = quantity) => {
    if (!product) return;
    const variant = product.node.variants.edges[selectedVariantIndex].node;
    addItem({
      product,
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity: count,
      selectedOptions: variant.selectedOptions || [],
    });
    toast.success(copy("In den Warenkorb", "Added to cart"), {
      description: `${count}× ${product.node.title}`,
    });
  };

  const buyNow = async () => {
    if (!product) return;
    addToCart();
    await createCheckout();
    const checkoutUrl = useCartStore.getState().checkoutUrl;
    if (checkoutUrl) window.open(checkoutUrl, "_blank");
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-[#00CDAC]" />
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="mx-auto max-w-[1500px] px-4 py-16 text-center sm:px-6">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
            {copy("Artikel nicht gefunden", "Product not found")}
          </h1>
          <Link href="/shop" className="mt-6 inline-block text-sm text-[#008975] dark:text-[#00CDAC] hover:underline">
            {copy("Zum Shop", "Back to shop")}
          </Link>
        </div>
      </Layout>
    );
  }

  const images = shopImagesOf(product);
  const selectedVariant = product.node.variants.edges[selectedVariantIndex].node;
  const priceLabel = formatShopPrice(
    selectedVariant.price.amount,
    selectedVariant.price.currencyCode,
    isDe ? "de-DE" : "en-IE"
  );
  const inStock = selectedVariant.availableForSale;
  const category = shopCategoryOf(product);
  const description = (product.node.description || "").trim();
  const about = extractShopAbout(description);
  const facts = extractShopFacts(description);
  const story = shopStoryOf(product, isDe);
  const externalOffers = offersForHandle(product.node.handle);
  const hasExternalOffers = externalOffers.length > 0;
  const hasVariants = product.node.options.length > 0 && product.node.options[0].values.length > 1;
  const details = [
    category ? { label: copy("Kategorie", "Category"), value: shopCategoryLabel(category, isDe) } : null,
    { label: copy("Artikel", "Item"), value: product.node.title },
    ...facts.map((fact) => ({ label: copy("Angabe", "Detail"), value: fact })),
  ].filter(Boolean) as { label: string; value: string }[];

  const buyBox = (
    <div className="rounded-lg border border-slate-300 bg-white p-4 dark:border-white/15 dark:bg-[#02182B]">
      <p className="text-[28px] font-medium leading-none tracking-tight text-slate-900 dark:text-white">{priceLabel}</p>
      <p className={`mt-3 text-sm font-semibold ${inStock ? "text-[#007600] dark:text-emerald-400" : "text-slate-400"}`}>
        {inStock
          ? hasExternalOffers
            ? copy("Bei Partnern verfügbar", "Available from partners")
            : copy("Auf Lager", "In stock")
          : copy("Nicht verfügbar", "Unavailable")}
      </p>

      {hasExternalOffers ? (
        <div className="mt-4 space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-white/45">
            {copy("Bei Händlern kaufen", "Buy from retailers")}
          </p>
          {externalOffers.map((offer) => (
            <a
              key={`${offer.retailerKey}-${offer.url}`}
              href={withAffiliateParams(offer.url, offer.retailerKey)}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#00CDAC] text-sm font-semibold text-white transition-colors hover:bg-[#02AAB0]"
            >
              {copy(`Bei ${offer.retailer}`, `Shop at ${offer.retailer}`)}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          ))}
          <p className="pt-1 text-[11px] leading-relaxed text-slate-500 dark:text-white/45">
            {copy(
              "Du wirst zum Shop des Anbieters weitergeleitet. Affiliate-Programme schalten wir später frei.",
              "You leave to the retailer’s shop. Affiliate programs will be wired later."
            )}
          </p>
        </div>
      ) : (
        <>
          <label className="mt-4 flex items-center gap-2 text-sm text-slate-700 dark:text-white/75">
            <span>{copy("Menge:", "Quantity:")}</span>
            <select
              value={quantity}
              onChange={(event) => setQuantity(Number(event.target.value))}
              disabled={!inStock}
              className="h-8 rounded border border-slate-300 bg-white px-2 text-sm dark:border-white/15 dark:bg-[#011B33]"
            >
              {Array.from({ length: 10 }, (_, index) => index + 1).map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <div className="mt-4 space-y-2">
            <Button
              onClick={() => addToCart()}
              disabled={!inStock}
              className="h-11 w-full rounded-full bg-[#00CDAC] text-sm font-semibold text-white hover:bg-[#02AAB0]"
            >
              {inStock ? copy("In den Warenkorb", "Add to cart") : copy("Nicht verfügbar", "Unavailable")}
            </Button>
            <Button
              onClick={buyNow}
              disabled={!inStock || checkoutLoading}
              variant="outline"
              className="h-11 w-full rounded-full border-slate-300 text-sm font-semibold dark:border-white/15"
            >
              {checkoutLoading
                ? copy("Weiterleitung…", "Opening checkout…")
                : copy("Jetzt kaufen", "Buy now")}
            </Button>
          </div>
        </>
      )}
      <ShopBuyBoxTrust isDe={isDe} methods={paymentMethods} external={hasExternalOffers} />
    </div>
  );

  return (
    <Layout>
      <div className="min-h-screen bg-background pb-24 lg:pb-16">
        <div className="mx-auto max-w-[1500px] px-4 pt-3 sm:px-6 lg:px-8">
          <div className="mb-3 flex items-center justify-between gap-4">
            <DetailBreadcrumb
              quiet
              items={[
                { label: "Shop", href: "/shop" },
                ...(category
                  ? [{ label: shopCategoryLabel(category, isDe), href: `/shop?cat=${category}` }]
                  : []),
                { label: product.node.title },
              ]}
            />
            <CartDrawer />
          </div>

          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,4fr)_minmax(240px,280px)] lg:gap-8">
            <div className="lg:sticky lg:top-20">
              <ShopImageStage images={images} title={product.node.title} />
            </div>

            <div className="min-w-0 space-y-4">
              <h1 className="text-[26px] font-normal leading-snug tracking-tight text-slate-900 dark:text-white">
                {product.node.title}
              </h1>
              {category ? (
                <Link
                  href={`/shop?cat=${category}`}
                  className="inline-block text-[13px] text-[#007185] hover:underline dark:text-[#00CDAC]"
                >
                  {copy("Besuche den", "Visit the")} {shopCategoryLabel(category, isDe)} {copy("Shop", "Store")}
                </Link>
              ) : null}
              {hasVariants ? (
                <div className="space-y-3 border-t border-slate-200 pt-4 dark:border-white/10">
                  {product.node.options.map((option) => (
                    <div key={option.name}>
                      <p className="mb-2 text-sm font-semibold text-slate-900 dark:text-white">{option.name}</p>
                      <div className="flex flex-wrap gap-2">
                        {product.node.variants.edges.map((variant, index) => {
                          const value = variant.node.selectedOptions.find((item) => item.name === option.name)?.value;
                          return (
                            <button
                              key={variant.node.id}
                              type="button"
                              onClick={() => setSelectedVariantIndex(index)}
                              className={`rounded border px-3 py-1.5 text-sm ${
                                selectedVariantIndex === index
                                  ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900"
                                  : "border-slate-300 text-slate-700 dark:border-white/15 dark:text-white/80"
                              }`}
                            >
                              {value}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
              {about.length > 0 ? (
                <section className="border-t border-slate-200 pt-4 dark:border-white/10">
                  <h2 className="mb-2 text-base font-bold text-slate-900 dark:text-white">
                    {copy("Produktinformationen", "About this item")}
                  </h2>
                  <ul className="list-disc space-y-1.5 pl-5 text-[14px] leading-relaxed text-slate-700 dark:text-white/80">
                    {about.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </section>
              ) : description ? (
                <section className="border-t border-slate-200 pt-4 dark:border-white/10">
                  <h2 className="mb-2 text-base font-bold text-slate-900 dark:text-white">
                    {copy("Produktinformationen", "About this item")}
                  </h2>
                  <p className="text-[14px] leading-relaxed text-slate-700 dark:text-white/80 whitespace-pre-line">
                    {description}
                  </p>
                </section>
              ) : null}
              {details.length > 0 ? (
                <section className="border-t border-slate-200 pt-4 dark:border-white/10">
                  <h2 className="mb-2 text-base font-bold text-slate-900 dark:text-white">
                    {copy("Produktdetails", "Product details")}
                  </h2>
                  <table className="w-full text-[13px]">
                    <tbody>
                      {details.map((row) => (
                        <tr key={`${row.label}-${row.value}`} className="align-top">
                          <th className="w-[38%] py-1 pr-3 text-left font-semibold text-slate-900 dark:text-white">
                            {row.label}
                          </th>
                          <td className="py-1 text-slate-700 dark:text-white/75">{row.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </section>
              ) : null}
              <div className="lg:hidden">{buyBox}</div>
            </div>

            <aside className="hidden lg:block">
              <div className="sticky top-20">{buyBox}</div>
            </aside>
          </div>

          <ShopProductStory
            {...shopStoryOf(product, isDe)}
            isDe={isDe}
            photos={{
              about: images[0]?.url,
              make: images[1]?.url,
              use: images[2]?.url,
            }}
          />

          {relatedProducts.length > 0 ? (
            <section className="mt-10 border-t border-slate-200 pt-6 dark:border-white/10">
              <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">
                {copy("Ähnliche Artikel", "Related products")}
              </h2>
              <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
                {relatedProducts.map((item) => (
                  <ShopProductCard
                    key={item.node.id}
                    product={item}
                    isDe={isDe}
                    onAdd={(related) => {
                      const variant = related.node.variants.edges[0]?.node;
                      if (!variant) return;
                      addItem({
                        product: related,
                        variantId: variant.id,
                        variantTitle: variant.title,
                        price: variant.price,
                        quantity: 1,
                        selectedOptions: variant.selectedOptions || [],
                      });
                      toast.success(copy("In den Warenkorb", "Added to cart"), {
                        description: related.node.title,
                      });
                    }}
                  />
                ))}
              </div>
            </section>
          ) : null}
        </div>
        <OfferingStickyCta
          price={priceLabel}
          note={
            hasExternalOffers
              ? copy("Bei Partnern verfügbar", "Available from partners")
              : inStock
                ? copy("Auf Lager", "In stock")
                : copy("Nicht verfügbar", "Unavailable")
          }
          actionLabel={
            hasExternalOffers
              ? copy(`Bei ${externalOffers[0].retailer}`, `Shop ${externalOffers[0].retailer}`)
              : copy("In den Warenkorb", "Add to cart")
          }
          onClick={
            hasExternalOffers
              ? () =>
                  window.open(
                    withAffiliateParams(externalOffers[0].url, externalOffers[0].retailerKey),
                    "_blank",
                    "noopener,noreferrer"
                  )
              : inStock
                ? () => addToCart()
                : undefined
          }
        />
      </div>
    </Layout>
  );
}
