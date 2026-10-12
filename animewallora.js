"use strict";
const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
const gifs=[
["Sakura Afterglow","PoHVT5kEyNWcN0CWNj","Sakura"],
["Rooftop Dream","2SYqgPxMm2kbVe3y02","Scenery"],
["Pink Petals","ONGUmqZCalAKO8PH7C","Sakura"],
["Purple Mood","4YZNYcTybcYTnROykG","Aesthetic"],
["Evening Sky","RcRYrpC1pBvIB0icDm","Scenery"],
["Quiet Rain","1Ye7CiFf0OvUaJ82A2","Scenery"],
["Study Atmosphere","4N3lQozOH2STZdDsOe","Aesthetic"],
["City Lights","2seKKLp1n0sEeJLYTK","City"],
["Anime Moments","2tOUQgIShjXIHksATn","Aesthetic"],
["Skyline Daydream","dn12b0TGWufPpdoSTv","City"],
["Shimmering Night","cC9j39MDoWk8ioRO7S","Aesthetic"],
["Slow Evening","orUBsDjlD2rzsz6pPK","Scenery"],
["Forest Spirit","8qFQA9iD8FS1Txuv9N","Fantasy"],
["Blooming Flower","7TcdqOgF3PwEvlciVw","Sakura"],
["Anime Atmosphere","8cvfAbrx8KyXWTekb5","Aesthetic"],
["Night Wonder","7J4wJJ7rMWHYG9wqW5","Aesthetic"],
["Tanjiro & Nezuko","ggR8oaGvhUbtndQSR4","Demon Slayer","Crunchyroll"],
["Demon Slayer — Water Style","efCdWBE19bR26ScE02","Demon Slayer","Crunchyroll"],
["Demon Slayer — Breathing","gIBzKPERLHF6mvU7Ea","Demon Slayer","Crunchyroll"],
["Nezuko — Demon Slayer","LMuU3xRkGus3SYqaqD","Demon Slayer","Crunchyroll"],
["Naruto — Shinobi","vJ7IyeRj0e1DWZvRZ4","Naruto","Xbox"],
["Naruto — Ultimate Ninja","6zVuKUmZY206RW6OHS","Naruto","Xbox"],
["Naruto — VIZ","1xm1Gm8Scnp33n0LEj","Naruto","VIZ"],
["Bleach — Byakuya","ukto3TrQS9hIDoDFHF","Bleach","VIZ"],
["Jujutsu Kaisen — Domain","mi5RMEhI2Ks9AbM9Iu","Jujutsu Kaisen","mesigugu"]
].map(([title,giphyId,category,creator],i)=>({id:"gif-"+(i+1),title,giphyId,category,creator:creator||"animatr",source:"https://giphy.com/gifs/"+giphyId,license:"GIPHY embed",type:"gif",orientation:"landscape",description:"Anime animation, embedded from its original GIPHY creator."}));
let catalog=[],kind="all",cat="All",query="",sort="featured",visible=16,favoritesMode=false,selected=null;
const likes=new Set();try{JSON.parse(localStorage.getItem("animewallora-favorites")||"[]").forEach(x=>likes.add(x))}catch{}
function el(tag,className,text){const x=document.createElement(tag);if(className)x.className=className;if(text!==undefined)x.textContent=text;return x}
function safeLink(url){try{let x=new URL(url,location.href);return x.protocol==="https:"?x.href:null}catch{return null}}
function saveLikes(){try{localStorage.setItem("animewallora-favorites",JSON.stringify([...likes]))}catch{}}
function toast(message){let node=$("#toast");node.textContent=message;node.classList.add("show");clearTimeout(toast.timeout);toast.timeout=setTimeout(()=>node.classList.remove("show"),2500)}
function allItems(){return [...catalog,...gifs]}
function matches(item){if(favoritesMode&&!likes.has(item.id))return false;if(kind!=="all"&&item.type!==kind)return false;if(cat!=="All"&&item.category!==cat)return false;if(query&&!([item.title,item.category,item.creator,item.description].join(" ").toLowerCase().includes(query)))return false;return true}
function filtered(){const items=allItems().filter(matches);if(sort==="name")items.sort((a,b)=>a.title.localeCompare(b.title));else if(sort==="newest")items.reverse();return items}
function updateFavorites(){const count=$("#favoriteCount");count.textContent=likes.size;count.style.color=likes.size?"#f8a2bd":"";$("#favoritesNav").title=favoritesMode?"Show all artworks":"View favorites"}
function toggleLike(item){likes.has(item.id)?likes.delete(item.id):likes.add(item.id);saveLikes();updateFavorites();toast(likes.has(item.id)?"Added to favorites":"Removed from favorites");render();if(selected&&selected.id===item.id)updateViewerLike(item)}
function thumbUrl(item){return safeLink(item.thumbnail)||safeLink(item.url)||""}
function imageCard(item){const card=el("article","wallpaper-card");const media=el("div","card-media");const img=el("img");img.alt=item.title+" — art by "+item.creator;img.src=thumbUrl(item);img.loading="lazy";img.decoding="async";img.onerror=()=>{if(img.src!==item.url)img.src=item.url};media.append(img);const activate=el("button","media-activate","Preview "+item.title);activate.setAttribute("aria-label","Preview "+item.title);activate.onclick=()=>openViewer(item);media.append(activate);const chip=el("span","media-chip","✦ "+(item.orientation==="portrait"?"PORTRAIT":"WALLPAPER"));media.append(chip);const heart=el("button","heart"+(likes.has(item.id)?" liked":""),likes.has(item.id)?"♥":"♡");heart.setAttribute("aria-label","Toggle favorite for "+item.title);heart.onclick=()=>toggleLike(item);media.append(heart);const body=el("div","card-body");const h=el("h3","",item.title);const p=el("p","",item.creator+" · "+(item.category||"Artwork"));const footer=el("div","card-footer");const license=el("span","license",item.license||"Licensed");const button=el("button","","↓ Download");button.onclick=()=>download(item);footer.append(license,button);body.append(h,p,footer);card.append(media,body);return card}
function gifCard(item){const card=el("article","wallpaper-card");const media=el("div","card-media");const iframe=el("iframe");iframe.loading="lazy";iframe.title=item.title+" animated GIF by "+item.creator;iframe.src="https://giphy.com/embed/"+item.giphyId;iframe.allowFullscreen=true;media.append(iframe);media.append(el("span","media-chip","● ANIMATED"));const heart=el("button","heart"+(likes.has(item.id)?" liked":""),likes.has(item.id)?"♥":"♡");heart.setAttribute("aria-label","Toggle favorite for "+item.title);heart.onclick=()=>toggleLike(item);media.append(heart);const body=el("div","card-body");body.append(el("h3","",item.title),el("p","","By "+item.creator+" · GIF loop"));const foot=el("div","card-footer");foot.append(el("span","license","Powered by GIPHY"));const button=el("button","","⤢ Preview");button.onclick=()=>openViewer(item);foot.append(button);body.append(foot);card.append(media,body);return card}
function categories(){const cats=["All",...new Set(allItems().filter(i=>kind==="all"||i.type===kind).map(i=>i.category).filter(Boolean))];if(!cats.includes(cat))cat="All";$("#categoryBar").replaceChildren(...cats.map(name=>{const b=el("button","category"+(cat===name?" active":""),(name==="All"?"✦  ":"")+name);b.setAttribute("aria-pressed",String(cat===name));b.onclick=()=>{cat=name;visible=16;render()};return b}))}
function render(){categories();updateFavorites();const items=filtered();$("#totalCount").textContent=String(allItems().length).padStart(2,"0");$("#resultCount").textContent=items.length+" result"+(items.length===1?"":"s");$("#galleryHeading").textContent=favoritesMode?"Your saved collection":kind==="gif"?"Anime in motion":kind==="image"?"Original illustrated art":"Explore the collection";$$(".type-tab").forEach(b=>{b.classList.toggle("active",b.dataset.type===kind);b.setAttribute("aria-pressed",String(b.dataset.type===kind))});$("#galleryGrid").replaceChildren(...items.slice(0,visible).map(item=>item.type==="gif"?gifCard(item):imageCard(item)));$("#emptyState").hidden=items.length!==0;$("#loadMore").hidden=items.length<=visible;$("#clearFilters").hidden=kind==="all"&&cat==="All"&&!query&&!favoritesMode;$("#favoritesNav").setAttribute("aria-pressed",String(favoritesMode))}
function reset(){kind="all";cat="All";query="";visible=16;sort="featured";favoritesMode=false;$("#searchInput").value="";$("#sortSelect").value="featured";render()}
function updateViewerLike(item){$("#viewerFavorite").textContent=likes.has(item.id)?"♥ Saved to favorites":"♡ Save to favorites"}
function openViewer(item){selected=item;$("#viewerCategory").textContent=(item.category||"Art")+" / "+(item.type==="gif"?"ANIMATED":"WALLPAPER");$("#viewerTitle").textContent=item.title;$("#viewerDescription").textContent=item.description||"Curated original anime artwork.";$("#viewerArtist").textContent=item.creator||"Artist";const license=$("#viewerLicense");license.textContent=item.license||"GIPHY embed";license.href=item.licenseUrl||item.source||"https://giphy.com";const src=$("#viewerSource");src.href=item.source||"https://giphy.com";src.textContent=item.type==="gif"?"View GIPHY attribution ↗":"View original & credit ↗";$("#viewerArt").replaceChildren();if(item.type==="gif"){const frame=el("iframe");frame.src="https://giphy.com/embed/"+item.giphyId;frame.title=item.title+" GIF on GIPHY";frame.allowFullscreen=true;$("#viewerArt").append(frame)}else{const img=el("img");img.src=item.url;img.alt=item.title;$("#viewerArt").append(img)}$("#viewerDownload").hidden=item.type==="gif";$("#viewerHint").textContent=item.type==="gif"?"Animated media is embedded via GIPHY and is not mirrored or offered as a download.":"Artist credit and license details are included above. Download uses the original file.";updateViewerLike(item);$("#viewerFavorite").onclick=()=>toggleLike(item);$("#viewerDownload").onclick=()=>download(item);$("#viewer").hidden=false;document.body.style.overflow="hidden";$("#viewerClose").focus()}
function closeViewer(){$("#viewer").hidden=true;document.body.style.overflow="";selected=null}
async function download(item){if(item.type==="gif")return;const url=safeLink(item.downloadUrl||item.url);if(!url)return toast("Download URL unavailable");const ext=(item.filename||item.url).split(".").pop().split("?")[0].toLowerCase();const filename="AnimeWallora-"+item.title.toLowerCase().replace(/[^a-z0-9]+/g,"-")+"."+(["png","jpg","jpeg","webp","gif"].includes(ext)?ext:"jpg");try{const response=await fetch(url);if(!response.ok)throw Error("Download failed");const blob=await response.blob();const objectURL=URL.createObjectURL(blob);const anchor=el("a");anchor.href=objectURL;anchor.download=filename;document.body.append(anchor);anchor.click();anchor.remove();setTimeout(()=>URL.revokeObjectURL(objectURL),30000);toast("Downloading "+item.title)}catch(e){window.open(url,"_blank","noopener,noreferrer");toast(item.downloadUrl&&item.downloadUrl.includes("/downloads/")?"Your wallpaper download is starting.":"Open the image and save it from there.")}}
function setKind(type){kind=type;cat="All";favoritesMode=false;visible=16;render();$("#wallpapers").scrollIntoView({behavior:"smooth"})}
async function init(){try{const response=await fetch("./data/wallpapers.json?v=2",{cache:"no-store"});if(!response.ok)throw Error("Catalog request failed");const data=await response.json();if(!Array.isArray(data))throw Error("Invalid catalog");catalog=data.filter(x=>x&&x.title&&safeLink(x.url)&&x.creator&&x.license&&x.permission&&x.type==="image").map((item,i)=>({category:"Fantasy",orientation:"landscape",id:"art-"+i,...item}));if(catalog[0]&&safeLink(catalog[0].url))$(".hero-backdrop").style.backgroundImage="url("+JSON.stringify(catalog[0].url)+")";}catch(e){console.error(e);toast("Artwork catalog could not load. Animated GIFs are still available.")}render()}
$$(".type-tab").forEach(b=>b.addEventListener("click",()=>setKind(b.dataset.type)));
$("#searchInput").addEventListener("input",e=>{query=e.target.value.trim().toLowerCase();visible=16;render()});
$("#sortSelect").addEventListener("change",e=>{sort=e.target.value;render()});
$("#clearFilters").onclick=reset;$("#emptyReset").onclick=reset;
$("#headerSearch").onclick=()=>{$("#wallpapers").scrollIntoView({behavior:"smooth"});$("#searchInput").focus({preventScroll:true})};
$("#favoritesNav").onclick=()=>{favoritesMode=!favoritesMode;kind="all";cat="All";visible=16;render();$("#wallpapers").scrollIntoView({behavior:"smooth"})};
$("#loadMore").onclick=()=>{visible+=16;render()};
$("#viewLive").onclick=()=>setKind("gif");
$("#viewerClose").onclick=closeViewer;$("#viewerScrim").onclick=closeViewer;
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!$("#viewer").hidden)closeViewer();if(e.key==="/"&&e.target.tagName!=="INPUT"&&$("#viewer").hidden){e.preventDefault();$("#searchInput").focus()}});
$("#year").textContent=new Date().getFullYear();init();
