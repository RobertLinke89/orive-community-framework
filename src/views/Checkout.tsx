"use client";
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { ArrowLeft, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Layout } from '@/components/Layout';
import { getExperienceById, type Experience } from '@/data/experiencesData';
import { partnerLabel, resolveFulfillment } from '@/lib/fulfillment';
import { toExperience, type OriveSlot } from '@/lib/orivePublic';
import { toast } from 'sonner';
import { useLanguage } from '@/hooks/useLanguage';
import type { IntakeQuestion } from '@/lib/orivePublic';

export default function Checkout() {
  const params = useParams();
  const experienceId = typeof params.experienceId === "string" ? params.experienceId : params.experienceId?.[0] || "";
  const navigate = useRouter();
  const staticExperience = getExperienceById(experienceId || '');
  const [oriveExperience, setOriveExperience] = useState<Experience | null>(null);
  const [slots, setSlots] = useState<OriveSlot[]>([]);
  const [loading, setLoading] = useState(!staticExperience && String(experienceId).startsWith('orive-'));
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [slotId, setSlotId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [questions, setQuestions] = useState<IntakeQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const { language, copy } = useLanguage();
  const isDe = language === 'de';

  useEffect(() => {
    if (!experienceId) return;
    let cancelled = false;
    fetch(`/api/orive/inventory/${encodeURIComponent(experienceId)}`)
      .then(async (res) => {
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled || !data?.raw) return;
        setOriveExperience(toExperience(data.raw, data.slots || []) as Experience);
        setSlots(Array.isArray(data.slots) ? data.slots : []);
        const intakeRes = await fetch(`/api/orive/intake?offeringId=${encodeURIComponent(experienceId)}&lang=${language === 'de' ? 'de' : 'en'}`);
        if (intakeRes.ok) {
          const intake = await intakeRes.json();
          if (!cancelled) setQuestions(Array.isArray(intake.questions) ? intake.questions : []);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [experienceId, language]);

  const experience = oriveExperience || staticExperience;

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center text-sm text-slate-500">Loading…</div>
      </Layout>
    );
  }

  if (!experience) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold mb-4">Angebot nicht gefunden</h1>
          <Link href="/marketplace">
            <Button>Browse Experiences</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const fulfillment = resolveFulfillment(experience);
  const partner = partnerLabel(experience.source_platform);
  const openSlots = slots.filter((slot) => slot.spots > 0 && new Date(slot.startAt).getTime() > Date.now());

  const handleStripeCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slotId) {
      toast.error('Choose a date first.');
      return;
    }
    setSubmitting(true);
    try {
      const resp = await fetch('/api/checkout/stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          offeringId: experience.id,
          slotId,
          sessionTitle: experience.title,
          customerEmail: email,
          customerName: fullName,
          facilitatorName: experience.facilitatorName,
          lang: language === "de" ? "de" : "en",
          intake: questions.map((question) => ({
            questionId: question.id,
            answer: answers[question.id] || '',
          })),
        }),
      });
      const data = await resp.json();
      if (!resp.ok || !data?.url) {
        toast.error(data?.error || 'Checkout is not available.');
        return;
      }
      window.location.href = data.url;
    } catch {
      toast.error('Checkout is not available.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-4 max-w-xl">
          <Button
            variant="ghost"
            onClick={() => navigate.push(`/experience/${experienceId}`)}
            className="text-muted-foreground hover:text-foreground mb-6 -ml-2"
            size="sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <h1 className="text-2xl font-semibold text-foreground tracking-tight">{experience.title}</h1>

          {fulfillment !== 'orive' ? (
            <div className="mt-8 space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                ORIVE does not sell this listing. Card details are never collected here.
              </p>
              {experience.source_url ? (
                <a
                  href={experience.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-12 rounded-full bg-[#00CDAC] hover:bg-[#02AAB0] text-white text-sm font-semibold inline-flex items-center justify-center gap-2 px-6 transition-colors"
                >
                  Open on {partner}
                  <ExternalLink className="w-4 h-4" />
                </a>
              ) : (
                <Link href="/">
                  <Button variant="outline">Back to catalog</Button>
                </Link>
              )}
            </div>
          ) : (
            <form onSubmit={handleStripeCheckout} className="mt-8 space-y-5">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {copy('Deine Karte wird bei Stripe gespeichert. ORIVE sieht keine Kartennummer. Abgebucht wird nach der Session: der Satz plus 1,00 € Concierge. Bis 24 Stunden vorher ist die Stornierung kostenfrei.', 'Your card is saved with Stripe. ORIVE never sees the card number. The charge happens after the session: the rate plus a €1.00 concierge fee. Cancellation is free until 24 hours before.')}
              </p>
              <div className="space-y-2">
                <Label htmlFor="slot">Date</Label>
                <select
                  id="slot"
                  required
                  value={slotId}
                  onChange={(e) => setSlotId(e.target.value)}
                  className="w-full h-11 rounded-md border border-border bg-background px-3 text-sm"
                >
                  <option value="">Select a date</option>
                  {openSlots.map((slot) => (
                    <option key={slot.id} value={slot.id}>
                      {new Date(slot.startAt).toLocaleString()} · {slot.spots} spots · {(slot.priceCents / 100).toFixed(0)} € + 1 €
                    </option>
                  ))}
                </select>
                {openSlots.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No open dates on ORIVE.</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="fullName">Full name</Label>
                <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              {questions.length > 0 ? (
                <div className="space-y-4 border-t border-border pt-5">
                  <div>
                    <p className="text-sm font-medium text-foreground">{copy('Für den Facilitator', 'For your facilitator')}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {copy('Diese Angaben gehen mit der Buchung an den Facilitator. ORIVE stellt damit keine Diagnose.', 'These answers go to the facilitator with the booking. ORIVE does not make a diagnosis from them.')}
                    </p>
                  </div>
                  {questions.map((question) => (
                    <div key={question.id} className="space-y-2">
                      <Label htmlFor={`intake-${question.id}`}>
                        {question.prompt}{question.required ? '' : (copy(' (freiwillig)', ' (optional)'))}
                      </Label>
                      <textarea
                        id={`intake-${question.id}`}
                        required={question.required}
                        value={answers[question.id] || ''}
                        onChange={(e) => setAnswers((prev) => ({ ...prev, [question.id]: e.target.value }))}
                        rows={3}
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                      />
                    </div>
                  ))}
                </div>
              ) : null}
              <Button
                type="submit"
                disabled={submitting || openSlots.length === 0}
                className="w-full h-12 rounded-full bg-[#00CDAC] hover:bg-[#02AAB0] text-white"
              >
                {submitting ? (copy('Öffne Stripe…', 'Opening Stripe…')) : (copy('Karte speichern', 'Save card'))}
              </Button>
            </form>
          )}
        </div>
      </div>
    </Layout>
  );
}
