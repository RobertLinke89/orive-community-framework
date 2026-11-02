import type { IntakeAnswer } from "@/lib/orivePublic";

export const demoFacilitator = {
  id: "fac-lena-vogt",
  name: "Lena Vogt",
  email: "lena@demo.orive.app",
  studio: "Studio Atem",
};

export const demoFormId = "form-studio-atem";

type Session = {
  id: string;
  title: string;
  titleDe: string;
  at: string;
  location: string;
  price: number;
  capacity: number;
  booked: number;
  duration: number;
  tag: string;
  type: "group" | "individual" | "event";
};

type LedgerRow = {
  id: string;
  at: string;
  title: string;
  titleDe: string;
  guests: number;
  cents: number;
  status: "paid" | "open";
};

const sessions: Session[] = [
  { id: "demo-0914-morning", title: "Morning breath", titleDe: "Morgenatem", at: "2026-09-14T07:30:00+02:00", location: "Studio Atem, Kreuzberg", price: 35, capacity: 8, booked: 4, duration: 60, tag: "Breathwork", type: "group" },
  { id: "demo-0916-circle", title: "Evening circle", titleDe: "Abendkreis", at: "2026-09-16T19:00:00+02:00", location: "Studio Atem, Kreuzberg", price: 45, capacity: 12, booked: 7, duration: 90, tag: "Breathwork", type: "group" },
  { id: "demo-0918-private", title: "Private session", titleDe: "Einzelsitzung", at: "2026-09-18T18:00:00+02:00", location: "Studio Atem, Kreuzberg", price: 120, capacity: 1, booked: 1, duration: 75, tag: "Breathwork", type: "individual" },
  { id: "demo-0919-sound", title: "Sound bath", titleDe: "Klangbad", at: "2026-09-19T19:00:00+02:00", location: "Neukölln", price: 28, capacity: 14, booked: 8, duration: 75, tag: "Sound Healing", type: "group" },
  { id: "demo-0921-morning", title: "Morning breath", titleDe: "Morgenatem", at: "2026-09-21T07:30:00+02:00", location: "Studio Atem, Kreuzberg", price: 35, capacity: 8, booked: 6, duration: 60, tag: "Breathwork", type: "group" },
  { id: "demo-0922-sound", title: "Sound bath", titleDe: "Klangbad", at: "2026-09-22T19:00:00+02:00", location: "Neukölln", price: 28, capacity: 14, booked: 11, duration: 75, tag: "Sound Healing", type: "group" },
  { id: "demo-0923-private", title: "Private session", titleDe: "Einzelsitzung", at: "2026-09-23T18:30:00+02:00", location: "Studio Atem, Kreuzberg", price: 120, capacity: 1, booked: 1, duration: 75, tag: "Breathwork", type: "individual" },
  { id: "demo-0924-circle", title: "Evening circle", titleDe: "Abendkreis", at: "2026-09-24T19:00:00+02:00", location: "Studio Atem, Kreuzberg", price: 45, capacity: 12, booked: 9, duration: 90, tag: "Breathwork", type: "group" },
  { id: "demo-0925-yoga", title: "Morning yoga", titleDe: "Morgenyoga", at: "2026-09-25T09:00:00+02:00", location: "Studio Atem, Kreuzberg", price: 22, capacity: 10, booked: 8, duration: 60, tag: "Yoga", type: "group" },
  { id: "demo-0926-sit", title: "Day sit", titleDe: "Tagessitzen", at: "2026-09-26T10:00:00+02:00", location: "Studio Atem, Kreuzberg", price: 65, capacity: 8, booked: 6, duration: 180, tag: "Meditation", type: "event" },
  { id: "demo-0927-dawn", title: "Dawn breath", titleDe: "Dämmerungsatem", at: "2026-09-27T09:00:00+02:00", location: "Studio Atem, Kreuzberg", price: 35, capacity: 8, booked: 7, duration: 60, tag: "Breathwork", type: "group" },
  { id: "demo-0927-private", title: "Private session", titleDe: "Einzelsitzung", at: "2026-09-27T11:30:00+02:00", location: "Studio Atem, Kreuzberg", price: 120, capacity: 1, booked: 1, duration: 75, tag: "Breathwork", type: "individual" },
  { id: "demo-0927-circle", title: "Sunday circle", titleDe: "Sonntagskreis", at: "2026-09-27T18:00:00+02:00", location: "Studio Atem, Kreuzberg", price: 45, capacity: 12, booked: 10, duration: 90, tag: "Breathwork", type: "group" },
  { id: "demo-0928-morning", title: "Morning breath", titleDe: "Morgenatem", at: "2026-09-28T07:30:00+02:00", location: "Studio Atem, Kreuzberg", price: 35, capacity: 8, booked: 5, duration: 60, tag: "Breathwork", type: "group" },
  { id: "demo-0928-sound", title: "Sound bath", titleDe: "Klangbad", at: "2026-09-28T19:00:00+02:00", location: "Neukölln", price: 28, capacity: 14, booked: 6, duration: 75, tag: "Sound Healing", type: "group" },
  { id: "demo-0929-cacao", title: "Cacao & breath", titleDe: "Kakao & Atem", at: "2026-09-29T18:30:00+02:00", location: "Studio Atem, Kreuzberg", price: 55, capacity: 10, booked: 4, duration: 120, tag: "Breathwork", type: "group" },
  { id: "demo-0930-midday", title: "Midday breath", titleDe: "Mittagsatem", at: "2026-09-30T12:15:00+02:00", location: "Online", price: 30, capacity: 8, booked: 3, duration: 45, tag: "Breathwork", type: "group" },
  { id: "demo-1001-circle", title: "Evening circle", titleDe: "Abendkreis", at: "2026-10-01T18:00:00+02:00", location: "Studio Atem, Kreuzberg", price: 45, capacity: 12, booked: 2, duration: 90, tag: "Breathwork", type: "group" },
  { id: "demo-1002-yoga", title: "Morning yoga", titleDe: "Morgenyoga", at: "2026-10-02T09:00:00+02:00", location: "Studio Atem, Kreuzberg", price: 22, capacity: 10, booked: 4, duration: 60, tag: "Yoga", type: "group" },
  { id: "demo-1003-forest", title: "Forest walk", titleDe: "Waldgang", at: "2026-10-03T11:00:00+02:00", location: "Grunewald", price: 40, capacity: 12, booked: 7, duration: 120, tag: "Meditation", type: "event" },
  { id: "demo-1004-circle", title: "Sunday circle", titleDe: "Sonntagskreis", at: "2026-10-04T18:00:00+02:00", location: "Studio Atem, Kreuzberg", price: 45, capacity: 12, booked: 3, duration: 90, tag: "Breathwork", type: "group" },
  { id: "demo-1007-sound", title: "Sound bath", titleDe: "Klangbad", at: "2026-10-07T19:00:00+02:00", location: "Neukölln", price: 28, capacity: 14, booked: 1, duration: 75, tag: "Sound Healing", type: "group" },
  { id: "demo-1010-sit", title: "Day sit", titleDe: "Tagessitzen", at: "2026-10-10T10:00:00+02:00", location: "Studio Atem, Kreuzberg", price: 65, capacity: 8, booked: 0, duration: 180, tag: "Meditation", type: "event" },
];

