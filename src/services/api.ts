const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8888";

async function request(path: string, options: RequestInit = {}) {
  const url = `${API_URL}${path}`;
  const token = window.localStorage.getItem("skill_swap_token");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...options, headers, credentials: "include" });
  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(body?.error || `Request failed: ${response.status}`);
  }

  return body;
}

export async function apiRegister(email: string, password: string, name: string) {
  return request("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, name }),
  });
}

export async function apiLogin(email: string, password: string) {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function apiGetProfile() {
  return request("/profile");
}

export async function apiUpsertProfile(payload: any) {
  return request("/profile", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function apiGetMatches() {
  return request("/matches");
}

export async function apiGenerateMatches() {
  return request("/matches/generate", { method: "POST" });
}

export async function apiGetConversations() {
  return request("/conversations");
}

export async function apiGetMessages(conversationId: string) {
  return request(`/conversations/${conversationId}/messages`);
}

export async function apiSendMessage(conversationId: string, content: string) {
  return request(`/conversations/${conversationId}/messages`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
}

export function setAuthToken(token: string | null) {
  if (token) {
    window.localStorage.setItem("skill_swap_token", token);
  } else {
    window.localStorage.removeItem("skill_swap_token");
  }
}
