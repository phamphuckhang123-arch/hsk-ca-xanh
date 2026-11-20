const C='hsk-v6';
const F=['./','index.html','css/style.css','js/app.js','js/vocab.js','js/lessons.js','js/grammar.js','js/grammar_lesson1.js','js/grammar_lesson2.js','js/grammar_lesson3.js','js/exams.js','js/bank1.js','js/bank2.js','js/bank3.js','icon.svg','icon-192.png','manifest.json'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(F)));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))));self.clients.claim();});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(fetch(e.request).then(r=>{const cp=r.clone();caches.open(C).then(c=>c.put(e.request,cp));return r;}).catch(()=>caches.match(e.request)));});
