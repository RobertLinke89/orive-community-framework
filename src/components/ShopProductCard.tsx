"use client";

import { useLanguage } from "@/hooks/useLanguage";

import Link from "next/link";
import { ExternalLink, ShoppingBag } from "lucide-react";
import type { ShopifyProduct } from "@/lib/shopify";
import { formatShopPrice, shopCategoryLabel, shopCategoryOf } from "@/lib/shopDisplay";
import { primaryOffer, withAffiliateParams } from "@/data/shopExternalOffers";

type ShopProductCardProps = {
  product: ShopifyProduct;
  isDe?: boolean;
  onAdd?: (product: ShopifyProduct) => void;
};

export function ShopProductCard({ product, isDe = false, onAdd }: ShopProductCardProps) {
  const { copy, language } = useLanguage();
  const image = product.node.images.edges[0]?.node;
  const price = product.node.priceRange.minVariantPrice;
  const category = shopCategoryOf(product);
  const priceLabel = formatShopPrice(
    price.amount,
    price.currencyCode,
    language === "de" || isDe ? "de-DE" : "en-IE"
  );
  const inStock = product.node.variants.edges[0]?.node.availableForSale !== false;
  const href = `/shop/${product.node.handle}`;
  const offer = primaryOffer(product.node.handle);

  return (
    <article className="group flex flex-col text-left">
      <Link href={href} className="block">
        <div className="relative mb-3 overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-[0_1px_0_rgba(15,23,42,0.04)] dark:border-white/10">
          <div className="aspect-square bg-white">
            {image ? (
              <img
                src={image.url}
                alt={image.altText || product.node.title}
                className="h-full w-full object-contain object-center p-3 transition-transform duration-300 ease-out group-hover:scale-[1.04]"
                loading="lazy"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-slate-300">
                <ShoppingBag className="h-8 w-8" />
              </div>
            )}
          </div>
        </div>
        {category ? (
          <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.12em] text-slate-400">
            {shopCategoryLabel(category, isDe)}
          </p>
        ) : null}
        <h3 className="line-clamp-2 min-h-[2.5rem] text-[13px] font-medium leading-snug text-slate-800 group-hover:text-[#008975] dark:text-white/90 dark:group-hover:text-[#00CDAC]">
          {product.node.title}
        </h3>
        <p className="mt-1.5 text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
          {priceLabel}
        </p>
        <p className={`mt-0.5 text-[11px] ${inStock ? "text-emerald-700 dark:text-emerald-400" : "text-slate-400"}`}>
          {offer
            ? copy(`Über ${offer.retailer}`, `Via ${offer.retailer}`)
            : inStock
              ? copy("Auf Lager", "In stock")
              : copy("Nicht verfügbar", "Unavailable")}
        </p>
      </Link>
      {offer ? (
        <a
          href={withAffiliateParams(offer.url, offer.retailerKey)}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="mt-3 inline-flex h-9 items-center justify-center gap-1.5 rounded-full bg-[#00CDAC] text-xs font-semibold text-white transition-colors hover:bg-[#02AAB0]"
        >
          {copy(`Bei ${offer.retailer}`, `Shop ${offer.retailer}`)}
          <ExternalLink className="h-3 w-3" />
        </a>
      ) : onAdd ? (
        <button
          type="button"
          disabled={!inStock}
          onClick={() => onAdd(product)}
          className="mt-3 h-9 rounded-full bg-[#00CDAC] text-xs font-semibold text-white transition-colors hover:bg-[#02AAB0] disabled:opacity-40"
        >
          {copy("In den Warenkorb", "Add to cart")}
        </button>
      ) : null}
    </article>
  );
}