const ledger: LedgerRow[] = [
  { id: "pay-0914", at: "2026-09-14T07:30:00+02:00", title: "Morning breath", titleDe: "Morgenatem", guests: 4, cents: 14000, status: "paid" },
  { id: "pay-0916", at: "2026-09-16T19:00:00+02:00", title: "Evening circle", titleDe: "Abendkreis", guests: 7, cents: 31500, status: "paid" },
  { id: "pay-0918", at: "2026-09-18T18:00:00+02:00", title: "Private session", titleDe: "Einzelsitzung", guests: 1, cents: 12000, status: "paid" },
  { id: "pay-0919", at: "2026-09-19T19:00:00+02:00", title: "Sound bath", titleDe: "Klangbad", guests: 8, cents: 22400, status: "paid" },
  { id: "pay-0921", at: "2026-09-21T07:30:00+02:00", title: "Morning breath", titleDe: "Morgenatem", guests: 6, cents: 21000, status: "paid" },
  { id: "pay-0922", at: "2026-09-22T19:00:00+02:00", title: "Sound bath", titleDe: "Klangbad", guests: 11, cents: 30800, status: "paid" },
  { id: "pay-0923", at: "2026-09-23T18:30:00+02:00", title: "Private session", titleDe: "Einzelsitzung", guests: 1, cents: 12000, status: "paid" },
  { id: "pay-0924", at: "2026-09-24T19:00:00+02:00", title: "Evening circle", titleDe: "Abendkreis", guests: 9, cents: 40500, status: "paid" },
  { id: "pay-0925", at: "2026-09-25T09:00:00+02:00", title: "Morning yoga", titleDe: "Morgenyoga", guests: 8, cents: 17600, status: "paid" },
  { id: "pay-0926", at: "2026-09-26T10:00:00+02:00", title: "Day sit", titleDe: "Tagessitzen", guests: 6, cents: 39000, status: "paid" },
  { id: "pay-0927", at: "2026-09-27T09:00:00+02:00", title: "Dawn breath", titleDe: "Dämmerungsatem", guests: 7, cents: 24500, status: "paid" },
  { id: "pay-0927b", at: "2026-09-27T11:30:00+02:00", title: "Private session", titleDe: "Einzelsitzung", guests: 1, cents: 12000, status: "paid" },
  { id: "pay-0927c", at: "2026-09-27T18:00:00+02:00", title: "Sunday circle", titleDe: "Sonntagskreis", guests: 10, cents: 45000, status: "open" },
  { id: "pay-0929", at: "2026-09-29T18:30:00+02:00", title: "Cacao & breath", titleDe: "Kakao & Atem", guests: 4, cents: 22000, status: "open" },
];

