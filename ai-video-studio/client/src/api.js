const BASE = '/api/videos';

async function jsonOrThrow(res) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Anfrage fehlgeschlagen (${res.status})`);
  }
  return res.json();
}

export function fetchMeta() {
  return fetch(`${BASE}/meta`).then(jsonOrThrow);
}

export function fetchJobs() {
  return fetch(BASE).then(jsonOrThrow);
}

export function fetchJob(id) {
  return fetch(`${BASE}/${id}`).then(jsonOrThrow);
}

export function createVideo(payload) {
  return fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).then(jsonOrThrow);
}

/** Subscribes to live job progress via Server-Sent Events. Returns an unsubscribe function. */
export function subscribeToJob(id, onUpdate) {
  const source = new EventSource(`${BASE}/${id}/events`);
  source.onmessage = (event) => {
    try {
      onUpdate(JSON.parse(event.data));
    } catch {
      // ignore malformed frame
    }
  };
  source.onerror = () => {
    source.close();
  };
  return () => source.close();
}
