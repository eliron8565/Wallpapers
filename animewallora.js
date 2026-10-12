"use strict";

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));
const state = { gifs: [], hosted: [], series: "All", mode: "all", search: "", sort: "featured", pageSize: 12, visible: 12, selected: null, lastFocus: null };
const favorites = new Set();
try { for (const id of JSON.parse(localStorage.getItem("animewallora-favorites") || "[]")) favorites.add(String(id)); } catch (_) {}

const e = (tag, className = "", text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};
const urlCheck = (value) => {
  try {
    const result = new URL(value);
    return result.protocol === "https:" ? result.href : null;
  } catch (_) { return null; }
};
const validGiphy = (id) => /^[A-Za-z0-9]{12,32}$/.test(id);
const embedURL = (item) => "https://giphy.com/embed/" + item.giphyId;
const allItems = () => [...state.gifs, ...state.hosted];
const isHosted = (item) => item.type === "hosted-gif" || item.type === "hosted-video";
const allowedDownload = (item) => isHosted(item) && Boolean(urlCheck(item.downloadUrl || item.url));

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timeout);
  showToast.timeout = setTimeout(() => toast.classList.remove("show"), 2600);
}

function updateFavoriteCounter() {
  const count = $("#favoriteCount");
  count.textContent = String(favorites.size);
  count.style.color = favorites.size ? "#ffa7bf" : "";
  $("#favoritesNav").setAttribute("aria-pressed", String(state.mode === "saved"));
}

function toggleFavorite(item) {
  if (favorites.has(item.id)) favorites.delete(item.id);
  else favorites.add(item.id);
  try { localStorage.setItem("animewallora-favorites", JSON.stringify([...favorites])); } catch (_) {}
  showToast(favorites.has(item.id) ? "Saved to your favorites" : "Removed from favorites");
  render();
  if (state.selected && state.selected.id === item.id) updateViewerFavorite(item);
}

function filterItems() {
  const needle = state.search;
  let results = allItems().filter((item) => {
    if (state.mode === "saved" && !favorites.has(item.id)) return false;
    if (state.mode === "featured" && !item.featured) return false;
    if (state.mode === "downloadable" && !allowedDownload(item)) return false;
    if (state.series !== "All" && item.series !== state.series) return false;
    if (needle && ![item.title, item.series, item.character, item.creator, ...(item.tags || [])].join(" ").toLowerCase().includes(needle)) return false;
    return true;
  });
  if (state.sort === "name") results = results.sort((a, b) => a.title.localeCompare(b.title));
  else if (state.sort === "newest") results = results.reverse();
  else results = results.sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
  return results;
}

function renderCategories() {
  const names = ["All", "Jujutsu Kaisen", "Demon Slayer", "Naruto", "Bleach", "One Piece", "Dragon Ball", "Chainsaw Man", "Attack on Titan", ...state.hosted.map(x => x.series)];
  const unique = [...new Set(names)].filter(s => s === "All" || allItems().some(x => x.series === s));
  if (!unique.includes(state.series)) state.series = "All";
  const holder = $("#categoryBar");
  holder.replaceChildren();
  for (const name of unique) {
    const count = name === "All" ? allItems().length : allItems().filter(x => x.series === name).length;
    const button = e("button", "category" + (state.series === name ? " active" : ""), name + "  " + count);
    button.setAttribute("aria-pressed", String(state.series === name));
    button.onclick = () => { state.series = name; state.visible = state.pageSize; render(); };
    holder.append(button);
  }
}

function makeMedia(item, className = "") {
  if (item.type === "giphy") {
    const frame = e("iframe", className);
    frame.src = embedURL(item);
    frame.title = item.title + " · GIPHY animated embed";
    frame.loading = "lazy";
    frame.allowFullscreen = true;
    frame.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
    return frame;
  }
  const safeURL = urlCheck(item.url);
  if (item.type === "hosted-video") {
    const video = e("video", className);
    video.src = safeURL;
    video.autoplay = true;
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.preload = "metadata";
    video.setAttribute("aria-label", item.title);
    return video;
  }
  const image = e("img", className);
  image.loading = "lazy";
  image.alt = item.title + " animated GIF";
  image.src = safeURL;
  return image;
}

