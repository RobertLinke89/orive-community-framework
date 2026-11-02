"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLanguage } from "@/hooks/useLanguage";
import { MIN_OFFERING_DESCRIPTION_CHARS, offeringDescriptionLength } from "@/lib/offeringDescription";

const fieldClass =
  "w-full h-11 px-3 bg-white dark:bg-[#01223F] border border-slate-200 dark:border-white/15 text-sm text-[#01223F] dark:text-white placeholder:text-slate-400 outline-none focus:border-[#01223F] dark:focus:border-white";
const labelClass = "block mb-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500 dark:text-white/45";

type Step = 1 | 2 | 3;

export default function FacilitatorStart() {
  const router = useRouter();
  const { language, copy } = useLanguage();
  const isDe = language === "de";
  const [ready, setReady] = useState(false);
  const [token, setToken] = useState("");
  const [step, setStep] = useState<Step>(1);
  const [offeringDone, setOfferingDone] = useState(false);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [practice, setPractice] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Breathwork");
  const [price, setPrice] = useState("35");
  const [spots, setSpots] = useState("8");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("18:00");
  const [place, setPlace] = useState("");
  const [weeks, setWeeks] = useState("4");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.auth.getSession();
      const access = data.session?.access_token || "";
      if (!access) {
        router.replace("/auth?mode=facilitator&returnUrl=/dezk/start");
        return;
      }
      const res = await fetch("/api/facilitator/profile", { headers: { Authorization: `Bearer ${access}` } });
      if (!res.ok) {
        router.replace("/auth?mode=facilitator&returnUrl=/dezk/start");
        return;
      }
      const profile = await res.json();
      if (cancelled) return;
      if (profile.onboardingComplete) {
        router.replace("/app");
        return;
      }
      setToken(access);
      setName(profile.name || "");
      setCity(profile.city || "");
      setPractice(profile.practice || "");
      setPlace(profile.city || "");
      const savedStep = Number(window.sessionStorage.getItem("orive-start-step"));
      if (savedStep === 2 || savedStep === 3) setStep(savedStep);
      if (window.sessionStorage.getItem("orive-start-offering") === "1") setOfferingDone(true);
      setReady(true);
    })().catch(() => router.replace("/auth?mode=facilitator&returnUrl=/dezk/start"));
    return () => {
      cancelled = true;
    };
  }, [router]);

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const saveProfile = async (complete: boolean) => {
    const res = await fetch("/api/facilitator/profile", {
      method: "PUT",
      headers,
      body: JSON.stringify({
        name: name.trim(),
        city: city.trim(),
        practice: practice.trim(),
        onboardingComplete: complete,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Could not save.");
    return data;
  };

  const goTo = (next: Step) => {
    window.sessionStorage.setItem("orive-start-step", String(next));
    setStep(next);
  };

  const nextFromPractice = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !city.trim()) return;
    setBusy(true);
    try {
      await saveProfile(false);
      if (!place) setPlace(city.trim());
      goTo(3);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  };

  const connectStripe = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/facilitator/connect", { method: "POST", headers, body: "{}" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      toast.info(data.error || (copy("Stripe ist noch nicht verbunden.", "Stripe is not connected yet.")));
    } catch {
      toast.error(copy("Stripe ist gerade nicht erreichbar.", "Stripe is not reachable right now."));
    } finally {
      setBusy(false);
    }
  };

  const publishFirst = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !date || !time || !place.trim()) return;
    if (offeringDescriptionLength(description) < MIN_OFFERING_DESCRIPTION_CHARS) {
      toast.error(
        copy(`Beschreibung braucht mindestens ${MIN_OFFERING_DESCRIPTION_CHARS} Zeichen.`, `Description needs at least ${MIN_OFFERING_DESCRIPTION_CHARS} characters.`),
      );
      return;
    }
    setBusy(true);
    try {
      const startAt = new Date(`${date}T${time}:00`);
      const res = await fetch("/api/orive/inventory", {
        method: "POST",
        headers,
        body: JSON.stringify({
          facilitatorName: name.trim(),
          title: title.trim(),
          description: description.trim(),
          category,
          location: place.trim(),
          priceEuros: Number(price),
          spots: Number(spots),
          repeatWeeks: Number(weeks) || 1,
          startAt: startAt.toISOString(),
          duration: 60,
          lang: language === "de" ? "de" : "en",
          intakeFormId: "orive-health",
          isOnline: /online/i.test(place),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Publish failed.");
      if (!city.trim()) setCity(place.trim());
      setOfferingDone(true);
      window.sessionStorage.setItem("orive-start-offering", "1");
      goTo(2);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Publish failed.");
    } finally {
      setBusy(false);
    }
  };

  const finishLater = async () => {
    setBusy(true);
    try {
      await saveProfile(true);
      window.sessionStorage.removeItem("orive-start-step");
      window.sessionStorage.removeItem("orive-start-offering");
      router.push("/app");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  };

  if (!ready) {
    return <div className="flex min-h-[100dvh] items-center justify-center bg-[#f4f6f8] text-sm text-slate-500 dark:bg-[#011424] dark:text-white/50">ORIVE</div>;
  }

  return (
    <div className="min-h-[100dvh] bg-[#f4f6f8] text-[#01223F] dark:bg-[#011424] dark:text-white">
      <div className="mx-auto max-w-lg px-5 py-10">
        <Link href="/" className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#017F80] dark:text-[#00CDAC]">ORIVE</Link>
        <p className="mt-6 text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500 dark:text-white/45">
          {copy(`Schritt ${step} von 3`, `Step ${step} of 3`)}
        </p>
        {step === 1 && (
          <form onSubmit={publishFirst} className="mt-3 space-y-4">
            <h1 className="text-2xl font-semibold">{copy("Dein erstes Angebot", "Your first offering")}</h1>
            <p className="text-sm text-slate-600 dark:text-white/60">
              {copy("Titel, Beschreibung mit Seeker-Outcome (min. 1000 Zeichen), Termin und Preis.", "Title, seeker-outcome description (min. 1000 characters), date and price.")}
            </p>
            <label className="block">
              <span className={labelClass}>{copy("Titel", "Title")}</span>
              <input value={title} onChange={(event) => setTitle(event.target.value)} required placeholder={copy("Morgenatem", "Morning breath")} className={fieldClass} />
            </label>
            <label className="block">
              <span className={labelClass}>
                {copy("Beschreibung (Seeker-Outcome)", "Description (seeker outcome)")}
              </span>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                required
                rows={8}
                minLength={MIN_OFFERING_DESCRIPTION_CHARS}
                placeholder={
                  copy("Marketing-Sprache: für wen, was erlebt die Person, welchen Outcome nimmt sie mit — mindestens 1000 Zeichen.", "Marketing speech: who it is for, what they experience, what outcome they leave with — at least 1000 characters.")
                }
                className="w-full min-h-[10rem] px-3 py-2 bg-white border border-slate-200 text-sm text-[#01223F] placeholder:text-slate-400 outline-none focus:border-[#01223F]"
              />
              <span
                className={`mt-1 block text-xs ${
                  offeringDescriptionLength(description) >= MIN_OFFERING_DESCRIPTION_CHARS
                    ? "text-emerald-700"
                    : "text-amber-700"
                }`}
              >
                {offeringDescriptionLength(description)} / {MIN_OFFERING_DESCRIPTION_CHARS}
                {copy(" Zeichen", " characters")}
              </span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className={labelClass}>{copy("Kategorie", "Category")}</span>
                <select value={category} onChange={(event) => setCategory(event.target.value)} className={fieldClass}>
                  {["Breathwork", "Yoga", "Meditation", "Sound Healing", "Cold Exposure"].map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className={labelClass}>{copy("Preis (€)", "Price (€)")}</span>
                <input type="number" min={1} value={price} onChange={(event) => setPrice(event.target.value)} required className={fieldClass} />
              </label>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <label className="block">
                <span className={labelClass}>{copy("Datum", "Date")}</span>
                <input type="date" value={date} onChange={(event) => setDate(event.target.value)} required className={fieldClass} />
              </label>
              <label className="block">
                <span className={labelClass}>{copy("Zeit", "Time")}</span>
                <input type="time" value={time} onChange={(event) => setTime(event.target.value)} required className={fieldClass} />
              </label>
              <label className="block">
                <span className={labelClass}>{copy("Plätze", "Spots")}</span>
                <input type="number" min={1} value={spots} onChange={(event) => setSpots(event.target.value)} required className={fieldClass} />
              </label>
            </div>
            <label className="block">
              <span className={labelClass}>{copy("Ort", "Place")}</span>
              <input value={place} onChange={(event) => setPlace(event.target.value)} required className={fieldClass} />
            </label>
            <label className="block">
              <span className={labelClass}>{copy("Wochen", "Weeks")}</span>
              <select value={weeks} onChange={(event) => setWeeks(event.target.value)} className={fieldClass}>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((count) => (
                  <option key={count} value={count}>
                    {count === 1 ? (copy("Einmal", "Once")) : (copy(`${count} Wochen`, `${count} weeks`))}
                  </option>
                ))}
              </select>
            </label>
            <button type="submit" disabled={busy} className="h-11 w-full bg-[#01223F] text-sm text-white disabled:opacity-60 dark:bg-white dark:text-[#01223F]">
              {busy ? (copy("Veröffentlicht…", "Publishing…")) : (copy("Termin veröffentlichen", "Publish the date"))}
            </button>
            <button type="button" onClick={() => goTo(2)} className="block w-full text-center text-sm text-slate-500">
              {copy("Überspringen", "Skip")}
            </button>
          </form>
        )}
        {step === 2 && (
          <form onSubmit={nextFromPractice} className="mt-3 space-y-4">
            <h1 className="text-2xl font-semibold">{copy("Deine Praxis", "Your practice")}</h1>
            <p className="text-sm text-slate-600 dark:text-white/60">
              {offeringDone
                ? (copy("Das Angebot ist live. Name und Stadt stehen dazu.", "The offering is live. Name and city sit with it."))
                : (copy("Name und Stadt stehen auf dem Angebot, sobald du eines anlegst.", "Name and city go on the offering once you add one."))}
            </p>
            <label className="block">
              <span className={labelClass}>{copy("Name", "Name")}</span>
              <input value={name} onChange={(event) => setName(event.target.value)} required className={fieldClass} />
            </label>
            <label className="block">
              <span className={labelClass}>{copy("Praxis", "Practice")}</span>
              <input value={practice} onChange={(event) => setPractice(event.target.value)} placeholder={copy("Studio Atem", "Studio Atem")} className={fieldClass} />
            </label>
            <label className="block">
              <span className={labelClass}>{copy("Stadt", "City")}</span>
              <input value={city} onChange={(event) => setCity(event.target.value)} required className={fieldClass} />
            </label>
            <button type="submit" disabled={busy} className="h-11 w-full bg-[#01223F] text-sm text-white disabled:opacity-60 dark:bg-white dark:text-[#01223F]">
              {copy("Weiter", "Continue")}
            </button>
          </form>
        )}
        {step === 3 && (
          <div className="mt-3 space-y-4">
            <h1 className="text-2xl font-semibold">{copy("Auszahlung", "Payout")}</h1>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-white/60">
              {copy("Der Gast hinterlegt die Karte bei der Buchung. Nach der Session geht dein Satz an dich, 1 € an ORIVE. Dafür braucht Stripe einmal deinen Namen und dein Konto.", "The guest saves a card at booking. After the session your rate comes to you, and €1 to ORIVE. Stripe needs your name and account once.")}
            </p>
            <button type="button" onClick={connectStripe} disabled={busy} className="h-11 w-full bg-[#01223F] text-sm text-white disabled:opacity-60 dark:bg-white dark:text-[#01223F]">
              {copy("Bei Stripe einrichten", "Set up with Stripe")}
            </button>
            <button type="button" onClick={finishLater} disabled={busy} className="block w-full text-center text-sm text-slate-500">
              {copy("Später", "Later")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
