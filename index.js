/**
 * index2.js — Three-state scroll hero
 *
 * State 0  Waveform: canvas bar waveform, oscillating
 * State 1  Text: bars scatter/dissolve, tagline fades in
 * State 2  Network: tagline fades out, physics network fades in
 */

/* ══════════════════════════════════════════════════════════
   COLOURS & CONFIG
   ══════════════════════════════════════════════════════════ */

const WINE   = { r: 114, g: 47,  b: 55  };
const CREAM  = { r: 245, g: 236, b: 215 };
const GOLD   = { r: 201, g: 168, b: 76  };
const SIENNA = { r: 184, g: 92,  b: 58  };

const BAR_COUNT  = 90;
const BAR_W      = 2.5;
const BAR_GAP    = 3.5;
const BAR_RADIUS = 1.25;
// How far behind the tail lags the lead (in dissolve progress, 0–1)
const TAIL_LAG   = 0.22;

/* ══════════════════════════════════════════════════════════
   STATE
   ══════════════════════════════════════════════════════════ */

let canvas, ctx, W, H, dpr;
let scrollProgress   = 0; // 0 → 1 across the hero scroll zone
let postProgress     = 0; // 0 → 1 as user scrolls through the about section after the hero
let portraitProgress = 0; // 0 → 1 for state 3: network fades, portrait scrolls in
let introProgress    = 0; // 0 → 1 as user scrolls the intro section (fades out intro, fades in hero)
let mouseX = -9999, mouseY = -9999;
let mouseDX = 0, mouseDY = 0; // velocity of cursor movement
let bars = [];

// Cached DOM refs for text transition
let aboutGroup2El = null;
let aboutBridgeEl = null;

/* ══════════════════════════════════════════════════════════
   BAR SETUP
   ══════════════════════════════════════════════════════════ */

function initBars() {
  bars = [];
  for (let i = 0; i < BAR_COUNT; i++) {
    // Each bar gets a unique curved exit path defined by two waypoints
    // so the snake wiggles as it travels (not a straight line)
    const exitAngle = Math.random() * Math.PI * 2;
    const exitDist  = 0.35 + Math.random() * 0.45; // fraction of screen
    // Mid-curve control point — offset perpendicular to exit direction
    const perpAngle = exitAngle + (Math.PI / 2) * (Math.random() > 0.5 ? 1 : -1);
    const curveBend  = 0.12 + Math.random() * 0.22;

    bars.push({
      phase:      Math.random() * Math.PI * 2,
      speed:      0.012 + Math.random() * 0.022,
      baseHeight: 0.12 + Math.random() * 0.58,

      // Exit path: origin → controlPt → destination (in normalised coords)
      exitDX:  Math.cos(exitAngle) * exitDist,
      exitDY:  Math.sin(exitAngle) * exitDist * 0.7,
      ctrlDX:  Math.cos(perpAngle) * curveBend,
      ctrlDY:  Math.sin(perpAngle) * curveBend * 0.7,

      // How much this individual bar's tail lags behind the lead
      tailLag:    TAIL_LAG * (0.6 + Math.random() * 0.8),
      fadeDelay:  Math.random() * 0.28,
    });
  }
}

/* ══════════════════════════════════════════════════════════
   CANVAS RESIZE
   ══════════════════════════════════════════════════════════ */

