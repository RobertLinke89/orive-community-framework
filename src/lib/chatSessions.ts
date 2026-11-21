import fs from 'fs';
import path from 'path';
import { normalizeVisitorKey } from '@/lib/chatCredits';

export type ChatSessionOffering = {
  id: string;
  title: string;
  location: string | null;
  when: string;
  price: string | null;
  href: string;
  partner: boolean;
  image?: string | null;
  facilitatorName?: string | null;
  facilitatorAvatar?: string | null;
  facilitatorHref?: string | null;
  blurb?: string | null;
  video?: {
    provider: 'youtube' | 'vimeo';
    id: string;
    title?: string;
    url: string;
  } | null;
};

export type ChatSessionMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  offerings?: ChatSessionOffering[];
  /** Directory search result cards shown under the answer (sanitized, size-capped). */
  directory?: unknown;
  whatsapp?: string | null;
  createdAt: string;
};

export type ChatSession = {
  id: string;
  visitorKey: string;
  title: string;
  updatedAt: string;
  createdAt: string;
  messages: ChatSessionMessage[];
};

export type ChatSessionSummary = {
  id: string;
  title: string;
  updatedAt: string;
  preview: string;
};

type StoreFile = {
  sessions: Record<string, ChatSession>;
};

const STORE_FILE = process.env.ORIVE_CHAT_SESSIONS_FILE
  ? path.resolve(process.env.ORIVE_CHAT_SESSIONS_FILE)
  : path.resolve(process.cwd(), 'src/data/chatSessions.json');

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

let memory: StoreFile | null = null;

function emptyStore(): StoreFile {
  return { sessions: {} };
}

function load(): StoreFile {
  if (memory) return memory;
  try {
    if (fs.existsSync(STORE_FILE)) {
      const raw = JSON.parse(fs.readFileSync(STORE_FILE, 'utf-8') || '{}');
      memory = {
        sessions:
          raw && typeof raw === 'object' && raw.sessions && typeof raw.sessions === 'object'
            ? raw.sessions
            : {},
      };
      return memory;
    }
  } catch (err) {
    console.warn('[chatSessions] read failed:', err);
  }
  memory = emptyStore();
  return memory;
}

function save(store: StoreFile) {
  memory = store;
  try {
    fs.mkdirSync(path.dirname(STORE_FILE), { recursive: true });
    fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[chatSessions] write failed:', err);
  }
}

export function isChatSessionId(id: string): boolean {
  return UUID.test(id);
}

function titleFromMessage(text: string): string {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (!cleaned) return 'New chat';
  return cleaned.length > 48 ? `${cleaned.slice(0, 45)}…` : cleaned;
}

export function createChatSession(input: {
  id: string;
  visitorKey: string;
  title?: string;
}): ChatSession | null {
  const visitorKey = normalizeVisitorKey(input.visitorKey);
  if (!visitorKey || !isChatSessionId(input.id)) return null;
  const store = load();
  const existing = store.sessions[input.id];
  if (existing) {
    if (existing.visitorKey !== visitorKey) return null;
    return existing;
  }
  const now = new Date().toISOString();
  const session: ChatSession = {
    id: input.id,
    visitorKey,
    title: (input.title || 'New chat').slice(0, 80),
    createdAt: now,
    updatedAt: now,
    messages: [],
  };
  store.sessions[input.id] = session;
  save(store);
  return session;
}

export function getChatSession(id: string, visitorKey: string): ChatSession | null {
  const key = normalizeVisitorKey(visitorKey);
  if (!key || !isChatSessionId(id)) return null;
  const session = load().sessions[id];
  if (!session || session.visitorKey !== key) return null;
  return session;
}

export function listChatSessions(visitorKey: string): ChatSessionSummary[] {
  const key = normalizeVisitorKey(visitorKey);
  if (!key) return [];
  return Object.values(load().sessions)
    .filter((session) => session.visitorKey === key)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 40)
    .map((session) => {
      const last = session.messages[session.messages.length - 1];
      return {
        id: session.id,
        title: session.title,
        updatedAt: session.updatedAt,
        preview: last?.text?.slice(0, 80) || '',
      };
    });
}

function sanitizeDirectory(value: unknown): unknown {
  if (!value || typeof value !== 'object') return undefined;
  try {
    const raw = JSON.stringify(value);
    return raw.length <= 60_000 ? JSON.parse(raw) : undefined;
  } catch {
    return undefined;
  }
}

export function appendChatMessages(
  id: string,
  visitorKey: string,
  messages: Omit<ChatSessionMessage, 'id' | 'createdAt'>[]
): ChatSession | null {
  const session = getChatSession(id, visitorKey);
  if (!session) return null;
  const now = new Date().toISOString();
  for (const message of messages) {
    session.messages.push({
      id: crypto.randomUUID(),
      role: message.role,
      text: String(message.text || '').slice(0, 4000),
      offerings: Array.isArray(message.offerings) ? message.offerings.slice(0, 8) : undefined,
      directory: sanitizeDirectory(message.directory),
      whatsapp: message.whatsapp || null,
      createdAt: now,
    });
  }
  const firstUser = session.messages.find((item) => item.role === 'user');
  if (firstUser && (session.title === 'New chat' || session.title === 'Neuer Chat')) {
    session.title = titleFromMessage(firstUser.text);
  }
  session.updatedAt = now;
  const store = load();
  store.sessions[session.id] = session;
  save(store);
  return session;
}

export function deleteChatSession(id: string, visitorKey: string): boolean {
  const key = normalizeVisitorKey(visitorKey);
  if (!key || !isChatSessionId(id)) return false;
  const store = load();
  const session = store.sessions[id];
  if (!session || session.visitorKey !== key) return false;
  delete store.sessions[id];
  save(store);
  return true;
}
