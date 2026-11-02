/**
 * ORIVE offering description quality gate.
 * External listings are enriched to marketing + seeker-outcome copy.
 * Internal ORIVE publishes must meet the minimum as a hard fact.
 */

export const MIN_OFFERING_DESCRIPTION_CHARS = 1000;

export type OfferingDescriptionLang = 'de' | 'en';

export type OfferingDescriptionInput = {
  title: string;
  description?: string | null;
  tags?: string[] | null;
  category?: string | null;
  location?: string | null;
  facilitatorName?: string | null;
  type?: string | null;
  lang?: OfferingDescriptionLang;
};

type Modality =
  | 'breathwork'
  | 'yoga'
  | 'meditation'
  | 'sound'
  | 'cacao'
  | 'cold'
  | 'retreat'
  | 'dance'
  | 'coaching'
  | 'bodywork'
  | 'ceremony'
  | 'general';

function strip(text: string | null | undefined): string {
  return String(text || '').replace(/\s+/g, ' ').trim();
}

export function offeringDescriptionLength(text: string | null | undefined): number {
  return strip(text).length;
}

export function isOfferingDescriptionReady(text: string | null | undefined): boolean {
  return offeringDescriptionLength(text) >= MIN_OFFERING_DESCRIPTION_CHARS;
}

export function assertOfferingDescription(
  text: string | null | undefined,
  isDe = false,
): string {
  const value = strip(text);
  if (value.length < MIN_OFFERING_DESCRIPTION_CHARS) {
    throw new Error(
      isDe ? `Beschreibung braucht mindestens ${MIN_OFFERING_DESCRIPTION_CHARS} Zeichen (aktuell ${value.length}). Formuliere Marketing-Sprache und den konkreten Outcome für den Seeker.` : `Description needs at least ${MIN_OFFERING_DESCRIPTION_CHARS} characters (currently ${value.length}). Write marketing speech and the concrete seeker outcome.`,
    );
  }
  return value;
}

function detectLang(input: OfferingDescriptionInput): OfferingDescriptionLang {
  if (input.lang === 'de' || input.lang === 'en') return input.lang;
  const sample = `${input.title || ''} ${input.description || ''} ${input.location || ''}`.toLowerCase();
  if (
    /[äöüß]|\b(und|mit|für|dein|deine|eine|einen|workshop|zeremonie|atem|klang|meditation|reise)\b/.test(
      sample,
    )
  ) {
    return 'de';
  }
  return 'en';
}

function detectModality(input: OfferingDescriptionInput): Modality {
  const hay = `${input.title || ''} ${(input.tags || []).join(' ')} ${input.category || ''} ${input.type || ''}`.toLowerCase();
  if (/retreat|auszeit|immersion|vipassana|residential/.test(hay)) return 'retreat';
  if (/breath|atem|wim\s*hof|pranayama|rebirthing/.test(hay)) return 'breathwork';
  if (/yoga|asana|yin\b|vinyasa|kundalini/.test(hay)) return 'yoga';
  if (/sound|klang|gong|singing\s*bowl|soundbath|frequenz/.test(hay)) return 'sound';
  if (/cacao|kakao/.test(hay)) return 'cacao';
  if (/cold|eis|ice\b|wim\s*hof|plunge/.test(hay)) return 'cold';
  if (/dance|tanz|ecstatic|movement|bewegung|5rhythms/.test(hay)) return 'dance';
  if (/coach|leadership|business|mentoring/.test(hay)) return 'coaching';
  if (/massage|bodywork|körper|reiki|fascia|somatic|trauma/.test(hay)) return 'bodywork';
  if (/ceremon|ritual|vollmond|fire|feuer|sacred|heilig/.test(hay)) return 'ceremony';
  if (/meditat|mindful|achtsamkeit|sitzen|stilling/.test(hay)) return 'meditation';
  return 'general';
}

