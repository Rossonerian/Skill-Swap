import { Profile, MatchType } from "@/types";

const DB_KEY = "skill_swap_local_db_v1";
const SESSION_KEY = "skill_swap_session_user_id";

export interface LocalUser {
  id: string;
  email: string;
  name?: string;
  password: string;
}

export interface LocalMatch {
  id: string;
  user1_id: string;
  user2_id: string;
  match_score: number;
  match_type: MatchType;
  match_reasons: string[];
  match_mutual_skills: string[];
  match_one_way_for_user: string[];
  match_one_way_from_user: string[];
  status: "pending" | "accepted" | "rejected";
  created_at: string;
}

export interface LocalConversation {
  id: string;
  match_id: string;
  created_at: string;
}

export interface LocalMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

interface LocalDb {
  users: LocalUser[];
  profiles: Profile[];
  matches: LocalMatch[];
  conversations: LocalConversation[];
  messages: LocalMessage[];
}

function getInitialDb(): LocalDb {
  return {
    users: [],
    profiles: [],
    matches: [],
    conversations: [],
    messages: [],
  };
}

function readDb(): LocalDb {
  if (typeof window === "undefined") {
    return getInitialDb();
  }

  try {
    const raw = window.localStorage.getItem(DB_KEY);
    if (!raw) return getInitialDb();
    const parsed = JSON.parse(raw);
    return {
      ...getInitialDb(),
      ...parsed,
    } as LocalDb;
  } catch {
    return getInitialDb();
  }
}

function writeDb(db: LocalDb) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DB_KEY, JSON.stringify(db));
}

function generateId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`;
}

// -------- Auth helpers --------

export function getCurrentUserFromSession(): LocalUser | null {
  if (typeof window === "undefined") return null;
  const userId = window.localStorage.getItem(SESSION_KEY);
  if (!userId) return null;
  const db = readDb();
  return db.users.find((u) => u.id === userId) || null;
}

export async function localSignUp(email: string, password: string, name: string) {
  const db = readDb();

  if (db.users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    return { user: null, error: new Error("An account with this email already exists.") };
  }

  const user: LocalUser = {
    id: generateId("user"),
    email,
    name,
    password, // For a local prototype we keep this simple; do not use in production.
  };

  db.users.push(user);
  writeDb(db);
  window.localStorage.setItem(SESSION_KEY, user.id);

  return { user, error: null as Error | null };
}

export async function localSignIn(email: string, password: string) {
  const db = readDb();
  const user = db.users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password,
  );

  if (!user) {
    return { user: null, error: new Error("Invalid email or password.") };
  }

  window.localStorage.setItem(SESSION_KEY, user.id);
  return { user, error: null as Error | null };
}

export async function localSignOut() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SESSION_KEY);
}

// -------- Profile helpers --------

export function getProfileByUserId(userId: string): Profile | null {
  if (!userId) return null;
  const db = readDb();
  return db.profiles.find((p) => p.user_id === userId) || null;
}

export function upsertProfile(userId: string, partial: Partial<Profile>): Profile {
  const db = readDb();
  const now = new Date().toISOString();

  let existing = db.profiles.find((p) => p.user_id === userId);

  if (!existing) {
    existing = {
      id: generateId("profile"),
      user_id: userId,
      name: "",
      college: "",
      branch: "",
      year: "",
      bio: "",
      avatar_url: null,
      is_profile_complete: false,
      created_at: now,
      updated_at: now,
      ...partial,
    };
    db.profiles.push(existing);
  } else {
    Object.assign(existing, partial);
    existing.updated_at = now;
  }

  writeDb(db);
  return existing;
}

export function listProfilesExcept(userId: string): Profile[] {
  const db = readDb();
  return db.profiles.filter((p) => p.user_id !== userId);
}

export function listProfilesByUserIds(userIds: string[]): Profile[] {
  const db = readDb();
  const set = new Set(userIds);
  return db.profiles.filter((p) => set.has(p.user_id));
}

// -------- Match, conversation & message helpers (local) --------

export function readMatches(): LocalMatch[] {
  return readDb().matches;
}

export function writeMatches(matches: LocalMatch[]) {
  const db = readDb();
  db.matches = matches;
  writeDb(db);
}

export function readConversations(): LocalConversation[] {
  return readDb().conversations;
}

export function writeConversations(conversations: LocalConversation[]) {
  const db = readDb();
  db.conversations = conversations;
  writeDb(db);
}

export function readMessages(): LocalMessage[] {
  return readDb().messages;
}

export function writeMessages(messages: LocalMessage[]) {
  const db = readDb();
  db.messages = messages;
  writeDb(db);
}

export function ensureConversationForMatch(matchId: string): LocalConversation {
  const db = readDb();
  const existing = db.conversations.find((c) => c.match_id === matchId);
  if (existing) return existing;

  const convo: LocalConversation = {
    id: generateId("convo"),
    match_id: matchId,
    created_at: new Date().toISOString(),
  };
  db.conversations.push(convo);
  writeDb(db);
  return convo;
}

export { generateId };

