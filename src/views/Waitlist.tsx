"use client";
import { useRouter } from 'next/navigation';
import { useState } from "react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Layout } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Clock, Sparkles, Users, Heart, CheckCircle2 } from "lucide-react";

export default function Waitlist() {
  const navigate = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Please enter your email");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("waitlist").insert({
        email: email.trim().toLowerCase(),
        name: name.trim() || null,
      });

      if (error) {
        if (error.code === "23505") {
          // Unique constraint violation
          toast.info("You're already on the waitlist! We'll notify you soon.");
          setIsSubmitted(true);
        } else {
          throw error;
        }
      } else {
        toast.success("You're on the list! We'll notify you when spots open.");
        setIsSubmitted(true);
      }
    } catch (err: any) {
      console.error("Waitlist error:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout hideFooter>
    <div className="min-h-[calc(100dvh-4rem)] bg-background flex flex-col">
      {/* Subtle animated background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-5"
          style={{
            background: "radial-gradient(circle, hsl(var(--highlight)) 0%, transparent 70%)",
            animation: "pulse 8s ease-in-out infinite",
          }}
        />
      </div>

      {/* Main content */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-lg">
          {!isSubmitted ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Badge */}
              <div className="flex justify-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-highlight/10 border border-highlight/20">
                  <Clock className="w-4 h-4 text-highlight" />
                  <span className="text-sm font-medium text-highlight">
                    Early Bird Spots Filled
                  </span>
                </div>
              </div>

              {/* Headline */}
              <div className="text-center space-y-4">
                <h1 className="text-3xl sm:text-4xl font-bold text-foreground leading-tight">
                  You're not too late—
                  <br />
                  <span className="text-highlight">you're next in line</span>
                </h1>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Our first 50 founding members have claimed their spots. Join the
                  waitlist to be notified when we open the next cohort.
                </p>
              </div>

              {/* Form */}
              <motion.form
                onSubmit={handleSubmit}
                className="space-y-4 p-6 rounded-lg bg-card/50 border border-border/50"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-foreground">
                    Your Name <span className="text-muted-foreground">(optional)</span>
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="How should we address you?"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-background/50 border-border/50 focus:border-highlight"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">
                    Email Address <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-background/50 border-border/50 focus:border-highlight"
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting}
                  className="w-full bg-highlight hover:bg-highlight/90 text-white font-bold"
                >
                  {isSubmitting ? (
                    "Joining..."
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Join the Waitlist
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  We respect your privacy. No spam, ever.
                </p>
              </motion.form>

              {/* Benefits */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="grid sm:grid-cols-3 gap-4"
              >
                {[
                  { icon: Users, text: "Priority access to next cohort" },
                  { icon: Heart, text: "Exclusive founding perks" },
                  { icon: Sparkles, text: "Early feature previews" },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <item.icon className="w-4 h-4 text-highlight shrink-0" />
                    <span>{item.text}</span>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          ) : (
            /* Success state */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="w-20 h-20 rounded-full bg-highlight/20 flex items-center justify-center mx-auto"
              >
                <CheckCircle2 className="w-10 h-10 text-highlight" />
              </motion.div>

              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-foreground">You're on the list!</h2>
                <p className="text-muted-foreground">
                  We'll send you an email at <strong>{email}</strong> when new spots open.
                </p>
              </div>

              <div className="p-4 rounded-md bg-card/50 border border-border/50">
                <p className="text-sm text-muted-foreground">
                  While you wait, follow us on social media to stay connected with the ORIVE
                  community and get early updates.
                </p>
              </div>

              <Button variant="outline" onClick={() => navigate.push("/")}>
                Return to Homepage
              </Button>
            </motion.div>
          )}
        </div>
      </main>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.05; }
          50% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.08; }
        }
      `}</style>
    </div>
    </Layout>
  );
}