function placeLine(location: string | null | undefined, isDe: boolean): string {
  const place = strip(location);
  if (!place) {
    return isDe ? 'Der Rahmen ist bewusst gestaltet — klar geführt, ohne Performance-Druck, mit Raum für dein Tempo.' : 'The container is held with care — clearly facilitated, free of performance pressure, paced to you.';
  }
  if (/online|virtual|zoom/i.test(place)) {
    return isDe ? `Du nimmst online teil (${place}) — von zu Hause aus, mit der gleichen Intensität wie vor Ort.` : `You join online (${place}) — from home, with the same intensity as an in-person room.`;
  }
  return isDe ? `Der Raum in ${place} gibt dem Erleben einen klaren Anker: ankommen, spüren, integrieren.` : `The space in ${place} anchors the experience: arrive, feel, integrate.`;
}

function hostLine(name: string | null | undefined, isDe: boolean): string {
  const host = strip(name);
  if (!host) {
    return isDe ? 'Du wirst von erfahrenen Facilitators begleitet, die Präsenz vor Performance stellen.' : 'You are guided by facilitators who put presence before performance.';
  }
  return isDe ? `${host} hält den Raum mit Klarheit und Wärme — du musst nichts „richtig“ machen.` : `${host} holds the room with clarity and warmth — nothing to get “right.”`;
}

type CopyBank = {
  hook: (title: string) => string;
  journey: string;
  flow: string;
  outcomes: string;
  after: string;
};

