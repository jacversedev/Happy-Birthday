(() => {
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const C = window.WISHES, reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const nm = s => s.replace(/\{NAME\}/g, C.NAME);

/* ---------- text from config ---------- */
$('#whoG').textContent = 'for ' + C.NAME;
$('#seaL').textContent = C.INITIAL;
$('#h3t').textContent = C.NAME;
$('#fromTxt').textContent = C.FROM;
$('#fn').value = C.NAME;
$('#heroImg').src = window.HERO_IMG;
document.title = 'Happy Birthday ' + C.NAME + ' 🎀';

/* ---------- sound: voice (embedded) + soft music-box melody (WebAudio) ---------- */
const au = new Audio(window.WISH_AUDIO); au.preload = 'auto';
const warn = $('#warn'), snd = $('#snd');
let actx, master, muted = false, musicT, musicOn = false;
function say() {
  au.currentTime = 0;
  const p = au.play();
  if (p) p.then(() => warn.classList.add('hide')).catch(() => warn.classList.remove('hide'));
  if (actx && actx.state === 'suspended') actx.resume();
}
warn.onclick = () => { say(); startMusic(); };
function initCtx() {
  if (actx) return;
  const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
  actx = new AC(); master = actx.createGain(); master.gain.value = .16; master.connect(actx.destination);
}
const song = [[7,.75],[7,.25],[9,1],[7,1],[12,1],[11,2],[7,.75],[7,.25],[9,1],[7,1],[14,1],[12,2],
              [7,.75],[7,.25],[19,1],[16,1],[12,1],[11,1],[9,1],[17,.75],[17,.25],[16,1],[12,1],[14,1],[12,2]];
function playSong() {
  if (!actx) return;
  const beat = .5; let t = actx.currentTime + .1, total = 0;
  song.forEach(([n, b]) => {
    const f = 261.63 * Math.pow(2, n / 12), d = b * beat;
    [[f, 'triangle', 1], [f * 2, 'sine', .25]].forEach(([fr, ty, v]) => {
      const o = actx.createOscillator(), g = actx.createGain();
      o.type = ty; o.frequency.value = fr;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + .015);
      g.gain.exponentialRampToValueAtTime(.001, t + d * 1.9);
      o.connect(g); g.connect(master); o.start(t); o.stop(t + d * 2);
    });
    t += d; total += d;
  });
  musicT = setTimeout(playSong, (total + 3) * 1000);
}
function startMusic() { if (musicOn || !actx) return; musicOn = true; playSong(); }
snd.onclick = () => {
  muted = !muted; au.muted = muted;
  if (master) master.gain.value = muted ? 0 : .16;
  snd.textContent = muted ? '🔇' : '🔊';
  if (!muted) { initCtx(); startMusic(); if (au.ended) say(); }
};

/* ---------- sparkles + confetti (one light canvas) ---------- */
const cv = $('#fx'), cx = cv.getContext('2d'); let dpr = 1, P = [], S = [], fxOn = false;
function sizeFx() { dpr = Math.min(devicePixelRatio || 1, 2); cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; }
function mkSpark() {
  return { x: Math.random() * cv.width, y: Math.random() * cv.height, r: (1 + Math.random() * 2.4) * dpr,
    vy: -(.12 + Math.random() * .3) * dpr, ph: Math.random() * 6.28 };
}
function burst(n = 150) {
  const cols = ['#e8588a', '#ffd0e2', '#f3cf86', '#ffffff', '#c9a15a', '#b8304f'];
  for (let i = 0; i < n; i++) {
    const a = -Math.PI * (.1 + Math.random() * .8), v = (8 + Math.random() * 14) * dpr;
    P.push({ x: cv.width / 2, y: cv.height * .6, vx: Math.cos(a) * v, vy: Math.sin(a) * v, r: Math.random() * 6, vr: (Math.random() - .5) * .3,
      f: Math.random() * 6, w: (6 + Math.random() * 7) * dpr, h: (4 + Math.random() * 5) * dpr, c: cols[i % 6] });
  }
}
function fxTick(t) {
  requestAnimationFrame(fxTick);
  cx.clearRect(0, 0, cv.width, cv.height);
  if (fxOn) S.forEach(s => {
    s.y += s.vy; if (s.y < -10) { s.y = cv.height + 10; s.x = Math.random() * cv.width; }
    cx.globalAlpha = .35 + .35 * Math.sin(t / 500 + s.ph); cx.fillStyle = '#e1b85c';
    cx.beginPath(); cx.arc(s.x, s.y, s.r, 0, 6.3); cx.fill();
  });
  cx.globalAlpha = 1;
  P = P.filter(p => p.y < cv.height + 40);
  P.forEach(p => {
    p.vy += .34 * dpr; p.vx *= .985; p.vy *= .985; p.x += p.vx; p.y += p.vy; p.r += p.vr; p.f += .2;
    cx.save(); cx.translate(p.x, p.y); cx.rotate(p.r); cx.scale(1, Math.cos(p.f));
    cx.fillStyle = p.c; cx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); cx.restore();
  });
}
sizeFx(); for (let i = 0; i < (reduce ? 10 : 38); i++) S.push(mkSpark());
addEventListener('resize', sizeFx); requestAnimationFrame(fxTick);