function gifCard(item) {
  const card = e("article", "wallpaper-card gif-only-card");
  const media = e("div", "card-media");
  media.append(makeMedia(item));
  media.append(e("span", "media-chip", isHosted(item) ? "● DOWNLOADABLE LOOP" : "● ANIMATED GIF"));
  const heart = e("button", "heart" + (favorites.has(item.id) ? " liked" : ""), favorites.has(item.id) ? "♥" : "♡");
  heart.type = "button";
  heart.setAttribute("aria-label", (favorites.has(item.id) ? "Remove" : "Add") + " favorite: " + item.title);
  heart.onclick = () => toggleFavorite(item);
  media.append(heart);
  const body = e("div", "card-body");
  body.append(e("h3", "", item.title), e("p", "", item.series + " · " + (item.character || item.creator)));
  const footer = e("div", "card-footer");
  footer.append(e("span", "license", isHosted(item) ? "Creator-approved media" : "Embedded via GIPHY"));
  const button = e("button", "", isHosted(item) ? "⤢ Preview & download" : "⤢ Full preview");
  button.type = "button";
  button.onclick = () => openViewer(item);
  footer.append(button);
  body.append(footer);
  card.append(media, body);
  return card;
}

function render() {
  renderCategories();
  updateFavoriteCounter();
  const results = filterItems();
  $("#totalCount").textContent = String(allItems().length).padStart(2, "0");
  $("#heroCount").textContent = allItems().length + " animated wallpapers";
  $("#resultCount").textContent = results.length + (results.length === 1 ? " GIF / loop" : " GIFs / loops");
  $("#galleryHeading").textContent = state.mode === "saved" ? "Your saved anime GIFs" : state.mode === "featured" ? "Featured animated wallpapers" : state.mode === "downloadable" ? "Downloadable animated wallpapers" : state.series !== "All" ? state.series + " GIFs" : "All animated wallpapers";
  $$(".type-tab").forEach(b => {
    b.classList.toggle("active", b.dataset.filter === state.mode);
    b.setAttribute("aria-pressed", String(b.dataset.filter === state.mode));
  });
  $("#downloadableTab").hidden = !state.hosted.some(allowedDownload);
  $("#galleryGrid").replaceChildren(...results.slice(0, state.visible).map(gifCard));
  $("#emptyState").hidden = results.length !== 0;
  $("#loadMore").hidden = results.length <= state.visible;
  $("#clearFilters").hidden = state.mode === "all" && state.series === "All" && !state.search;
}

function showMode(next) {
  state.mode = next;
  state.visible = state.pageSize;
  render();
  $("#wallpapers").scrollIntoView({ behavior: "smooth" });
}
function reset() {
  state.series = "All"; state.mode = "all"; state.search = ""; state.sort = "featured"; state.visible = state.pageSize;
  $("#searchInput").value = ""; $("#sortSelect").value = "featured";
  render();
}

function updateViewerFavorite(item) {
  $("#viewerFavorite").textContent = favorites.has(item.id) ? "♥ Saved to favorites" : "♡ Save to favorites";
}

