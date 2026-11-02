"use client";
import Link from 'next/link';
import { useParams, useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from "react";

import { CheckCircle2, XCircle, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getAnonClientHeaders } from "@/lib/anonClientToken";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PaymentStatusBadge } from "@/components/payments/PaymentStatusBadge";
import { toast } from "sonner";

type PaymentView = "pay" | "success" | "cancel";

type PaymentPageBooking = {
  id: string;
  booking_date: string;
  booking_time: string;
  duration: number;
  status: string;
  payment_status: string;
  offering?: {
    title: string | null;
    type: string | null;
    price: string | null;
  };
};

export default function PayBooking() {
  const params = useParams(); const bookingId = typeof params.bookingId === "string" ? params.bookingId : params.bookingId?.[0] || "";
  const searchParams = useSearchParams();
  const navigate = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<PaymentPageBooking | null>(null);
  const [error, setError] = useState<string | null>(null);

  const view: PaymentView = useMemo(() => {
    const s = searchParams.get("status");
    if (s === "success") return "success";
    if (s === "cancel") return "cancel";
    return "pay";
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        if (!bookingId) {
          setError("Missing booking id");
          return;
        }

        const resp: any = await supabase.functions.invoke("get-payment-page", {
          body: { bookingId },
          headers: getAnonClientHeaders(),
        });

        if (cancelled) return;

        if (resp?.error) {
          setError("Could not load booking details");
          setBooking(null);
          return;
        }

        setBooking(resp?.data?.booking ?? null);
      } catch (e) {
        if (!cancelled) {
          setError("Could not load booking details");
          setBooking(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [bookingId]);

  const title = booking?.offering?.title || "Booking payment";
  const subtitle = booking
    ? `${booking.booking_date} · ${booking.booking_time.slice(0, 5)} · ${booking.duration} min`
    : null;

  return (
    <Layout>
      <main className="min-h-screen bg-background py-10">
        <div className="container mx-auto px-4 max-w-md">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <Link
                href="/"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Back
              </Link>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Lock className="h-3.5 w-3.5" />
                Secure checkout
              </div>
            </div>
          </div>

          <Card className="bg-card border-border shadow-card">
            <CardHeader className="border-b border-border">
              <CardTitle className="text-xl text-foreground">{title}</CardTitle>
              {subtitle ? (
                <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
              ) : null}
              {booking ? (
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Payment status</span>
                  <PaymentStatusBadge status={booking.payment_status} />
                </div>
              ) : null}
            </CardHeader>

            <CardContent className="pt-6 space-y-6">
              {loading ? (
                <div className="space-y-3">
                  <div className="h-4 w-2/3 rounded bg-muted" />
                  <div className="h-4 w-1/2 rounded bg-muted" />
                  <div className="h-10 w-full rounded bg-muted" />
                </div>
              ) : error ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">{error}</p>
                  <Button asChild variant="secondary" className="w-full">
                    <Link href="/">Return home</Link>
                  </Button>
                </div>
              ) : view === "success" ? (
                <div className="text-center space-y-5">
                  <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                    <CheckCircle2 className="h-7 w-7 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-xl font-semibold text-foreground">Payment successful</h2>
                    <p className="text-sm text-muted-foreground">Thank you — you can safely close this page.</p>
                  </div>
                  <Separator />
                  <Button asChild className="w-full">
                    <Link href="/">Back to Orive</Link>
                  </Button>
                </div>
              ) : view === "cancel" ? (
                <div className="text-center space-y-5">
                  <div className="mx-auto w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center">
                    <XCircle className="h-7 w-7 text-destructive" />
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-xl font-semibold text-foreground">Payment cancelled</h2>
                    <p className="text-sm text-muted-foreground">No charges were made. You can try again anytime.</p>
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => {
                      const next = new URLSearchParams(searchParams?.toString());
                      next.delete("status");
                      navigate.replace(`${pathname}${next.toString() ? `?${next.toString()}` : ''}`);
                    }}
                  >
                    Try again
                  </Button>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Tap “Pay now” to continue. (We’ll connect this to the payment provider next.)
                    </p>
                    {booking?.offering?.price ? (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Amount</span>
                        <span className="font-semibold text-foreground">{booking.offering.price}</span>
                      </div>
                    ) : null}
                  </div>

                  <Button
                    className="w-full"
                    onClick={() => {
                      toast.message("Payment provider not connected yet", {
                        description: "Next step: wire this button to Stripe checkout.",
                      });
                      navigate.replace(`${pathname}?status=success`);
                    }}
                    disabled={booking?.payment_status === "paid"}
                  >
                    {booking?.payment_status === "paid" ? "Already paid" : "Pay now"}
                  </Button>

                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => navigate.replace(`${pathname}?status=cancel`)}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </Layout>
  );
}
