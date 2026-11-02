"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ShoppingBag, Minus, Plus, Trash2, ExternalLink, Loader2 } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { useLanguage } from "@/hooks/useLanguage";
import { formatShopPrice } from "@/lib/shopDisplay";

export const CartDrawer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { language, copy } = useLanguage();
  const isDe = language === "de";
  const { 
    items, 
    isLoading, 
    updateQuantity, 
    removeItem, 
    createCheckout 
  } = useCartStore();
  
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (parseFloat(item.price.amount) * item.quantity), 0);
  const currency = items[0]?.price.currencyCode || "EUR";
  const locale = copy("de-DE", "en-IE");

  const handleCheckout = async () => {
    try {
      await createCheckout();
      const checkoutUrl = useCartStore.getState().checkoutUrl;
      if (checkoutUrl) {
        window.open(checkoutUrl, '_blank');
        setIsOpen(false);
      }
    } catch (error) {
      console.error('Checkout failed:', error);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:text-white/80 dark:hover:bg-white/5"
          aria-label={copy("Warenkorb", "Cart")}
        >
          <ShoppingBag className="h-4 w-4" />
          {totalItems > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#00CDAC] text-[10px] font-bold text-white">
              {totalItems}
            </span>
          )}
        </button>
      </SheetTrigger>
      
      <SheetContent className="flex h-full w-full flex-col sm:max-w-lg">
        <SheetHeader className="flex-shrink-0">
          <SheetTitle>{copy("Warenkorb", "Cart")}</SheetTitle>
          <SheetDescription>
            {totalItems === 0
              ? (copy("Noch leer.", "Still empty."))
              : copy(`${totalItems} Artikel`, `${totalItems} item${totalItems !== 1 ? "s" : ""}`)}
          </SheetDescription>
        </SheetHeader>
        
        <div className="flex flex-col flex-1 pt-6 min-h-0">
          {items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <ShoppingBag className="mx-auto mb-4 h-10 w-10 text-slate-300 dark:text-white/20" />
                <p className="text-sm text-slate-500 dark:text-white/45">{copy("Noch leer.", "Still empty.")}</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto pr-2 min-h-0">
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.variantId} className="flex gap-4 p-2">
                      <div className="w-16 h-16 bg-secondary/20 rounded-md overflow-hidden flex-shrink-0">
                        {item.product.node.images?.edges?.[0]?.node && (
                          <img
                            src={item.product.node.images.edges[0].node.url}
                            alt={item.product.node.title}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{item.product.node.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {item.selectedOptions.map(option => option.value).join(' • ')}
                        </p>
                        <p className="font-semibold">
                          {formatShopPrice(item.price.amount, item.price.currencyCode, locale)}
                        </p>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => removeItem(item.variantId)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                        
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex-shrink-0 space-y-4 pt-4 border-t bg-background">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-slate-400">
                      {copy("Zwischensumme", "Subtotal")}
                    </p>
                    <p className="text-xl font-semibold text-slate-900 dark:text-white">
                      {formatShopPrice(String(totalPrice), currency, locale)}
                    </p>
                  </div>
                  <p className="max-w-[180px] text-right text-[11px] leading-relaxed text-slate-400">
                    {copy("Versand und Steuern an der Shopify-Kasse.", "Shipping and tax at Shopify checkout.")}
                  </p>
                </div>
                
                <Button 
                  onClick={handleCheckout}
                  className="h-12 w-full rounded-full bg-[#00CDAC] text-sm font-semibold text-white hover:bg-[#02AAB0]"
                  disabled={items.length === 0 || isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {copy("Weiterleitung…", "Opening checkout…")}
                    </>
                  ) : (
                    <>
                      <ExternalLink className="mr-2 h-4 w-4" />
                      {copy("Auf Shopify zahlen", "Pay on Shopify")}
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
