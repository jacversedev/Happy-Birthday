(() => {
const $ = s => document.querySelector(s);
const W = window.WISHES, reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const setVh = () => document.documentElement.style.setProperty('--vh', innerHeight * .01 + 'px');

/* ---------- voice (audio is embedded in audio.js, no file path needed) ---------- */
const au = new Audio(window.WISH_AUDIO); au.preload = 'auto';
const warn = $('#warn');
function say() {
  au.currentTime = 0;
  const p = au.play();
  if (p) p.then(() => warn.classList.add('hide')).catch(() => warn.classList.remove('hide'));
}
warn.onclick = say; $('#snd').onclick = say;

/* ---------- balloons ---------- */
const sky = $('#sky'), bc = [['#ff8fb8','#d63a78'],['#ffd0e2','#f08bb0'],['#ffe08a','#e9a93c'],['#ffffff','#f3b8cf'],['#ff6f9f','#b82a62'],['#c9b6ff','#8c6fe0']];
for (let i = 0; i < 10; i++) {
  const b = document.createElement('div'), c = bc[i % 6];
  b.className = 'bl';
  b.style.cssText = `--x:${(i * 10 + Math.random() * 6) | 0}%;--s:${(60 + Math.random() * 50) | 0};--c:${c[0]};--c2:${c[1]};--t:${(14 + Math.random() * 10) | 0}s;--dl:-${(Math.random() * 20) | 0}s;--z:${(-250 + Math.random() * 350) | 0}px`;
  sky.appendChild(b);
}

/* ---------- confetti (2D canvas, stops itself when done) ---------- */
const cv = $('#fx'), cx = cv.getContext('2d'); let P = [], running = false, dpr = 1;
function sizeFx() { dpr = Math.min(devicePixelRatio || 1, 2); cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; }
function burst(n = 150) {
  const cols = ['#ff7fae','#ffd0e2','#ffc857','#ffffff','#e8588a','#8fd3ff'];
  for (let i = 0; i < n; i++) {
    const a = -Math.PI * (.1 + Math.random() * .8), v = (8 + Math.random() * 14) * dpr;
    P.push({ x: cv.width / 2, y: cv.height * .6, vx: Math.cos(a) * v, vy: Math.sin(a) * v, r: Math.random() * 6, vr: (Math.random() - .5) * .3,
      f: Math.random() * 6, w: (6 + Math.random() * 7) * dpr, h: (4 + Math.random() * 5) * dpr, c: cols[i % 6] });
  }
  if (!running) { running = true; requestAnimationFrame(fxTick); }
}
function fxTick() {
  cx.clearRect(0, 0, cv.width, cv.height);
  P = P.filter(p => p.y < cv.height + 40);
  P.forEach(p => {
    p.vy += .34 * dpr; p.vx *= .985; p.vy *= .985; p.x += p.vx; p.y += p.vy; p.r += p.vr; p.f += .2;
    cx.save(); cx.translate(p.x, p.y); cx.rotate(p.r); cx.scale(1, Math.cos(p.f));
    cx.fillStyle = p.c; cx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); cx.restore();
  });
  if (P.length) requestAnimationFrame(fxTick); else { running = false; cx.clearRect(0, 0, cv.width, cv.height); }
}

/* ---------- 3D extruded title ---------- */
const T = $('#title'), lines = `<b class="l1">Happy</b><b class="l2">Birthday</b><b class="l3">dear ${W.NAME}</b>`;
for (let i = 15; i >= 0; i--) {
  const d = document.createElement('div'); d.className = 'ly' + (i ? '' : ' front'); d.innerHTML = lines;
  if (i) {
    const k = i / 15;
    d.style.transform = `translateZ(${-i * 1.8}px)`;
    d.style.color = `rgb(${190 - 120 * k | 0},${50 - 40 * k | 0},${105 - 65 * k | 0})`;
  } else d.style.transform = 'translateZ(2px)';
  T.appendChild(d);
}

/* ---------- wish pages ---------- */
const deck = $('#deck'), dots = $('#dots'), N = W.PAGES.length;
const cards = W.PAGES.map((p, i) => {
  const c = document.createElement('article'); c.className = 'card k-' + p.k;
  c.innerHTML = `<svg class="bow" viewBox="0 0 100 70"><use href="#bow"/></svg><div class="body"><h2 class="ttl script${p.t.length > 22 ? ' long' : ''}">${p.t}</h2>${p.s ? `<p class="sub">${p.s}</p>` : ''}<div class="txt">${p.b.map(x => `<p>${x}</p>`).join('')}</div>${p.e ? `<p class="em">${p.e}</p>` : ''}${i === N - 1 ? '<button class="btn" id="again">Phir se dekho 🎉</button>' : ''}</div><span class="num">${i + 1} / ${N}</span>`;
  deck.appendChild(c); dots.appendChild(document.createElement('i')); return c;
});
let cur = 0, tilt = { rx: 0, ry: 0 }, dx = 0, drag = false, sx = 0, t0 = 0, navT;

function fit() {
  cards.forEach(c => {
    const t = c.querySelector('.txt'); let f = 1.3; t.style.fontSize = f + 'rem';
    while (t.scrollHeight > t.clientHeight + 1 && f > .88) { f -= .04; t.style.fontSize = f + 'rem'; }
  });
}
function place(i, x = 0) {
  const c = cards[i], d = i - cur; let tf, op = 1;
  if (d < 0) { tf = 'translate3d(-135%,0,0) rotateZ(-22deg) rotateY(-40deg)'; op = 0; }
  else if (d === 0) tf = `translate3d(${x}px,0,0) rotateX(${tilt.rx}deg) rotateY(${x * .06 + tilt.ry}deg) rotateZ(${x * .04}deg)`;
  else { tf = `translate3d(0,${d * 16}px,${-d * 70}px) scale(${1 - d * .04})`; op = d > 3 ? 0 : 1 - d * .12; }
  c.style.transform = tf; c.style.opacity = op; c.style.zIndex = d < 0 ? 0 : 50 - d;
  c.style.pointerEvents = d === 0 ? 'auto' : 'none';
}
function layout() {
  cards.forEach((_, i) => place(i));
  [...dots.children].forEach((e, i) => e.classList.toggle('on', i === cur));
}
function nav() { deck.classList.add('nav'); clearTimeout(navT); navT = setTimeout(() => deck.classList.remove('nav'), 800); }
function go(n) {
  const k = Math.max(0, Math.min(N - 1, cur + n));
  dx = 0; nav();
  if (k !== cur) { cur = k; if (cur === N - 1) setTimeout(() => burst(120), 500); }
  layout();
}
$('#prev').onclick = () => go(-1); $('#nxt').onclick = () => go(1);
addEventListener('keydown', e => { if (e.key === 'ArrowRight') go(1); if (e.key === 'ArrowLeft') go(-1); });
deck.addEventListener('click', e => { if (e.target.id === 'again') { cur = 0; nav(); layout(); burst(); } });

deck.addEventListener('pointerdown', e => {
  if (e.target.closest('button')) return;
  drag = true; sx = e.clientX; dx = 0; t0 = e.timeStamp; cards[cur].classList.add('drag');
});
addEventListener('pointermove', e => {
  mx = e.clientX / innerWidth * 2 - 1; my = e.clientY / innerHeight * 2 - 1;
  if (drag) { dx = e.clientX - sx; place(cur, dx); }
  else if (phase === 'book' && e.pointerType === 'mouse') { tilt.ry = mx * 8; tilt.rx = -my * 6; place(cur); }
});
function release(e, cancel) {
  if (!drag) return; drag = false; cards[cur].classList.remove('drag');
  const v = dx / Math.max(e.timeStamp - t0, 1);
  if (!cancel && (dx < -70 || v < -.5)) go(1); else if (!cancel && (dx > 70 || v > .5)) go(-1); else { dx = 0; nav(); layout(); }
}
addEventListener('pointerup', e => release(e, false));
addEventListener('pointercancel', e => release(e, true));

/* ---------- flow: gate -> intro (voice + 3D title) -> book ---------- */
let phase = 'gate', mx = 0, my = 0;
function tick(n) {
  if (phase !== 'intro') return; requestAnimationFrame(tick);
  const s = n / 1000;
  T.style.transform = `rotateX(${-my * 8}deg) rotateY(${(reduce ? 0 : Math.sin(s * .8) * 22) + mx * 18}deg)`;
}
function toBook() {
  if (phase !== 'intro') return; phase = 'book';
  $('#intro').classList.add('hide'); $('#book').classList.remove('hide');
  $('#ctl').classList.remove('hide'); fit(); layout(); burst(100);
}
$('#open').onclick = () => {
  say();
  phase = 'intro';
  $('#gate').classList.add('hide'); $('#intro').classList.remove('hide'); $('#snd').classList.remove('hide');
  burst(); requestAnimationFrame(tick);
  setTimeout(() => $('#go').classList.remove('hide'), 3500);
  au.addEventListener('ended', () => setTimeout(toBook, 3000), { once: true });
  setTimeout(toBook, 14000);
};
$('#go').onclick = toBook;

addEventListener('resize', () => { setVh(); sizeFx(); fit(); });
setVh(); sizeFx(); layout();
if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
})();
