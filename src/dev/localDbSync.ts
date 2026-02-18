// Dev helper: sync server `local_db.json` <-> browser `localStorage` during `npm run dev`.
// - Loads initial DB from the dev server endpoint `/__local_db`.
// - Listens to server Server-Sent-Events `/__local_db/events` for live updates.
// - Patches `localStorage.setItem` to POST updates back to the server when the app writes the DB key.

const DB_KEY = "skill_swap_local_db_v1";
const SESSION_KEY = "skill_swap_session_user_id";

let lastSent: string | null = null;

async function fetchAndSet() {
  try {
    const res = await fetch("/__local_db");
    if (!res.ok) return;
    const text = await res.text();
    const cur = localStorage.getItem(DB_KEY);
    if (cur !== text) {
      localStorage.setItem(DB_KEY, text);
      window.dispatchEvent(new StorageEvent("storage", { key: DB_KEY, newValue: text, oldValue: cur } as any));
    }
  } catch (e) {
    // ignore in dev helper
    // console.error("localDbSync.fetchAndSet", e);
  }
}

function startSSE() {
  try {
    const es = new EventSource("/__local_db/events");
    es.onmessage = (ev) => {
      try {
        const data = ev.data;
        const cur = localStorage.getItem(DB_KEY);
        if (cur !== data) {
          localStorage.setItem(DB_KEY, data);
          window.dispatchEvent(new StorageEvent("storage", { key: DB_KEY, newValue: data, oldValue: cur } as any));
        }
      } catch (e) {
        console.error(e);
      }
    };
    es.onerror = () => {
      // EventSource will auto-retry — nothing to do here.
    };
  } catch (e) {
    // ignore
  }
}

function patchSetItem() {
  const nativeSet = Storage.prototype.setItem;
  Storage.prototype.setItem = function (key: string, value: string) {
    nativeSet.apply(this, [key, value]);
    if (key === DB_KEY) {
      schedulePush();
    }
  };
}

let pushTimer: number | null = null;
function schedulePush() {
  if (pushTimer) {
    clearTimeout(pushTimer);
  }
  pushTimer = window.setTimeout(pushDbToServer, 300);
}

async function pushDbToServer() {
  try {
    const data = localStorage.getItem(DB_KEY) || JSON.stringify({ users: [], profiles: [], matches: [], conversations: [], messages: [] });
    if (data === lastSent) return;
    lastSent = data;
    await fetch("/__local_db", { method: "POST", headers: { "Content-Type": "application/json" }, body: data });
  } catch (e) {
    // ignore
  }
}

(async function init() {
  await fetchAndSet();
  startSSE();
  patchSetItem();
})();

export {};