function resize() {
  dpr = window.devicePixelRatio || 1;
  W = window.innerWidth;
  H = window.innerHeight;
  canvas.style.width  = W + 'px';
  canvas.style.height = H + 'px';
  canvas.width  = W * dpr;
  canvas.height = H * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

/* ══════════════════════════════════════════════════════════
   ROUNDED RECT HELPER
   ══════════════════════════════════════════════════════════ */

function roundedRect(x, y, w, h, r) {
  r = Math.min(r, w / 2, Math.abs(h) / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/* ══════════════════════════════════════════════════════════
   LERP HELPERS
   ══════════════════════════════════════════════════════════ */

function lerp(a, b, t) { return a + (b - a) * t; }
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
function easeOut(t) { return 1 - (1 - t) * (1 - t); }
function easeInOut(t) { return t < 0.5 ? 2*t*t : 1-Math.pow(-2*t+2,2)/2; }

/* ══════════════════════════════════════════════════════════
   DRAW — WAVEFORM BARS
   Phase 0 → ~0.45 of hero scroll
   ══════════════════════════════════════════════════════════ */

/**
 * Sample the quadratic bezier exit path at progress p ∈ [0,1].
 * Origin (ox,oy) → control (cx,cy) → destination (dx,dy)
 */
function sampleBezier(ox, oy, cx, cy, dx, dy, p) {
  const q = 1 - p;
  return {
    x: q*q*ox + 2*q*p*cx + p*p*dx,
    y: q*q*oy + 2*q*p*cy + p*p*dy,
  };
}

function drawBars(t, time) {
  const SIDE_MARGIN = Math.min(48, W * 0.08);
  const centerX = W / 2;
  const centerY = H / 2;
  const availW  = W - SIDE_MARGIN * 2;
  const fullW   = BAR_COUNT * (BAR_W + BAR_GAP);
  const scale   = Math.min(1, availW / fullW);
  const barW    = BAR_W  * scale;
  const barGap  = BAR_GAP * scale;
  const totalW  = BAR_COUNT * (barW + barGap);
  const startX  = centerX - totalW / 2;
  const maxH    = H * 0.30;

  for (let i = 0; i < BAR_COUNT; i++) {
    const bar = bars[i];

    // Per-bar dissolve progress (staggered by fadeDelay)
    const rawT   = clamp((t - bar.fadeDelay) / (1 - bar.fadeDelay), 0, 1);
    // Lead tip: easeOut for snappy launch
    const lead   = easeOut(rawT);
    // Tail tip: lags behind the lead, clipped so it never goes past lead
    const tailRaw = clamp(rawT - bar.tailLag, 0, 1);
    const tail    = easeOut(tailRaw);

    // Oscillation: slows as lead moves away
    const oscSpeed = 1 - lead * 0.88;
    const osc      = Math.sin(time * bar.speed * 55 * oscSpeed + bar.phase);
    const barH     = bar.baseHeight * maxH * (0.35 + 0.65 * Math.abs(osc));

    // Base position of this bar in the waveform grid
    const baseX = startX + i * (barW + barGap);

    // Exit path control points (in screen coords)
    const destX = centerX + bar.exitDX * W;
    const destY = centerY + bar.exitDY * H;
    const ctrlX = baseX   + bar.ctrlDX * W;
    const ctrlY = centerY + bar.ctrlDY * H;

    // While fully at rest (lead=0), draw as a vertical bar
    // As it starts moving, the "bar" becomes a thick stroke from tail→lead
    if (lead < 0.005) {
      // Pure waveform bar — draw as before
      const alpha = 1;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = `rgb(${CREAM.r},${CREAM.g},${CREAM.b})`;
      roundedRect(baseX - barW / 2, centerY - barH / 2, barW, barH, BAR_RADIUS * scale);
      ctx.fill();
      ctx.restore();
      continue;
    }

    // Whole bar has gone — skip
    if (tail >= 0.999) continue;

    // Alpha: lead opacity is 1 when not yet fully gone,
    // tail fades to 0 so the trailing end dissolves softly
    const alpha = clamp(1 - tail * 1.2, 0, 1);
    if (alpha < 0.005) continue;

    // Colour shifts cream → gold as lead progresses
    const cr = Math.round(lerp(CREAM.r, GOLD.r, lead * 0.65));
    const cg = Math.round(lerp(CREAM.g, GOLD.g, lead * 0.65));
    const cb = Math.round(lerp(CREAM.b, GOLD.b, lead * 0.65));

    // Stroke width: fat at full, shrinks as it goes
    const sw = barW * (1.4 - lead * 0.5);

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = `rgb(${cr},${cg},${cb})`;
    ctx.lineWidth   = sw;
    ctx.lineCap     = 'round';
    ctx.lineJoin    = 'round';

    // Draw the snake: multi-segment bezier sampled between tail and lead positions
    // We sample ~8 intermediate points so curves look smooth even when stretched
    const SEGS = 8;
    ctx.beginPath();
    for (let s = 0; s <= SEGS; s++) {
      const sp = lerp(tailRaw, rawT, s / SEGS);
      const pt = sampleBezier(baseX, centerY, ctrlX, ctrlY, destX, destY, easeOut(sp));
      if (s === 0) ctx.moveTo(pt.x, pt.y);
      else         ctx.lineTo(pt.x, pt.y);
    }
    ctx.stroke();
    ctx.restore();
  }
}

/* ══════════════════════════════════════════════════════════
   DRAW — AMBIENT PARTICLES (subtle background texture)
   ══════════════════════════════════════════════════════════ */

function drawParticles(t, time) {
  const alpha = 0.07 * (1 - t);
  if (alpha < 0.005) return;
  ctx.fillStyle = `rgba(${CREAM.r},${CREAM.g},${CREAM.b},${alpha})`;
  for (let i = 0; i < 18; i++) {
    const px = (Math.sin(time * 0.28 + i * 2.1) * 0.5 + 0.5) * W;
    const py = (Math.cos(time * 0.19 + i * 1.7) * 0.5 + 0.5) * H;
    const ps = 0.8 + Math.sin(time * 0.8 + i) * 0.4;
    ctx.beginPath();
    ctx.arc(px, py, ps, 0, Math.PI * 2);
    ctx.fill();
  }
}

/* ══════════════════════════════════════════════════════════
   DRAW FRAME
   ══════════════════════════════════════════════════════════ */

/* ══════════════════════════════════════════════════════════
   HTML OVERLAY STATE
   ══════════════════════════════════════════════════════════ */

function applyScrollState() {
  const phaseA = clamp(scrollProgress / 0.5, 0, 1);
  const phaseB = clamp((scrollProgress - 0.5) / 0.5, 0, 1);

  // Tagline fades in during phaseA 0.5→1.
  // Fades out + scales outward starting at phaseB=0.4, exactly when network zoom begins.
  let textAlpha, textScale, line1Tx, line1Ty, line2Tx, line2Ty;
  if (phaseA < 0.5) {
    textAlpha = 0;
    textScale = 1;
    line1Tx = 0; line1Ty = 0;
    line2Tx = 0; line2Ty = 0;
  } else if (phaseA < 1) {
    textAlpha = easeInOut((phaseA - 0.5) / 0.5);
    textScale = 1;
    line1Tx = 0; line1Ty = 0;
    line2Tx = 0; line2Ty = 0;
  } else {
    const fadeT = clamp((phaseB - 0.4) / 0.45, 0, 1);
    textAlpha = phaseB < 0.4 ? 1 : easeInOut(1 - fadeT);
    textScale = 1;
    // Line 1 flies up-left, line 2 flies down-right
    const flyE = easeInOut(fadeT);
    line1Tx = -flyE * 80;
    line1Ty = -flyE * 40;
    line2Tx =  flyE * 80;
    line2Ty =  flyE * 40;
  }
  const tagline = document.getElementById('hero-tagline');
  if (tagline) {
    tagline.style.opacity   = textAlpha;
    tagline.style.transform = `scale(${textScale})`;
    const lines = tagline.querySelectorAll('.tagline-line');
    if (lines[0]) lines[0].style.transform = `translate(${line1Tx}px, ${line1Ty}px)`;
    if (lines[1]) lines[1].style.transform = `translate(${line2Tx}px, ${line2Ty}px)`;
  }

  // Network zoom starts at phaseB=0.4, reaches full at phaseB=1.
  // Only fades out once postProgress is done and portraitProgress begins.
  const netAlphaBase = phaseB < 0.4 ? 0 : easeInOut(clamp((phaseB - 0.4) / 0.6, 0, 1));
  const netFadeOut   = easeInOut(clamp(portraitProgress / 0.45, 0, 1));
  const netAlpha     = netAlphaBase * (1 - netFadeOut);
  const netEl = document.getElementById('network-layer');
  if (netEl) netEl.style.opacity = netAlpha;

  // Intro section: fades out as introProgress goes 0→1 (bottom half of intro scroll zone)
  const introEl = document.getElementById('intro-sticky');
  if (introEl) {
    // Fade starts when intro is half scrolled, completes just before hero begins
    const introFade = easeInOut(clamp((introProgress - 0.4) / 0.6, 0, 1));
    introEl.style.opacity = 1 - introFade;
    // Also fade the intro scroll hint out early
    const introHint = document.getElementById('intro-scroll-hint');
    if (introHint) introHint.style.opacity = introProgress < 0.08 ? 1 : 0;
  }

  // Scroll hint hides once scrolling begins
  const hint = document.getElementById('scroll-hint');
  if (hint) hint.style.opacity = scrollProgress < 0.04 ? 1 : 0;

  // ── Canvas positioning ─────────────────────────────────────────────────────
  // Canvas is always position:fixed. Three phases:
  //
  // Phase A — Intro (introProgress 0→1, scrollProgress=0):
  //   Small waveform, left-aligned under the text, animates to full-center.
  //
  // Phase B — Hero (scrollProgress 0→1):
  //   Full-screen, centred. The existing scatter/tagline/network plays here.
  //
  // Phase C — Post-hero (scrollProgress=1):
  //   Right-shifts to make room for about text, fades with portrait.
  // ─────────────────────────────────────────────────────────────────────────

  canvas.style.transformOrigin = 'center center';
  canvas.style.pointerEvents   = 'none';

  const isMobile = window.innerWidth <= 768;

  if (scrollProgress >= 1) {
    // Phase C: post-hero — shift right and fade out as portrait rises
    const p  = easeInOut(postProgress);
    const sc = isMobile ? lerp(1, 0.92, p) : lerp(1, 0.76, p);
    const tx = isMobile ? 0 : lerp(0, W * 0.22, p);
    const ty = isMobile ? 0 : lerp(0, -H * 0.04, p);
    const netExitT  = easeInOut(clamp(portraitProgress / 0.7, 0, 1));
    const netSlideY = -netExitT * H * 0.65;
    canvas.style.transform = `translate(${tx}px, ${ty + netSlideY}px) scale(${sc})`;
    canvas.style.opacity   = 1 - easeInOut(clamp((portraitProgress - 0.2) / 0.5, 0, 1));

  } else {
    // Phase A/B blend: while intro is scrolling (introProgress 0→1), the canvas
    // animates from a small left-aligned position to full-screen center.
    // Once introProgress=1 (hero begins), it's already at center — stays there.
    const ip = easeInOut(clamp(introProgress, 0, 1));

    // Scale: starts at 0.65 (clearly visible under text), grows to 1
    const sc = lerp(0.65, 1, ip);

    // Horizontal: left-half centre on desktop (-W/4), centred on mobile → 0
    const tx = isMobile ? 0 : lerp(-W * 0.25, 0, ip);

    // Vertical: just below centre on desktop; pushed toward bottom quarter on mobile → 0
    const ty = isMobile ? lerp(H * 0.30, 0, ip) : lerp(H * 0.04, 0, ip);

    canvas.style.transform = ip >= 1 ? 'none' : `translate(${tx}px, ${ty}px) scale(${sc})`;
    canvas.style.opacity = '1';
  }

  // Portrait scrolls up from below in sync with the network's upward exit.
  // Position is computed at runtime so it aligns center-to-center with the about text.
  const pp = easeInOut(portraitProgress);
  const portrait = document.getElementById('portrait-panel');
  const aboutStrip = document.getElementById('about-strip');
  if (portrait && aboutStrip && window.innerWidth > 768) {
    const aRect = aboutStrip.getBoundingClientRect();
    const pW = portrait.offsetWidth;
    const pH = portrait.offsetHeight;

    // Horizontal: centre of the gap between about strip's right edge and viewport right
    const rightHalfCx = aRect.right + (window.innerWidth - aRect.right) / 2;

    // Vertical: centre of the actual text content inside the strip,
    // excluding its padding (120px top, 100px bottom) so we hit the true content midpoint
    const contentTop    = aRect.top  + 120;
    const contentBottom = aRect.bottom - 100;
    const aboutCy = (contentTop + contentBottom) / 2;

    // Position spotify panel so its centre lands on (rightHalfCx, aboutCy)
    const nudgeX = -20;  // px toward left
    const nudgeY =   0;  // vertically centred
    portrait.style.left = (rightHalfCx - pW / 2 + nudgeX) + 'px';
    portrait.style.top  = (aboutCy - pH / 2 + nudgeY) + 'px';

    const slideY = (1 - pp) * 100;
    portrait.style.opacity   = clamp((portraitProgress - 0.05) / 0.4, 0, 1);
    portrait.style.transform = `translateY(${slideY}vh)`;
    portrait.style.pointerEvents = portraitProgress > 0.1 ? 'auto' : 'none';
  }

  // Text transition: bridge fades out, group 2 rises in — both driven by portraitProgress.
  // Skipped on mobile where CSS keeps group 2 always visible.
  if (window.innerWidth > 768) {
    if (aboutBridgeEl) {
      aboutBridgeEl.style.opacity = clamp(1 - portraitProgress / 0.4, 0, 1);
    }
    if (aboutGroup2El) {
      const g2 = easeInOut(clamp(portraitProgress / 0.6, 0, 1));
      aboutGroup2El.style.opacity   = g2;
      aboutGroup2El.style.transform = `translateY(${(1 - g2) * 48}px)`;
    }
  }

  return { phaseA, phaseB, netAlpha };
}

/* ══════════════════════════════════════════════════════════
   NETWORK — NODES & PHYSICS
   ══════════════════════════════════════════════════════════ */

// Node positions: Human-Centered AI Systems anchored at centre (0.50, 0.50).
// Indian Classical Dance and AI for Music pulled toward the middle.
// hx/hy are fractions of W/H; 0.5 = dead centre.
const NODES = [
  { label: 'Indian Classical Dance',          hx: 0.28, hy: 0.47, url: '/work.html' }, // 0
  { label: 'Kathak as a Language',            hx: 0.30, hy: 0.27, url: '/work.html' }, // 1
  { label: 'Philosophy of Language',          hx: 0.48, hy: 0.20, url: '/work.html' }, // 2
  { label: 'AI Safety & Behavior',            hx: 0.64, hy: 0.32, url: '/work.html' }, // 3
  { label: 'Human-Centered AI Systems',       hx: 0.52, hy: 0.52, url: '/work.html' }, // 4 — centre hub
  { label: 'AI for Music',                    hx: 0.64, hy: 0.67, url: '/work.html' }, // 5
  { label: 'AI Evaluations & Benchmarks',     hx: 0.71, hy: 0.49, url: '/work.html' }, // 6
  { label: 'Human Experience of Music',       hx: 0.30, hy: 0.68, url: '/work.html' }, // 7
];

const EDGES = [
  [0, 1], // Indian Classical Dance → Kathak as a Language
  [0, 7], // Indian Classical Dance → Human Experience of Music
  [1, 2], // Kathak as a Language → Philosophy of Language
  [2, 3], // Philosophy of Language → AI Safety & Behavior
  [6, 3], // AI Evaluations & Benchmarks → AI Safety & Behavior
  [3, 4], // AI Safety & Behavior → Human-Centered AI Systems
  [5, 7], // AI for Music → Human Experience of Music
  [5, 4], // AI for Music → Human-Centered AI Systems
];

let nodePhysics = [];
let networkBuilt = false;

function initNetwork() {
  nodePhysics = NODES.map(n => ({
    x:     n.hx * W,
    y:     n.hy * H,
    homeX: n.hx * W,
    homeY: n.hy * H,
    vx: (Math.random() - 0.5) * 0.3,
    vy: (Math.random() - 0.5) * 0.3,
    // Each node has a unique drift oscillator so they never all move in sync
    driftPhaseX: Math.random() * Math.PI * 2,
    driftPhaseY: Math.random() * Math.PI * 2,
    driftSpeed:  0.22 + Math.random() * 0.22,
    driftAmp:    9.0  + Math.random() * 5.0,
    hoverT: 0, // 0→1 smooth hover state for glow/size effect
  }));
}

function stepNetwork(time) {
  const SPRING  = 0.010;
  const DAMP    = 0.89;

  const rect = canvas.getBoundingClientRect();
  const mx = (mouseX - rect.left) * (W / rect.width);
  const my = (mouseY - rect.top)  * (H / rect.height);

  nodePhysics.forEach(p => {
    // Sinusoidal drift — each node has its own frequency and phase
    // This drives the home position gently so the spring always has something to chase
    const driftX = Math.sin(time * p.driftSpeed       + p.driftPhaseX) * p.driftAmp;
    const driftY = Math.cos(time * p.driftSpeed * 0.7 + p.driftPhaseY) * p.driftAmp;

    p.vx += (p.homeX + driftX - p.x) * SPRING;
    p.vy += (p.homeY + driftY - p.y) * SPRING;

    // Cursor stir: nodes within range get a tiny nudge in the direction the mouse moved
    const dist = Math.hypot(p.x - mx, p.y - my);
    const STIR_R = 160;
    if (dist < STIR_R) {
      const influence = (1 - dist / STIR_R) * 0.012;
      p.vx += mouseDX * influence;
      p.vy += mouseDY * influence;
    }

    // Smooth hover state: ease toward 1 if cursor is close, toward 0 otherwise
    const hovered = dist < NODE_HIT_R;
    p.hoverT = clamp(p.hoverT + (hovered ? 1 : 0 - p.hoverT) * 0.08, 0, 1);

    p.vx *= DAMP;
    p.vy *= DAMP;
    p.x  += p.vx;
    p.y  += p.vy;

    // Soft boundary: keep nodes away from viewport edges so labels stay readable
    const PAD = 80;
    if (p.x < PAD)      { p.vx += (PAD - p.x)      * 0.04; }
    if (p.x > W - PAD)  { p.vx -= (p.x - (W - PAD)) * 0.04; }
    if (p.y < PAD)      { p.vy += (PAD - p.y)      * 0.04; }
    if (p.y > H - PAD)  { p.vy -= (p.y - (H - PAD)) * 0.04; }
  });
}

function drawNetwork(alpha) {
  if (alpha < 0.01) return;

  // Zoom-from-centre: scale starts near 0 and eases to 1 as alpha goes 0→1.
  // We use a cubic ease so the expansion feels physical, not linear.
  const scale = alpha * alpha * (3 - 2 * alpha); // smoothstep

  const originX = W / 2;
  const originY = H / 2;

  ctx.save();
  ctx.globalAlpha = alpha;

  // Apply scale transform centred on the viewport centre
  ctx.translate(originX, originY);
  ctx.scale(scale, scale);
  ctx.translate(-originX, -originY);

  // Edges
  EDGES.forEach(([a, b]) => {
    const pa = nodePhysics[a];
    const pb = nodePhysics[b];
    ctx.beginPath();
    ctx.moveTo(pa.x, pa.y);
    const mx = (pa.x + pb.x) / 2;
    const my = (pa.y + pb.y) / 2;
    const dx = pb.x - pa.x;
    const dy = pb.y - pa.y;
    const len = Math.hypot(dx, dy);
    const ox = (-dy / len) * 20;
    const oy = ( dx / len) * 20;
    ctx.quadraticCurveTo(mx + ox, my + oy, pb.x, pb.y);
    ctx.strokeStyle = `rgba(${CREAM.r},${CREAM.g},${CREAM.b},0.22)`;
    ctx.lineWidth = 1 / scale; // keep stroke weight consistent regardless of scale
    ctx.stroke();
  });

  // Nodes
  NODES.forEach((n, i) => {
    const p = nodePhysics[i];
    const ht = p.hoverT || 0;
    const nodeR = (4.5 + ht * 1.2) / scale;      // barely grows on hover
    const glowR = (22  + ht * 7)   / scale;       // glow expands just a touch
    const glowA = 0.18 + ht * 0.10;               // very subtle brightening

    // Outer glow
    const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowR);
    grad.addColorStop(0, `rgba(${GOLD.r},${GOLD.g},${GOLD.b},${glowA})`);
    grad.addColorStop(1, `rgba(${GOLD.r},${GOLD.g},${GOLD.b},0)`);
    ctx.beginPath();
    ctx.arc(p.x, p.y, glowR, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    // Inner dot
    ctx.beginPath();
    ctx.arc(p.x, p.y, nodeR, 0, Math.PI * 2);
    ctx.fillStyle = `rgb(${GOLD.r},${GOLD.g},${GOLD.b})`;
    ctx.fill();

    // Label — compensate font size for scale so it reads consistently
    ctx.globalAlpha = alpha * 0.90;
    const fontSize = Math.round(13.5 / scale);
    ctx.font = `400 ${fontSize}px "DM Sans", sans-serif`;
    ctx.fillStyle = `rgb(${CREAM.r},${CREAM.g},${CREAM.b})`;
    ctx.textAlign = 'center';
    ctx.fillText(n.label, p.x, p.y + (30 / scale));
    ctx.globalAlpha = alpha;
  });

  ctx.restore();
}

/* ══════════════════════════════════════════════════════════
   MAIN LOOP
   ══════════════════════════════════════════════════════════ */

function loop(timestamp) {
  const time = timestamp / 1000;

  ctx.clearRect(0, 0, W, H);

  const { netAlpha } = applyScrollState();

  // Decay mouse delta so stir fades when cursor is still
  mouseDX *= 0.75;
  mouseDY *= 0.75;

  // Always step network physics (just invisible until phaseB)
  stepNetwork(time);

  const phaseA = clamp(scrollProgress / 0.5, 0, 1);
  // Bars hold (pure oscillation) for first 35% of hero scroll, then scatter.
  // scatterT=0 means bars are fully at rest; scatterT=1 means fully scattered.
  const DWELL = 0.35;
  const scatterT = clamp((scrollProgress - DWELL * 0.5) / (0.5 - DWELL * 0.5), 0, 1);
  drawParticles(phaseA, time);
  drawBars(scatterT, time);
  drawNetwork(netAlpha);

  requestAnimationFrame(loop);
}

/* ══════════════════════════════════════════════════════════
   SCROLL
   ══════════════════════════════════════════════════════════ */

function onScroll() {
  // introProgress: 0→1 across the intro section scroll zone
  const introEl = document.getElementById('intro');
  if (introEl) {
    const iRect      = introEl.getBoundingClientRect();
    const iScrollable = introEl.offsetHeight - window.innerHeight;
    const iScrolled   = -iRect.top;
    introProgress     = clamp(iScrolled / iScrollable, 0, 1);
  }

  const hero = document.getElementById('hero');
  const rect = hero.getBoundingClientRect();
  const scrollable = hero.offsetHeight - window.innerHeight;
  const scrolled   = -rect.top;
  scrollProgress   = clamp(scrolled / scrollable, 0, 1);

  // postProgress: 0→1 as the about section scrolls into view after the hero ends.
  const about = document.getElementById('about-strip');
  if (about) {
    const aRect   = about.getBoundingClientRect();
    const entered = window.innerHeight - aRect.top;
    const zone    = about.offsetHeight * 0.6;
    postProgress  = clamp(entered / zone, 0, 1);
  }

  // portraitProgress: on desktop, 0→1 over the bottom 60% of #portrait-section scroll.
  // On mobile (height:auto), drive it off the about strip leaving the viewport instead.
  const portraitSection = document.getElementById('portrait-section');
  if (portraitSection) {
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
      // Fade network out as the about strip scrolls past the top of the viewport
      const aRect = document.getElementById('about-strip')?.getBoundingClientRect();
      if (aRect) {
        // Start fading when about strip top hits 60% up the screen, finish when it leaves top
        const fadeStart = window.innerHeight * 0.6;
        const fadeEnd   = -aRect.height * 0.3;
        portraitProgress = clamp((fadeStart - aRect.top) / (fadeStart - fadeEnd), 0, 1);
      }
    } else {
      const pRect       = portraitSection.getBoundingClientRect();
      const totalTravel = portraitSection.offsetHeight - window.innerHeight;
      const scrolledIn  = -pRect.top;
      const dwellEnd    = totalTravel * 0.4;
      portraitProgress  = clamp((scrolledIn - dwellEnd) / (totalTravel * 0.6), 0, 1);
    }
  }
}

/* ══════════════════════════════════════════════════════════
   NAVBAR
   ══════════════════════════════════════════════════════════ */

function setupNavbar() {
  const nav = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 10);
  }, { passive: true });

  // Dropdown toggle
  const toggle = document.querySelector('.nav-dropdown-toggle');
  const menu   = document.querySelector('.nav-dropdown-menu');
  if (toggle && menu) {
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      menu.classList.toggle('open', !open);
    });
    document.addEventListener('click', () => {
      toggle.setAttribute('aria-expanded', 'false');
      menu.classList.remove('open');
    });
  }

  // "About" jump: scroll to the very bottom of the page
  const jumpAbout = document.getElementById('nav-jump-about');
  if (jumpAbout) {
    jumpAbout.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      toggle?.setAttribute('aria-expanded', 'false');
      menu?.classList.remove('open');
    });
  }
}