/* ---------- wish cards ---------- */
const box = $('#wishes'), N = C.PAGES.length;
C.PAGES.forEach((p, i) => {
  const t = nm(p.t), w = document.createElement('div'); w.className = 'reveal';
  w.innerHTML = `<article class="wcard k-${p.k}"><svg class="bow" viewBox="0 0 100 70"><use href="#bow"/></svg><p class="no">${String(i + 1).padStart(2, '0')} / ${String(N).padStart(2, '0')}</p><h3 class="ttl script${t.length > 22 ? ' long' : ''}">${t}</h3>${p.s ? `<p class="sub">${p.s}</p>` : ''}<div class="sep"></div><div class="txt">${p.b.map(x => `<p>${nm(x)}</p>`).join('')}</div>${p.e ? `<p class="em">${p.e}</p>` : ''}</article>`;
  box.appendChild(w);
});
if (matchMedia('(hover:hover) and (pointer:fine)').matches && !reduce) {
  $$('.wcard').forEach(c => {
    c.addEventListener('mousemove', e => {
      const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      c.style.transform = `perspective(900px) rotateY(${x * 8}deg) rotateX(${-y * 6}deg)`;
    });
    c.addEventListener('mouseleave', () => c.style.transform = '');
  });
}

/* ---------- scroll reveal ---------- */
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12 });
const observeAll = () => $$('.reveal').forEach(el => io.observe(el));

/* ---------- hearts + countdown ---------- */
let flipped = 0, clockT;
$$('.hrt').forEach(h => h.addEventListener('click', () => {
  if (h.classList.contains('flip')) return;
  h.classList.add('flip'); burst(30);
  if (++flipped === 3) setTimeout(() => {
    $('#dateBox').classList.add('show'); burst(120); startClock();
  }, 900);
}));
function startClock() {
  const day = new Date(C.DATE + 'T00:00:00');
  $('#dateTxt').textContent = day.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  const start = day.getTime(), end = start + 864e5;
  function tick() {
    const now = Date.now(); let target = start, title;
    if (now < start) title = 'Birthday shuru hone mein…';
    else if (now < end) { target = end; title = 'Aaj ka din sirf tumhara hai 💗'; }
    else { target = now; title = 'Birthday beet gaya, yaadein hamesha rahengi 💗'; }
    let d = Math.max(0, target - now);
    const s = Math.floor(d / 1e3) % 60, m = Math.floor(d / 6e4) % 60, h = Math.floor(d / 36e5) % 24, dd = Math.floor(d / 864e5);
    $('#clockTitle').textContent = title;
    $('#cd').textContent = dd; $('#ch').textContent = h; $('#cm').textContent = m; $('#cs').textContent = s;
  }
  tick(); clearInterval(clockT); clockT = setInterval(tick, 1000);
}

/* ---------- cake ---------- */
const cake = $('#cake'), blow = $('#blow');
blow.onclick = () => {
  const out = cake.classList.toggle('out');
  blow.textContent = out ? 'Phir se jalao 🕯️' : 'Candles bujhao 🌬️';
  $('#wishMsg').textContent = out ? 'Wish maang li? Ab sab sach hoga ✨💗' : '';
  if (out) { burst(160); setTimeout(() => burst(100), 350); }
};

/* ---------- reply form ---------- */
$('#chips').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  $$('#chips button').forEach(x => x.classList.remove('on')); b.classList.add('on');
});
$('#send').onclick = () => {
  const mood = $('#chips .on').textContent, name = $('#fn').value.trim() || C.NAME, msg = $('#fm').value.trim();
  const text = `Hii 💗 ${name} ki taraf se reply!\nMood: ${mood}\n\n${msg || 'Thank you so much for the birthday surprise! 🥹🎀'}`;
  if (C.PHONE) window.open('https://wa.me/' + C.PHONE + '?text=' + encodeURIComponent(text), '_blank');
  else if (navigator.share) navigator.share({ text }).catch(() => {});
  else window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank');
  burst(80);
};
$('#again').onclick = () => { scrollTo({ top: 0, behavior: 'smooth' }); setTimeout(() => burst(140), 600); };

/* ---------- open the envelope ---------- */
const gate = $('#gate'); let opened = false;
function openEnv() {
  if (opened) return; opened = true;
  say(); initCtx();
  gate.classList.add('open');
  setTimeout(() => { gate.classList.add('zoom'); burst(180); $('#main').classList.remove('hide'); document.body.classList.add('ready'); observeAll(); fxOn = true; snd.classList.remove('hide'); }, 1300);
  setTimeout(() => gate.classList.add('gone'), 2500);
  setTimeout(startMusic, 3600);
}
$('#env').addEventListener('click', openEnv);
$('#seal').addEventListener('click', e => { e.stopPropagation(); openEnv(); });
})();
