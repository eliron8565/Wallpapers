"use strict";
const $ = q => document.querySelector(q);
const $$ = q => [...document.querySelectorAll(q)];
const state = {gifs:[], images:[], mode:"all", category:"All", search:"", sort:"featured", visible:12, selected:null, lastFocus:null};
const favorites = new Set();
try {for (const id of JSON.parse(localStorage.getItem("animewallora-favorites") || "[]")) favorites.add(String(id));} catch {}
function node(tag, cls, txt) {
  const el = document.createElement(tag);
  if (cls) el.className = cls;
  if (txt !== undefined) el.textContent = txt;
  return el;
}
function httpsURL(url) {
  try { const u = new URL(url); return u.protocol === "https:" ? u.href : null; } catch { return null; }
}
function mediaType(item) {
  return item.type === "giphy" ? "GIF" : item.type === "video" ? "VIDEO" : "IMAGE";
}
function isGIF(item) {return item.type === "giphy" || item.type === "video" || item.type === "animated-gif";}
function all() {
  // Mix recently added real GIFs and images, instead of burying images after every GIF.
  const gifs=[...state.gifs].reverse(), images=[...state.images].reverse();
  const mixed=[];
  const length=Math.max(gifs.length, images.length);
  for(let i=0;i<length;i++) {
    if(gifs[i]) mixed.push(gifs[i]);
    if(images[i]) mixed.push(images[i]);
  }
  return mixed;
}
const BLOCKED_ADULT_TAGS = /\b(?:nsfw|hentai|ecchi|nude|nudity|naked|porn(?:ography)?|sexual|sex|lewd|fetish|explicit|erotic|r18|r-18|18\+|lingerie|bikini|underwear|boobs?|breasts?|nipples?|onlyfans|rule\s*34|rule34)\b/i;
function safeForWork(item) {
  if (!item || item.contentRating !== "sfw") return false;
  const meta = [item.title, item.series, item.category, item.character, item.description, ...(item.tags || [])].filter(Boolean).join(" ");
  return !BLOCKED_ADULT_TAGS.test(meta);
}