const BANKS: Record<OfferingDescriptionLang, Record<Modality, CopyBank>> = {
  en: {
    breathwork: {
      hook: (title) =>
        `${title} is a guided breath experience for seekers who want more than a tip or a playlist — you want a shift you can feel in your body.`,
      journey:
        'You arrive with a busy nervous system, a mind that won’t quiet, or a longing to meet yourself without distraction. In this session breath becomes the doorway: not as a trick, but as a lived practice that opens emotion, energy, and clarity.',
      flow:
        'Expect a clear arc — arrival and intention, guided breath rounds, space to feel what moves, and a soft landing so you leave grounded rather than spun out. The facilitation keeps you safe while inviting depth.',
      outcomes:
        'What this brings you: a calmer baseline, more access to feeling without overwhelm, sharper presence in daily decisions, and a tool you can return to when stress spikes. Seekers often leave with a sense of “I can meet myself again” — less tightness in the chest, more room to choose how they respond.',
      after:
        'Afterwards, give yourself quiet time. Drink water, move gently, and notice what softens over the next day. The real outcome is not a peak moment — it is the capacity you carry back into work, relationships, and rest.',
    },
    yoga: {
      hook: (title) =>
        `${title} invites you into embodied practice — movement, breath, and attention woven so your system can reset.`,
      journey:
        'Whether you come stiff from sitting, restless from overthinking, or hungry for a ritual that is not another workout, this offering meets you where you are. The mat becomes a place to listen instead of perform.',
      flow:
        'You move through a guided sequence that balances effort and ease, with cues that honor different bodies. Breath stays central; stillness is allowed. No prior flexibility required — curiosity is enough.',
      outcomes:
        'What this brings you: more ease in the body, a quieter mind, better sleep signals, and a felt sense of belonging in your own skin. Seekers leave lighter, more upright in posture and mood, with practices they can keep for five minutes on hard days.',
      after:
        'Integration is simple: notice how you stand, how you breathe between meetings, how tension returns — and choose a short sequence as your reset button.',
    },
    meditation: {
      hook: (title) =>
        `${title} is a meditation container for people who want stillness that actually sticks — not another app streak.`,
      journey:
        'You may feel scattered, overstimulated, or quietly numb. This session offers a held pause: guidance when you need it, silence when you can hold it, and language that makes the practice human.',
      flow:
        'Arrival, settling the body, a clear method (breath, awareness, or guided imagery), and closing that helps you re-enter the day without jarring. Questions are welcome; performance is not required.',
      outcomes:
        'What this brings you: more mental space, kinder self-talk, improved focus, and a reference point for calm you can recall under pressure. Seekers describe walking out with a softer inner volume and a practical way to return to center.',
      after:
        'Keep it alive with two to five minutes daily. The outcome compounds — presence becomes a habit, not a rare weekend feeling.',
    },
    sound: {
      hook: (title) =>
        `${title} immerses you in sound as medicine — vibration that reaches places thinking cannot.`,
      journey:
        'Come when words feel too small: burnout, grief, creative block, or simple exhaustion. Sound baths and gong work let the nervous system receive without needing to explain itself.',
      flow:
        'You lie down or sit comfortably while instruments build a landscape of tone. Eyes can close. There is nothing to “do” except receive. Facilitation frames safety and aftercare.',
      outcomes:
        'What this brings you: deep physical relaxation, emotional release without forcing stories, restored imagination, and a reset of sensory overload. Seekers leave with a washed-out quiet in the mind and a body that feels heavy in a good way — ready for sleep or creative work.',
      after:
        'Protect the afterglow. Avoid rushing into screens. Journal one sentence if something arose. The outcome is a nervous system that remembers it can settle.',
    },
    cacao: {
      hook: (title) =>
        `${title} opens the heart with ceremonial cacao — warmth, presence, and connection without the hype.`,
      journey:
        'You may want intimacy with yourself or community after a season of armor. Cacao softens the edges so feeling and intention can meet.',
      flow:
        'Shared intention, a carefully prepared cup, guided meditation or gentle movement, and space to share if you choose. The dose and pacing respect your body.',
      outcomes:
        'What this brings you: emotional openness, clearer heart-led priorities, connection with others without small talk theater, and a ritual you can remember when life gets transactional. Seekers leave warmer, more honest, and oddly courageous about what they want next.',
      after:
        'Stay hydrated and gentle with yourself. The outcome continues as you notice where you say yes from the heart versus from habit.',
    },
    cold: {
      hook: (title) =>
        `${title} trains courage through cold — breath, exposure, and recovery that rewires how you meet discomfort.`,
      journey:
        'You do not need to be an athlete. You need a willingness to meet the edge with guidance. Cold becomes a teacher for stress, focus, and resilience.',
      flow:
        'Breath preparation, clear safety brief, immersion or exposure, and deliberate warm-down. Community energy helps, but your pace is respected.',
      outcomes:
        'What this brings you: sharper focus, mood lift, a portable confidence (“I can do hard things”), and respect for recovery. Seekers leave buzzing with aliveness and a calmer relationship to everyday stressors.',
      after:
        'Warm slowly, eat well, rest. The lasting outcome is choosing response over reactivity when life gets cold in other ways.',
    },
    retreat: {
      hook: (title) =>
        `${title} is a deeper immersion — time away from default life so change can land in the body, not only the notes app.`,
      journey:
        'You arrive ready to put down noise: calendar, roles, constant input. A retreat gives structure, nature or sanctuary, and facilitation that holds intensity and rest.',
      flow:
        'Days weave practice, silence or sharing, nourishment, and integration. You are not packed with content; you are given room to metabolize.',
      outcomes:
        'What this brings you: clarity on what matters, nervous-system rest, renewed direction for work and relationships, and memories of who you are without the hustle costume. Seekers leave with decisions made, boundaries named, and energy returned.',
      after:
        'Protect the first week home. Choose one practice and one boundary to keep. That is how retreat becomes a turning point instead of a nice story.',
    },
    dance: {
      hook: (title) =>
        `${title} frees the body through conscious movement — expression without choreography to impress anyone.`,
      journey:
        'Come if you feel stuck in your head, shy in your body, or hungry to move emotion that talking cannot reach.',
      flow:
        'Guided waves of music and invitation, permission to be awkward, moments of stillness, and a closing that grounds you. No steps to memorize.',
      outcomes:
        'What this brings you: emotional release, creative spark, social ease without forced networking, and joy that is physical. Seekers leave sweaty, soft, and more at home in their skin.',
      after:
        'Notice how you walk home. That freer gait is the outcome — keep dancing it into ordinary days.',
    },
    coaching: {
      hook: (title) =>
        `${title} is coaching with teeth and heart — clarity, accountability, and outcomes you can measure in how you lead and live.`,
      journey:
        'You may be between chapters, carrying a decision, or ready to lead without burning out. This container makes the invisible visible.',
      flow:
        'Honest intake, focused dialogue, embodied checks when useful, and concrete next steps. You leave with a plan, not only inspiration.',
      outcomes:
        'What this brings you: sharper priorities, language for hard conversations, sustainable ambition, and self-trust. Seekers walk away knowing the next three moves and why they matter.',
      after:
        'Schedule the first action within 48 hours. Coaching compounds when insight becomes behavior.',
    },
    bodywork: {
      hook: (title) =>
        `${title} works with the body as the place stories live — touch, somatic attention, and restoration you can feel.`,
      journey:
        'Come with pain, numbness, grief held in tissue, or simply the need to be received without talking it all out.',
      flow:
        'Consent-led contact or guided somatic practice, pacing that never rushes release, and aftercare that keeps you safe.',
      outcomes:
        'What this brings you: less chronic tension, more sensation where you felt blank, emotional thaw without overwhelm, and sleep that comes easier. Seekers leave inhabiting more of themselves.',
      after:
        'Drink water, move slowly, rest. The outcome deepens as the nervous system updates that safety is possible.',
    },
    ceremony: {
      hook: (title) =>
        `${title} is a held ceremony — ritual that marks change so your psyche can catch up with your life.`,
      journey:
        'Thresholds want witnessing: endings, beginnings, seasons, intentions. Ceremony gives form to what would otherwise stay vague.',
      flow:
        'Opening, intention, ritual elements (sound, fire, sharing, silence), and closing that seals the work. You are invited, never forced, into participation.',
      outcomes:
        'What this brings you: a clear before-and-after, community recognition, emotional completion, and renewed meaning. Seekers leave feeling marked in a good way — ready for the next chapter with less unfinished business.',
      after:
        'Honor the ceremony with one symbolic act at home. That keeps the outcome alive.',
    },
    general: {
      hook: (title) =>
        `${title} is an ORIVE experience designed for seekers who want real change — felt in the body, visible in daily life.`,
      journey:
        'You may be looking for calm, connection, courage, or clarity. This offering meets that longing with skilled facilitation and a clear container.',
      flow:
        'You will be guided through a beginning, a depth phase, and an integration close. Expect presence over performance, and practical cues you can reuse.',
      outcomes:
        'What this brings you: a regulated nervous system, clearer self-knowledge, tools for stress and emotion, and a sense of belonging — to yourself first, then to community. Seekers leave with language for what they need and energy to pursue it.',
      after:
        'Protect a little quiet after. Choose one insight and one practice. That is how one session becomes a new pattern.',
    },
  },
  de: {
    breathwork: {
      hook: (title) =>
        `${title} ist eine geführte Atemreise für Seeker, die mehr wollen als einen Tipp — du willst eine spürbare Verschiebung im Körper.`,
      journey:
        'Du kommst mit einem unruhigen Nervensystem, einem Kopf der nicht stoppt, oder dem Wunsch, dir selbst ohne Ablenkung zu begegnen. Hier wird Atem zur Tür: kein Trick, sondern gelebte Praxis für Emotion, Energie und Klarheit.',
      flow:
        'Erwarte einen klaren Bogen — Ankommen und Intention, geführte Atemrunden, Raum für das was auftaucht, und eine weiche Landung. Die Facilitation hält Sicherheit und lädt Tiefe ein.',
      outcomes:
        'Was du mitnimmst: eine ruhigere Baseline, Zugang zu Gefühl ohne Überforderung, mehr Präsenz in Entscheidungen und ein Werkzeug für Stressmomente. Viele Seeker gehen mit dem Gefühl „ich kann mir wieder begegnen“ — weniger Enge, mehr Wahlfreiheit.',
      after:
        'Danach: Ruhe, Wasser, sanfte Bewegung. Der echte Outcome ist nicht der Peak — es ist die Kapazität, die du in Arbeit, Beziehung und Erholung zurückträgst.',
    },
    yoga: {
      hook: (title) =>
        `${title} lädt dich in verkörperte Praxis ein — Bewegung, Atem und Aufmerksamkeit, damit dein System resetten kann.`,
      journey:
        'Ob steif vom Sitzen, rastlos vom Denken oder hungrig nach Ritual statt Workout: dieses Angebot trifft dich dort, wo du bist. Die Matte wird zum Ort des Hörens, nicht der Performance.',
      flow:
        'Eine geführte Sequenz aus Effort und Ease, Cues für unterschiedliche Körper, Atem im Zentrum, Stille erlaubt. Keine Flexibilität vorausgesetzt — Neugier reicht.',
      outcomes:
        'Was du mitnimmst: mehr Leichtigkeit im Körper, ruhigerer Geist, bessere Schlafsignale und das Gefühl, wieder in der eigenen Haut zuhause zu sein. Seeker gehen aufrechter und mit Mini-Praktiken für schwere Tage.',
      after:
        'Integration: merke, wie du stehst und atmest zwischen Terminen — und wähle eine kurze Sequenz als Reset.',
    },
    meditation: {
      hook: (title) =>
        `${title} ist ein Meditationsraum für Menschen, die Stille wollen die hält — nicht nur einen App-Streak.`,
      journey:
        'Vielleicht fühlst du dich zerstreut, überreizt oder leise taub. Diese Session hält eine Pause: Führung wenn nötig, Stille wenn möglich, Sprache die Praxis menschlich macht.',
      flow:
        'Ankommen, Körper setzen, klare Methode, Abschluss der dich sanft zurückbringt. Fragen willkommen; Leistung nicht nötig.',
      outcomes:
        'Was du mitnimmst: mehr mentalen Raum, freundlicheren Innendialog, besseren Fokus und einen Anker für Ruhe unter Druck. Seeker beschreiben eine weichere innere Lautstärke und einen Weg zurück zur Mitte.',
      after:
        'Halte es lebendig mit zwei bis fünf Minuten täglich. Outcome wächst — Präsenz wird Gewohnheit.',
    },
    sound: {
      hook: (title) =>
        `${title} taucht dich in Klang als Medizin — Vibration die Orte erreicht, die Denken nicht findet.`,
      journey:
        'Komm, wenn Worte zu klein sind: Burnout, Trauer, kreativer Block, Erschöpfung. Soundbath und Gong lassen das Nervensystem empfangen, ohne erklären zu müssen.',
      flow:
        'Du liegst oder sitzt, Instrumente bauen eine Klanglandschaft. Augen zu. Nichts zu „tun“ außer empfangen. Facilitation rahmt Sicherheit und Nachsorge.',
      outcomes:
        'Was du mitnimmst: tiefe Entspannung, emotionales Loslassen ohne Story-Zwang, erholte Imagination und Reset bei Reizüberflutung. Seeker gehen mit stiller Klarheit und einem Körper der gut müde ist — bereit für Schlaf oder Kreativität.',
      after:
        'Schütze das Nachglühen. Weniger Screens. Ein Satz ins Journal reicht. Outcome: ein Nervensystem das sich wieder setzen kann.',
    },
    cacao: {
      hook: (title) =>
        `${title} öffnet das Herz mit zeremoniellem Kakao — Wärme, Präsenz und Verbindung ohne Hype.`,
      journey:
        'Vielleicht willst du Nähe zu dir oder Community nach einer Phase der Panzerung. Kakao weicht Kanten auf, damit Gefühl und Intention sich treffen.',
      flow:
        'Gemeinsame Intention, achtsam zubereiteter Trunk, Meditation oder sanfte Bewegung, Teilen wenn du magst. Dosis und Tempo respektieren deinen Körper.',
      outcomes:
        'Was du mitnimmst: emotionale Offenheit, klarere herzgeführte Prioritäten, echte Begegnung statt Smalltalk und ein Ritual für den Alltag. Seeker gehen wärmer, ehrlicher und mutiger für den nächsten Schritt.',
      after:
        'Viel trinken, sanft bleiben. Der Outcome zeigt sich, wo du aus dem Herz statt aus Gewohnheit Ja sagst.',
    },
    cold: {
      hook: (title) =>
        `${title} trainiert Mut durch Kälte — Atem, Exposition und Recovery die verändern, wie du Unbehagen begegnest.`,
      journey:
        'Du musst kein Athlet sein. Bereitschaft zur Kante mit Begleitung reicht. Kälte wird Lehrerin für Stress, Fokus und Resilienz.',
      flow:
        'Atemvorbereitung, klare Safety, Immersion, bewusstes Warmwerden. Community hilft, dein Tempo zählt.',
      outcomes:
        'Was du mitnimmst: schärferer Fokus, Stimmungshebel, tragbares Selbstvertrauen und Respekt für Recovery. Seeker gehen lebendig und ruhiger gegenüber Alltagstress.',
      after:
        'Langsam wärmen, essen, ruhen. Der bleibende Outcome: Response statt Reaktion, wenn das Leben anders „kalt“ wird.',
    },
    retreat: {
      hook: (title) =>
        `${title} ist Immersion — Zeit außerhalb des Default-Lebens, damit Wandel im Körper landet, nicht nur in Notizen.`,
      journey:
        'Du legst Lärm ab: Kalender, Rollen, Input. Retreat gibt Struktur, Ort und Facilitation die Intensität und Ruhe hält.',
      flow:
        'Tage aus Praxis, Stille oder Teilen, Nahrung und Integration. Weniger Content-Überflutung, mehr Raum zum Verdauen.',
      outcomes:
        'Was du mitnimmst: Klarheit über das Wesentliche, Nervensystem-Rest, neue Richtung für Arbeit und Beziehung, Erinnerung wer du ohne Hustle bist. Seeker gehen mit Entscheidungen, Grenzen und zurückgekehrter Energie.',
      after:
        'Schütze die erste Woche zu Hause. Eine Praxis, eine Grenze. So wird Retreat zum Wendepunkt.',
    },
    dance: {
      hook: (title) =>
        `${title} befreit den Körper durch bewusste Bewegung — Ausdruck ohne Choreografie für Applaus.`,
      journey:
        'Komm, wenn du im Kopf steckst, schüchtern im Körper bist oder Emotion bewegen willst die Reden nicht erreichen.',
      flow:
        'Geführte Musikwellen, Erlaubnis ungelenk zu sein, Stille, Closing das erdet. Keine Schritte zum Auswendiglernen.',
      outcomes:
        'Was du mitnimmst: emotionales Loslassen, kreativen Funken, soziale Leichtigkeit und physische Freude. Seeker gehen verschwitzt, weich und heimischer in der eigenen Haut.',
      after:
        'Spüre den Gang nach Hause. Dieser freiere Schritt ist der Outcome — tanze ihn in den Alltag.',
    },
    coaching: {
      hook: (title) =>
        `${title} ist Coaching mit Klarheit und Herz — Accountability und Outcomes die du in Führung und Leben misst.`,
      journey:
        'Vielleicht bist du zwischen Kapiteln, trägst eine Entscheidung oder willst führen ohne auszubrennen. Dieser Raum macht Unsichtbares sichtbar.',
      flow:
        'Ehrliches Intake, fokussierter Dialog, verkörperte Checks wo sinnvoll, konkrete nächste Schritte. Du gehst mit Plan, nicht nur Inspiration.',
      outcomes:
        'Was du mitnimmst: schärfere Prioritäten, Sprache für harte Gespräche, nachhaltige Ambition und Selbstvertrauen. Seeker kennen die nächsten drei Moves und warum sie zählen.',
      after:
        'Plane die erste Aktion in 48 Stunden. Coaching wirkt, wenn Insight Verhalten wird.',
    },
    bodywork: {
      hook: (title) =>
        `${title} arbeitet mit dem Körper als Ort der Geschichten — Berührung, somatisches Spüren, spürbare Wiederherstellung.`,
      journey:
        'Komm mit Schmerz, Taubheit, gehaltener Trauer oder dem Wunsch empfangen zu werden ohne alles erzählen zu müssen.',
      flow:
        'Consent-geführte Arbeit, Tempo das Release nicht erzwingt, Aftercare das dich sicher hält.',
      outcomes:
        'Was du mitnimmst: weniger chronische Spannung, mehr Sensation wo Leere war, emotionales Auftauen ohne Overwhelm, leichterer Schlaf. Seeker bewohnen mehr von sich selbst.',
      after:
        'Wasser, langsame Bewegung, Ruhe. Der Outcome vertieft sich, wenn Sicherheit im Nervensystem ankommt.',
    },
    ceremony: {
      hook: (title) =>
        `${title} ist gehaltene Zeremonie — Ritual das Wandel markiert, damit die Psyche dem Leben nachkommen kann.`,
      journey:
        'Schwellen wollen Zeugenschaft: Enden, Anfänge, Jahreszeiten, Intentionen. Zeremonie gibt Form dem was sonst vage bleibt.',
      flow:
        'Öffnung, Intention, rituelle Elemente, Closing das die Arbeit versiegelt. Einladung statt Zwang.',
      outcomes:
        'Was du mitnimmst: klares Vorher-Nachher, gemeinschaftliche Anerkennung, emotionalen Abschluss und erneuerte Bedeutung. Seeker gehen gut „markiert“ — bereit fürs nächste Kapitel mit weniger Unerledigtem.',
      after:
        'Ehre die Zeremonie mit einer symbolischen Handlung zu Hause. So bleibt der Outcome lebendig.',
    },
    general: {
      hook: (title) =>
        `${title} ist ein ORIVE-Erlebnis für Seeker die echten Wandel wollen — spürbar im Körper, sichtbar im Alltag.`,
      journey:
        'Vielleicht suchst du Ruhe, Verbindung, Mut oder Klarheit. Dieses Angebot trifft die Sehnsucht mit klarer Facilitation und gehaltenem Rahmen.',
      flow:
        'Anfang, Tiefenphase, Integration. Präsenz vor Performance, praktische Cues die du wiederverwenden kannst.',
      outcomes:
        'Was du mitnimmst: reguliertes Nervensystem, klareres Selbstwissen, Tools für Stress und Emotion und Zugehörigkeit — zuerst zu dir, dann zur Community. Seeker gehen mit Sprache für ihre Bedürfnisse und Energie sie zu leben.',
      after:
        'Bewahre etwas Stille danach. Eine Einsicht, eine Praxis. So wird eine Session zum neuen Muster.',
    },
  },
};

