/**
 * theme.js — stream-assets theme controller
 * Index: sets theme. Scenes: reads and applies theme.
 *
 * Key: 'denzuko-stream-theme'  Values: 'light' | 'dark'  Default: 'dark'
 */

const THEME_KEY = 'denzuko-stream-theme';
const CHANNEL   = new BroadcastChannel('stream-theme');
const DEFAULT   = 'dark';

function storedTheme() {
  try { return localStorage.getItem(THEME_KEY) || DEFAULT; }
  catch { return DEFAULT; }
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  // Override body background directly — wins over any inline style
  document.body.style.background = theme === 'dark' ? '#0d0d0b' : '#fffdfa';
  document.body.style.color      = theme === 'dark' ? '#d1fae5' : '#111111';
}

function setTheme(theme) {
  try { localStorage.setItem(THEME_KEY, theme); } catch {}
  applyTheme(theme);
  CHANNEL.postMessage({ theme });
}

function updateToggle(theme) {
  const btn = document.getElementById('theme-toggle');
  if (btn) btn.textContent = theme === 'dark' ? '☀ light' : '☾ dark';
}

// ── Scene pages ──────────────────────────────────────────────────
function sceneInit() {
  const t = storedTheme();
  applyTheme(t);
  CHANNEL.onmessage = e => { if (e.data?.theme) applyTheme(e.data.theme); };
}

// ── Index page ───────────────────────────────────────────────────
function indexInit() {
  const t = storedTheme();
  applyTheme(t);
  updateToggle(t);

  document.getElementById('theme-toggle')?.addEventListener('click', () => {
    const next = storedTheme() === 'dark' ? 'light' : 'dark';
    setTheme(next);
    updateToggle(next);
  });
}

// Apply immediately before DOMContentLoaded to prevent flash
(function() {
  const t = storedTheme();
  document.documentElement.setAttribute('data-theme', t);
})();

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('theme-toggle')) indexInit();
  else sceneInit();
});
