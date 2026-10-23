// Johnson Travels — tiny static vlog site. Content lives in videos.json.
const app = document.getElementById("app");
document.getElementById("year").textContent = new Date().getFullYear();

let videos = [];
let activeFilter = "All";

// --- helpers -------------------------------------------------------------
const esc = (s = "") =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const YT_ID = /^[A-Za-z0-9_-]{11}$/;
const SAFE_PATH = /^(videos|images)\/[A-Za-z0-9._\/-]+$/; // local files only

const fmtDate = (d) =>
  d ? new Date(d + "T00:00:00").toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "";

const PALETTE = ["#c2410c", "#0f766e", "#7c3aed", "#b45309", "#1d4ed8", "#be185d"];

function thumbStyle(v, i) {
  if (v.thumbnail && SAFE_PATH.test(v.thumbnail)) return `background-image:url('${esc(v.thumbnail)}')`;
  if (v.youtube && YT_ID.test(v.youtube)) return `background-image:url('https://i.ytimg.com/vi/${v.youtube}/hqdefault.jpg')`;
  const c = PALETTE[i % PALETTE.length];
  return `background:linear-gradient(135deg, ${c}, #111)`;
}

function playerHTML(v) {
  if (v.youtube && YT_ID.test(v.youtube)) {
    return `<iframe src="https://www.youtube-nocookie.com/embed/${v.youtube}" title="${esc(v.title)}"
      allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen loading="lazy"></iframe>`;
  }
  if (v.file && SAFE_PATH.test(v.file)) {
    const poster = v.thumbnail && SAFE_PATH.test(v.thumbnail) ? ` poster="${esc(v.thumbnail)}"` : "";
    return `<video src="${esc(v.file)}" controls playsinline preload="metadata"${poster}></video>`;
  }
  return `<div class="empty"><div><strong>Video coming soon</strong><br>Add a YouTube ID or file in videos.json</div></div>`;
}

function card(v, i) {
  const hasImg = (v.thumbnail && SAFE_PATH.test(v.thumbnail)) || (v.youtube && YT_ID.test(v.youtube));
  return `
    <a class="card" href="#/v/${encodeURIComponent(v.slug)}">
      <div class="thumb ${hasImg ? "" : "ph"}" style="${thumbStyle(v, i)}">
        ${hasImg ? "" : esc((v.country || "✈").slice(0, 2))}
        <span class="play" aria-hidden="true"></span>
        ${v.country ? `<span class="badge">${esc(v.country)}</span>` : ""}
      </div>
      <div class="card-body">
        <h3>${esc(v.title)}</h3>
        <div class="meta">${esc(v.location || "")}${v.location && v.date ? " · " : ""}${esc(fmtDate(v.date))}</div>
      </div>
    </a>`;
}

function setNav(route) {
  document.querySelectorAll(".site-header nav a").forEach((a) => {
    const match = a.getAttribute("href") === "#/" + route;
    a.toggleAttribute("aria-current", match);
    if (match) a.setAttribute("aria-current", "page");
  });
}

// --- views ---------------------------------------------------------------
function renderHome() {
  setNav("");
  if (!videos.length) {
    app.innerHTML = `<div class="state"><h2>No vlogs yet</h2><p>Add your first trip to videos.json and it will appear here.</p></div>`;
    return;
  }
  const featured = videos.find((v) => v.featured) || videos[0];
  const countries = ["All", ...new Set(videos.map((v) => v.country).filter(Boolean))];
  const list = activeFilter === "All" ? videos : videos.filter((v) => v.country === activeFilter);

  app.innerHTML = `
    <section class="hero" style="${thumbStyle(featured, 0)}">
      <div class="hero-body">
        <span class="eyebrow">Latest from the road</span>
        <h1>${esc(featured.title)}</h1>
        <p>${esc(featured.summary || "")}</p>
        <a class="btn" href="#/v/${encodeURIComponent(featured.slug)}">▶ Watch the vlog</a>
      </div>
    </section>

    <section>
      <div class="section-head">
        <h2>All vlogs</h2>
        <div class="filters" role="group" aria-label="Filter by country">
          ${countries.map((c) => `<button class="chip" aria-pressed="${c === activeFilter}" data-filter="${esc(c)}">${esc(c)}</button>`).join("")}
        </div>
      </div>
      <div class="grid">${list.map((v) => card(v, videos.indexOf(v))).join("")}</div>
    </section>`;

  app.querySelectorAll("[data-filter]").forEach((b) =>
    b.addEventListener("click", () => {
      activeFilter = b.dataset.filter;
      renderHome();
    })
  );
}

function renderVideo(slug) {
  setNav("");
  const v = videos.find((x) => x.slug === slug);
  if (!v) {
    app.innerHTML = `<div class="state"><h2>Vlog not found</h2><a class="btn ghost" href="#/">← Back to all vlogs</a></div>`;
    return;
  }
  app.innerHTML = `
    <article class="video-page">
      <a class="back" href="#/">← All vlogs</a>
      <div class="player">${playerHTML(v)}</div>
      <div class="video-info">
        <span class="eyebrow">${esc(v.country || "")}</span>
        <h1>${esc(v.title)}</h1>
        <div class="meta">📍 ${esc(v.location || "Somewhere")} · ${esc(fmtDate(v.date))}</div>
        <p class="story">${esc(v.story || v.summary || "")}</p>
        ${v.tags?.length ? `<div class="tags">${v.tags.map((t) => `<span class="tag">#${esc(t)}</span>`).join("")}</div>` : ""}
      </div>
    </article>`;
  window.scrollTo(0, 0);
}

function renderAbout() {
  setNav("about");
  app.innerHTML = `
    <section class="prose">
      <span class="eyebrow">About</span>
      <h1>Hi, I'm Johnson.</h1>
      <p>I travel, film what I find, and share it here: the food, the people, the long bus rides and the views that make it all worth it.</p>
      <p>New vlogs drop whenever I find good Wi-Fi. Thanks for watching!</p>
      <a class="btn" href="#/">Watch the vlogs</a>
    </section>`;
}

function route() {
  const hash = location.hash.replace(/^#\/?/, "");
  if (hash.startsWith("v/")) return renderVideo(decodeURIComponent(hash.slice(2)));
  if (hash === "about") return renderAbout();
  renderHome();
}

// --- boot ----------------------------------------------------------------
fetch("videos.json", { cache: "no-cache" })
  .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
  .then((data) => {
    videos = data.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
    route();
  })
  .catch(() => {
    app.innerHTML = `<div class="state"><h2>Couldn't load vlogs</h2><p>Please refresh the page.</p></div>`;
  });

window.addEventListener("hashchange", route);
