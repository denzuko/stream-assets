/**
 * theme.js — stream-assets theme controller
 *
 * Index page: sets theme, broadcasts to all open scene windows via BroadcastChannel.
 * Scene pages: reads theme on load, listens for live updates via BroadcastChannel.
 *
 * Storage key: 'denzuko-stream-theme'
 * Values: 'light' | 'dark'
 * Default: 'dark' (most scenes are dark-primary)
 */

const THEME_KEY  = 'denzuko-stream-theme';
const CHANNEL    = new BroadcastChannel('stream-theme');
const DEFAULT    = 'dark';

/** Apply theme to the document root */
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
}

/** Read stored preference, fallback to default */
function storedTheme() {
  try { return localStorage.getItem(THEME_KEY) || DEFAULT; }
  catch { return DEFAULT; }
}

/** Persist and broadcast a theme change (index use) */
function setTheme(theme) {
  try { localStorage.setItem(THEME_KEY, theme); } catch {}
  applyTheme(theme);
  CHANNEL.postMessage({ theme });
  // Also update all open scene iframes if on the index page
  document.querySelectorAll('iframe').forEach(f => {
    try { f.contentDocument?.documentElement.setAttribute('data-theme', theme); } catch {}
  });
}

/** Scene init — apply on load and listen for broadcast updates */
function sceneInit() {
  applyTheme(storedTheme());
  CHANNEL.onmessage = e => {
    if (e.data?.theme) applyTheme(e.data.theme);
  };
}

/** Index init — apply stored theme and wire toggle button */
function indexInit() {
  const current = storedTheme();
  applyTheme(current);

  const btn = document.getElementById('theme-toggle');
  if (!btn) return;

  btn.textContent = current === 'dark' ? '☀ light mode' : '☾ dark mode';

  btn.addEventListener('click', () => {
    const next = storedTheme() === 'dark' ? 'light' : 'dark';
    setTheme(next);
    btn.textContent = next === 'dark' ? '☀ light mode' : '☾ dark mode';
  });

  // Live-update iframes on toggle — re-apply after a tick so iframe has loaded
  CHANNEL.onmessage = e => {
    if (e.data?.theme) {
      btn.textContent = e.data.theme === 'dark' ? '☀ light mode' : '☾ dark mode';
    }
  };
}

// Auto-detect context
if (document.getElementById('theme-toggle')) {
  document.addEventListener('DOMContentLoaded', indexInit);
} else {
  document.addEventListener('DOMContentLoaded', sceneInit);
}
