"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Layout } from "@/components/Layout";
import { CartDrawer } from "@/components/CartDrawer";
import { ShopProductCard } from "@/components/ShopProductCard";
import { fallbackShopProducts } from "@/data/shopProducts";
import { useLanguage } from "@/hooks/useLanguage";
import { fetchProducts, type ShopifyProduct } from "@/lib/shopify";
import {
  productInStock,
  productMatchesCategory,
  productMatchesMaterials,
  productMatchesPriceBucket,
  productMatchesQuery,
  productPriceValue,
  shopCategoryCounts,
  shopHeroOf,
  shopMaterialCounts,
  shopPriceBucketCounts,
  shopStockCount,
  SHOP_CATEGORIES,
  SHOP_MATERIALS,
  SHOP_PRICE_BUCKETS,
} from "@/lib/shopDisplay";
import { useCartStore } from "@/stores/cartStore";
import { cn } from "@/lib/utils";
import { Loader2, Search } from "lucide-react";
import { toast } from "sonner";

export default function Shop() {
  const { language, copy } = useLanguage();
  const isDe = language === "de";
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(searchParams?.get("cat") || "all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"featured" | "price-asc" | "price-desc">("featured");
  const [priceBucket, setPriceBucket] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [materials, setMaterials] = useState<string[]>([]);
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    const cat = searchParams?.get("cat");
    if (cat) setSelectedCategory(cat);
  }, [searchParams]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchProducts(60);
        const combined = [...data];
        for (const fallback of fallbackShopProducts) {
          if (!combined.some((item) => item.node.handle === fallback.node.handle)) {
            combined.push(fallback);
          }
        }
        setProducts(combined);
      } catch {
        setProducts([...fallbackShopProducts]);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  const counts = useMemo(() => shopCategoryCounts(products), [products]);

  const scopedProducts = useMemo(
    () =>
      products
        .filter((product) => productMatchesCategory(product, selectedCategory))
        .filter((product) => productMatchesQuery(product, query)),
    [products, selectedCategory, query]
  );

  const priceCounts = useMemo(() => shopPriceBucketCounts(scopedProducts), [scopedProducts]);
  const materialCounts = useMemo(() => shopMaterialCounts(scopedProducts), [scopedProducts]);
  const stockCount = useMemo(() => shopStockCount(scopedProducts), [scopedProducts]);

  const filteredProducts = useMemo(() => {
    const next = scopedProducts
      .filter((product) => productMatchesPriceBucket(product, priceBucket))
      .filter((product) => (inStockOnly ? productInStock(product) : true))
      .filter((product) => productMatchesMaterials(product, materials));
    if (sort === "price-asc") return [...next].sort((a, b) => productPriceValue(a) - productPriceValue(b));
    if (sort === "price-desc") return [...next].sort((a, b) => productPriceValue(b) - productPriceValue(a));
    return next;
  }, [scopedProducts, priceBucket, inStockOnly, materials, sort]);

  const filtersActive = Boolean(priceBucket || inStockOnly || materials.length);
  const clearFilters = () => {
    setPriceBucket("");
    setInStockOnly(false);
    setMaterials([]);
  };

  const toggleMaterial = (value: string) => {
    setMaterials((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value]
    );
  };

  const addToCart = (product: ShopifyProduct) => {
    const variant = product.node.variants.edges[0]?.node;
    if (!variant) return;
    addItem({
      product,
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity: 1,
      selectedOptions: variant.selectedOptions || [],
    });
    toast.success(copy("In den Warenkorb", "Added to cart"), {
      description: product.node.title,
    });
  };

  const hero = shopHeroOf(selectedCategory);

  const resultsLabel = query.trim()
    ? copy(`${filteredProducts.length} Ergebnisse für „${query.trim()}“`, `${filteredProducts.length} results for “${query.trim()}”`)
    : copy(`${filteredProducts.length} Ergebnisse`, `${filteredProducts.length} results`);

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <section className="pb-3 pt-0">
          <div className="relative w-full overflow-hidden">
            <img
              key={hero.image}
              src={hero.image}
              alt=""
              className="aspect-[5/1] h-auto w-full object-cover"
              style={{ objectPosition: hero.objectPosition }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#F8FAFC] via-[#F8FAFC]/88 to-transparent dark:from-[#011B33] dark:via-[#011B33]/86 dark:to-transparent" />
            <div className="absolute inset-0 flex items-center px-4 sm:px-6 lg:px-10 xl:px-16">
              <div className="mx-auto w-full max-w-[1600px]">
                <div className="max-w-xl py-5 sm:py-7">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-white/40">
                    ORIVE Shop
                  </p>
                  <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                    {isDe ? hero.titleDe : hero.titleEn}{" "}
                    <span className="bg-gradient-to-r from-[#00CDAC] to-[#02AAB0] bg-clip-text text-transparent">
                      {isDe ? hero.accentDe : hero.accentEn}
                    </span>
                  </h1>
                  <p className="mt-1.5 max-w-md text-sm text-slate-500 dark:text-white/55">
                    {isDe ? hero.subDe : hero.subEn}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-10 lg:px-10 xl:px-16">
          <aside className="hidden lg:block">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              {copy("Kategorie", "Department")}
            </p>
            <nav className="space-y-0.5">
              {SHOP_CATEGORIES.map((category) => {
                const active = selectedCategory === category.value;
                const count = counts[category.value] ?? 0;
                if (category.value !== "all" && count === 0) return null;
                return (
                  <button
                    key={category.value}
                    type="button"
                    onClick={() => setSelectedCategory(category.value)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-sm transition-colors",
                      active
                        ? "bg-slate-900 font-semibold text-white dark:bg-white dark:text-slate-900"
                        : "text-slate-600 hover:bg-slate-100 dark:text-white/65 dark:hover:bg-white/5"
                    )}
                  >
                    <span>{isDe ? category.labelDe : category.labelEn}</span>
                    <span className={cn("text-[11px]", active ? "opacity-70" : "text-slate-400")}>{count}</span>
                  </button>
                );
              })}
            </nav>

            <div className="mt-6 space-y-5 border-t border-slate-200/70 pt-5 dark:border-white/10">
              {filtersActive ? (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-[11px] font-semibold text-[#008975] hover:underline dark:text-[#00CDAC]"
                >
                  {copy("Filter zurücksetzen", "Clear filters")}
                </button>
              ) : null}

              <div>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                  {copy("Preis", "Price")}
                </p>
                <div className="space-y-1">
                  {SHOP_PRICE_BUCKETS.map((bucket) => {
                    const count = priceCounts[bucket.value] ?? 0;
                    return (
                      <label
                        key={bucket.value}
                        className="flex cursor-pointer items-center justify-between gap-2 rounded-lg px-2.5 py-1 text-sm text-slate-600 hover:bg-slate-100 dark:text-white/65 dark:hover:bg-white/5"
                      >
                        <span className="flex min-w-0 items-center gap-2">
                          <input
                            type="radio"
                            name="shop-price"
                            checked={priceBucket === bucket.value}
                            onChange={() => setPriceBucket(priceBucket === bucket.value ? "" : bucket.value)}
                            onClick={() => {
                              if (priceBucket === bucket.value) setPriceBucket("");
                            }}
                            className="accent-[#00CDAC]"
                          />
                          <span className="truncate">{isDe ? bucket.labelDe : bucket.labelEn}</span>
                        </span>
                        <span className="text-[11px] text-slate-400">{count}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                  {copy("Verfügbarkeit", "Availability")}
                </p>
                <label className="flex cursor-pointer items-center justify-between gap-2 rounded-lg px-2.5 py-1 text-sm text-slate-600 hover:bg-slate-100 dark:text-white/65 dark:hover:bg-white/5">
                  <span className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={inStockOnly}
                      onChange={(event) => setInStockOnly(event.target.checked)}
                      className="accent-[#00CDAC]"
                    />
                    <span>{copy("Auf Lager", "In stock")}</span>
                  </span>
                  <span className="text-[11px] text-slate-400">{stockCount}</span>
                </label>
              </div>

              <div>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                  {copy("Material", "Material")}
                </p>
                <div className="space-y-1">
                  {SHOP_MATERIALS.map((material) => {
                    const count = materialCounts[material.value] ?? 0;
                    if (count === 0) return null;
                    return (
                      <label
                        key={material.value}
                        className="flex cursor-pointer items-center justify-between gap-2 rounded-lg px-2.5 py-1 text-sm text-slate-600 hover:bg-slate-100 dark:text-white/65 dark:hover:bg-white/5"
                      >
                        <span className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={materials.includes(material.value)}
                            onChange={() => toggleMaterial(material.value)}
                            className="accent-[#00CDAC]"
                          />
                          <span>{isDe ? material.labelDe : material.labelEn}</span>
                        </span>
                        <span className="text-[11px] text-slate-400">{count}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          </aside>

          <div>
            <div className="mb-4 flex flex-col gap-3 border-b border-slate-200/80 pb-4 dark:border-white/10">
              <div className="flex min-w-0 items-center gap-2 overflow-x-auto no-scrollbar lg:hidden">
                {SHOP_CATEGORIES.map((category) => {
                  const active = selectedCategory === category.value;
                  return (
                    <button
                      key={category.value}
                      type="button"
                      onClick={() => setSelectedCategory(category.value)}
                      className={cn(
                        "shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
                        active
                          ? "border-transparent bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                          : "border-slate-200/80 bg-white/90 text-slate-600 dark:border-white/5 dark:bg-white/5 dark:text-white/60"
                      )}
                    >
                      {isDe ? category.labelDe : category.labelEn}
                    </button>
                  );
                })}
              </div>

              <details className="lg:hidden">
                <summary className="cursor-pointer text-xs font-semibold text-slate-600 dark:text-white/70">
                  {copy("Filter", "Filters")}
                  {filtersActive ? ` · ${[priceBucket, inStockOnly, ...materials].filter(Boolean).length}` : ""}
                </summary>
                <div className="mt-3 grid gap-4 sm:grid-cols-3">
                  <div>
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                      {copy("Preis", "Price")}
                    </p>
                    {SHOP_PRICE_BUCKETS.map((bucket) => (
                      <label key={bucket.value} className="flex items-center justify-between py-1 text-sm text-slate-600 dark:text-white/65">
                        <span className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="shop-price-mobile"
                            checked={priceBucket === bucket.value}
                            onChange={() => setPriceBucket(bucket.value)}
                            onClick={() => {
                              if (priceBucket === bucket.value) setPriceBucket("");
                            }}
                            className="accent-[#00CDAC]"
                          />
                          {isDe ? bucket.labelDe : bucket.labelEn}
                        </span>
                        <span className="text-[11px] text-slate-400">{priceCounts[bucket.value] ?? 0}</span>
                      </label>
                    ))}
                  </div>
                  <div>
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                      {copy("Verfügbarkeit", "Availability")}
                    </p>
                    <label className="flex items-center justify-between py-1 text-sm text-slate-600 dark:text-white/65">
                      <span className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={inStockOnly}
                          onChange={(event) => setInStockOnly(event.target.checked)}
                          className="accent-[#00CDAC]"
                        />
                        {copy("Auf Lager", "In stock")}
                      </span>
                      <span className="text-[11px] text-slate-400">{stockCount}</span>
                    </label>
                  </div>
                  <div>
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                      {copy("Material", "Material")}
                    </p>
                    {SHOP_MATERIALS.map((material) => {
                      const count = materialCounts[material.value] ?? 0;
                      if (count === 0) return null;
                      return (
                        <label key={material.value} className="flex items-center justify-between py-1 text-sm text-slate-600 dark:text-white/65">
                          <span className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={materials.includes(material.value)}
                              onChange={() => toggleMaterial(material.value)}
                              className="accent-[#00CDAC]"
                            />
                            {isDe ? material.labelDe : material.labelEn}
                          </span>
                          <span className="text-[11px] text-slate-400">{count}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </details>

              <div className="flex flex-wrap items-center gap-2">
                <label className="relative min-w-0 flex-1 sm:max-w-sm">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={copy("Artikel suchen", "Search items")}
                    className="h-10 w-full rounded-full border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#00CDAC] dark:border-white/10 dark:bg-white/5 dark:text-white"
                  />
                </label>
                <select
                  value={sort}
                  onChange={(event) => setSort(event.target.value as typeof sort)}
                  className="h-10 rounded-full border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-white/80"
                >
                  <option value="featured">{copy("Empfohlen", "Featured")}</option>
                  <option value="price-asc">{copy("Preis: aufsteigend", "Price: low to high")}</option>
                  <option value="price-desc">{copy("Preis: absteigend", "Price: high to low")}</option>
                </select>
                <p className="mr-auto text-xs text-slate-500 dark:text-white/45">{resultsLabel}</p>
                <CartDrawer />
              </div>
            </div>

            {loading ? (
              <div className="flex min-h-[40vh] items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-[#00CDAC]" />
              </div>
            ) : filteredProducts.length === 0 ? (
              <p className="py-20 text-center text-sm text-slate-500 dark:text-white/45">
                {copy("Keine Artikel gefunden.", "No items found.")}
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 xl:grid-cols-4">
                {filteredProducts.map((product) => (
                  <ShopProductCard
                    key={product.node.id}
                    product={product}
                    isDe={isDe}
                    onAdd={addToCart}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
