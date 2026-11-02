"use client";

import { useRouter } from 'next/navigation';
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Eye, EyeOff, CheckCircle, Check, Loader2 } from "lucide-react";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { PublicNavbar } from "@/components/PublicNavbar";

const passwordSchema = z.string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must be less than 128 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");

export default function ResetPassword() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  // Live password validation criteria from Figma
  const hasCapital = /[A-Z]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const hasMinLen = password.length >= 8;
  const hasNumber = /[0-9]/.test(password);
  const isPasswordValid = hasCapital && hasSpecial && hasMinLen && hasNumber;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsValidSession(true);
      }
      setCheckingSession(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) {
        setIsValidSession(true);
        setCheckingSession(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error("Passwörter stimmen nicht überein");
      return;
    }

    if (!isPasswordValid) {
      toast.error("Bitte alle 4 Passwortanforderungen erfüllen.");
      return;
    }

    setLoading(true);

    try {
      const validatedPassword = passwordSchema.parse(password);

      const { error } = await supabase.auth.updateUser({
        password: validatedPassword
      });

      if (error) throw error;

      setSuccess(true);
      toast.success("Passwort erfolgreich geändert!");
      
      setTimeout(() => {
        router.push("/app");
      }, 1500);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error(error.message || "Fehler beim Zurücksetzen des Passworts");
      }
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#01223F" }}
      >
        <Loader2 className="w-8 h-8 text-[#00CDAC] animate-spin" />
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen w-full relative overflow-hidden flex flex-col justify-between items-center text-white"
      style={{
        backgroundColor: "#01223F",
        fontFamily: "'Raleway', sans-serif"
      }}
    >
      {/* Figma Radial Gradient Atmosphere */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(92.05% 182.03% at 4.48% 11.62%, rgba(7, 43, 75, 0.5) 0%, rgba(13, 146, 161, 0.5) 11.46%, rgba(23, 177, 195, 0.5) 21.87%, rgba(7, 43, 75, 0.5) 35.42%, rgba(23, 177, 195, 0.5) 56.77%, rgba(7, 43, 75, 0.5) 88.54%)",
          filter: "blur(186px)",
          transform: "translate3d(0, 0, 0)"
        }}
      />

      <PublicNavbar tone="dark" fixed={false} />
      <div className="relative z-20 w-full max-w-[1280px] px-6 pt-3">
        <Link
          href="/auth"
          className="inline-flex items-center gap-2 text-xs font-medium text-white/60 hover:text-white transition-colors"
        >
          <span>← Zurück zum Login</span>
        </Link>
      </div>

      {/* Center Form Container */}
      <main className="w-full max-w-[480px] px-4 py-4 flex flex-col items-center relative z-20 my-auto">
        {/* Figma Emblem Logo */}
        <div className="relative mb-6 flex items-center justify-center">
          <div 
            className="w-[160px] h-[160px] rounded-full flex items-center justify-center"
            style={{
              background: "linear-gradient(224.04deg, #FFFFFF -56.66%, rgba(255, 255, 255, 0) 98.07%)",
              opacity: 0.9,
              filter: "drop-shadow(0px 15px 51px rgba(0, 0, 0, 0.3))",
              backdropFilter: "blur(319px)",
              border: "1px solid rgba(255, 255, 255, 0.2)"
            }}
          >
            <div 
              className="w-[112px] h-[112px] rounded-full flex items-center justify-center relative overflow-hidden"
              style={{
                background: "linear-gradient(180deg, #082C4E 0%, #39B1BF 121.18%)",
                boxShadow: "0px 0px 28px rgba(42, 239, 255, 0.6)"
              }}
            >
              <svg width="68" height="42" viewBox="0 0 68 42" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M34 22C38 12 48 8 58 10C54 20 44 26 34 22Z" fill="#FFB300" />
                <path d="M34 22C30 12 20 8 10 10C14 20 24 26 34 22Z" fill="#FFB300" />
                <path d="M34 22C42 26 56 34 66 28C58 38 42 36 34 22Z" fill="#16B1C3" />
                <path d="M34 22C26 26 12 34 2 28C10 38 26 36 34 22Z" fill="#16B1C3" />
              </svg>
            </div>
          </div>
        </div>

        {/* Figma Exact Title */}
        <h1 
          className="text-center font-bold mb-6 text-white"
          style={{
            fontFamily: "'Raleway', sans-serif",
            fontSize: "20px",
            lineHeight: "120%"
          }}
        >
          Change your password before go to the ORIVE dezk
        </h1>

        {success ? (
          <div className="w-full p-6 rounded-lg bg-white/10 border border-white/20 text-center space-y-3">
            <CheckCircle className="w-10 h-10 text-[#47B94C] mx-auto" />
            <h2 className="text-base font-bold text-white">Password Updated!</h2>
            <p className="text-xs text-white/80">
              Dein neues Passwort wurde gespeichert. Du wirst ins ORIVE dezk weitergeleitet...
            </p>
          </div>
        ) : (
          <form onSubmit={handleResetPassword} className="w-full space-y-4">
            {/* New Password Input */}
            <div 
              className="w-full rounded-[8px] px-4 py-1.5 flex items-center justify-between bg-white border border-white/20 transition-all focus-within:ring-2 focus-within:ring-[#00CDAC] relative"
              style={{ height: "51px" }}
            >
              <div className="flex-1 flex flex-col justify-center">
                <label 
                  htmlFor="new-password"
                  className="font-semibold uppercase tracking-wider text-[10px]"
                  style={{ color: "#6B8095" }}
                >
                  New password
                </label>
                <input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-transparent outline-none text-[#082C4E] placeholder-[#B5C0CA] text-sm"
                />
              </div>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[#082C4E] opacity-25 hover:opacity-80 transition-opacity p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Confirm Password Input */}
            <div 
              className="w-full rounded-[8px] px-4 py-1.5 flex items-center justify-between bg-white border border-white/20 transition-all focus-within:ring-2 focus-within:ring-[#00CDAC] relative"
              style={{ height: "51px" }}
            >
              <div className="flex-1 flex flex-col justify-center">
                <label 
                  htmlFor="confirm-password"
                  className="font-semibold uppercase tracking-wider text-[10px]"
                  style={{ color: "#6B8095" }}
                >
                  Confirm password
                </label>
                <input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-transparent outline-none text-[#082C4E] placeholder-[#B5C0CA] text-sm"
                />
              </div>
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="text-[#082C4E] opacity-25 hover:opacity-80 transition-opacity p-1"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Figma 4 Password Validation Checklist */}
            <div className="w-full flex flex-wrap gap-x-4 gap-y-2 pt-1 pb-2">
              <div className="flex items-center gap-1.5 text-xs">
                <span 
                  className={cn(
                    "w-4 h-4 rounded-full flex items-center justify-center transition-colors",
                    hasCapital ? "bg-[#47B94C] text-white" : "border border-white/40 text-transparent"
                  )}
                >
                  <Check className="w-2.5 h-2.5" />
                </span>
                <span className={cn("text-[11px] font-bold", hasCapital ? "text-white" : "text-white/50")}>
                  at least 1 capital letter
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-xs">
                <span 
                  className={cn(
                    "w-4 h-4 rounded-full flex items-center justify-center transition-colors",
                    hasSpecial ? "bg-[#47B94C] text-white" : "border border-white/40 text-transparent"
                  )}
                >
                  <Check className="w-2.5 h-2.5" />
                </span>
                <span className={cn("text-[11px] font-bold", hasSpecial ? "text-white" : "text-white/50")}>
                  at least 1 special character
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-xs">
                <span 
                  className={cn(
                    "w-4 h-4 rounded-full flex items-center justify-center transition-colors",
                    hasMinLen ? "bg-[#47B94C] text-white" : "border border-white/40 text-transparent"
                  )}
                >
                  <Check className="w-2.5 h-2.5" />
                </span>
                <span className={cn("text-[11px] font-bold", hasMinLen ? "text-white" : "text-white/50")}>
                  at least 8 characters
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-xs">
                <span 
                  className={cn(
                    "w-4 h-4 rounded-full flex items-center justify-center transition-colors",
                    hasNumber ? "bg-[#47B94C] text-white" : "border border-white/40 text-transparent"
                  )}
                >
                  <Check className="w-2.5 h-2.5" />
                </span>
                <span className={cn("text-[11px] font-bold", hasNumber ? "text-white" : "text-white/50")}>
                  at least 1 number
                </span>
              </div>
            </div>

            {/* Primary Action Button (Figma #FFB300) */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-[48px] rounded-[8px] bg-[#FFB300] hover:bg-[#e09e00] text-white font-bold text-sm tracking-wide transition-all shadow-md flex items-center justify-center gap-2 uppercase"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>CHANGE PASSWORD</span>
            </button>

            {/* Secondary Action: Back to login */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => router.push("/auth")}
                className="text-sm font-bold text-[#FFB300] underline hover:opacity-90 transition-opacity"
              >
                Back to login
              </button>
            </div>
          </form>
        )}
      </main>

      {/* Footer: Terms & Privacy */}
      <footer className="w-full py-6 text-center relative z-20">
        <div className="flex items-center justify-center gap-3 text-xs text-white/50 font-medium">
          <Link href="/datenschutz" className="hover:text-white transition-colors">
            Terms & Privacy
          </Link>
          <span>·</span>
          <Link href="/agb#impressum" className="hover:text-white transition-colors">
            Legal Notice
          </Link>
        </div>
      </footer>
    </div>
  );
}
