// ── Dark mode toggle ──
document.querySelector('.theme-toggle')?.addEventListener('click', () => {
  const root = document.documentElement;
  const dark = root.dataset.theme
    ? root.dataset.theme === 'dark'
    : matchMedia('(prefers-color-scheme: dark)').matches;
  root.dataset.theme = dark ? 'light' : 'dark';
  try { localStorage.setItem('theme', root.dataset.theme); } catch (e) {}
});

// ── Hero: drifting microbes (cocci, rods, colonies) linked like a network ──
(() => {
  const canvas = document.querySelector('.hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const TEAL = '63,216,180', CORAL = '255,138,101', MINT = '207,233,223';
  const mouse = { x: -1e4, y: -1e4 };
  let w, h, cells = [];

  function make() {
    const r = Math.random();
    const kind = r < 0.22 ? 'rod' : r < 0.3 ? 'colony' : 'coccus';
    const tint = Math.random();
    return {
      kind,
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
      a: Math.random() * Math.PI, va: (Math.random() - 0.5) * 0.006,
      size: kind === 'colony' ? Math.random() * 3 + 3 : kind === 'rod' ? Math.random() * 5 + 6 : Math.random() * 1.6 + 0.8,
      rgb: kind === 'colony' ? (tint < 0.6 ? TEAL : CORAL) : tint < 0.14 ? CORAL : tint < 0.45 ? TEAL : MINT,
      phase: Math.random() * Math.PI * 2,
    };
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.round(Math.min(120, (w * h) / 12000));
    cells = Array.from({ length: count }, make);
  }

  function draw(c, t) {
    const pulse = 0.75 + 0.25 * Math.sin(t / 900 + c.phase);
    if (c.kind === 'rod') {
      const dx = Math.cos(c.a) * c.size, dy = Math.sin(c.a) * c.size;
      ctx.strokeStyle = `rgba(${c.rgb},${0.55 * pulse})`;
      ctx.lineWidth = 3.2; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(c.x - dx, c.y - dy); ctx.lineTo(c.x + dx, c.y + dy); ctx.stroke();
    } else if (c.kind === 'colony') {
      const g = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.size * 6);
      g.addColorStop(0, `rgba(${c.rgb},${0.35 * pulse})`);
      g.addColorStop(1, `rgba(${c.rgb},0)`);
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(c.x, c.y, c.size * 6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = `rgba(${c.rgb},0.95)`;
      ctx.beginPath(); ctx.arc(c.x, c.y, c.size, 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.fillStyle = `rgba(${c.rgb},${(c.rgb === MINT ? 0.5 : 0.85) * pulse})`;
      ctx.beginPath(); ctx.arc(c.x, c.y, c.size, 0, Math.PI * 2); ctx.fill();
    }
  }

  function frame(t = 0) {
    ctx.clearRect(0, 0, w, h);
    const link = 120;
    for (const c of cells) {
      const dx = mouse.x - c.x, dy = mouse.y - c.y, d = Math.hypot(dx, dy);
      if (d < 160) { c.vx -= dx / d * 0.025; c.vy -= dy / d * 0.025; }
      c.vx *= 0.994; c.vy *= 0.994;
      c.x += c.vx; c.y += c.vy; c.a += c.va;
      if (c.x < -20) c.x = w + 20; else if (c.x > w + 20) c.x = -20;
      if (c.y < -20) c.y = h + 20; else if (c.y > h + 20) c.y = -20;
    }
    ctx.lineWidth = 0.6; ctx.lineCap = 'butt';
    for (let i = 0; i < cells.length; i++) {
      for (let j = i + 1; j < cells.length; j++) {
        const a = cells[i], b = cells[j], d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < link) {
          ctx.strokeStyle = `rgba(${TEAL},${(1 - d / link) * 0.16})`;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
    }
    for (const c of cells) draw(c, t);
    if (!still) requestAnimationFrame(frame);
  }

  canvas.addEventListener('pointermove', e => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
  });
  canvas.addEventListener('pointerleave', () => { mouse.x = mouse.y = -1e4; });
  addEventListener('resize', () => { resize(); if (still) frame(); });
  resize(); frame();
})();

// ── Publications: topic filter (also reads ?topic= from Research links) ──
(() => {
  const buttons = document.querySelectorAll('.filter');
  if (!buttons.length) return;
  const count = document.getElementById('pub-count');

  function apply(topic) {
    buttons.forEach(b => b.classList.toggle('active', b.dataset.topic === topic));
    let shown = 0;
    document.querySelectorAll('.year-block').forEach(block => {
      let visible = 0;
      block.querySelectorAll('.pub').forEach(p => {
        const ok = !topic || p.dataset.topics.split('|').includes(topic);
        p.hidden = !ok; if (ok) visible++;
      });
      block.hidden = visible === 0;
      shown += visible;
    });
    if (count) count.textContent = shown;
  }

  buttons.forEach(b => b.addEventListener('click', () => {
    apply(b.dataset.topic);
    const url = new URL(location);
    b.dataset.topic ? url.searchParams.set('topic', b.dataset.topic) : url.searchParams.delete('topic');
    history.replaceState(null, '', url);
  }));
  const initial = new URLSearchParams(location.search).get('topic');
  if (initial && [...buttons].some(b => b.dataset.topic === initial)) apply(initial);
})();

// ── Tools: live data from the GitHub API ──
(() => {
  const api = 'https://api.github.com';
  const fmtDate = s => new Date(s).toLocaleDateString('en', { year: 'numeric', month: 'short' });
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const featured = [...document.querySelectorAll('.tool[data-repo]')];
  featured.forEach(async card => {
    try {
      const res = await fetch(`${api}/repos/${card.dataset.repo}`);
      if (!res.ok) return;
      const r = await res.json();
      card.querySelector('.gh-stats').textContent = `★ ${r.stargazers_count} · updated ${fmtDate(r.pushed_at)}`;
      if (r.language) {
        const lang = card.querySelector('.gh-lang');
        lang.textContent = r.language; lang.hidden = false;
      }
    } catch (e) {}
  });

  const grid = document.getElementById('repo-grid');
  if (!grid) return;
  const skip = new Set(featured.map(c => c.dataset.repo.toLowerCase()));
  fetch(`${api}/users/${grid.dataset.user}/repos?per_page=100&sort=pushed`)
    .then(res => { if (!res.ok) throw res; return res.json(); })
    .then(repos => {
      const site = `${grid.dataset.user}.github.io`.toLowerCase();
      const list = repos.filter(r => !r.fork && !r.archived && r.name.toLowerCase() !== site && !skip.has(r.full_name.toLowerCase()));
      if (!list.length) { grid.innerHTML = '<p class="muted">No other public repositories yet.</p>'; return; }
      grid.innerHTML = list.map(r => `
        <a class="repo" href="${esc(r.html_url)}">
          <strong>${esc(r.name)}</strong>
          <p>${esc(r.description || '')}</p>
          <div class="meta">${r.language ? `<span>${esc(r.language)}</span>` : ''}<span>★ ${r.stargazers_count}</span><span>${fmtDate(r.pushed_at)}</span></div>
        </a>`).join('');
    })
    .catch(() => { grid.innerHTML = '<p class="muted">Couldn\'t load repositories from GitHub right now.</p>'; });
})();
