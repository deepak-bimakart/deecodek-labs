"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import type { OSSProject } from "@/lib/opensource";
import "@/app/opensource/opensource.css";

const MAIN_SITE = "https://deecodeklabs.com";

const FILTERS = [
  { id: "all", label: "All projects" },
  { id: "developer", label: "Developer tools" },
  { id: "experiments", label: "Experiments" },
  { id: "utilities", label: "Utilities" },
] as const;

function filterCatOf(p: OSSProject) {
  if (p.filterCat) return p.filterCat;
  const c = (p.category ?? "").toLowerCase();
  if (c.includes("experiment")) return "experiments";
  if (c.includes("util")) return "utilities";
  return "developer";
}

export function OpenSourceLanding({
  projects: initialProjects,
  featured: initialFeatured,
  githubUrl = "https://github.com/deecodeklabs",
}: {
  projects: OSSProject[];
  featured: OSSProject | null;
  url: string;
  githubUrl?: string;
}) {
  const GH = githubUrl;
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [filter, setFilter] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [starsTotal, setStarsTotal] = useState<string>("—");
  const [ghStats, setGhStats] = useState<Record<string, { stars: number; forks: number; url: string; pushed: string }>>({});
  const [toast, setToast] = useState("");
  const [cloneCmd, setCloneCmd] = useState("git clone https://github.com/deecodeklabs/<repo>.git");
  const heroCanvasRef = useRef<HTMLCanvasElement>(null);
  const wfCanvasRef = useRef<HTMLCanvasElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const termOutRef = useRef<HTMLDivElement>(null);
  const termInputRef = useRef<HTMLInputElement>(null);
  const termBodyRef = useRef<HTMLDivElement>(null);
  const histRef = useRef<string[]>([]);
  const histIdxRef = useRef(0);

  const showToast = useCallback((t: string) => {
    setToast(t);
    window.setTimeout(() => setToast(""), 2200);
  }, []);

  useEffect(() => {
    try {
      const t = localStorage.getItem("dck-oss-theme");
      if (t === "light" || t === "dark") setTheme(t);
    } catch { /* ignore */ }
  }, []);

  function toggleTheme() {
    setTheme((prev) => {
      const next = prev === "light" ? "dark" : "light";
      try { localStorage.setItem("dck-oss-theme", next); } catch { /* ignore */ }
      return next;
    });
  }

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      if (barRef.current) {
        barRef.current.style.width = `${(h.scrollTop / (h.scrollHeight - h.clientHeight || 1)) * 100}%`;
      }
    };
    const onMove = (e: PointerEvent) => {
      if (glowRef.current) {
        glowRef.current.style.left = `${e.clientX}px`;
        glowRef.current.style.top = `${e.clientY}px`;
      }
    };
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("pointermove", onMove, { passive: true });
    return () => {
      removeEventListener("scroll", onScroll);
      removeEventListener("pointermove", onMove);
    };
  }, []);

  useEffect(() => {
    const nodes = document.querySelectorAll(".oss-rv");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    nodes.forEach((n, i) => {
      (n as HTMLElement).style.transitionDelay = `${(i % 4) * 70}ms`;
      io.observe(n);
    });
    return () => io.disconnect();
  }, [initialProjects]);

  // Hero particles
  useEffect(() => {
    const cv = heroCanvasRef.current;
    if (!cv) return;
    const x = cv.getContext("2d");
    if (!x) return;
    const RM = matchMedia("(prefers-reduced-motion:reduce)").matches;
    if (RM) return;

    let W = 0, H = 0, dpr = Math.min(devicePixelRatio || 1, 2);
    let P: Array<{ x: number; y: number; vx: number; vy: number; r: number }> = [];
    const m = { x: -999, y: -999 };
    let vis = true;
    let raf = 0;

    function size() {
      W = cv!.clientWidth;
      H = cv!.clientHeight;
      cv!.width = W * dpr;
      cv!.height = H * dpr;
      x!.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.min(130, (W * H) / 9000 | 0);
      P = [];
      for (let i = 0; i < n; i++) {
        P.push({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          r: Math.random() * 1.4 + 0.6,
        });
      }
    }

    const ro = new ResizeObserver(size);
    ro.observe(cv);
    size();

    const hero = cv.parentElement!;
    const onMove = (e: PointerEvent) => {
      const r = cv.getBoundingClientRect();
      m.x = e.clientX - r.left;
      m.y = e.clientY - r.top;
    };
    const onLeave = () => { m.x = m.y = -999; };
    const onDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest("a,button")) return;
      const r = cv.getBoundingClientRect();
      const cx = e.clientX - r.left;
      const cy = e.clientY - r.top;
      P.forEach((p) => {
        const dx = p.x - cx, dy = p.y - cy, d = Math.hypot(dx, dy) + 1;
        if (d < 260) { p.vx += (dx / d) * (260 - d) * 0.04; p.vy += (dy / d) * (260 - d) * 0.04; }
      });
    };
    hero.addEventListener("pointermove", onMove);
    hero.addEventListener("pointerleave", onLeave);
    hero.addEventListener("pointerdown", onDown);
    const io = new IntersectionObserver((e) => { vis = e[0].isIntersecting; });
    io.observe(hero);

    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (!vis) return;
      const col = theme === "light" ? "22,139,75" : "131,230,162";
      x.clearRect(0, 0, W, H);
      for (const p of P) {
        const dx = p.x - m.x, dy = p.y - m.y, d = Math.hypot(dx, dy);
        if (d < 150) { p.vx += (dx / d) * 0.05; p.vy += (dy / d) * 0.05; }
        p.vx *= 0.985; p.vy *= 0.985;
        if (Math.abs(p.vx) < 0.15) p.vx += (Math.random() - 0.5) * 0.02;
        if (Math.abs(p.vy) < 0.15) p.vy += (Math.random() - 0.5) * 0.02;
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        x.fillStyle = `rgba(${col},.85)`;
        x.beginPath(); x.arc(p.x, p.y, p.r, 0, 6.3); x.fill();
      }
      for (let i = 0; i < P.length; i++) {
        for (let j = i + 1; j < P.length; j++) {
          const d = Math.hypot(P[i].x - P[j].x, P[i].y - P[j].y);
          if (d < 110) {
            x.strokeStyle = `rgba(${col},${(1 - d / 110) * 0.28})`;
            x.beginPath(); x.moveTo(P[i].x, P[i].y); x.lineTo(P[j].x, P[j].y); x.stroke();
          }
        }
        const d = Math.hypot(P[i].x - m.x, P[i].y - m.y);
        if (d < 170) {
          x.strokeStyle = `rgba(${col},${(1 - d / 170) * 0.6})`;
          x.beginPath(); x.moveTo(P[i].x, P[i].y); x.lineTo(m.x, m.y); x.stroke();
        }
      }
    };
    loop();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      hero.removeEventListener("pointermove", onMove);
      hero.removeEventListener("pointerleave", onLeave);
      hero.removeEventListener("pointerdown", onDown);
    };
  }, [theme]);

  // Workflow canvas for featured
  useEffect(() => {
    const cv = wfCanvasRef.current;
    if (!cv || !initialFeatured) return;
    const x = cv.getContext("2d");
    if (!x) return;
    let W = 0, H = 0, dpr = Math.min(devicePixelRatio || 1, 2), drag: any = null, t = 0, raf = 0;
    const labels = ["Trigger", "Filter", "Fetch", "Inject", "Notify", "Store"];
    let N: Array<{ x: number; y: number; l: string }> = [];

    function size() {
      W = cv!.clientWidth; H = cv!.clientHeight;
      cv!.width = W * dpr; cv!.height = H * dpr;
      x!.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!N.length) {
        N = labels.slice(0, 4).map((l, i) => ({
          x: W * (0.15 + i * 0.23),
          y: H * (i % 2 ? 0.62 : 0.38),
          l,
        }));
      }
    }
    const ro = new ResizeObserver(size);
    ro.observe(cv);
    size();

    const pos = (e: PointerEvent) => {
      const r = cv.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const onDown = (e: PointerEvent) => {
      const p = pos(e);
      const n = N.find((n) => Math.abs(n.x - p.x) < 46 && Math.abs(n.y - p.y) < 17);
      if (n) { drag = n; cv.setPointerCapture(e.pointerId); }
      else if (N.length < 9) N.push({ x: p.x, y: p.y, l: labels[N.length % labels.length] });
    };
    const onMove = (e: PointerEvent) => {
      if (drag) { const p = pos(e); drag.x = p.x; drag.y = p.y; }
    };
    const onUp = () => { drag = null; };
    cv.addEventListener("pointerdown", onDown);
    cv.addEventListener("pointermove", onMove);
    cv.addEventListener("pointerup", onUp);

    const loop = () => {
      raf = requestAnimationFrame(loop);
      t += 0.012;
      x.clearRect(0, 0, W, H);
      x.strokeStyle = "rgba(131,230,162,.35)";
      x.lineWidth = 1.5;
      for (let i = 0; i < N.length - 1; i++) {
        const a = N[i], b = N[i + 1], mx = (a.x + b.x) / 2;
        x.beginPath();
        x.moveTo(a.x, a.y);
        x.bezierCurveTo(mx, a.y, mx, b.y, b.x, b.y);
        x.stroke();
        const u = (t + i * 0.3) % 1;
        const px = a.x + (b.x - a.x) * u;
        const py = a.y + (b.y - a.y) * (u * u * (3 - 2 * u));
        x.fillStyle = "#b6f5c6";
        x.beginPath(); x.arc(px, py, 3, 0, 6.3); x.fill();
      }
      N.forEach((n) => {
        x.fillStyle = "#10271b";
        x.strokeStyle = "#83e6a2";
        x.lineWidth = 1;
        x.beginPath();
        if (typeof (x as any).roundRect === "function") {
          (x as any).roundRect(n.x - 44, n.y - 16, 88, 32, 9);
        } else {
          x.rect(n.x - 44, n.y - 16, 88, 32);
        }
        x.fill(); x.stroke();
        x.fillStyle = "#d0f0d8";
        x.font = "11px monospace";
        x.textAlign = "center";
        x.textBaseline = "middle";
        x.fillText(n.l, n.x, n.y);
      });
    };
    loop();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      cv.removeEventListener("pointerdown", onDown);
      cv.removeEventListener("pointermove", onMove);
      cv.removeEventListener("pointerup", onUp);
    };
  }, [initialFeatured]);

  // GitHub stats
  useEffect(() => {
    fetch("https://api.github.com/users/deecodeklabs/repos?per_page=100")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((repos: any[]) => {
        const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
        let total = 0;
        const map: typeof ghStats = {};
        repos.forEach((r) => {
          total += r.stargazers_count;
          map[norm(r.name)] = {
            stars: r.stargazers_count,
            forks: r.forks_count,
            url: r.html_url,
            pushed: new Date(r.pushed_at).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
          };
        });
        setStarsTotal(String(total));
        setGhStats(map);
        if (repos[0]) setCloneCmd(`git clone ${repos[0].clone_url}`);
      })
      .catch(() => setStarsTotal("OPEN"));
  }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return initialProjects.filter((p) => {
      const cat = filterCatOf(p);
      const catOk = filter === "all" || cat === filter;
      const text = `${p.name} ${p.description ?? ""} ${(p.technologies ?? []).join(" ")}`.toLowerCase();
      return catOk && (!q || text.includes(q));
    });
  }, [initialProjects, filter, query]);

  function termSay(text: string, color?: string) {
    const out = termOutRef.current;
    if (!out) return;
    const d = document.createElement("div");
    d.className = "oss-ln";
    d.textContent = text;
    if (color) d.style.color = color;
    out.appendChild(d);
    if (termBodyRef.current) termBodyRef.current.scrollTop = 1e9;
  }

  function runCmd(v: string) {
    termSay(`visitor@deecodek:~$ ${v}`, "#83e6a2");
    const cmds: Record<string, () => string | null> = {
      help: () => "help  projects  about  stack  whoami  ls  repo  theme  date  clear",
      projects: () => initialProjects.map((p) => `• ${p.name}`).join("\n") || "No projects yet.",
      ls: () => initialProjects.map((p) => `${p.slug}/`).join("  ") || "(empty)",
      about: () => "DeeCodeK Labs is an independent playground for useful open-source software, tools and experiments.",
      stack: () => "PHP · Laravel · JavaScript · Node.js · Go · Python · AI",
      whoami: () => "visitor — a curious human, probably a developer.",
      date: () => new Date().toString(),
      repo: () => { window.open(GH, "_blank", "noopener"); return "opening github.com/deecodeklabs ..."; },
      theme: () => { toggleTheme(); return "theme toggled."; },
      clear: () => { if (termOutRef.current) termOutRef.current.innerHTML = ""; return null; },
    };
    const f = cmds[v.toLowerCase()];
    if (f) {
      const r = f();
      if (r) termSay(r);
    } else {
      termSay(`Command not found: ${v}\nType "help" to see available commands.`, "#e8a0a0");
    }
  }

  useEffect(() => {
    if (termOutRef.current && !termOutRef.current.childElementCount) {
      termSay("Welcome to DeeCodeK Labs.\nType help to see available commands.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const featured = initialFeatured;
  const featuredHref =
    (featured && ghStats[featured.slug?.toLowerCase().replace(/[^a-z0-9]/g, "") ?? ""]?.url) ||
    featured?.repoUrl ||
    GH;

  return (
    <div className="oss-root" data-theme={theme === "light" ? "light" : undefined}>
      <div className="oss-bar" ref={barRef} />
      <div className="oss-glow" ref={glowRef} />

      <nav className="oss-nav">
        <div className="oss-wrap oss-nav-in">
          <a className="oss-brand" href="#top">
            <Image
              src={theme === "dark" ? "/logo-dark.png" : "/logo-light.png"}
              alt="DeeCodeK Labs"
              width={28}
              height={28}
              className="oss-logo-img"
              priority
            />
            <span>DeeCodeK<span className="oss-green"> Labs</span></span>
          </a>
          <div className="oss-links">
            <a href="#projects">Projects</a>
            <a href="#terminal">Playground</a>
            <a href="#contribute">Contribute</a>
            <a href={MAIN_SITE}>Main site</a>
          </div>
          <div className="oss-acts">
            <button type="button" className="oss-ib" onClick={toggleTheme} aria-label="Toggle theme">◐</button>
            <a className="oss-gh" href={GH} target="_blank" rel="noopener noreferrer">GitHub ↗</a>
          </div>
        </div>
      </nav>

      <header className="oss-hero" id="top">
        <canvas ref={heroCanvasRef} className="oss-hc-canvas" />
        <div className="oss-wrap oss-hc">
          <div className="oss-kick">
            <span className="oss-pulse" /> INDEPENDENT OPEN SOURCE LAB · <span>{starsTotal}</span> ★ ACROSS REPOS
          </div>
          <h1>
            <span>Ideas into</span>
            <br />
            <span className="oss-out">useful things.</span>
            <span className="oss-cur" />
          </h1>
          <p className="oss-hd">
            Small experiments. Useful tools. Developer-first software. Built, tested and shared in the open.
            Move your mouse, click anywhere — this hero is alive.
          </p>
          <div className="oss-ha">
            <a href="#projects" className="oss-btn oss-bp">Explore projects →</a>
            <a href={GH} target="_blank" rel="noopener noreferrer" className="oss-btn oss-bs">★ Star us on GitHub</a>
          </div>
        </div>
        <div className="oss-wrap oss-hb">
          <span>BUILDING IN THE OPEN / EST. 2026</span>
          <span>SCROLL TO EXPLORE</span>
        </div>
      </header>

      <div className="oss-marq">
        <div>
          {Array(2).fill(null).map((_, i) => (
            <span key={i}>
              OPEN SOURCE<b>✳</b>LARAVEL<b>✳</b>GO<b>✳</b>PYTHON<b>✳</b>JAVASCRIPT<b>✳</b>AI AGENTS<b>✳</b>DEV TOOLS<b>✳</b>MIT LICENSED<b>✳</b>PRs WELCOME<b>✳</b>
            </span>
          ))}
        </div>
      </div>

      <main>
        {featured && (
          <section className="oss-sec oss-wrap">
            <div className="oss-sh oss-rv">
              <div>
                <div className="oss-eyebrow">01 / THE SPOTLIGHT</div>
                <h2>Currently in the lab<span className="oss-green">.</span></h2>
              </div>
              <p>What we&apos;re building right now. Play with the canvas: drag the nodes, click empty space to add one.</p>
            </div>
            <article className="oss-feat oss-rv">
              <div className="oss-fi">
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span className="oss-st">ACTIVE EXPERIMENT</span>
                  <span className="oss-tag">FEATURED</span>
                </div>
                <h3>{featured.name}</h3>
                <p>{featured.description}</p>
                <div className="oss-tags">
                  {(featured.technologies ?? []).map((t) => (
                    <span key={t} className="oss-tag">{t}</span>
                  ))}
                </div>
                <a className="oss-btn oss-bp" href={featuredHref} target="_blank" rel="noopener noreferrer">
                  Explore repository →
                </a>
              </div>
              <div className="oss-fv">
                <canvas ref={wfCanvasRef} />
                <span className="oss-vh">DRAG NODES · CLICK TO ADD</span>
                <span className="oss-vl">{(featured.slug ?? "PROJECT").toUpperCase()} / VISUAL WORKFLOW</span>
              </div>
            </article>
          </section>
        )}

        <section className="oss-sec oss-wrap" id="projects" style={{ paddingTop: 70 }}>
          <div className="oss-sh oss-rv">
            <div>
              <div className="oss-eyebrow">02 / THE COLLECTION</div>
              <h2>Things we&apos;ve made<span className="oss-green">.</span></h2>
            </div>
            <p>Tools, experiments and open-source projects. Find something useful and make it your own.</p>
          </div>
          <div className="oss-tb oss-rv">
            <div className="oss-fl">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  className={`oss-f${filter === f.id ? " on" : ""}`}
                  onClick={() => setFilter(f.id)}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <label className="oss-se">
              ⌕{" "}
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Find something..."
                aria-label="Search projects"
              />
              <span className="oss-mono" style={{ fontSize: 9 }}>/</span>
            </label>
          </div>
          <div className="oss-grid">
            {filtered.map((p) => {
              const key = (p.slug ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
              const gh = ghStats[key];
              const href = gh?.url || p.repoUrl || GH;
              return (
                <a
                  key={p.id}
                  className="oss-card oss-rv"
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="oss-ct">
                    <div className="oss-sym">{p.symbol ?? "⚙"}</div>
                    <span className="oss-ar">↗</span>
                  </div>
                  <h3>{p.name}</h3>
                  <p>{p.description}</p>
                  <div className="oss-cb">
                    <div className="oss-cs">
                      {(p.technologies ?? []).slice(0, 3).map((t) => (
                        <span key={t} className="oss-sk">{t}</span>
                      ))}
                    </div>
                    <span className="oss-ty">{(p.category ?? filterCatOf(p)).toUpperCase()}</span>
                  </div>
                  {gh && (
                    <div className="oss-gs">
                      <span>★ {gh.stars}</span>
                      <span>⑂ {gh.forks}</span>
                      <span>↻ {gh.pushed}</span>
                    </div>
                  )}
                </a>
              );
            })}
            {filtered.length === 0 && (
              <div className="oss-empty">No projects found. Try another search.</div>
            )}
          </div>
        </section>

        <section className="oss-wrap" id="terminal" style={{ padding: "30px 0 100px" }}>
          <div className="oss-sh oss-rv">
            <div>
              <div className="oss-eyebrow">03 / INTERACTIVE CORNER</div>
              <h2>Take the terminal<span className="oss-green">.</span></h2>
            </div>
            <p>Tab to autocomplete, ↑ ↓ for history. There are a few secrets in here.</p>
          </div>
          <div
            className="oss-term oss-rv"
            ref={termBodyRef}
            onClick={() => termInputRef.current?.focus()}
          >
            <div className="oss-tbar">
              <span className="oss-dot" /><span className="oss-dot" /><span className="oss-dot" />
              <span className="oss-tt">deecodek-labs — interactive shell</span>
            </div>
            <div className="oss-tbody" id="tb">
              <div ref={termOutRef} />
              <div className="oss-ti">
                <span className="p">visitor@deecodek:~$</span>
                <input
                  ref={termInputRef}
                  autoComplete="off"
                  spellCheck={false}
                  aria-label="Terminal command"
                  placeholder="type help..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const v = e.currentTarget.value.trim();
                      if (!v) return;
                      histRef.current.push(v);
                      histIdxRef.current = histRef.current.length;
                      runCmd(v);
                      e.currentTarget.value = "";
                    } else if (e.key === "ArrowUp") {
                      e.preventDefault();
                      if (histIdxRef.current > 0) {
                        histIdxRef.current -= 1;
                        e.currentTarget.value = histRef.current[histIdxRef.current] ?? "";
                      }
                    } else if (e.key === "ArrowDown") {
                      e.preventDefault();
                      if (histIdxRef.current < histRef.current.length - 1) {
                        histIdxRef.current += 1;
                        e.currentTarget.value = histRef.current[histIdxRef.current] ?? "";
                      } else {
                        histIdxRef.current = histRef.current.length;
                        e.currentTarget.value = "";
                      }
                    } else if (e.key === "Tab") {
                      e.preventDefault();
                      const keys = ["help", "projects", "about", "stack", "whoami", "ls", "repo", "theme", "date", "clear"];
                      const m = keys.filter((k) => k.startsWith(e.currentTarget.value.toLowerCase()));
                      if (m.length === 1) e.currentTarget.value = m[0];
                    }
                  }}
                />
              </div>
            </div>
          </div>
          <div className="oss-chips oss-rv">
            {["help", "projects", "about", "theme"].map((c) => (
              <button key={c} type="button" className="oss-chip" onClick={() => runCmd(c)}>{c}</button>
            ))}
          </div>
        </section>

        <section className="oss-contrib" id="contribute">
          <div className="oss-wrap oss-ci">
            <div className="oss-rv">
              <div className="oss-eyebrow">04 / OPEN INVITATION</div>
              <h2>Good ideas are<br /><span className="oss-green">better shared.</span></h2>
              <p>
                Found something useful? Have an idea? Want to contribute? Fork, tinker, open an issue or a PR.
                Every contribution counts.
              </p>
              <div className="oss-clone">
                <span className="oss-green">$</span>
                <span>{cloneCmd}</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(cloneCmd)
                      .then(() => showToast("Copied. Happy hacking."))
                      .catch(() => showToast("Select and copy manually."));
                  }}
                >
                  COPY
                </button>
              </div>
            </div>
            <div className="oss-rv" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <a href={GH} target="_blank" rel="noopener noreferrer" className="oss-btn oss-bp">Join us on GitHub →</a>
              <a href={GH} target="_blank" rel="noopener noreferrer" className="oss-btn oss-bs">Good first issues</a>
            </div>
          </div>
        </section>
      </main>

      <footer className="oss-footer">
        <div className="oss-wrap oss-fo">
          <a className="oss-brand" href="#top">
            <Image
              src={theme === "dark" ? "/logo-dark.png" : "/logo-light.png"}
              alt="DeeCodeK Labs"
              width={28}
              height={28}
              className="oss-logo-img"
              priority
            />
            <span>DeeCodeK<span className="oss-green"> Labs</span></span>
          </a>
          <span className="oss-fn">MADE WITH CURIOSITY · SHARED WITH EVERYONE · deecodeklabs.com</span>
          <div className="oss-flk">
            <a href="#projects">Projects</a>
            <a href={MAIN_SITE}>Main site</a>
            <a href={GH} target="_blank" rel="noopener noreferrer">GitHub ↗</a>
          </div>
        </div>
      </footer>

      <div className={`oss-toast${toast ? " show" : ""}`}>{toast}</div>
    </div>
  );
}