function openViewer(item) {
  state.lastFocus = document.activeElement;
  state.selected = item;
  $("#viewerTitle").textContent = item.title;
  $("#viewerCategory").textContent = item.series + " / ANIMATED";
  $("#viewerDescription").textContent = (item.character ? "Featuring " + item.character + ". " : "") + (isHosted(item) ? "Animated wallpaper hosted by AnimeWallora with redistribution permission." : "Animated GIF viewed through its original GIPHY embed.");
  $("#viewerArtist").textContent = item.creator;
  const source = $("#viewerSource");
  source.href = urlCheck(item.source) || "https://giphy.com";
  source.textContent = isHosted(item) ? "View creator & license ↗" : "GIPHY creator & original GIF ↗";
  $("#viewerArt").replaceChildren(makeMedia(item));
  const dl = $("#viewerDownload");
  dl.hidden = !allowedDownload(item);
  if (allowedDownload(item)) {
    dl.href = urlCheck(item.downloadUrl || item.url);
    dl.removeAttribute("download");
  } else dl.removeAttribute("href");
  $("#viewerHint").textContent = allowedDownload(item) ? "This creator-approved loop is available as a direct download." : "This GIF is played from GIPHY and is not copied or downloadable directly from this website.";
  updateViewerFavorite(item);
  $("#viewerFavorite").onclick = () => toggleFavorite(item);
  $("#viewer").hidden = false;
  document.body.style.overflow = "hidden";
  $("#viewerClose").focus();
}
function closeViewer() {
  $("#viewer").hidden = true;
  $("#viewerArt").replaceChildren();
  document.body.style.overflow = "";
  state.selected = null;
  if (state.lastFocus && state.lastFocus.isConnected && typeof state.lastFocus.focus === "function") state.lastFocus.focus();
}
function surprise() {
  const pool = filterItems();
  const pick = pool[Math.floor(Math.random() * pool.length)] || allItems()[0];
  if (pick) openViewer(pick);
}
async function loadCatalog() {
  const [giphyResult, hostedResult] = await Promise.allSettled([
    fetch("./data/anime-gifs.json", { cache: "no-store" }).then(r => { if (!r.ok) throw Error("GIF catalog missing"); return r.json(); }),
    fetch("./data/wallpapers.json", { cache: "no-store" }).then(r => { if (!r.ok) throw Error("Hosted catalog missing"); return r.json(); })
  ]);
  if (giphyResult.status === "fulfilled" && Array.isArray(giphyResult.value)) {
    state.gifs = giphyResult.value.filter(item => item && validGiphy(item.giphyId) && item.title && item.series && item.creator)
      .map(item => ({ ...item, id: "giphy-" + item.giphyId, type: "giphy" }));
  } else showToast("GIF gallery couldn't load. Please refresh.");
  if (hostedResult.status === "fulfilled" && Array.isArray(hostedResult.value)) {
    state.hosted = hostedResult.value.filter(item => {
      if (!item || item.permission === undefined || !urlCheck(item.url)) return false;
      if (item.type === "video") return /\.(mp4|webm)(\?|$)/i.test(item.url);
      if (item.type === "image") return /\.gif(\?|$)/i.test(item.url);
      return false;
    }).map((item, i) => ({
      ...item,
      id: item.id || "hosted-" + i,
      series: item.category || "Other anime",
      character: item.description || "",
      tags: [item.category || "anime"],
      featured: false,
      type: item.type === "video" ? "hosted-video" : "hosted-gif"
    }));
  }
  render();
}
$$(".type-tab").forEach(b => b.onclick = () => showMode(b.dataset.filter));
$("#favoritesNav").onclick = () => showMode(state.mode === "saved" ? "all" : "saved");
$("#searchInput").oninput = ev => { state.search = ev.target.value.trim().toLowerCase(); state.visible = state.pageSize; render(); };
$("#sortSelect").onchange = ev => { state.sort = ev.target.value; render(); };
$("#clearFilters").onclick = reset; $("#emptyReset").onclick = reset;
$("#loadMore").onclick = () => { state.visible += state.pageSize; render(); };
$("#headerSearch").onclick = () => { $("#wallpapers").scrollIntoView({ behavior: "smooth" }); $("#searchInput").focus({ preventScroll: true }); };
$("#surpriseHero").onclick = surprise;
$("#viewLive").onclick = () => showMode("all");
$("#viewerClose").onclick = closeViewer;
$("#viewerScrim").onclick = closeViewer;
document.addEventListener("keydown", ev => {
  if (ev.key === "Escape" && !$("#viewer").hidden) closeViewer();
  if (ev.key === "/" && $("#viewer").hidden && !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) {
    ev.preventDefault(); $("#searchInput").focus();
  }
});
$("#year").textContent = new Date().getFullYear();
loadCatalog();
