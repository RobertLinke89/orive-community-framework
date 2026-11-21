"use client";
import { SafeImage } from "@/components/SafeImage";

import { useLanguage } from "@/hooks/useLanguage";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { IntakeAnswer, IntakeQuestion } from "@/lib/orivePublic";

type GuestBooking = {
  id: string;
  sessionTitle: string;
  customerName: string;
  avatar?: string;
  customerEmail: string;
  startAt: string;
  location: string | null;
  status: string;
  intake: IntakeAnswer[];
};

function whenLabel(value: string, locale: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(date);
}

type SavedForm = { id: string; name: string; questions: IntakeQuestion[] };
type TemplateForm = { id: string; name: string; questions: IntakeQuestion[] };

export default function GuestIntake({
  isDe,
  seedBookings = [],
  seedForms = [],
  token = "",
  onOpenBooking,
}: {
  isDe: boolean;
  seedBookings?: GuestBooking[];
  seedForms?: SavedForm[];
  token?: string;
  onOpenBooking?: (booking: GuestBooking) => void;
}) {
  const { copy } = useLanguage();
  const locale = isDe ? "de-DE" : "en-GB";
  const [forms, setForms] = useState<SavedForm[]>(seedForms);
  const [templates, setTemplates] = useState<TemplateForm[]>([]);
  const [activeFormId, setActiveFormId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");
  const [questions, setQuestions] = useState<IntakeQuestion[]>([]);
  const [editing, setEditing] = useState(false);
  const [bookings, setBookings] = useState<GuestBooking[]>(seedBookings);
  const [openId, setOpenId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const openForm = (form: SavedForm) => {
    setActiveFormId(form.id);
    setDraftName(form.name);
    setQuestions(form.questions);
    setEditing(true);
  };

  useEffect(() => {
    let cancelled = false;
    const lang = isDe ? "de" : "en";
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    Promise.all([
      fetch(`/api/facilitator/intake?lang=${lang}`, { headers }).then((res) => res.json()),
      fetch("/api/facilitator/bookings", { headers }).then((res) => res.json()),
    ]).then(([form, list]) => {
      if (cancelled) return;
      const saved = Array.isArray(form.forms) ? form.forms : [];
      const seedIds = new Set(seedForms.map((item) => item.id));
      setForms([...seedForms, ...saved.filter((item: SavedForm) => !seedIds.has(item.id))]);
      setTemplates(Array.isArray(form.templates) ? form.templates : []);
      const remote = Array.isArray(list.bookings) ? list.bookings : [];
      setBookings(seedBookings.length ? seedBookings : remote);
    }).catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [isDe, seedBookings, seedForms, token]);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/facilitator/intake", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ id: activeFormId, name: draftName, questions }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.error || (copy("Speichern fehlgeschlagen.", "Could not save.")));
        return;
      }
      const saved = data.form as SavedForm;
      setForms((prev) => [saved, ...prev.filter((item) => item.id !== saved.id)]);
      setActiveFormId(saved.id);
      toast.success(copy("Formular gespeichert.", "Form saved."));
    } catch {
      toast.error(copy("Speichern fehlgeschlagen.", "Could not save."));
    } finally {
      setSaving(false);
    }
  };

  const removeForm = async (id: string) => {
    await fetch("/api/facilitator/intake", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ id }),
    });
    setForms((prev) => prev.filter((item) => item.id !== id));
    if (activeFormId === id) {
      setEditing(false);
      setActiveFormId(null);
      setDraftName("");
      setQuestions([]);
    }
  };

  return (
    <div className="space-y-10">
      <section>
        <h2 className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">
          {copy("Buchungen", "Bookings")}
        </h2>
        {bookings.length === 0 ? (
          <p className="mt-3 border border-dashed border-slate-300 px-4 py-8 text-sm text-slate-500 dark:border-white/15">
            {copy("Noch keine Buchung. Die Angaben der Suchenden erscheinen hier und gehen per Mail an den Facilitator.", "No booking yet. A seeker’s answers appear here and go to the facilitator by email.")}
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-200 border-y border-slate-200 dark:divide-white/10 dark:border-white/10">
            {bookings.map((booking) => {
              const open = openId === booking.id;
              return (
                <li key={booking.id} className="py-4">
                  <button
                    type="button"
                    onClick={() => (onOpenBooking ? onOpenBooking(booking) : setOpenId(open ? null : booking.id))}
                    className="w-full text-left"
                  >
                    <span className="flex items-center gap-3">
                      {booking.avatar ? (
                        <SafeImage src={booking.avatar} alt="" kind="avatar" avatarSize={36} className="h-9 w-9 rounded-full object-cover" />
                      ) : null}
                      <span className="font-medium">{booking.customerName || booking.customerEmail || (copy("Suchende", "Seeker"))}</span>
                    </span>
                    <p className="mt-1 text-sm text-slate-500">
                      {[booking.sessionTitle, whenLabel(booking.startAt, locale), booking.customerEmail].filter(Boolean).join(" · ")}
                    </p>
                  </button>
                  {!onOpenBooking && open && (
                    <dl className="mt-4 space-y-3">
                      {booking.intake.length === 0 ? (
                        <p className="text-sm text-slate-500">{copy("Keine Angaben.", "No answers.")}</p>
                      ) : booking.intake.map((item) => (
                        <div key={item.questionId}>
                          <dt className="text-[11px] uppercase tracking-[0.12em] text-slate-400">{item.prompt}</dt>
                          <dd className="mt-1 whitespace-pre-wrap text-sm">{item.answer}</dd>
                        </div>
                      ))}
                    </dl>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">ORIVE</h2>
        <ul className="mt-3 space-y-4">
          {templates.map((form) => (
            <li key={form.id} className="border border-slate-200 px-4 py-3 dark:border-white/10">
              <p className="text-sm font-medium">{form.name}</p>
              <ul className="mt-2 space-y-1 text-sm text-slate-500">
                {form.questions.map((question, index) => (
                  <li key={`${form.id}-${index}`}>{question.prompt}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
        <h2 className="mt-8 text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">
          {copy("Vom Facilitator", "From the facilitator")}
        </h2>
        <p className="mt-2 max-w-lg text-sm text-slate-500">
          {copy("Beim Anlegen eines Angebots wählst du eines dieser Formulare oder eine ORIVE-Vorlage. Ohne Wahl gibt es keine Fragen.", "When you create an offering, pick one of these or an ORIVE form. With no choice, the seeker is not asked.")}
        </p>
        {forms.length === 0 && !editing && (
          <p className="mt-3 text-sm text-slate-500">{copy("Noch keines gespeichert.", "None saved yet.")}</p>
        )}
        <ul className="mt-3 space-y-4">
          {forms.map((form) => (
            <li key={form.id} className="border border-slate-200 px-4 py-3 dark:border-white/10">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium">{form.name}</p>
                <button type="button" onClick={() => openForm(form)} className="text-sm text-[#017F80]">
                  {copy("Bearbeiten", "Edit")}
                </button>
              </div>
              <ul className="mt-2 space-y-1 text-sm text-slate-500">
                {form.questions.map((question, index) => (
                  <li key={`${form.id}-${index}`}>{question.prompt}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setActiveFormId(null);
              setDraftName("");
              setQuestions([{ id: `q-${Date.now()}`, prompt: "", required: true }]);
              setEditing(true);
            }}
            className="h-9 px-3 text-sm text-[#017F80]"
          >
            {copy("Neues Formular", "New form")}
          </button>
        </div>
        {editing && (
          <div className="mt-4 space-y-3">
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">{copy("Name", "Name")}</span>
              <input
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                placeholder={copy("z. B. Breathwork", "e.g. Breathwork")}
                className="h-11 w-full border border-slate-200 bg-transparent px-3 text-sm outline-none dark:border-white/15"
              />
            </label>
            {questions.map((question, index) => (
              <div key={question.id} className="border border-slate-200 p-3 dark:border-white/10">
                <textarea
                  value={question.prompt}
                  onChange={(e) => setQuestions((prev) => prev.map((item, i) => i === index ? { ...item, prompt: e.target.value } : item))}
                  rows={2}
                  className="w-full bg-transparent text-sm outline-none"
                />
                <div className="mt-2 flex items-center justify-between text-sm text-slate-500">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={question.required}
                      onChange={(e) => setQuestions((prev) => prev.map((item, i) => i === index ? { ...item, required: e.target.checked } : item))}
                    />
                    {copy("Pflicht", "Required")}
                  </label>
                  <button
                    type="button"
                    onClick={() => setQuestions((prev) => prev.filter((_, i) => i !== index))}
                    className="text-red-700 dark:text-red-300"
                  >
                    {copy("Entfernen", "Remove")}
                  </button>
                </div>
              </div>
            ))}
            <div className="flex flex-wrap gap-4">
              <button
                type="button"
                onClick={() => setQuestions((prev) => [...prev, { id: `q-${Date.now()}`, prompt: "", required: false }])}
                className="text-sm text-[#017F80]"
              >
                {copy("Frage hinzufügen", "Add a question")}
              </button>
              <button
                type="button"
                onClick={save}
                disabled={saving}
                className="h-9 bg-[#01223F] px-3 text-sm text-white disabled:opacity-60 dark:bg-white dark:text-[#01223F]"
              >
                {saving ? (copy("Speichert…", "Saving…")) : (copy("Speichern", "Save"))}
              </button>
              {activeFormId && (
                <button type="button" onClick={() => removeForm(activeFormId)} className="text-sm text-slate-500">
                  {copy("Formular löschen", "Delete form")}
                </button>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
