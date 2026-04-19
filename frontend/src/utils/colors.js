export function getSubjectColorCode(subject) {
  if (!subject) return { bg: 'white', border: '#e0e0e0' }; // fallback

  let hash = 0;
  for (let i = 0; i < subject.length; i++) {
    hash = subject.charCodeAt(i) + ((hash << 5) - hash);
  }

  const hue = Math.abs(hash) % 360;

  return {
    bg: `hsl(${hue}, 85%, 97%)`,
    border: `hsl(${hue}, 70%, 50%)`
  };
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
