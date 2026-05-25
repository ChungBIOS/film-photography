// URL-based filter state + small helpers shared between gallery and lightbox.

export const norm = s => (s || "").toString().trim().toLowerCase();
export const uniq = arr => [...new Set(arr)];
export const getAll = (search, key) =>
  (search.get(key) || "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean)
    .map(norm);

export function buildURL(state) {
  const qs = new URLSearchParams();
  if (state.tags?.length) qs.set("tags", uniq(state.tags).join(","));
  if (state.camera?.length) qs.set("camera", uniq(state.camera).join(","));
  if (state.lens?.length) qs.set("lens", uniq(state.lens).join(","));
  if (state.film?.length) qs.set("film", uniq(state.film).join(","));
  const s = qs.toString();
  return s ? "/?" + s : "/";
}

export function addFacet(state, facet, value) {
  const next = JSON.parse(JSON.stringify(state));
  const v = norm(value);
  next[facet] = uniq([...(next[facet] || []), v]);
  return next;
}

export function removeFacet(state, facet, value) {
  const next = JSON.parse(JSON.stringify(state));
  const v = norm(value);
  next[facet] = (next[facet] || []).filter(x => x !== v);
  return next;
}

export function readState() {
  const params = new URLSearchParams(location.search);
  return {
    tags: getAll(params, "tags"),
    camera: getAll(params, "camera"),
    lens: getAll(params, "lens"),
    film: getAll(params, "film"),
  };
}

// Shared mutable handle so the lightbox can step through the same filtered list
// the gallery rendered.
export const galleryPhotos = { current: [] };
