export const COURSE_COLOR_PALETTE = [
  '#ef4444', // red
  '#f59e0b', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#ec4899', // pink
];

export function getSubjectColorCode() {
  return { bg: '#ffffff', border: '#e0e0e0' };
}

// Derive a soft background tint from a hex color chosen by the user.
export function colorsFromHex(hex) {
  if (!hex || !/^#([0-9a-f]{6})$/i.test(hex)) return null;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  // Mix with white to create a soft pastel background.
  const mix = (c) => Math.round(c + (255 - c) * 0.88);
  const bg = `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
  return { bg, border: hex };
}

const COLOR_STORAGE_KEY = 'bruinplan:courseColors';

export function loadCourseColorOverrides() {
  try {
    const raw = localStorage.getItem(COLOR_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function saveCourseColorOverrides(overrides) {
  try {
    localStorage.setItem(COLOR_STORAGE_KEY, JSON.stringify(overrides));
  } catch {
    // ignore quota / privacy-mode errors
  }
}
