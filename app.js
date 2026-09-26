/* FINTECH COMMITTEE — motion engine (vanilla, no deps) */
(() => {
  "use strict";
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(hover:hover) and (pointer:fine)").matches;

  /* ── PRELOADER ── */
  const pre = $("#preloader"), prePct = $("#prePct"), preFill = $("#preBarFill");
  let pct = 0;
  const tickPre = () => {
    pct = Math.min(100, pct + Math.random() * 14 + 4);
    const p = String(Math.floor(pct)).padStart(3, "0");
    if (prePct) prePct.textContent = p;
    if (preFill) preFill.style.width = pct + "%";
    if (pct < 100) setTimeout(tickPre, reduced ? 30 : 90 + Math.random() * 120);
    else setTimeout(() => {
      pre?.classList.add("done");
      document.body.dataset.loading = "false";
      heroIntro();
      setTimeout(() => pre?.remove(), 1200);
    }, 250);
  };
  tickPre();

  /* ── SPLIT TEXT (chars) ── */
  function splitChars(el) {
    const text = el.textContent;
    el.setAttribute("aria-label", text);
    el.innerHTML = "";
    [...text].forEach((c) => {
      const s = document.createElement("span");
      s.className = "ch";
      s.innerHTML = c === " " ? "&nbsp;" : c === "<" ? "&lt;" : c;
      // preserve <em> styling? hero uses nested em — handle separately
      el.appendChild(s);
    });
  }
  // hero lines contain nested markup — split per text node instead
  function splitRich(el) {
    const nodes = [...el.childNodes];
    el.innerHTML = "";
    nodes.forEach((n) => {
      if (n.nodeType === 3) {
        [...n.textContent].forEach((c) => {
          const s = document.createElement("span");
          s.className = "ch";
          s.innerHTML = c === " " ? "&nbsp;" : (c === "<" ? "&lt;" : c);
          el.appendChild(s);
        });
      } else if (n.nodeType === 1) {
        const clone = n.cloneNode(false);
        [...n.textContent].forEach((c) => {
          const s = document.createElement("span");
          s.className = "ch";
          s.innerHTML = c === " " ? "&nbsp;" : c;
          clone.appendChild(s);
        });
        el.appendChild(clone);
      }
    });
  }
  $$(".hero-title .ht-line, .foot-word span").forEach(splitRich);
  // mission statement word-split for scroll scrub
  const mission = $("#missionStatement");
  if (mission) {
    $$(".bs-line", mission).forEach((line) => {
      const nodes = [...line.childNodes];
      line.innerHTML = "";
      nodes.forEach((n) => {
        const txt = n.textContent || "";
        const wrap = n.nodeType === 1 && n.tagName === "EM" ? "em" : null;
        txt.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          const w = document.createElement("span");
          w.className = "w";
          if (/^\s+$/.test(part)) { w.innerHTML = "&nbsp;"; line.appendChild(w); return; }
          if (wrap) { const e = document.createElement("em"); e.textContent = part; w.appendChild(e); }
          else w.textContent = part;
          line.appendChild(w);
        });
      });
    });
  }

  function heroIntro() {
    if (reduced) return;
    const chars = $$(".hero-title .ch");
    chars.forEach((c) => {
      c.style.transform = "translateY(110%)";
      c.style.transition = "none";
    });
    requestAnimationFrame(() => requestAnimationFrame(() => {
      chars.forEach((c, i) => {
        c.style.transition = `transform 1s cubic-bezier(.22,1,.36,1) ${i * 0.022}s`;
        c.style.transform = "translateY(0)";
      });
    }));
  }

  /* ── CLOCK (Mumbai) ── */
  const fmt = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
  const clock = $("#clock"), footClock = $("#footClock");
  const tickClock = () => {
    const t = fmt.format(new Date());
    if (clock) clock.textContent = `MUMBAI ${t}`;
    if (footClock) footClock.textContent = `MUMBAI ${t} IST`;
  };
  tickClock(); setInterval(tickClock, 1000);

  /* ── NAV behaviour + progress + active link ── */
  const nav = $("#nav"), prog = $("#progress i");
  let lastY = 0;
  const sections = ["mission", "record", "committee", "join"].map((id) => document.getElementById(id));
  const navAs = $$(".nav-links a");
  /* ── 004 drifting one-liner (pinned, lerped) ── */
  const dSec = $("#philosophy"), dA = $("#driftA"), dB = $("#driftB");
  let dTarget = 0, dCur = 0, dRaf = 0;
  function dProgress() {
    if (!dSec || (!dA && !dB) || reduced) return 0;
    const total = dSec.offsetHeight - innerHeight;
    if (total <= 0) return 0;
    const y = -dSec.getBoundingClientRect().top;
    return Math.min(1, Math.max(0, y / total));
  }
  function applyD(p) {
    // gentle oscillation around centre — text never leaves the screen,
    // so the whole line is readable at any scroll position
    const amp = innerWidth <= 900 ? innerWidth * 0.015 : innerWidth * 0.022;
    const x = (0.5 - p) * 2 * amp;
    if (dA) dA.style.transform = `translate3d(${x.toFixed(1)}px,0,0)`;
    if (dB) dB.style.transform = `translate3d(${(-x).toFixed(1)}px,0,0)`;
  }
  function kickD() {
    if (reduced || (!dA && !dB)) return;
    if (!dRaf) dRaf = requestAnimationFrame(dLoop);
  }
  function dLoop() {
    dCur += (dTarget - dCur) * 0.11;
    if (Math.abs(dTarget - dCur) < 0.0008) { dCur = dTarget; applyD(dCur); dRaf = 0; return; }
    applyD(dCur);
    dRaf = requestAnimationFrame(dLoop);
  }
  /* ── mission word scrub state (declared before onScroll first runs) ── */
  const mWords = mission ? $$(".w", mission) : [];
  let mTarget = 0, mCur = 0, mRaf = 0;
  const onScroll = () => {
    const y = scrollY;
    nav?.classList.toggle("scrolled", y > 40);
    if (y > 500 && y > lastY + 4) nav?.classList.add("hidden");
    else if (y < lastY - 4 || y < 500) nav?.classList.remove("hidden");
    lastY = y;
    const h = document.documentElement.scrollHeight - innerHeight;
    if (prog) prog.style.transform = `scaleX(${h ? y / h : 0})`;
    // active link
    let cur = "";
    sections.forEach((s) => { if (s && s.getBoundingClientRect().top < innerHeight * 0.4) cur = s.id; });
    navAs.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === `#${cur}`));
    // mission word scrub + drifting one-liner
    mTarget = mProgress();
    kickM();
    dTarget = dProgress();
    kickD();
  };
  addEventListener("scroll", () => { try { onScroll(); } catch (err) { console.error(err); } }, { passive: true });
  addEventListener("resize", () => { mTarget = mProgress(); mCur = mTarget; renderMission(mTarget); dTarget = dProgress(); dCur = dTarget; applyD(dTarget); });
  try { onScroll(); } catch (err) { console.error(err); }
  applyD(dProgress());

  /* ── mission word scrub: overlapping windows + lerped progress ── */
  function mProgress() {
    if (!mission) return 0;
    const r = mission.getBoundingClientRect();
    const start = innerHeight * 0.92; // lighting begins as the statement enters…
    const end = innerHeight * 0.5 - r.height * 0.5; // …fully lit with it sitting mid-screen
    const range = Math.max(1, start - end);
    return Math.min(1, Math.max(0, (start - r.top) / range));
  }
  function renderMission(p) {
    const n = mWords.length;
    if (!n) return;
    const span = 3.2; // each word fades across ~3 word-slots: soft edge, never a hard flip
    const total = n - 1 + span;
    for (let i = 0; i < n; i++) {
      let t = (p * total - i) / span;
      t = t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t); // smoothstep
      const w = mWords[i];
      w.style.opacity = (0.13 + t * 0.87).toFixed(3);
      w.style.transform = `translateY(${((1 - t) * 6).toFixed(2)}px)`;
      w.style.filter = t >= 0.999 ? "" : `blur(${((1 - t) * 2).toFixed(2)}px)`;
    }
  }
  function kickM() {
    if (reduced || !mission) return;
    if (!mRaf) mRaf = requestAnimationFrame(mLoop);
  }
  function mLoop() {
    mCur += (mTarget - mCur) * 0.12;
    if (Math.abs(mTarget - mCur) < 0.0005) { mCur = mTarget; renderMission(mCur); mRaf = 0; return; }
    renderMission(mCur);
    mRaf = requestAnimationFrame(mLoop);
  }

  /* ── mobile menu ── */
  const menuBtn = $("#menuBtn"), mm = $("#mobileMenu");
  let mmOpen = false;
  const setMM = (open) => {
    mmOpen = open;
    mm?.classList.toggle("open", open);
    menuBtn?.classList.toggle("open", open);
    document.documentElement.classList.toggle("locked", open);
    menuBtn?.setAttribute("aria-expanded", String(open));
    mm?.setAttribute("aria-hidden", String(!open));
    if (open) $$("#mobileMenu nav a").forEach((a, i) => (a.style.transitionDelay = `${0.06 * i + 0.1}s`));
  };
  menuBtn?.addEventListener("click", () => setMM(!mmOpen));
  $$("#mobileMenu a").forEach((a) => a.addEventListener("click", () => setMM(false)));

  /* ── REVEALS + COUNTERS ── */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("in");
      $$("[data-count]", e.target).forEach(runCount);
      if (e.target.hasAttribute("data-count")) runCount(e.target);
      io.unobserve(e.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
  $$(".reveal, .event, .totals").forEach((el) => io.observe(el));
  // counters inside hero stats (above fold) — observe individually
  $$("[data-count]").forEach((el) => io.observe(el));

  function runCount(el) {
    if (el.dataset.done) return; el.dataset.done = "1";
    const target = parseFloat(el.dataset.count);
    const pad = parseInt(el.dataset.pad || "0", 10);
    if (reduced) { el.textContent = String(Math.round(target)).padStart(pad, "0"); return; }
    const dur = 1400, t0 = performance.now();
    const step = (t) => {
      const p = Math.min(1, (t - t0) / dur);
      const e = 1 - Math.pow(1 - p, 4);
      const v = Math.round(target * e);
      el.textContent = String(v).padStart(pad, "0");
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* ── CANVAS: live candlestick desk ── */
  const cv = $("#chart");
  if (cv) {
    const ctx = cv.getContext("2d");
    let W = 0, H = 0, candles = [], mouseX = -999, mouseY = -999, t = 0;
    const N = () => Math.max(28, Math.floor(W / 46));
    function resize() {
      const r = cv.parentElement.getBoundingClientRect();
      const dpr = Math.min(2, devicePixelRatio || 1);
      W = r.width; H = r.height;
      cv.width = W * dpr; cv.height = H * dpr;
      cv.style.width = W + "px"; cv.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    }
    function seed() {
      candles = []; let price = 0.5;
      for (let i = 0; i < N() + 4; i++) { price = step(price); candles.push(mk(price)); }
    }
    const step = (p) => Math.min(0.92, Math.max(0.08, p + (Math.random() - 0.485) * 0.09));
    const mk = (p) => {
      const o = p, c = step(p);
      return { o, c, h: Math.max(o, c) + Math.random() * 0.05, l: Math.min(o, c) - Math.random() * 0.05 };
    };
    addEventListener("resize", resize); resize();
    cv.parentElement.addEventListener("pointermove", (e) => {
      const r = cv.getBoundingClientRect();
      mouseX = e.clientX - r.left; mouseY = e.clientY - r.top;
    });
    cv.parentElement.addEventListener("pointerleave", () => (mouseX = -999));
    let lastShift = 0;
    function frame(now) {
      t = now / 1000;
      if (!reduced && now - lastShift > 900) { lastShift = now; candles.push(mk(candles[candles.length - 1].c)); if (candles.length > N() + 4) candles.shift(); }
      ctx.clearRect(0, 0, W, H);
      const baseY = H * 0.42, amp = H * 0.3, cw = W / N();
      // glow line (price path)
      ctx.beginPath();
      candles.forEach((k, i) => {
        const x = i * cw + cw / 2 - ((candles.length - N()) * cw || 0);
        const y = baseY - (k.c - 0.5) * amp * 2 - Math.sin(t * 0.7 + i * 0.5) * 4;
        i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
        k._x = x; k._y = y;
      });
      const grad = ctx.createLinearGradient(0, 0, W, 0);
      grad.addColorStop(0, "rgba(198,255,74,0)");
      grad.addColorStop(0.5, "rgba(198,255,74,.55)");
      grad.addColorStop(1, "rgba(122,92,255,.6)");
      ctx.strokeStyle = grad; ctx.lineWidth = 1.6; ctx.stroke();
      // area fill
      ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath();
      const ag = ctx.createLinearGradient(0, 0, 0, H);
      ag.addColorStop(0, "rgba(198,255,74,.10)"); ag.addColorStop(1, "rgba(198,255,74,0)");
      ctx.fillStyle = ag; ctx.fill();
      // candles
      candles.forEach((k, i) => {
        const x = k._x, up = k.c >= k.o;
        const yO = baseY - (k.o - 0.5) * amp * 2, yC = baseY - (k.c - 0.5) * amp * 2;
        const yH = baseY - (k.h - 0.5) * amp * 2, yL = baseY - (k.l - 0.5) * amp * 2;
        const near = Math.abs(mouseX - x) < 60;
        const hot = Math.abs(mouseX - x) < 24;
        ctx.strokeStyle = up ? (hot ? "#c6ff4a" : "rgba(198,255,74,.55)") : (hot ? "#ff5c5c" : "rgba(255,92,92,.5)");
        ctx.lineWidth = hot ? 2 : 1.2;
        ctx.beginPath(); ctx.moveTo(x, yH); ctx.lineTo(x, yL); ctx.stroke();
        ctx.fillStyle = up ? (hot ? "#c6ff4a" : "rgba(198,255,74,.28)") : (hot ? "#ff5c5c" : "rgba(255,92,92,.30)");
        const top = Math.min(yO, yC), hgt = Math.max(3, Math.abs(yC - yO));
        const bw = near ? 16 : 10;
        ctx.fillRect(x - bw / 2, top, bw, hgt);
        // mouse crosshair readout
        if (hot) {
          ctx.fillStyle = "rgba(198,255,74,.95)";
          ctx.font = "11px JetBrains Mono, monospace";
          ctx.fillText(`₹${(14 + k.c * 18).toFixed(2)} CR`, x + 14, yC - 10);
        }
      });
      // scanline sweep
      const sx = ((t * 60) % (W + 200)) - 100;
      const sg = ctx.createLinearGradient(sx - 60, 0, sx, 0);
      sg.addColorStop(0, "rgba(198,255,74,0)"); sg.addColorStop(1, "rgba(198,255,74,.06)");
      ctx.fillStyle = sg; ctx.fillRect(sx - 60, 0, 60, H);
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  /* ── live FIN/CHAOS index + bid ticker ── */
  let finVal = 4208;
  const heroIndex = $("#heroIndex"), heroDelta = $("#heroIndexDelta"), liveBid = $("#liveBid");
  setInterval(() => {
    if (document.hidden) return;
    const d = (Math.random() - 0.42) * 26;
    finVal = Math.max(3800, finVal + d);
    if (heroIndex) heroIndex.innerHTML = `${Math.round(finVal).toLocaleString("en-IN")}<span class="up">${d >= 0 ? "▲" : "▼"}</span>`;
    if (heroDelta) { heroDelta.textContent = `${d >= 0 ? "+" : ""}${(d / 40).toFixed(2)}% today`; heroDelta.style.color = d >= 0 ? "var(--lime)" : "var(--red)"; }
    if (liveBid && Math.random() > 0.4) liveBid.textContent = `LIVE BID — ₹${(24 + Math.random() * 5.5).toFixed(2)} CR · ${["KOHLI", "BUMRAH", "RASHID", "HEAD"][Math.floor(Math.random() * 4)]}`;
  }, 2200);

  /* ── bid simulator ── */
  const bidBtn = $(".bid-btn"), bidFill = $("#bidSimFill"), bidPrice = $("#bidSimPrice");
  let bid = 14.2;
  bidBtn?.addEventListener("click", () => {
    bid = Math.min(29, bid + 0.4 + Math.random() * 1.4);
    if (bidPrice) bidPrice.textContent = `₹${bid.toFixed(2)} CR`;
    if (bidFill) bidFill.style.width = `${(bid / 29) * 100}%`;
    if (bid >= 29) { toast("SOLD! Kohli goes for 29 cr. — just like Bidblaze."); bid = 14.2; setTimeout(() => { if (bidFill) bidFill.style.width = "48%"; if (bidPrice) bidPrice.textContent = "₹14.20 CR"; }, 1600); }
    else if (liveBid) liveBid.textContent = `LIVE BID — ₹${bid.toFixed(2)} CR · YOU`;
  });

  /* ── magnetic buttons ── */
  if (finePointer && !reduced) {
    $$("[data-magnet]").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
        el.style.transform = `translate(${x * 0.18}px, ${y * 0.22}px)`;
      });
      el.addEventListener("pointerleave", () => (el.style.transform = ""));
    });
  }

  /* ── 3D tilt ── */
  if (finePointer && !reduced) {
    $$("[data-tilt]").forEach((el) => {
      let raf = 0;
      el.addEventListener("pointermove", (e) => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          const r = el.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
          el.style.transform = `perspective(900px) rotateX(${-y * 7}deg) rotateY(${x * 9}deg) translateY(-4px)`;
        });
      });
      el.addEventListener("pointerleave", () => { cancelAnimationFrame(raf); el.style.transform = ""; });
    });
  }

  /* ── custom cursor ── */
  if (finePointer) {
    const dot = $("#cursorDot"), ring = $("#cursorRing"), label = $("span", ring || document.createElement("span"));
    let dx = -100, dy = -100, rx = -100, ry = -100;
    addEventListener("pointermove", (e) => { dx = e.clientX; dy = e.clientY; });
    (function loop() {
      rx += (dx - rx) * 0.16; ry += (dy - ry) * 0.16;
      if (dot) dot.style.transform = `translate(${dx}px,${dy}px) translate(-50%,-50%)`;
      if (ring) ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
      requestAnimationFrame(loop);
    })();
    document.addEventListener("pointerover", (e) => {
      const t = e.target.closest("[data-cursor]");
      const a = e.target.closest("a,button");
      if (t && label) { label.textContent = t.dataset.cursor; ring?.classList.add("is-view"); ring?.classList.remove("is-link"); }
      else if (a) { ring?.classList.add("is-link"); ring?.classList.remove("is-view"); }
      else { ring?.classList.remove("is-view", "is-link"); }
    });
  }

  /* ── portfolio filter ── */
  const pfs = $$(".portfolio-filter .pf"), cards = $$("#portfolioGrid .person");
  pfs.forEach((b) => b.addEventListener("click", () => {
    pfs.forEach((x) => x.classList.remove("active")); b.classList.add("active");
    const f = b.dataset.filter;
    cards.forEach((c) => {
      const hit = f === "all" || (c.dataset.portfolio || "").includes(f);
      c.classList.toggle("hidden", !hit);
      if (hit) { c.classList.remove("pop"); void c.offsetWidth; c.classList.add("pop"); }
    });
  }));

  /* ── FAQ ── */
  $$("[data-faq]").forEach((f) => {
    const q = $(".faq-q", f), a = $(".faq-a", f);
    const sync = () => { if (f.classList.contains("open")) a.style.maxHeight = a.scrollHeight + "px"; else a.style.maxHeight = "0px"; };
    sync(); addEventListener("resize", sync);
    q?.addEventListener("click", () => {
      const was = f.classList.contains("open");
      $$("[data-faq].open").forEach((o) => { o.classList.remove("open"); $(".faq-a", o).style.maxHeight = "0px"; $(".faq-q", o)?.setAttribute("aria-expanded", "false"); });
      if (!was) { f.classList.add("open"); a.style.maxHeight = a.scrollHeight + "px"; q.setAttribute("aria-expanded", "true"); }
    });
  });

  /* ── join form ── */
  const form = $("#joinForm"), note = $("#formNote");
  $$("#pfSelect .pf").forEach((b) => b.addEventListener("click", () => {
    $$("#pfSelect .pf").forEach((x) => x.classList.remove("active")); b.classList.add("active");
  }));
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = form.name.value.trim(), email = form.email.value.trim();
    if (!name || !email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      toast("Give us a name + a real email — the paddle needs an owner.");
      return;
    }
    const pf = $("#pfSelect .pf.active")?.dataset.value || "Events";
    toast(`Locked in, ${name.split(" ")[0]}. ${pf} desk will call you.`);
    if (note) { note.textContent = `RECEIVED — ${name.toUpperCase()} · ${pf.toUpperCase()} DESK · WE REPLY FROM CAMPUS.`; note.classList.add("ok"); }
    form.reset();
  });

  let toastT;
  function toast(msg) {
    const el = $("#toast");
    if (!el) return;
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toastT);
    toastT = setTimeout(() => el.classList.remove("show"), 3400);
  }

  /* ── footer word in-view pop ── */
  const fw = $(".foot-word");
  if (fw) {
    new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting || reduced) return;
      $$(".ch", fw).forEach((c, i) => {
        c.style.transform = "translateY(60%)"; c.style.opacity = "0"; c.style.transition = "none";
        requestAnimationFrame(() => requestAnimationFrame(() => {
          c.style.transition = `all .8s cubic-bezier(.22,1,.36,1) ${i * 0.03}s`;
          c.style.transform = "none"; c.style.opacity = "1";
        }));
      });
    }), { threshold: 0.3 }).observe(fw);
  }
})();
