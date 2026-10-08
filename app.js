const BASE='./content/';
const app=document.getElementById('app');
const nav=document.getElementById('subjectNav');
const searchInput=document.getElementById('siteSearch');
const crumbs=document.getElementById('breadcrumbs');
const sidebar=document.getElementById('sidebar');
const scrim=document.getElementById('scrim');
const menuToggle=document.getElementById('menuToggle');
let manifest=null;
let notes={};
let subjectById={};
let currentRoute={type:'home'};
let searchTimer=null;
const escapeHtml=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function updateCrumbs(parts){crumbs.innerHTML=parts.map((p,i)=>`${i?'<span class="crumb-sep">/</span>':''}<span>${escapeHtml(p)}</span>`).join('');}
function hideMobileNav(){sidebar.classList.remove('open');scrim.classList.remove('show');menuToggle.setAttribute('aria-expanded','false');}
function renderNav(){nav.innerHTML=manifest.subjects.map(s=>`<button class="nav-link" type="button" data-subject="${escapeHtml(s.id)}"><span class="nav-icon">${escapeHtml(s.icon)}</span><span>${escapeHtml(s.name)}</span><span class="subject-count">${s.weeks.length}</span></button>`).join('');}
function routeFromHash(){const h=decodeURIComponent(location.hash.replace(/^#/,''));if(!h||h==='home')return{type:'home'};const p=h.split('/');if(p[0]==='subject'&&subjectById[p[1]])return{type:'subject',subject:p[1]};return{type:'home'};}
function go(hash){history.pushState({},'',`#${hash}`);routeFromLocation();}
function routeFromLocation(){currentRoute=routeFromHash();hideMobileNav();if(currentRoute.type==='home')renderHome();else renderSubject(currentRoute.subject);setActiveNav();}
function setActiveNav(){document.querySelectorAll('[data-view="home"]').forEach(x=>x.classList.toggle('active',currentRoute.type==='home'));document.querySelectorAll('.subject-nav [data-subject]').forEach(x=>x.classList.toggle('active',currentRoute.subject===x.dataset.subject&&currentRoute.type==='subject'));}
function subjectCard(s){return `<button class="subject-card" type="button" data-subject="${escapeHtml(s.id)}" style="--accent:${escapeHtml(s.accent)};--tint:${escapeHtml(s.tint)}"><span class="subject-card-top"><span class="subject-card-icon">${escapeHtml(s.icon)}</span><span class="subject-card-arrow">↗</span></span><h3>${escapeHtml(s.name)}</h3><p>${escapeHtml(s.description)}</p><span class="card-foot"><span>${s.weeks.length} lesson${s.weeks.length===1?'':'s'} in the source</span><b>Open notes&nbsp; →</b></span></button>`;}
function renderHome(){
  updateCrumbs(['Home','Original notes']);
  const total=manifest.subjects.reduce((n,s)=>n+s.weeks.length,0);
  app.setAttribute('aria-busy','false');
  app.innerHTML=`<section class="hero"><div class="eyebrow"><span class="eyebrow-mark"></span> SS2 · FIRST TERM 2026/2027</div><h1>Lesson notes<br>in one place.</h1><p>Choose a subject to read the lesson text as supplied. The source notes—including the repeated Biology section—are kept intact.</p><div class="hero-bottom"><span class="hero-chip highlight">MATER MISERICORDIAE SECONDARY SCHOOL</span><span class="hero-chip">RUMOMASI</span></div></section><div class="stats-row"><div class="stat-card"><span class="stat-icon">▤</span><div><strong>${manifest.subjects.length}</strong><span>Subjects</span></div></div><div class="stat-card"><span class="stat-icon">◷</span><div><strong>${total}</strong><span>Weekly sections listed</span></div></div><div class="stat-card"><span class="stat-icon">↗</span><div><strong>Source text</strong><span>As provided</span></div></div></div><div class="section-heading"><div><h2>Subjects</h2><p>Select a subject to open its complete source text.</p></div><span class="section-note">SS2 · 2026/2027</span></div><div class="subject-grid">${manifest.subjects.map(subjectCard).join('')}</div>`;
}
function renderSubject(id){
  const s=subjectById[id];if(!s)return renderHome();
  updateCrumbs(['Home',s.name]);
  app.setAttribute('aria-busy','false');
  app.innerHTML=`<button class="back-link" type="button" data-view="home">← Subjects</button><section class="subject-intro" style="--accent:${escapeHtml(s.accent)};--tint:${escapeHtml(s.tint)}"><span class="subject-intro-icon">${escapeHtml(s.icon)}</span><div><h1>${escapeHtml(s.name)}</h1><p>Complete text supplied for this subject. The text below is displayed without editorial rewriting.</p><div class="subject-intro-meta">${s.weeks.length} WEEK${s.weeks.length===1?'':'S'} · SS2 · FIRST TERM 2026/2027</div></div></section><div class="lesson-actions raw-actions"><button class="small-button" type="button" data-action="print">Print notes</button><a class="small-button download-link" href="${BASE}${escapeHtml(s.file)}" download>Download original text</a></div><article class="lesson-paper raw-paper"><pre class="verbatim-notes" id="verbatimNotes"></pre></article>`;
  document.getElementById('verbatimNotes').textContent=notes[id]||'';
  window.scrollTo({top:0,behavior:'smooth'});
}
function previewText(text,query){const clean=text.replace(/\s+/g,' ').trim();const i=clean.toLowerCase().indexOf(query.toLowerCase());if(i<0)return clean.slice(0,190)+(clean.length>190?'…':'');return `…${clean.slice(Math.max(0,i-85),Math.min(clean.length,i+160))}…`;}
function renderSearch(value){const q=value.trim().toLowerCase();if(!q){routeFromLocation();return;}updateCrumbs(['Home','Search']);const results=manifest.subjects.filter(s=>(notes[s.id]||'').toLowerCase().includes(q));app.setAttribute('aria-busy','false');app.innerHTML=`<div class="search-heading"><div class="lesson-label">SEARCH THE ORIGINAL NOTES</div><h1>Results for “${escapeHtml(value.trim())}”</h1><p>${results.length} matching subject${results.length===1?'':'s'}.</p></div>${results.length?`<div class="search-results">${results.map(s=>`<button class="result-card" type="button" data-subject="${escapeHtml(s.id)}"><span class="result-badge">${escapeHtml(s.name)}</span><span class="result-main"><strong>${escapeHtml(s.name)}</strong><span>Open the complete source text</span><p>${escapeHtml(previewText(notes[s.id]||'',value.trim()))}</p></span><span class="arrow">›</span></button>`).join('')}</div>`:'<div class="empty-state">No subject text matched that search.</div>'}`;}
function init(){
  fetch(BASE+'manifest.json').then(r=>{if(!r.ok)throw new Error('Could not load the subject index.');return r.json();}).then(async data=>{
    manifest=data;subjectById=Object.fromEntries(data.subjects.map(s=>[s.id,s]));renderNav();
    const loaded=await Promise.all(data.subjects.map(async s=>{try{const r=await fetch(BASE+s.file);if(!r.ok)throw new Error('Missing source file');notes[s.id]=await r.text();return true;}catch(e){notes[s.id]='';return false;}}));
    if(loaded.some(x=>!x))console.warn('One or more source text files could not be loaded.');
    routeFromLocation();
  }).catch(err=>{app.setAttribute('aria-busy','false');app.innerHTML=`<div class="empty-state"><strong>Could not load the source notes.</strong><br>Open the site through GitHub Pages or a local web server.<br><small>${escapeHtml(err.message)}</small></div>`;});
}
document.addEventListener('click',e=>{const target=e.target.closest('button');if(!target)return;if(target.dataset.view==='home'){searchInput.value='';go('home');return;}if(target.dataset.subject){searchInput.value='';go(`subject/${target.dataset.subject}`);return;}if(target.dataset.action==='print'){window.print();}});
searchInput.addEventListener('input',()=>{clearTimeout(searchTimer);const value=searchInput.value;searchTimer=setTimeout(()=>{if(value.trim())renderSearch(value);else routeFromLocation();},160);});
menuToggle.addEventListener('click',()=>{const open=!sidebar.classList.contains('open');sidebar.classList.toggle('open',open);scrim.classList.toggle('show',open);menuToggle.setAttribute('aria-expanded',String(open));});
scrim.addEventListener('click',hideMobileNav);
window.addEventListener('popstate',routeFromLocation);
window.addEventListener('hashchange',routeFromLocation);
document.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();searchInput.focus();}if(e.key==='Escape'){searchInput.blur();hideMobileNav();}});
init();
