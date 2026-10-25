/* IndoThreat latest articles via public Blogger JSONP feed.
   Verified, linked articles are pre-rendered in HTML as an offline fallback.
   External content is never inserted as HTML; all strings use textContent. */
(() => {
 'use strict';
 const mount=document.querySelector('[data-feed-mount]');
 if(!mount)return;
 const status=document.querySelector('[data-feed-status]');
 const limit=Math.min(3,Math.max(1,Number(mount.dataset.limit)||3));
 const callback='aulap_indothreat_callback';
 let settled=false;
 let node;
 let timer;
 function finish(ok){if(settled)return;settled=true;clearTimeout(timer);node?.remove();if(status)status.textContent=ok?'FEED TERBARU':'ARTIKEL INDO THREAT';try{delete window[callback]}catch{window[callback]=undefined}}
 const clean=(html)=>{
  const doc=new DOMParser().parseFromString(html||'','text/html');
  return (doc.body.textContent||'').replace(/\s+/g,' ').trim();
 };
 const truncate=(value,length=200)=>value.length>length?value.slice(0,length).replace(/\s+\S*$/,'')+'…':value;
 const safeUrl=(str)=>{try{const url=new URL(str);return url.protocol==='https:'&&url.hostname==='indothreat.blogspot.com'?url.href:null}catch{return null}};
 window[callback]=(payload)=>{
   if(settled)return;
   const entries=(payload?.feed?.entry||[]).slice(0,limit);
   const parsed=entries.map(entry=>({
     title:entry?.title?.$t||'Artikel IndoThreat',
     url:safeUrl((entry?.link||[]).find(x=>x.rel==='alternate')?.href),
     date:entry?.published?.$t,
     description:truncate(clean(entry?.summary?.$t||entry?.content?.$t||''))
   })).filter(x=>x.url);
   if(!parsed.length){finish(false);return}
   const frag=document.createDocumentFragment();
   parsed.forEach(x=>{
     const article=document.createElement('article');article.className='feed-article';
     const time=document.createElement('time');
     if(x.date&&!isNaN(Date.parse(x.date))){time.dateTime=new Date(x.date).toISOString();time.textContent=new Intl.DateTimeFormat('id-ID',{day:'numeric',month:'short',year:'numeric'}).format(new Date(x.date))}else{time.textContent='IndoThreat'}
     const h3=document.createElement('h3');const a=document.createElement('a');a.href=x.url;a.target='_blank';a.rel='noopener noreferrer';a.textContent=x.title;h3.append(a);
     const p=document.createElement('p');p.textContent=x.description||'Baca informasi selengkapnya di blog IndoThreat.';
     const more=document.createElement('a');more.href=x.url;more.target='_blank';more.rel='noopener noreferrer';more.className='read-more';more.textContent='Baca di IndoThreat ↗';
     article.append(time,h3,p,more);frag.append(article);
   });
   mount.replaceChildren(frag);finish(true);
 };
 node=document.createElement('script');node.async=true;node.src=`https://indothreat.blogspot.com/feeds/posts/default?alt=json-in-script&max-results=${limit}&callback=${callback}`;node.onerror=()=>finish(false);
 document.head.append(node);timer=setTimeout(()=>finish(false),8000);
})();