const prompts = {
  health: { en: "How is your health at the moment?", de: "Wie ist deine gesundheitliche Verfassung im Moment?" },
  medicines: { en: "Which medicines or supplements do you take?", de: "Welche Medikamente oder Nahrungsergänzung nimmst du?" },
  conditions: { en: "Any injury, pregnancy, or condition the facilitator should know?", de: "Gibt es Verletzungen, eine Schwangerschaft oder etwas, das der Facilitator wissen sollte?" },
  emergency: { en: "Emergency contact: name and phone", de: "Notfallkontakt: Name und Telefon" },
};

function answers(isDe: boolean, health: string, healthDe: string, medicines: string, medicinesDe: string, conditions: string, conditionsDe: string, emergency: string): IntakeAnswer[] {
  const lang = isDe ? "de" : "en";
  return [
    { questionId: "health", prompt: prompts.health[lang], answer: isDe ? healthDe : health },
    { questionId: "medicines", prompt: prompts.medicines[lang], answer: isDe ? medicinesDe : medicines },
    { questionId: "conditions", prompt: prompts.conditions[lang], answer: isDe ? conditionsDe : conditions },
    { questionId: "emergency", prompt: prompts.emergency[lang], answer: emergency },
  ];
}

export type Seeker = { id: string; name: string; avatar: string };

const seekers: Seeker[] = [
  { id: "mara", name: "Mara Klein", avatar: "/avatars/avatar-6.png" },
  { id: "jonas", name: "Jonas Weber", avatar: "/avatars/avatar-8.png" },
  { id: "leila", name: "Leila Haddad", avatar: "/avatars/seeker-01.jpg" },
  { id: "noah", name: "Noah Berger", avatar: "/avatars/seeker-05.jpg" },
  { id: "emil", name: "Emil Schwarz", avatar: "/avatars/avatar-1.png" },
  { id: "hanna", name: "Hanna Krüger", avatar: "/avatars/avatar-13.png" },
  { id: "priya", name: "Priya Shah", avatar: "/avatars/seeker-04.jpg" },
  { id: "tom", name: "Tom Reiter", avatar: "/avatars/seeker-07.jpg" },
  { id: "klara", name: "Klara Voss", avatar: "/avatars/avatar-4.png" },
  { id: "malik", name: "Malik Owusu", avatar: "/avatars/avatar-5.png" },
  { id: "nina", name: "Nina Berg", avatar: "/avatars/avatar-9.png" },
  { id: "ida", name: "Ida Lorenz", avatar: "/avatars/avatar-11.png" },
  { id: "kenji", name: "Kenji Sato", avatar: "/avatars/seeker-02.jpg" },
  { id: "amina", name: "Amina Diallo", avatar: "/avatars/seeker-03.jpg" },
  { id: "ingrid", name: "Ingrid Falk", avatar: "/avatars/seeker-06.jpg" },
  { id: "hana", name: "Hana Ito", avatar: "/avatars/seeker-08.jpg" },
];

