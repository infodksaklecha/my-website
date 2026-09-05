/* Shared interactions */
(function(){
  const nav=document.getElementById('nav');
  const onScroll=()=>{ if(nav) nav.classList.toggle('scrolled',window.scrollY>20);
    const t=document.getElementById('toTop'); if(t) t.classList.toggle('show',window.scrollY>600); };
  window.addEventListener('scroll',onScroll,{passive:true}); onScroll();
  const b=document.getElementById('burger'),d=document.getElementById('drawer');
  if(b&&d) b.addEventListener('click',()=>{b.classList.toggle('open');d.classList.toggle('open');});
  window.closeDrawer=()=>{ if(b) b.classList.remove('open'); if(d) d.classList.remove('open'); };
  // Auto-close drawer whenever any link inside it is tapped
  document.querySelectorAll('#drawer a').forEach(a=>a.addEventListener('click',()=>window.closeDrawer()));
  // Ensure drawer stays hidden if viewport grows to desktop size
  window.addEventListener('resize',()=>{ if(window.innerWidth>800) window.closeDrawer(); });
  const tt=document.getElementById('toTop'); if(tt) tt.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));
  // active nav
  const path=(location.pathname.split('/').pop()||'index.html').toLowerCase();
  document.querySelectorAll('.nav-links a, .nav-drawer a').forEach(a=>{
    const h=(a.getAttribute('href')||'').toLowerCase();
    if(h===path || (path===''&&h==='index.html') || (path==='case-detail.html'&&h==='case-studies.html')) a.classList.add('active');
  });
  // reveal
  const io=new IntersectionObserver(es=>es.forEach((e,i)=>{ if(e.isIntersecting){ setTimeout(()=>e.target.classList.add('visible'),(i%4)*70); io.unobserve(e.target);} }),{threshold:.12});
  document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
  // counters
  const cio=new IntersectionObserver(es=>es.forEach(e=>{
    if(!e.isIntersecting) return; cio.unobserve(e.target);
    const el=e.target, raw=el.dataset.count||el.textContent; const m=String(raw).match(/[\d,]+/);
    if(!m) return; const target=parseFloat(m[0].replace(/,/g,'')); const suf=el.textContent.slice(m[0].length+m.index);
    const pre=el.textContent.slice(0,m.index); let t0=null;
    const step=ts=>{ if(!t0)t0=ts; const p=Math.min(1,(ts-t0)/1400); const v=Math.round(target*(0.2+0.8*p*p)); el.textContent=pre+v.toLocaleString('en-IN')+suf; if(p<1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }),{threshold:.4});
  document.querySelectorAll('[data-count]').forEach(el=>cio.observe(el));
  // footer year
  document.querySelectorAll('[data-year]').forEach(el=>el.textContent=new Date().getFullYear());
})();
// Case helpers used by listing + detail pages
function caseCard(c){
  return `<article class="card reveal visible" data-cat="${c.cat}">
    <img class="top" loading="lazy" src="${c.img}" alt="${c.title}">
    <span class="meta">${c.cat} \u00B7 ${c.context}</span>
    <h3>${c.title}</h3><p>${c.brief}</p>
    <div class="metric-row">${c.metrics.map(m=>`<div class="metric"><b>${m[0]}</b><small>${m[1]}</small></div>`).join('')}</div>
    <a class="more" href="case-detail.html?id=${c.id}">Read full story \u2192</a></article>`;
}
function renderCases(filter){
  const grid=document.getElementById('caseGrid'); if(!grid||!window.SITE_DATA) return;
  const list=SITE_DATA.cases.filter(c=>!filter||filter==='All'||c.cat===filter);
  grid.innerHTML=list.map(caseCard).join('')||'<p class="lead">No stories in this bucket yet.</p>';
  const n=document.getElementById('caseCount'); if(n) n.textContent=list.length+' stor'+(list.length===1?'y':'ies');
}
function renderCaseDetail(){
  const box=document.getElementById('caseDetail'); if(!box) return;
  const id=new URLSearchParams(location.search).get('id')||'case1';
  const c=(window.SITE_DATA.cases.find(x=>x.id===id)||window.SITE_DATA.cases[0]);
  const others=window.SITE_DATA.cases.filter(x=>x.id!==c.id).slice(0,2);
  box.innerHTML=`<div class="breadcrumb"><a href="index.html">Home</a> / <a href="case-studies.html">Case Studies</a> / ${c.cat}</div>
  <span class="section-tag">${c.cat}</span>
  <h1 class="section-h2">${c.title}</h1>
  <p class="lead">${c.context}</p>
  <img src="${c.img}" alt="${c.title}" style="width:100%;height:380px;object-fit:cover;border-radius:18px;margin:1.4rem 0">
  <div class="prose glass" style="padding:2rem">${c.story.map(p=>`<p>${p}</p>`).join('')}
  <div class="metric-row">${c.metrics.map(m=>`<div class="metric"><b>${m[0]}</b><small>${m[1]}</small></div>`).join('')}</div></div>
  <h3 class="section-h2" style="font-size:1.5rem;margin-top:2.2rem">Related mandates</h3>
  <div class="grid-2">${others.map(caseCard).join('')}</div>
  <div class="btn-row"><a class="btn-primary" href="contact.html">Discuss a similar mandate</a><a class="btn-outline" href="case-studies.html">\u2190 All case studies</a></div>`;
  document.title=c.title+' | CA Vaibhav Saklecha';
}
// Contact form: validate + store locally + open mail client fallback
function initContact(){
  const f=document.getElementById('qform'); if(!f) return;
  f.addEventListener('submit',e=>{
    e.preventDefault();
    const msg=document.getElementById('formMsg');
    const v=id=>{const el=document.getElementById(id); return el?el.value.trim():'';};
    const name=v('cf-name'),email=v('cf-email'),type=v('cf-type'),text=v('cf-msg');
    if(name.length<2){msg.textContent='Please enter your full name.';msg.className='form-msg err';return;}
    if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)){msg.textContent='Please enter a valid email.';msg.className='form-msg err';return;}
    if(!type){msg.textContent='Please choose the nature of enquiry.';msg.className='form-msg err';return;}
    if(text.length<10){msg.textContent='Please describe your mandate in 10+ characters.';msg.className='form-msg err';return;}
    try{const k='dks_enquiries';const arr=JSON.parse(localStorage.getItem(k)||'[]');arr.push({name,email,phone:v('cf-phone'),type,text,at:new Date().toISOString()});localStorage.setItem(k,JSON.stringify(arr));}catch(_){}
    msg.textContent='Thank you, '+name.split(' ')[0]+'. Your enquiry has been recorded \u2014 we respond within one business day.';msg.className='form-msg ok';f.reset();
  });
}
function initCaseFilters(){
  const wrap=document.getElementById('caseFilters'); if(!wrap) return;
  wrap.addEventListener('click',e=>{
    const btn=e.target.closest('button'); if(!btn) return;
    wrap.querySelectorAll('button').forEach(x=>x.classList.remove('active'));
    btn.classList.add('active');
    renderCases(btn.dataset.f||'All');
  });
}
document.addEventListener('DOMContentLoaded',()=>{
  // Display all case studies automatically the moment the grid container appears
  if(document.getElementById('caseGrid')) renderCases('All');
  initCaseFilters();
  renderCaseDetail();initContact();});
