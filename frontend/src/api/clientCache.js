/**
 * In-flight deduplication + optional localStorage TTL for GET-heavy catalog data.
 */

const inflight = new Map();

function dedupeKey(url, init = {}) {
  const method = (init.method || 'GET').toUpperCase();
  if (method !== 'GET') return `${method} ${url} ${init.body || ''}`;
  return `GET ${url}`;
}

export function fetchJsonDeduped(url, init = {}) {
  const key = dedupeKey(url, init);
  if (inflight.has(key)) return inflight.get(key);
  const p = (async () => {
    const res = await fetch(url, init);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  })();
  inflight.set(key, p);
  p.finally(() => inflight.delete(key));
  return p;
}

function readLsJson(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeLsJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // quota / private mode
  }
}

export function sortSubjectsList(data) {
  const list = Array.isArray(data?.subjects) ? [...data.subjects] : [];
  list.sort((a, b) => {
    const c = (a.code || '').localeCompare(b.code || '');
    return c !== 0 ? c : (a.name || '').localeCompare(b.name || '');
  });
  return list;
}

const SUBJECTS_LS = 'bruinplan_cache_subjects_v1';
const SUBJECTS_TTL_MS = 24 * 60 * 60 * 1000;

export async function fetchSubjectsCatalog(apiBase) {
  const url = `${apiBase}/api/subjects/`;
  const cached = readLsJson(SUBJECTS_LS);
  if (cached && typeof cached.savedAt === 'number' && Date.now() - cached.savedAt < SUBJECTS_TTL_MS) {
    return cached.payload;
  }
  const payload = await fetchJsonDeduped(url, { headers: { 'Content-Type': 'application/json' } });
  writeLsJson(SUBJECTS_LS, { savedAt: Date.now(), payload });
  return payload;
}

const courseSubjectKey = (subjectId) => `bruinplan_cache_courses_subject_${subjectId}_v1`;
const COURSE_LIST_TTL_MS = 6 * 60 * 60 * 1000;

export async function fetchCoursesForSubjectCached(apiBase, subjectId) {
  if (!subjectId) return { courses: [] };
  const url = `${apiBase}/api/courses/${subjectId}/`;
  const lsKey = courseSubjectKey(subjectId);
  const cached = readLsJson(lsKey);
  if (cached && typeof cached.savedAt === 'number' && Date.now() - cached.savedAt < COURSE_LIST_TTL_MS) {
    return cached.payload;
  }
  const payload = await fetchJsonDeduped(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  writeLsJson(lsKey, { savedAt: Date.now(), payload });
  return payload;
}