const pinnedSeeker: Record<string, string> = {
  "demo-0927-private": "mara",
  "demo-0927-circle": "jonas",
  "demo-0928-morning": "leila",
  "demo-0929-cacao": "noah",
  "demo-0923-private": "emil",
  "demo-1002-yoga": "hanna",
  "demo-1001-circle": "priya",
  "demo-1003-forest": "tom",
};

function seekerById(id: string) {
  return seekers.find((person) => person.id === id) || seekers[0];
}

export function seekersForSession(sessionId: string, count: number): Seeker[] {
  if (count <= 0) return [];
  const pinId = pinnedSeeker[sessionId];
  const pin = pinId ? seekerById(pinId) : null;
  const rest = seekers.filter((person) => person.id !== pin?.id);
  const start = sessionId.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0) % rest.length;
  const picked: Seeker[] = pin ? [pin] : [];
  for (let index = 0; picked.length < count; index += 1) {
    picked.push(rest[(start + index) % rest.length]);
  }
  return picked;
}

const notes: Record<string, { en: string; de: string }> = {
  "Morning breath": {
    en: "Sixty minutes of guided breath, seated and standing.",
    de: "Sechzig Minuten geführter Atem, sitzend und stehend.",
  },
  "Dawn breath": {
    en: "An early hour of breath before the day starts.",
    de: "Eine frühe Stunde Atem, bevor der Tag beginnt.",
  },
  "Midday breath": {
    en: "Forty-five minutes online, camera optional.",
    de: "Fünfundvierzig Minuten online, Kamera nach Wunsch.",
  },
  "Evening circle": {
    en: "A group evening. Breath, a short sit, and time to close.",
    de: "Ein Abend in der Gruppe. Atem, kurzes Sitzen, gemeinsamer Abschluss.",
  },
  "Sunday circle": {
    en: "The weekly circle. Ninety minutes, twelve places.",
    de: "Der wöchentliche Kreis. Neunzig Minuten, zwölf Plätze.",
  },
  "Private session": {
    en: "One-to-one. The pace follows the person in the room.",
    de: "Zu zweit. Das Tempo folgt der Person im Raum.",
  },
  "Sound bath": {
    en: "Seventy-five minutes of sound, lying down.",
    de: "Fünfundsiebzig Minuten Klang, im Liegen.",
  },
  "Cacao & breath": {
    en: "A cup of cacao, then two hours of breath in the circle.",
    de: "Eine Tasse Kakao, danach zwei Stunden Atem im Kreis.",
  },
  "Morning yoga": {
    en: "A quiet morning practice, sixty minutes.",
    de: "Eine ruhige Morgenpraxis, sechzig Minuten.",
  },
  "Day sit": {
    en: "Three hours of sitting, with breaks.",
    de: "Drei Stunden Sitzen, mit Pausen.",
  },
  "Forest walk": {
    en: "Two hours on foot in Grunewald. Bring a layer for the weather.",
    de: "Zwei Stunden zu Fuß im Grunewald. Eine Schicht fürs Wetter mitbringen.",
  },
};

