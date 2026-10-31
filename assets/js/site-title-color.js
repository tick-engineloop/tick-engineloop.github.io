/**
 * Coolors-style hover effect for the sidebar site title.
 *
 * The title is split into per-character spans. Hovering a character paints it
 * with the next colour of a fixed hue-wheel palette, so sweeping the pointer
 * across the word draws a rainbow in visit order. Leaving the title resets it.
 */
(() => {
  'use strict';

  const title = document.querySelector('#sidebar .site-title');
  if (!title) {
    return;
  }

  // Chirpy <= 7.1 wraps the title in `<h1 class="site-title"><a>…</a></h1>`,
  // newer versions put `site-title` straight on the `<a>`. Support both.
  const link = title.tagName === 'A' ? title : title.querySelector('a') || title;

  if (link.querySelector('.site-title-char')) {
    return;
  }

  // Same 17-step hue wheel coolors.co uses: Tailwind 500 / 400 shades ordered
  // from red to rose, so consecutive letters are neighbours on the wheel.
  const PALETTE = [
    ['#ef4444', '#f87171'], // red
    ['#f97316', '#fb923c'], // orange
    ['#f59e0b', '#fbbf24'], // amber
    ['#eab308', '#facc15'], // yellow
    ['#84cc16', '#a3e635'], // lime
    ['#22c55e', '#4ade80'], // green
    ['#10b981', '#34d399'], // emerald
    ['#14b8a6', '#2dd4bf'], // teal
    ['#06b6d4', '#22d3ee'], // cyan
    ['#0ea5e9', '#38bdf8'], // sky
    ['#3b82f6', '#60a5fa'], // blue
    ['#6366f1', '#818cf8'], // indigo
    ['#8b5cf6', '#a78bfa'], // violet
    ['#a855f7', '#c084fc'], // purple
    ['#d946ef', '#e879f9'], // fuchsia
    ['#ec4899', '#f472b6'], // pink
    ['#f43f5e', '#fb7185'], // rose
  ];

  // Shared across hovers: every touched letter advances the wheel by one step.
  let cursor = 0;

  // `title: "Tick \u200BEngineLoop"` in `_config.yml` marks the line break with
  // a zero-width space: invisible on the page and safe from the HTML minifier,
  // which would otherwise collapse a real newline into a plain space.
  const text = link.textContent;
  link.textContent = '';
  link.setAttribute('aria-label', text.replace(/[\u200B-\u200D\uFEFF\r\n]+/g, ' ').replace(/\s+/g, ' ').trim());

  const chars = [];

  text.split(/\s*[\u200B-\u200D\uFEFF]\s*|\r?\n/).forEach((lineText) => {
    if (lineText.trim() === '') {
      return;
    }

    const line = document.createElement('span');
    line.className = 'site-title-line';
    line.setAttribute('aria-hidden', 'true');
    link.appendChild(line);

    lineText.split(/(\s+)/).forEach((chunk) => {
      if (chunk === '') {
        return;
      }

      if (/^\s+$/.test(chunk)) {
        line.appendChild(document.createTextNode(chunk));
        return;
      }

      // Words stay inline-blocks so a long line can still wrap between words
      // but never inside one.
      const word = document.createElement('span');
      word.className = 'site-title-word';
      line.appendChild(word);

      Array.from(chunk).forEach((char) => {
        const span = document.createElement('span');
        span.className = 'site-title-char';
        span.textContent = char;
        word.appendChild(span);
        chars.push(span);
      });
    });
  });

  if (chars.length === 0) {
    return;
  }

  chars.forEach((span) => {
    span.addEventListener('pointerenter', (event) => {
      if (event.pointerType === 'touch') {
        return;
      }

      const [light, dark] = PALETTE[cursor % PALETTE.length];
      cursor += 1;

      span.style.setProperty('--char-color', light);
      span.style.setProperty('--char-color-dark', dark);
      span.classList.add('is-colored');
    });
  });

  link.addEventListener('pointerleave', () => {
    chars.forEach((span) => {
      span.classList.remove('is-colored');
      span.style.removeProperty('--char-color');
      span.style.removeProperty('--char-color-dark');
    });
  });
})();