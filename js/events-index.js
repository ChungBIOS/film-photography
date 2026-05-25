// Reads photos.json, groups by `event`, renders one card per event with a cover image.
// Picks the newest photo per event as the cover.

async function renderEvents() {
  const el = document.getElementById('events');
  if (!el) return;

  try {
    const res = await fetch('/img/photos.json?v=' + Date.now());
    const photos = await res.json();

    const byEvent = new Map();
    for (const p of photos) {
      if (!p.event) continue;
      const list = byEvent.get(p.event) || [];
      list.push(p);
      byEvent.set(p.event, list);
    }

    // Build event metadata. Slugs are `<name>_<year>`, e.g. "wild_2026".
    const events = [...byEvent.entries()].map(([slug, list]) => {
      const [name, year] = slug.split('_');
      list.sort((a, b) => new Date(b.ts || b.date || 0) - new Date(a.ts || a.date || 0));
      const cover = list[0];
      const dates = list.map(p => p.taken || p.date).filter(Boolean).sort();
      const dateLabel = dates.length
        ? (dates[0].slice(0, 7) === dates[dates.length - 1].slice(0, 7)
            ? dates[0].slice(0, 7)             // single month: 2026-05
            : `${dates[0].slice(0, 7)} → ${dates[dates.length - 1].slice(0, 7)}`)
        : year;
      return {
        slug,
        title: name.charAt(0).toUpperCase() + name.slice(1),
        year,
        dateLabel,
        count: list.length,
        cover,
      };
    });

    // Newest event first.
    events.sort((a, b) => b.year.localeCompare(a.year));

    el.innerHTML = events.map(e => `
      <a class="event-card" href="/events/${e.slug}/">
        <div class="square">
          <img
            src="/img/${e.cover.base}-640.jpg"
            srcset="/img/${e.cover.base}-640.jpg 640w,
                    /img/${e.cover.base}-1280.jpg 1280w,
                    /img/${e.cover.base}-2560.jpg 2560w"
            sizes="(max-width: 900px) 90vw, 480px"
            alt="${e.title} cover" loading="lazy" />
        </div>
        <span class="museum-label">
          <span class="caption">
            <span class="caption-title">${e.title}</span>
            <time class="date-badge">${e.dateLabel}</time>
          </span>
          <span class="museum-rule" aria-hidden="true"></span>
          <ul class="meta meta--stack">
            <li class="meta-item">${e.count} photo${e.count === 1 ? '' : 's'}</li>
          </ul>
        </span>
      </a>
    `).join('') || '<p class="center">No events yet.</p>';
  } catch (err) {
    console.error('Failed to load events', err);
    el.innerHTML = '<p class="center">Loading…</p>';
  }
}

renderEvents();
