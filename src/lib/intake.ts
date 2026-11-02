import type { IntakeAnswer, IntakeQuestion } from "@/lib/orivePublic";

const BUILTIN: { id: string; required: boolean; de: string; en: string }[] = [
  {
    id: "health",
    required: true,
    de: "Wie ist deine gesundheitliche Verfassung im Moment?",
    en: "How is your health at the moment?",
  },
  {
    id: "medicines",
    required: true,
    de: "Welche Medikamente oder Nahrungsergänzung nimmst du?",
    en: "Which medicines or supplements do you take?",
  },
  {
    id: "conditions",
    required: true,
    de: "Gibt es Verletzungen, eine Schwangerschaft oder etwas, das der Facilitator wissen sollte?",
    en: "Any injury, pregnancy, or condition the facilitator should know?",
  },
  {
    id: "emergency",
    required: true,
    de: "Notfallkontakt: Name und Telefon",
    en: "Emergency contact: name and phone",
  },
  {
    id: "notes",
    required: false,
    de: "Sonstiges vor der Stunde",
    en: "Anything else before the session",
  },
];

export function defaultIntakeQuestions(isDe: boolean): IntakeQuestion[] {
  return BUILTIN.map((item) => ({
    id: item.id,
    prompt: isDe ? item.de : item.en,
    required: item.required,
  }));
}

type BilingualQuestion = { id: string; required: boolean; de: string; en: string };

function toQuestions(items: BilingualQuestion[], isDe: boolean): IntakeQuestion[] {
  return items.map((item) => ({
    id: item.id,
    prompt: isDe ? item.de : item.en,
    required: item.required,
  }));
}

const ARRIVAL: BilingualQuestion[] = [
  BUILTIN.find((item) => item.id === "emergency")!,
  BUILTIN.find((item) => item.id === "notes")!,
];

export type IntakeTemplate = {
  id: string;
  name: string;
  questions: IntakeQuestion[];
};

export function intakeTemplates(isDe: boolean): IntakeTemplate[] {
  return [
    {
      id: "orive-health",
      name: isDe ? "Gesundheit" : "Health",
      questions: toQuestions(BUILTIN, isDe),
    },
    {
      id: "orive-arrival",
      name: isDe ? "Ankommen" : "Arrival",
      questions: toQuestions(ARRIVAL, isDe),
    },
  ];
}

export function templateById(id: string, isDe: boolean): IntakeTemplate | null {
  return intakeTemplates(isDe).find((item) => item.id === id) || null;
}

export function sanitizeQuestions(input: unknown): IntakeQuestion[] {
  if (!Array.isArray(input)) return [];
  const questions: IntakeQuestion[] = [];
  for (const raw of input.slice(0, 12)) {
    if (!raw || typeof raw !== "object") continue;
    const item = raw as { id?: unknown; prompt?: unknown; required?: unknown };
    const id = String(item.id || "").trim().slice(0, 40);
    const prompt = String(item.prompt || "").trim().slice(0, 240);
    if (!/^[a-z0-9-]+$/i.test(id) || !prompt) continue;
    questions.push({ id, prompt, required: Boolean(item.required) });
  }
  return questions;
}

export function collectIntake(
  questions: IntakeQuestion[],
  rawAnswers: unknown
): { ok: true; intake: IntakeAnswer[] } | { ok: false; error: string } {
  const sent = Array.isArray(rawAnswers) ? rawAnswers : [];
  const byId = new Map<string, string>();
  for (const raw of sent) {
    if (!raw || typeof raw !== "object") continue;
    const item = raw as { questionId?: unknown; answer?: unknown };
    const questionId = String(item.questionId || "").trim();
    byId.set(questionId, String(item.answer || "").trim().slice(0, 2000));
  }

  const intake: IntakeAnswer[] = [];
  for (const question of questions) {
    const answer = byId.get(question.id) || "";
    if (question.required && !answer) {
      return { ok: false, error: "Please answer the questions for your facilitator." };
    }
    if (answer) intake.push({ questionId: question.id, prompt: question.prompt, answer });
  }
  return { ok: true, intake };
}