/* ══════════════════════════════════════════════════════════
   INIT
   ══════════════════════════════════════════════════════════ */

function setupFadeUp() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.15 });
  document.querySelectorAll('.fade-up').forEach((el, i) => {
    el.style.transitionDelay = `${i * 0.08}s`;
    observer.observe(el);
  });
}

/* ══════════════════════════════════════════════════════════
   NODE HIT TEST
   ══════════════════════════════════════════════════════════ */

const NODE_HIT_R = 28; // px in canvas-space (before scale transform)

/**
 * Return the index of the node under a canvas-space point, or -1.
 * When the canvas is scaled+translated in post-hero mode we need to
 * invert that transform before comparing to node positions.
 */
function hitTestNodes(cx, cy) {
  if (scrollProgress < 1) return -1; // network not visible yet
  const p = easeInOut(postProgress);
  const sc = lerp(1, 0.76, p);
  const tx = lerp(0, W * 0.22, p);
  const ty = lerp(0, -H * 0.04, p);

  // Invert the CSS transform: canvas centre = (W/2 + tx, H/2 + ty) on screen
  const originX = W / 2 + tx;
  const originY = H / 2 + ty;
  // Map screen coords to canvas-space
  const lx = (cx - originX) / sc + W / 2;
  const ly = (cy - originY) / sc + H / 2;

  for (let i = 0; i < nodePhysics.length; i++) {
    const np = nodePhysics[i];
    if (Math.hypot(lx - np.x, ly - np.y) < NODE_HIT_R) return i;
  }
  return -1;
}

function setupNetworkInteraction() {
  window.addEventListener('mousemove', (e) => {
    const idx = hitTestNodes(e.clientX, e.clientY);
    canvas.style.cursor = idx >= 0 ? 'pointer' : 'default';
  }, { passive: true });

  canvas.addEventListener('click', (e) => {
    const idx = hitTestNodes(e.clientX, e.clientY);
    if (idx >= 0 && NODES[idx].url) {
      window.location.href = NODES[idx].url;
    }
  });
}

function init() {
  canvas = document.getElementById('waveform-canvas');
  ctx    = canvas.getContext('2d');

  resize();
  initBars();
  initNetwork();
  setupNavbar();
  setupFadeUp();
  setupNetworkInteraction();

  aboutGroup2El = document.getElementById('about-group-2');
  aboutBridgeEl = document.getElementById('about-bridge');

  window.addEventListener('resize', () => { resize(); initNetwork(); }, { passive: true });
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('mousemove', (e) => {
    mouseDX = e.clientX - mouseX;
    mouseDY = e.clientY - mouseY;
    mouseX = e.clientX;
    mouseY = e.clientY;
  }, { passive: true });

  requestAnimationFrame(loop);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