function saveLikes() {try {localStorage.setItem("animewallora-favorites", JSON.stringify([...favorites]));} catch {}}
function toast(message) {
  const el = $("#toast");
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => el.classList.remove("show"), 2600);
}
function updateLikes() {
  $("#favoriteCount").textContent = String(favorites.size);
  $("#favoritesNav").setAttribute("aria-pressed", String(state.mode === "saved"));
}
function toggleFavorite(item) {
  if(favorites.has(item.id)) favorites.delete(item.id); else favorites.add(item.id);
  saveLikes();
  toast(favorites.has(item.id) ? "Added to favorites" : "Removed from favorites");
  render();
  if (state.selected && state.selected.id === item.id) {
    $("#viewerFavorite").textContent = favorites.has(item.id) ? "♥ Saved" : "♡ Save to favorites";
  }
}
function matches(item) {
  if (state.mode === "gifs" && !isGIF(item)) return false;
  if (state.mode === "images" && isGIF(item)) return false;
  if (state.mode === "saved" && !favorites.has(item.id)) return false;
  if (state.category !== "All" && (item.series || item.category) !== state.category) return false;
  const term = state.search;
  if (term && ![item.title,item.creator,item.series,item.category,item.character,item.description,...(item.tags||[])].filter(Boolean).join(" ").toLowerCase().includes(term)) return false;
  return true;
}
function results() {
  const items = all().filter(matches);
  if (state.sort === "name") items.sort((a,b) => a.title.localeCompare(b.title));
  else if (state.sort === "newest") return items;
  else items.sort((a,b) => Number(!!b.featured) - Number(!!a.featured));
  return items;
}
function renderCategories() {
  const list = state.mode === "gifs" ? state.gifs : state.mode === "images" ? state.images : all();
  const order = ["Jujutsu Kaisen","Demon Slayer","Naruto","Bleach","One Piece","Dragon Ball","Chainsaw Man","Fantasy","Characters","Manga","Sintel"];
  const names = ["All", ...new Set(list.map(x => x.series || x.category).filter(Boolean))];
  const sorted = [names[0], ...names.slice(1).sort((a,b) => {
    const ai=order.indexOf(a), bi=order.indexOf(b);
    return (ai<0?100:ai)-(bi<0?100:bi) || a.localeCompare(b);
  })];
  if (!sorted.includes(state.category)) state.category = "All";
  $("#categoryBar").replaceChildren(...sorted.map(name => {
    const count = name === "All" ? list.length : list.filter(x => (x.series || x.category) === name).length;
    const button = node("button","category"+(state.category===name?" active":""),name+"  "+count);
    button.type="button";
    button.setAttribute("aria-pressed",String(state.category===name));
    button.onclick=()=>{state.category=name;state.visible=12;render();};
    return button;
  }));
}
function frame(item) {
  if (item.type === "giphy") {
    const f=node("iframe");
    f.src="https://giphy.com/embed/"+item.giphyId;
    f.title=item.title+" — GIPHY player";
    f.loading="lazy";
    f.allowFullscreen=true;
    return f;
  }
  if (item.type === "video") {
    const video=node("video");
    video.src=httpsURL(item.url);
    video.autoplay=true;video.loop=true;video.muted=true;video.playsInline=true;video.preload="metadata";
    video.setAttribute("aria-label",item.title);
    return video;
  }
  const image=node("img");
  image.src=httpsURL(item.thumbnail||item.url);
  image.alt=item.title+" by "+item.creator;
  image.loading="lazy";
  image.decoding="async";
  image.onerror=()=>{if(item.thumbnail&&image.src!==item.url) image.src=httpsURL(item.url);};
  return image;
}
function makeCard(item) {
  const card=node("article","wallpaper-card"+(isGIF(item)?" gif-card":" image-card"));
  const media=node("div","card-media");
  media.append(frame(item));
  media.append(node("span","media-chip",isGIF(item)?"● LIVE GIF":"▣ WALLPAPER IMAGE"));
  const heart=node("button","heart"+(favorites.has(item.id)?" liked":""),favorites.has(item.id)?"♥":"♡");
  heart.type="button";heart.setAttribute("aria-label","Toggle favorite: "+item.title);
  heart.onclick=()=>toggleFavorite(item);media.append(heart);
  const body=node("div","card-body");
  body.append(node("h3","",item.title));
  body.append(node("p","",(item.series||item.category)+" · "+(item.character||item.creator)));
  const foot=node("div","card-footer");
  foot.append(node("span","license",item.type==="giphy"?"Original GIPHY embed":item.license));
  const action=node("button","",item.type==="giphy"?"⤢ Preview":"↓ View & download");
  action.type="button";action.onclick=()=>openViewer(item);foot.append(action);
  body.append(foot);
  card.append(media,body);
  return card;
}
function render() {
  renderCategories();updateLikes();
  const filtered=results();
  $("#totalCount").textContent=String(all().length).padStart(2,"0");
  $("#heroCount").textContent=state.gifs.length+" GIFs · "+state.images.length+" images · SFW only";
  $("#resultCount").textContent=filtered.length+" wallpaper"+(filtered.length===1?"":"s");
  $("#galleryHeading").textContent=state.mode==="gifs"?"Animated anime GIFs":state.mode==="images"?"Downloadable anime artwork":state.mode==="saved"?"Your favorites":state.category!=="All"?state.category+" wallpapers":"Anime wallpapers & GIFs";
  $$(".type-tab").forEach(x=>{x.classList.toggle("active",x.dataset.filter===state.mode);x.setAttribute("aria-pressed",String(x.dataset.filter===state.mode));});
  $("#galleryGrid").replaceChildren(...filtered.slice(0,state.visible).map(makeCard));
  $("#emptyState").hidden=filtered.length!==0;
  $("#loadMore").hidden=filtered.length<=state.visible;
  $("#clearFilters").hidden=state.mode==="all"&&state.category==="All"&&!state.search;
}
function switchMode(mode) {state.mode=mode;state.category="All";state.visible=12;render();$("#wallpapers").scrollIntoView({behavior:"smooth"});}
function reset() {
  state.mode="all";state.category="All";state.search="";state.sort="featured";state.visible=12;
  $("#searchInput").value="";$("#sortSelect").value="featured";render();
}
function reportURL(item) {
  const title="Incorrect or meme wallpaper: "+item.title;
  const body="Wallpaper: "+item.title+"\nAnime: "+(item.series||item.category)+"\nSource: "+(item.source||item.url)+"\n\nIssue: This GIF is a meme, has an overlay, does not match the anime, or is unsuitable as a wallpaper.\n\nSuggested correction:";
  return "https://github.com/eliron8565/Wallpapers/issues/new?title="+encodeURIComponent(title)+"&body="+encodeURIComponent(body);
}
function openViewer(item) {
  state.lastFocus=document.activeElement;state.selected=item;
  const name=item.series||item.category||"Anime artwork";
  $("#viewerCategory").textContent=name+" / "+mediaType(item);
  $("#viewerTitle").textContent=item.title;
  $("#viewerDescription").textContent=item.type==="giphy"?"Anime GIF streamed through GIPHY's official embed. This is not a direct downloadable wallpaper.":item.description||"Illustration by the credited independent artist.";
  $("#viewerArtist").textContent=item.creator;
  const src=$("#viewerSource");src.href=httpsURL(item.source)||"https://giphy.com";src.textContent=item.type==="giphy"?"View original GIF / creator ↗":"View artist and original file ↗";
  const licRow=$("#viewerLicenseRow");
  licRow.hidden=item.type==="giphy";
  const lic=$("#viewerLicense");
  if(item.type!=="giphy") {lic.textContent=item.license||"Creator license";lic.href=httpsURL(item.licenseUrl)||httpsURL(item.source)||"https://commons.wikimedia.org";}
  $("#viewerArt").replaceChildren(frame(item));
  const dl=$("#viewerDownload");
  dl.hidden=item.type==="giphy";
  if(item.type==="giphy") dl.removeAttribute("href");
  else {dl.href=httpsURL(item.downloadUrl||item.url);dl.textContent="↓ Download image";}
  $("#viewerHint").textContent=item.type==="giphy"?"GIPHY embeds can be previewed here; we do not mirror or offer these clips as downloads.":"The image is stored on Cloudflare R2 with the creator's CC license and credit.";
  const report=$("#viewerReport");
  report.href=reportURL(item);
  report.textContent=item.type==="giphy"?"Flag meme or wrong GIF ↗":"Report incorrect image ↗";
  $("#viewerFavorite").textContent=favorites.has(item.id)?"♥ Saved":"♡ Save to favorites";
  $("#viewerFavorite").onclick=()=>toggleFavorite(item);
  $("#viewer").hidden=false;document.body.style.overflow="hidden";$("#viewerClose").focus();
}
function closeViewer() {
  if(document.fullscreenElement && typeof document.exitFullscreen==="function") document.exitFullscreen().catch(()=>{});
  $("#viewer").hidden=true;$("#viewerArt").replaceChildren();
  document.body.style.overflow="";state.selected=null;
  if(state.lastFocus&&state.lastFocus.isConnected)state.lastFocus.focus();
}
async function load() {
  const [g,i]=await Promise.allSettled([
    fetch("./data/anime-gifs.json",{cache:"no-store"}).then(r=>{if(!r.ok)throw Error("GIF catalog unavailable");return r.json();}),
    fetch("./data/wallpapers.json",{cache:"no-store"}).then(r=>{if(!r.ok)throw Error("Image catalog unavailable");return r.json();})
  ]);
  if(g.status==="fulfilled"&&Array.isArray(g.value)) {
    state.gifs=g.value.filter(x=>safeForWork(x)&&/^[a-zA-Z0-9]{12,32}$/.test(x.giphyId)&&x.series&&x.title&&x.creator)
      .map(x=>({...x,id:"giphy-"+x.giphyId,type:"giphy"}));
  } else toast("Some GIFs couldn't load. Try refreshing.");
  if(i.status==="fulfilled"&&Array.isArray(i.value)) {
    state.images=i.value.filter(x=>safeForWork(x)&&x.creator&&x.license&&x.permission&&httpsURL(x.url)&&["image","video"].includes(x.type))
      .map((x,n)=>({...x,id:x.id||"image-"+n,series:x.series||x.category||"Illustrations",featured:(x.series==="Jujutsu Kaisen"||x.series==="Naruto"||n===0),type:x.type==="video"?"video":/\.gif(?:\?|$)/i.test(x.url)?"animated-gif":"image"}));
    const preferred=state.images.find(x=>x.series==="Jujutsu Kaisen"||x.series==="Naruto")||state.images[0];
    if(preferred)$(".hero-backdrop").style.backgroundImage="url("+JSON.stringify(preferred.url)+")";
  }
  render();
}
$$(".type-tab").forEach(x=>x.onclick=()=>switchMode(x.dataset.filter));
$("#favoritesNav").onclick=()=>switchMode(state.mode==="saved"?"all":"saved");
$("#searchInput").oninput=e=>{state.search=e.target.value.trim().toLowerCase();state.visible=12;render();};
$("#sortSelect").onchange=e=>{state.sort=e.target.value;render();};
$("#clearFilters").onclick=reset;
$("#emptyReset").onclick=reset;
$("#loadMore").onclick=()=>{state.visible+=12;render();};
$("#headerSearch").onclick=()=>{$("#wallpapers").scrollIntoView({behavior:"smooth"});$("#searchInput").focus({preventScroll:true});};
$("#surpriseHero").onclick=()=>{const items=results();if(items.length)openViewer(items[Math.floor(Math.random()*items.length)]);};
$("#viewLive").onclick=()=>switchMode("gifs");
$("#viewerClose").onclick=closeViewer;$("#viewerScrim").onclick=closeViewer;
$("#viewerFullscreen").onclick=async()=>{
  const media=$("#viewerArt");
  if(!media || $("#viewer").hidden) return;
  try {
    if(document.fullscreenElement) await document.exitFullscreen();
    else if(typeof media.requestFullscreen==="function") await media.requestFullscreen();
    else toast("Fullscreen is not available in this browser.");
  } catch { toast("Fullscreen couldn't start in this browser."); }
};
document.addEventListener("fullscreenchange",()=>{
  $("#viewerFullscreen").textContent=document.fullscreenElement?"⤢ Exit fullscreen":"⛶ Fullscreen preview";
});
document.addEventListener("keydown",e=>{
  if(e.key==="Escape"&&!$("#viewer").hidden)closeViewer();
  if(e.key==="/"&&$("#viewer").hidden&&!["INPUT","TEXTAREA"].includes(document.activeElement.tagName)) {e.preventDefault();$("#searchInput").focus();}
});
$("#year").textContent=new Date().getFullYear();load();
