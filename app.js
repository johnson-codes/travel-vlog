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

// Soft pastel placeholders until a real thumbnail exists
const PALETTE = [["#f6d7c3", "#eab69a"], ["#cfe3dc", "#a9cbbf"], ["#dcd6ee", "#bdb3de"], ["#f3e3b8", "#e3cb8a"], ["#cfdcef", "#a9c0e0"]];

function thumbStyle(v, i) {
  if (v.thumbnail && SAFE_PATH.test(v.thumbnail)) return `background-image:url('${esc(v.thumbnail)}')`;
  if (v.youtube && YT_ID.test(v.youtube)) return `background-image:url('https://i.ytimg.com/vi/${v.youtube}/hqdefault.jpg')`;
  const [a, b] = PALETTE[i % PALETTE.length];
  return `background:linear-gradient(160deg, ${a}, ${b})`;
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
  return `
    <a class="card" href="#/v/${encodeURIComponent(v.slug)}">
      <div class="thumb" style="${thumbStyle(v, i)}"><span class="play" aria-hidden="true"></span></div>
      <div class="card-body">
        <div class="meta">${esc(v.location || v.country || "")}${(v.location || v.country) && v.date ? " · " : ""}${esc(fmtDate(v.date))}</div>
        <h3>${esc(v.title)}</h3>
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
  const place = (v) => v.region || v.country;
  const countries = ["All", ...new Set(videos.map(place).filter(Boolean))];
  const list = activeFilter === "All" ? videos : videos.filter((v) => place(v) === activeFilter);

  const latest = videos[0];
  const regions = countries.length - 1;

  app.innerHTML = `
    <section class="intro">
      <div class="intro-text">
        <span class="kicker"><span class="dot"></span>Western Canada · ${new Date().getFullYear()}</span>
        <h1>Stories from the <em>road</em>.</h1>
        <p>Short films from the lakes, peaks and back roads I've wandered, made to feel like you were there.</p>
        <div class="intro-actions">
          <a class="btn" href="#/v/${encodeURIComponent(latest.slug)}"><span class="btn-play" aria-hidden="true"></span>Watch latest film</a>
          <a class="link-quiet" href="#films">Browse all →</a>
        </div>
        <dl class="stats">
          <div><dt>${videos.length}</dt><dd>films</dd></div>
          <div><dt>${regions}</dt><dd>${regions === 1 ? "region" : "regions"}</dd></div>
          <div><dt>1080p</dt><dd>quality</dd></div>
        </dl>
      </div>
      <a class="intro-media" href="#/v/bow-lake-glacier-blue" aria-label="Watch Bow Lake: Glacier Blue">
        <video src="videos/hero-loop.mp4" poster="images/hero-poster.jpg" autoplay muted loop playsinline aria-hidden="true"></video>
        <span class="media-tag"><span class="dot"></span>Now showing · Bow Lake, AB</span>
      </a>
    </section>

    <section id="films">
      <div class="filters" role="group" aria-label="Filter by region">
        ${countries.map((c) => `<button class="chip" aria-pressed="${c === activeFilter}" data-filter="${esc(c)}">${esc(c)}</button>`).join("")}
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
    app.innerHTML = `<div class="state"><h2>Vlog not found</h2><a class="link" href="#/">Back to all vlogs</a></div>`;
    return;
  }
  app.innerHTML = `
    <article class="video-page">
      <a class="back" href="#/">← All vlogs</a>
      <div class="player">${playerHTML(v)}</div>
      <div class="video-info">
        <span class="eyebrow">${esc(v.location || v.country || "")} · ${esc(fmtDate(v.date))}</span>
        <h1>${esc(v.title)}</h1>
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
      <h1>Hi, I'm Johnson.</h1>
      <p>I travel, film what I find, and share it here: the food, the people, the long bus rides and the views that make it all worth it.</p>
      <p>New vlogs drop whenever I find good Wi-Fi. Thanks for watching!</p>
      <p><a class="link" href="#/">Watch the vlogs →</a></p>
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
