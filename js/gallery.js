import { norm, buildURL, addFacet, removeFacet, readState, galleryPhotos } from './state.js';

export async function renderGallery() {
  const el = document.getElementById("gallery");
  const tagBar = document.getElementById("tag-filter-bar");
  const state = readState();

  try {
    const res = await fetch("/img/photos.json?v=" + Date.now());
    const incoming = await res.json();

    const photos = incoming.map(p => {
      let tags = [];
      if (Array.isArray(p.tags)) tags = p.tags;
      else if (p.tags) tags = String(p.tags).split(",").map(t => t.trim()).filter(Boolean);
      return { ...p, tags };
    });

    // newest-first
    photos.sort((a, b) => new Date(b.ts || b.date || 0) - new Date(a.ts || a.date || 0));

    // AND filter across all selected facets; always exclude `fontana` event photos.
    const filtered = photos.filter(p => {
      const pTags = (p.tags || []).map(norm);
      if (pTags.includes("fontana")) return false;
      const pCamera = norm(p.camera);
      const pLens = norm(p.lens);
      const pFilm = norm(p.film);
      if (state.tags.length && !state.tags.every(t => pTags.includes(t))) return false;
      if (state.camera.length && !state.camera.includes(pCamera)) return false;
      if (state.lens.length && !state.lens.includes(pLens)) return false;
      if (state.film.length && !state.film.includes(pFilm)) return false;
      return true;
    });

    galleryPhotos.current = filtered;

    renderFilterBar(tagBar, state);

    const html = filtered.map((p, idx) => cardHtml(p, idx, state)).join("");
    el.innerHTML = html || '<p class="center">No photos yet.</p>';
  } catch (err) {
    console.error("Failed to load photos.json", err);
    document.getElementById("gallery").innerHTML = '<p class="center">Loading photos…</p>';
  }
}

function renderFilterBar(tagBar, state) {
  const chips = []
    .concat((state.tags || []).map(v => ({ facet: "tags", label: "#" + v, v })))
    .concat((state.camera || []).map(v => ({ facet: "camera", label: "📷 " + v, v })))
    .concat((state.lens || []).map(v => ({ facet: "lens", label: "🔭 " + v, v })))
    .concat((state.film || []).map(v => ({ facet: "film", label: "🎞️ " + v, v })));

  if (!chips.length) {
    tagBar.hidden = true;
    document.title = "Chi Yuen Chung";
    return;
  }

  tagBar.hidden = false;
  tagBar.innerHTML = `
    <div class="tag-filter-inner">
      <span>Filters:</span>
      ${chips.map(c => `
        <span class="tag-pill tag-pill--solid">
          ${c.label}
          <a class="tag-clear" href="${buildURL(removeFacet(state, c.facet, c.v))}" aria-label="Remove ${c.label}">×</a>
        </span>
      `).join("")}
      <a class="tag-clear" href="/" aria-label="Clear all filters">Clear all</a>
    </div>
  `;
  document.title = `Filters — Chi Yuen Chung`;
}

function cardHtml(p, idx, state) {
  const base = p.base;
  const title = p.title || base;
  const alt = (p.alt || title || base).replace(/"/g, "&quot;");
  const camera = p.camera || "";
  const lens = p.lens || "";
  const film = p.film || "";
  const place = p.location || "";
  const shot = p.taken || "";
  const commit = p.date || "";

  const tagPills = (p.tags && p.tags.length)
    ? `<ul class="tags">` + p.tags.map(t => {
      const href = buildURL(addFacet(state, "tags", t));
      return `<li><a class="tag-pill" href="${href}">#${t}</a></li>`;
    }).join("") + `</ul>`
    : "";

  const metaList = (camera || lens || film || place) ? `
    <ul class="meta meta--stack">
      ${camera ? `<li class="meta-item">📷 <a class="meta-link" href="${buildURL(addFacet(state, 'camera', camera))}">${camera}</a></li>` : ""}
      ${lens ? `<li class="meta-item">🔭 <a class="meta-link" href="${buildURL(addFacet(state, 'lens', lens))}">${lens}</a></li>` : ""}
      ${film ? `<li class="meta-item">🎞️ <a class="meta-link" href="${buildURL(addFacet(state, 'film', film))}">${film}</a></li>` : ""}
      ${place ? `<li class="meta-item">📍 ${place}</li>` : ""}
    </ul>` : "";

  return `
    <article class="card" data-index="${idx}">
      <a class="tile-link" href="/img/${base}-2560.jpg" data-index="${idx}" aria-label="Open full-size image of ${alt}">
        <div class="square">
          <img
            src="/img/${base}-640.jpg"
            srcset="/img/${base}-640.jpg 640w,
                    /img/${base}-1280.jpg 1280w,
                    /img/${base}-2560.jpg 2560w"
            sizes="(max-width: 900px) 90vw, 480px"
            alt="${alt}" loading="lazy" />
          ${p.overlay ? `<div class="tile-overlay">${p.overlay}</div>` : ""}
        </div>
      </a>

      <span class="museum-label">
        <span class="caption">
          <span class="caption-title">${title}</span>
          ${shot ? `<time class="date-badge" datetime="${shot}">${shot}</time>`
      : (commit ? `<time class="date-badge" datetime="${commit}">${commit}</time>` : "")}
        </span>
        <span class="museum-rule" aria-hidden="true"></span>
        ${metaList}
        ${tagPills}
      </span>
    </article>
  `;
}
