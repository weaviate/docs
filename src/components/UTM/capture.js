const UTM_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'gclid',
  'fbclid',
  'msclkid',
];

const DOCS_DEFAULT_UTMS = {
  utm_source: 'docs',
  utm_medium: 'docs',
  utm_campaign: 'docs-to-console',
};

function getUtmsFromUrl() {
  if (typeof window === 'undefined') return {};
  const q = new URLSearchParams(window.location.search);
  const out = {};
  UTM_KEYS.forEach((k) => {
    const v = q.get(k);
    if (v) out[k] = v;
  });
  return out;
}

(function saveLastTouchUtmsSitewide() {
  if (typeof window === 'undefined') return;

  try {
    const urlUtms = getUtmsFromUrl();
    const existingRaw = window.localStorage.getItem('first_touch_utms');
    const existing = existingRaw ? JSON.parse(existingRaw) : null;

    let utmsToSave = null;

    if (Object.keys(urlUtms).length) {
      utmsToSave = urlUtms;
    } else if (!existing) {
      utmsToSave = DOCS_DEFAULT_UTMS;
    } else {
      return;
    }

    window.localStorage.setItem('first_touch_utms', JSON.stringify(utmsToSave));
  } catch {
    // ignore storage errors
  }
})();