function imageFor(title: string) {
  const name = title.toLowerCase();
  if (name.includes("private") || name.includes("einzel")) return "/facilitators/motif-private.jpg";
  if (name.includes("sound") || name.includes("klang")) return "/facilitators/motif-sound.jpg";
  if (name.includes("cacao") || name.includes("kakao")) return "/facilitators/motif-cacao.jpg";
  if (name.includes("forest") || name.includes("wald")) return "/facilitators/motif-forest.jpg";
  if (name.includes("yoga")) return "/facilitators/motif-morning.jpg";
  if (name.includes("sit") || name.includes("sitz")) return "/facilitators/motif-still.jpg";
  if (name.includes("circle") || name.includes("kreis")) return "/facilitators/motif-circle.jpg";
  if (name.includes("dawn") || name.includes("dämmer") || name.includes("morning") || name.includes("morgen")) return "/facilitators/motif-breath.jpg";
  return "/facilitators/motif-group.jpg";
}

export function demoOffers(isDe: boolean) {
  const rows = sessions.map((session) => ({
    id: session.id,
    title: isDe ? session.titleDe : session.title,
    type: session.type,
    price: session.price,
    duration: session.duration,
    location: session.location,
    is_online: session.location === "Online",
    capacity: session.capacity,
    start_at: new Date(session.at).toISOString(),
    tags: [session.tag],
    description: notes[session.title]?.[isDe ? "de" : "en"] || "",
    intakeName: demoFacilitator.studio,
    intakeQuestions: [prompts.health, prompts.medicines, prompts.conditions, prompts.emergency].map((item) => item[isDe ? "de" : "en"]),
    image_url: imageFor(session.title),
    facilitator_id: demoFacilitator.id,
    facilitator_name: demoFacilitator.name,
    status: "Active",
    bookingsCount: session.booked,
    seekers: seekersForSession(session.id, session.booked).map((person) => ({ name: person.name, avatar: person.avatar })),
  }));
  const now = Date.now();
  const ahead = rows.filter((row) => +new Date(row.start_at) >= now);
  const past = rows.filter((row) => +new Date(row.start_at) < now).reverse();
  return [...ahead, ...past];
}

export function demoForm(isDe: boolean) {
  const lang = isDe ? "de" : "en";
  return {
    id: demoFormId,
    name: demoFacilitator.studio,
    questions: [
      { id: "health", prompt: prompts.health[lang], required: true },
      { id: "medicines", prompt: prompts.medicines[lang], required: true },
      { id: "conditions", prompt: prompts.conditions[lang], required: true },
      { id: "emergency", prompt: prompts.emergency[lang], required: true },
    ],
  };
}