function buildMarketingDescription(input: OfferingDescriptionInput): string {
  const lang = detectLang(input);
  const isDe = lang === 'de';
  const modality = detectModality(input);
  const title = strip(input.title) || (isDe ? 'Dieses Angebot' : 'This offering');
  const bank = BANKS[lang][modality];
  const tags = (input.tags || []).map(strip).filter(Boolean).slice(0, 4);
  const tagLine =
    tags.length > 0
      ? isDe ? `Schwerpunkte: ${tags.join(', ')}.` : `Focus themes: ${tags.join(', ')}.`
      : isDe ? 'Der Fokus liegt auf spürbarer Veränderung, nicht auf Entertainment.' : 'The focus is felt change, not entertainment.';

  const parts = [
    bank.hook(title),
    bank.journey,
    bank.flow,
    bank.outcomes,
    hostLine(input.facilitatorName, isDe),
    placeLine(input.location, isDe),
    tagLine,
    bank.after,
    isDe ? 'ORIVE kuratiert Angebote, die dem Seeker einen klaren Outcome geben: du gehst nicht nur „schön berührt“ — du gehst mit einer Fähigkeit, einer Entscheidung oder einer ruhigeren Baseline zurück in dein Leben.' : 'ORIVE curates offerings with a clear seeker outcome: you leave not only “nicely touched” — you leave with a capacity, a decision, or a calmer baseline to bring back into your life.',
  ];

  return parts.join('\n\n');
}

/**
 * Quality gate for external (and any short) listings: keep ready copy,
 * otherwise expand into marketing + seeker-outcome speech from examples.
 */
export function ensureOfferingDescription(input: OfferingDescriptionInput): string {
  const existing = strip(input.description);
  if (existing.length >= MIN_OFFERING_DESCRIPTION_CHARS) return existing;

  const generated = buildMarketingDescription(input);
  if (!existing) return generated;

  const combined = `${existing}\n\n${generated}`;
  if (combined.length >= MIN_OFFERING_DESCRIPTION_CHARS) return combined;

  const lang = detectLang(input);
  const pad =
    lang === 'de'
      ? '\n\nNimm mit: mehr Präsenz, mehr Wahlfreiheit, mehr Vertrauen in deinen Körper und deine nächste Entscheidung — das ist der Standard, den ORIVE für jedes Angebot setzt.'
      : '\n\nTake with you: more presence, more choice, more trust in your body and your next decision — that is the bar ORIVE sets for every offering.';
  return `${combined}${pad}${pad}${pad}`;
}