export function demoGuestBookings(isDe: boolean) {
  const title = (id: string) => {
    const session = sessions.find((item) => item.id === id);
    return session ? (isDe ? session.titleDe : session.title) : "";
  };
  const when = (id: string) => {
    const session = sessions.find((item) => item.id === id);
    return session ? new Date(session.at).toISOString() : "";
  };
  const place = (id: string) => sessions.find((item) => item.id === id)?.location || null;

  return [
    {
      id: "guest-mara",
      sessionTitle: title("demo-0927-private"),
      customerName: "Mara Klein",
      avatar: seekerById("mara").avatar,
      customerEmail: "mara.klein@example.com",
      startAt: when("demo-0927-private"),
      location: place("demo-0927-private"),
      status: "paid",
      intake: answers(isDe, "Well. A little tired from the train.", "Gut. Etwas müde von der Bahnfahrt.", "Magnesium in the evening.", "Magnesium am Abend.", "None.", "Keine.", "Eva Klein, +49 151 0000001"),
    },
    {
      id: "guest-jonas",
      sessionTitle: title("demo-0927-circle"),
      customerName: "Jonas Weber",
      avatar: seekerById("jonas").avatar,
      customerEmail: "jonas.weber@example.com",
      startAt: when("demo-0927-circle"),
      location: place("demo-0927-circle"),
      status: "paid",
      intake: answers(isDe, "Good.", "Gut.", "None.", "Keine.", "Old knee injury, I sit for the second half.", "Alte Knieverletzung, ich sitze in der zweiten Hälfte.", "Lina Weber, +49 151 0000002"),
    },
    {
      id: "guest-leila",
      sessionTitle: title("demo-0928-morning"),
      customerName: "Leila Haddad",
      avatar: seekerById("leila").avatar,
      customerEmail: "leila.haddad@example.com",
      startAt: when("demo-0928-morning"),
      location: place("demo-0928-morning"),
      status: "paid",
      intake: answers(isDe, "Strong, first session back after a cold.", "Kräftig, erste Stunde nach einer Erkältung.", "None.", "Keine.", "None.", "Keine.", "Samir Haddad, +49 151 0000003"),
    },
    {
      id: "guest-noah",
      sessionTitle: title("demo-0929-cacao"),
      customerName: "Noah Berger",
      avatar: seekerById("noah").avatar,
      customerEmail: "noah.berger@example.com",
      startAt: when("demo-0929-cacao"),
      location: place("demo-0929-cacao"),
      status: "pending",
      intake: answers(isDe, "Fine.", "In Ordnung.", "None.", "Keine.", "None.", "Keine.", "Mia Berger, +49 151 0000004"),
    },
    {
      id: "guest-emil",
      sessionTitle: title("demo-0923-private"),
      customerName: "Emil Schwarz",
      avatar: seekerById("emil").avatar,
      customerEmail: "emil.schwarz@example.com",
      startAt: when("demo-0923-private"),
      location: place("demo-0923-private"),
      status: "paid",
      intake: answers(isDe, "Lower back is tight this week.", "Der untere Rücken ist diese Woche fest.", "Ibuprofen yesterday, none today.", "Gestern Ibuprofen, heute nichts.", "No pregnancy. Please keep the floor work short.", "Keine Schwangerschaft. Bodenarbeit bitte kurz halten.", "Clara Schwarz, +49 151 0000005"),
    },
    {
      id: "guest-hanna",
      sessionTitle: title("demo-1002-yoga"),
      customerName: "Hanna Krüger",
      avatar: seekerById("hanna").avatar,
      customerEmail: "hanna.krueger@example.com",
      startAt: when("demo-1002-yoga"),
      location: place("demo-1002-yoga"),
      status: "paid",
      intake: answers(isDe, "Good.", "Gut.", "Iron supplement.", "Eisenpräparat.", "None.", "Keine.", "Paul Krüger, +49 151 0000006"),
    },
    {
      id: "guest-priya",
      sessionTitle: title("demo-1001-circle"),
      customerName: "Priya Shah",
      avatar: seekerById("priya").avatar,
      customerEmail: "priya.shah@example.com",
      startAt: when("demo-1001-circle"),
      location: place("demo-1001-circle"),
      status: "pending",
      intake: answers(isDe, "Well.", "Gut.", "None.", "Keine.", "None.", "Keine.", "Anil Shah, +49 151 0000007"),
    },
    {
      id: "guest-tom",
      sessionTitle: title("demo-1003-forest"),
      customerName: "Tom Reiter",
      avatar: seekerById("tom").avatar,
      customerEmail: "tom.reiter@example.com",
      startAt: when("demo-1003-forest"),
      location: place("demo-1003-forest"),
      status: "paid",
      intake: answers(isDe, "Good. I walk slowly.", "Gut. Ich gehe langsam.", "None.", "Keine.", "None.", "Keine.", "Ines Reiter, +49 151 0000008"),
    },
  ];
}

export function demoPayments(isDe: boolean) {
  return [...ledger]
    .sort((a, b) => +new Date(b.at) - +new Date(a.at))
    .map((row) => ({
      id: row.id,
      at: new Date(row.at).toISOString(),
      title: isDe ? row.titleDe : row.title,
      guests: row.guests,
      euros: row.cents / 100,
      status: row.status,
    }));
}

export function demoMonthEuros(now = new Date()) {
  return ledger
    .filter((row) => row.status === "paid")
    .filter((row) => {
      const at = new Date(row.at);
      return at.getFullYear() === now.getFullYear() && at.getMonth() === now.getMonth();
    })
    .reduce((sum, row) => sum + row.cents, 0) / 100;
}
