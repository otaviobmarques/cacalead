/* GARIMPO — painel ao vivo */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeUrl = u => /^https?:\/\//i.test(u || '') ? u : '';
const fmt = n => Number(n || 0).toLocaleString('pt-BR');
const cityOf = l => { const a = l.data.complete_address; if (a && a.city) return a.city; const m = (l.data.address || '').match(/,\s*([^,]+?)\s*-\s*[A-Z]{2}\b/); return m ? m[1].trim() : ''; };
const bairroOf = l => (l.data._bairro || l.data.complete_address?.borough || '').trim();
const TEMP = { quente: 'var(--hot)', morno: 'var(--warm)', frio: 'var(--cold)' };
const TEMPHEX = { quente: '#ff4d6d', morno: '#ffb03b', frio: '#5b8cff' };
const PIPE = { novo: ['Novo', '#a9b3cf'], contatado: ['Contatado', '#2ef2ff'], negociando: ['Negociando', '#ffcf4a'], fechado: ['Fechado', '#3dffa8'], descartado: ['Descartado', '#ff4d6d'] };
const GAP_TAGS = ['Sem site', 'Só rede social', 'Só plataforma', 'Sem Instagram', 'Nota baixa', 'Nota mediana', 'Invisível', 'Pouca prova social', 'Perfil incompleto', 'Sem fotos'];
const CAP_TAGS = ['WhatsApp', 'Telefone', 'E-mail', 'Grande', 'Movimentado'];
const SUGS = ['hamburgueria', 'dentista', 'clínica de estética', 'barbearia', 'pet shop', 'academia', 'imobiliária', 'advogado', 'pizzaria', 'salão de beleza'];

const S = { leads: new Map(), hunts: new Map(), sweeps: new Map(), mode: 'city', bairros: [], bsel: new Set(), bq: '', bzLayer: null, bfilter: '', hunt: 'all', view: 'radar', kw: [], city: null, pipeline: [],
  f: { q: '', temp: 'all', tags: new Set(), sort: 'score' }, sel: null, sound: true, markers: new Map(), seenHot: new Set(), aiBusy: new Set() };
try { S.sound = localStorage.getItem('g_sound') !== '0'; } catch (e) {}

/* ───────── utilidades ───────── */
function toast(t) { const el = $('#toast'); el.textContent = t; el.classList.add('on'); clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove('on'), 2600); }
async function api(m, p, b) {
  const r = await fetch(p, { method: m, headers: Object.assign({ 'X-Garimpo': '1' }, b ? { 'Content-Type': 'application/json' } : {}), body: b ? JSON.stringify(b) : undefined });
  const d = await r.json().catch(() => ({}));
  if (r.status === 401) location.href = '/login';  // na nuvem: a sessão venceu
  if (!r.ok) throw new Error(d.error || ('HTTP ' + r.status));
  return d;
}
const inHunt = (l, h) => (l.hunts || [l.hunt_id]).includes(+h);
function visible() { return [...S.leads.values()].filter(l => (S.hunt === 'all' || inHunt(l, S.hunt)) && (!S.city2 || cityOf(l) === S.city2)); }
function ring(score, temp, cls = '') { return `<div class="ring ${cls}" style="--s:${score};--c:${TEMP[temp]}">${score}${cls.includes('big') ? '<small>SCORE</small>' : ''}</div>`; }
function stars(l) { const i = l.intel; return i.reviews ? `<div class="stars"><b>★ ${i.rating.toFixed(1)}</b><span>${fmt(i.reviews)} avaliações</span></div>` : `<div class="stars"><span>sem avaliações</span></div>`; }
function tagHtml(t) { return `<span class="tag ${GAP_TAGS.includes(t) ? 'gap' : CAP_TAGS.includes(t) ? 'cap' : (t === 'Fechado' || t === 'Sem contato') ? 'bad' : ''}">${esc(t)}</span>`; }
function waLink(l, text) { return l.intel.wa ? `https://wa.me/${l.intel.wa}?text=${encodeURIComponent(text ?? l.intel.pitch)}` : ''; }
function apiLink(l, text) { const n = l.intel.wa || l.intel.tel; return n ? `https://api.whatsapp.com/send?phone=${n}&text=${encodeURIComponent(text ?? l.intel.pitch)}` : ''; }
async function copyLink(key, text) {
  const l = S.leads.get(key); const u = l && apiLink(l, text); if (!u) { toast('Esse lead não tem número'); return; }
  api('PATCH', '/api/leads/' + encodeURIComponent(key), { wa_link: true });
  copyText(u); toast('🔗 Link copiado. Quando você mandar, o Garimpo percebe sozinho.');
}
function copyText(t) {
  const ta = document.createElement('textarea'); ta.value = t; ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0';
  document.body.appendChild(ta); ta.select(); let ok = false; try { ok = document.execCommand('copy'); } catch (e) {} ta.remove();
  if (!ok && navigator.clipboard) navigator.clipboard.writeText(t).catch(() => {});
}
function count(el, to) {
  const from = +el.dataset.v || 0; el.dataset.v = to; if (from === to) return;
  const t0 = performance.now(), d = 600, isF = !Number.isInteger(to);
  const step = t => { const k = Math.min(1, (t - t0) / d), v = from + (to - from) * (1 - Math.pow(1 - k, 3)); el.textContent = isF ? v.toFixed(1) : fmt(Math.round(v)); if (k < 1) requestAnimationFrame(step); };
  requestAnimationFrame(step); el.closest('.kpi')?.classList.remove('bump'); void el.offsetWidth; el.closest('.kpi')?.classList.add('bump');
}

/* som */
let actx;
function ping(hot) {
  if (!S.sound) return;
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    const o = actx.createOscillator(), g = actx.createGain(), t = actx.currentTime;
    o.type = 'sine'; o.frequency.setValueAtTime(hot ? 880 : 520, t); o.frequency.exponentialRampToValueAtTime(hot ? 1760 : 700, t + .12);
    g.gain.setValueAtTime(hot ? .08 : .025, t); g.gain.exponentialRampToValueAtTime(.0001, t + .35);
    o.connect(g).connect(actx.destination); o.start(t); o.stop(t + .4);
  } catch (e) {}
}

/* confete dourado no fim da caçada */
function boom() {
  const c = $('#boom'), x = c.getContext('2d'); c.width = innerWidth; c.height = innerHeight;
  const P = Array.from({ length: 140 }, () => ({ x: innerWidth / 2, y: innerHeight / 3, vx: (Math.random() - .5) * 16, vy: Math.random() * -14 - 2, r: Math.random() * 4 + 2, c: ['#ffcf4a', '#ff9f1c', '#2ef2ff', '#8b5cff', '#ff4d6d'][Math.random() * 5 | 0], a: 1 }));
  (function f() { x.clearRect(0, 0, c.width, c.height); let alive = 0;
    for (const p of P) { p.vy += .35; p.x += p.vx; p.y += p.vy; p.a -= .008; if (p.a > 0) { alive++; x.globalAlpha = p.a; x.fillStyle = p.c; x.fillRect(p.x, p.y, p.r, p.r * 1.6); } }
    if (alive) requestAnimationFrame(f); else x.clearRect(0, 0, c.width, c.height); })();
}

/* ───────── mapa ───────── */
const map = L.map('map', { zoomControl: true, attributionControl: true, preferCanvas: false }).setView([-15.8, -47.9], 4);
// OpenStreetMap: grátis, sem chave. O tema escuro é um filtro CSS (.leaflet-tile-pane em app.css).
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap' }).addTo(map);
let fitted = false;
function marker(l, isNew) {
  const lat = parseFloat(l.data.latitude), lon = parseFloat(l.data.longitude);
  if (!isFinite(lat) || !isFinite(lon)) return;
  const sz = Math.round(10 + l.intel.score / 7), c = TEMPHEX[l.intel.temp];
  const icon = L.divIcon({ className: '', iconSize: [sz, sz], html: `<div class="mk ${isNew ? 'new' : ''} ${S.sel === l.key ? 'sel' : ''}" style="--c:${c};width:${sz}px;height:${sz}px"></div>` });
  let m = S.markers.get(l.key);
  if (m) { m.setIcon(icon); m.setLatLng([lat, lon]); }
  else {
    m = L.marker([lat, lon], { icon, riseOnHover: true }).addTo(map);
    m.on('click', () => openLead(l.key));
    m.on('mouseover', e => showTip(e.originalEvent, `<b>${esc(S.leads.get(l.key).data.title)}</b><span>score ${S.leads.get(l.key).intel.score} · ${esc(S.leads.get(l.key).data.category || '')}</span>`));
    m.on('mouseout', hideTip);
    S.markers.set(l.key, m);
  }
  m.setZIndexOffset(l.intel.score * 10);
}
function syncMarkers() {
  const vis = new Set(visible().map(l => l.key));
  for (const [k, m] of S.markers) { if (!vis.has(k)) { map.removeLayer(m); S.markers.delete(k); } }
  for (const l of visible()) marker(l, false);
}
function fitMap(force) {
  const pts = visible().map(l => [parseFloat(l.data.latitude), parseFloat(l.data.longitude)]).filter(p => isFinite(p[0]));
  if (pts.length && (force || !fitted)) { map.fitBounds(pts, { padding: [60, 60], maxZoom: 15, animate: true }); fitted = true; }
}

/* ───────── KPIs / progresso / top5 / destaque ───────── */
const KPIS = [
  ['leads', 'Leads', '◆', 'var(--gold)', ls => ls.length, ls => 'encontrados'],
  ['hot', 'Quentes', '🔥', 'var(--hot)', ls => ls.filter(l => l.intel.temp === 'quente').length, ls => pctOf(ls, l => l.intel.temp === 'quente') + ' do total'],
  ['wa', 'WhatsApp', '✆', '#25d366', ls => ls.filter(l => l.intel.wa).length, ls => 'contato direto'],
  ['nosite', 'Sem site', '⌀', 'var(--warm)', ls => ls.filter(l => l.intel.site_kind !== 'próprio').length, ls => pctOf(ls, l => l.intel.site_kind !== 'próprio') + ' sem site próprio'],
  ['mail', 'E-mails', '✉', 'var(--cyan)', ls => ls.filter(l => l.intel.emails.length).length, ls => ls.filter(l => l.intel.instagram).length + ' com Instagram'],
  ['avg', 'Score médio', '◎', 'var(--violet)', ls => ls.length ? +(ls.reduce((a, l) => a + l.intel.score, 0) / ls.length).toFixed(1) : 0, ls => 'nota média ' + (avgRating(ls) || '—')],
];
function pctOf(ls, f) { return ls.length ? Math.round(100 * ls.filter(f).length / ls.length) + '%' : '0%'; }
function avgRating(ls) { const r = ls.filter(l => l.intel.reviews); return r.length ? (r.reduce((a, l) => a + l.intel.rating, 0) / r.length).toFixed(1) : ''; }
function buildKpis() { $('#kpis').innerHTML = KPIS.map(k => `<div class="panel kpi" style="--k:${k[3]}"><span>${k[2]} ${k[1]}</span><b data-k="${k[0]}" data-v="0">0</b><small data-s="${k[0]}"></small></div>`).join(''); }
function renderKpis() {
  const ls = visible().filter(l => !l.intel.closed);
  for (const k of KPIS) { count($(`[data-k="${k[0]}"]`), k[4](ls)); $(`[data-s="${k[0]}"]`).textContent = k[5](ls); }
  $('#nLeads').textContent = visible().length; $('#nCli').textContent = [...S.leads.values()].filter(l => l.client).length;
}
const STAGES = [['search', 'Mapa'], ['reviews', 'Avaliações'], ['websites', 'Sites & redes'], ['done', 'Pronto']];
function activeHunt() {
  if (S.hunt !== 'all') return S.hunts.get(+S.hunt);
  const hs = [...S.hunts.values()].sort((a, b) => b.id - a.id);
  return hs.find(h => h.status === 'rodando') || hs[0];
}
let tick;
function renderProgress() {
  const h = activeHunt(), running = h && h.status === 'rodando';
  document.body.classList.toggle('scanning', !!running);
  $('#app').classList.toggle('scanning', !!running);
  const order = STAGES.map(s => s[0]); let cur = h ? (h.status === 'pronta' ? 'done' : (h.stage || 'search')) : '';
  if (cur === 'queued') cur = 'search';
  const ci = order.indexOf(cur);
  $('#steps').innerHTML = STAGES.map((s, i) => {
    const st = !h ? '' : (h.status === 'pronta' || i < ci) ? 'ok' : i === ci ? 'on' : '';
    return (i ? `<div class="ln ${st === 'ok' || (i <= ci && h?.status === 'pronta') ? 'ok' : st === 'on' ? 'on' : ''}"></div>` : '') + `<div class="step ${st}"><i>${st === 'ok' ? '✓' : i + 1}</i>${s[1]}</div>`;
  }).join('');
  $('#pct').textContent = h ? (h.status === 'pronta' ? '100%' : (h.percent || 0) + '%') : '—';
  const sw = h ? sweepsOf(h.id) : [], curS = sw.find(x => x.status === 'rodando'), doneS = sw.filter(x => !['fila', 'rodando'].includes(x.status)).length;
  $('#ptitle').textContent = h ? (sw.length > 1 ? `#${h.id} · ${h.keywords.join(', ')} · 🏘 ${doneS}/${sw.length}${curS ? ' · ' + curS.bairro : ''} · ${fmt(h.places)} leads` : `#${h.id} · ${h.keywords.join(', ')}${h.city ? ' · ' + h.city.split(',')[0] : ''} · ${fmt(h.places)} lugares`) : 'Nenhuma caçada ainda';
  $('#stopBtn').hidden = !running;
  $('#stopBtn').onclick = async () => { if (confirm('Parar essa caçada? Os leads já achados ficam.')) await api('DELETE', '/api/hunts/' + h.id); };
}
function renderTop5() {
  const top = visible().filter(l => !l.intel.closed && !l.client).sort((a, b) => b.intel.score - a.intel.score).slice(0, 6);
  $('#top5').innerHTML = top.map((l, i) => `<div class="t5" data-key="${esc(l.key)}"><span class="rk">${i + 1}</span>${ring(l.intel.score, l.intel.temp)}<div><b>${esc(l.data.title)}</b><small>${esc(l.intel.tags.slice(0, 2).join(' · '))}</small></div></div>`).join('');
  const best = top[0];
  const sp = $('#spot');
  if (!best) { sp.innerHTML = '<h3>★ Lead em destaque</h3><div class="empty">O melhor lead da caçada aparece aqui.</div>'; return; }
  if (sp.dataset.key === best.key && sp.dataset.s == best.intel.score) return;
  sp.dataset.key = best.key; sp.dataset.s = best.intel.score;
  sp.innerHTML = `<h3>★ Lead em destaque</h3><div class="card" data-key="${esc(best.key)}"><div class="ph" style="background-image:url('${esc(safeUrl(best.data.thumbnail))}')"></div>
    <div style="min-width:0;flex:1"><div style="display:flex;justify-content:space-between;gap:8px"><h4>${esc(best.data.title)}</h4>${ring(best.intel.score, best.intel.temp)}</div>
    <p>${esc(best.data.category || '')}</p>${stars(best)}<div class="tags">${best.intel.tags.slice(0, 3).map(tagHtml).join('')}</div></div></div>`;
}

/* ───────── feed ───────── */
function feedLine(f) {
  if (S.hunt !== 'all' && f.hunt && String(f.hunt) !== String(S.hunt)) return;
  const el = document.createElement('div');
  el.className = 'ln-f ' + (f.tone || '');
  if (f.key) el.dataset.key = f.key;
  el.innerHTML = `<time>${esc(f.t)}</time><span>${esc(f.text)}</span>`;
  const box = $('#lines'), stick = box.scrollTop + box.clientHeight >= box.scrollHeight - 30;
  box.appendChild(el);
  while (box.children.length > 400) box.firstChild.remove();
  if (stick) box.scrollTop = box.scrollHeight;
}

/* ───────── caçadas ───────── */
function renderHunts() {
  const hs = [...S.hunts.values()].sort((a, b) => b.id - a.id);
  $('#hCount').textContent = hs.length ? hs.length + ' no total' : '';
  const per = id => [...S.leads.values()].filter(l => inHunt(l, id));
  $('#hList').innerHTML = hs.length ? hs.map(h => {
    const ls = per(h.id), hot = ls.filter(l => l.intel.temp === 'quente').length;
    return `<div class="hcard ${String(S.hunt) === String(h.id) ? 'on' : ''}" data-h="${h.id}">
      <div style="display:flex;justify-content:space-between;gap:8px;align-items:center"><b>${h.opts?.kind === 'cliente' ? '🛡 Cliente: ' : h.opts?.kind === 'checagem' ? '🛡 ' : ''}${esc(h.keywords.join(', '))}</b><span class="st ${esc(h.status)}">${esc(h.status)}</span></div>
      <div class="meta"><span>📍 ${esc((h.city || 'sem cidade').split(',')[0])}${h.opts?.bairros ? ' · 🏘 ' + h.opts.bairros : ''}</span><span>◆ ${ls.length}</span><span>🔥 ${hot}</span><span>${esc((h.created || '').slice(5, 16).replace('T', ' '))}</span></div>
      <div class="bar"><i style="width:${h.status === 'pronta' ? 100 : h.percent || 0}%"></i></div></div>`;
  }).join('') : '<div style="padding:16px;color:var(--ink3);font-size:13px">Nenhuma caçada ainda. Monte a primeira aí em cima. ☝️</div>';
  const sel = $('#huntSel');
  sel.innerHTML = `<option value="all">Todas as caçadas</option>` + hs.map(h => `<option value="${h.id}">#${h.id} · ${esc(h.keywords.join(', ')).slice(0, 40)}</option>`).join('');
  sel.value = String(S.hunt);
  const cc = {}; [...S.leads.values()].forEach(l => { const c = cityOf(l); if (c) cc[c] = (cc[c] || 0) + 1; });
  const cs = $('#citySel'); cs.innerHTML = `<option value="">Todas as cidades</option>` + Object.entries(cc).sort((a, b) => b[1] - a[1]).map(([c, n]) => `<option value="${esc(c)}">${esc(c)} (${n})</option>`).join('');
  cs.value = S.city2 || '';
  $('#export').href = '/api/export.csv' + (S.hunt !== 'all' ? '?hunt=' + S.hunt : '');
}
function setHunt(h) { S.hunt = h; fitted = false; renderAll(); fitMap(true); }

/* ───────── leads (grade) ───────── */
function tagCounts(ls) { const c = {}; ls.forEach(l => l.intel.tags.forEach(t => c[t] = (c[t] || 0) + 1)); return c; }
function renderFilters() {
  const ls = visible(), tc = tagCounts(ls), f = S.f;
  const tc2 = { all: ls.length, quente: 0, morno: 0, frio: 0 }; ls.forEach(l => tc2[l.intel.temp]++);
  const tags = [...GAP_TAGS, ...CAP_TAGS].filter(t => tc[t]);
  $('#filters').innerHTML = `<div class="search">🔎<input id="fq" placeholder="Buscar nome, bairro, categoria…" value="${esc(f.q)}"></div>
    ${['all', 'quente', 'morno', 'frio'].map(t => `<button class="fchip ${f.temp === t ? 'on' : ''}" data-temp="${t}">${{ all: 'Todos', quente: '🔥 Quentes', morno: '🌤 Mornos', frio: '🧊 Frios' }[t]} <em>${tc2[t]}</em></button>`).join('')}
    <span style="width:1px;height:20px;background:var(--line2)"></span>
    ${tags.map(t => `<button class="fchip ${f.tags.has(t) ? 'on' : ''}" data-tag="${esc(t)}">${esc(t)} <em>${tc[t]}</em></button>`).join('')}
    ${(() => { const bc = {}; ls.forEach(l => { const b = bairroOf(l); if (b) bc[b] = (bc[b] || 0) + 1; }); const bs = Object.entries(bc).sort((a, b) => b[1] - a[1]);
      return bs.length ? `<select class="bsel" id="fbairro"><option value="">🏘 Todos os bairros</option>${bs.map(([b, n]) => `<option value="${esc(b)}" ${S.bfilter === b ? 'selected' : ''}>${esc(b)} (${n})</option>`).join('')}</select>` : ''; })()}
    <button class="fchip" id="bulkLinks" title="Copiar os links api.whatsapp dos leads filtrados">🔗 Copiar links</button>
    <button class="fchip on" id="bulkProspect" title="Colocar os leads filtrados na fila de disparo automático">🚀 Prospectar</button>
    <select class="sortsel" id="fsort">${[['score', 'Maior score'], ['opp', 'Mais lacunas'], ['cap', 'Mais capacidade'], ['reviews', 'Mais avaliações'], ['rating', 'Pior nota'], ['new', 'Mais recentes'], ['name', 'Nome']].map(o => `<option value="${o[0]}" ${f.sort === o[0] ? 'selected' : ''}>${o[1]}</option>`).join('')}</select>`;
  const fq = $('#fq'); fq.oninput = () => { f.q = fq.value; renderGrid(); };
  $('#bulkLinks').onclick = async () => {
    const ls = filtered().filter(l => (l.intel.wa || l.intel.tel) && !l.client);
    if (!ls.length) return toast('Nenhum lead com número nesse filtro');
    const txt = ls.slice(0, 200).map(l => `${l.data.title}\n${apiLink(l)}`).join('\n\n');
    copyText(txt);
    ls.slice(0, 200).forEach(l => api('PATCH', '/api/leads/' + encodeURIComponent(l.key), { wa_link: true }));
    toast(`🔗 ${Math.min(200, ls.length)} links copiados`);
  };
  $('#bulkProspect').onclick = () => prospectModal(filtered());
}
function filtered() {
  const f = S.f, q = f.q.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  let ls = visible().filter(l => (f.temp === 'all' || l.intel.temp === f.temp) && [...f.tags].every(t => l.intel.tags.includes(t)) && (!S.bfilter || bairroOf(l) === S.bfilter));
  if (q) ls = ls.filter(l => (l.data.title + ' ' + l.data.category + ' ' + l.data.address + ' ' + l.data.categories).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').includes(q));
  const by = { score: l => -l.intel.score, opp: l => -l.intel.opp, cap: l => -l.intel.cap, reviews: l => -l.intel.reviews, rating: l => l.intel.reviews ? l.intel.rating : 9, new: l => -Date.parse(l.first_seen), name: l => l.data.title.toLowerCase() }[f.sort];
  return ls.sort((a, b) => { const x = by(a), y = by(b); return x < y ? -1 : x > y ? 1 : 0; });
}
function card(l) {
  const d = l.data, i = l.intel;
  return `<article class="lc" data-key="${esc(l.key)}">
    <div class="cv" style="background-image:url('${esc(safeUrl(d.thumbnail))}')"><span class="tbadge ${i.temp} temp">${i.temp}</span>${l.pipeline !== 'novo' ? `<span class="pipe-b">${esc(PIPE[l.pipeline][0])}</span>` : ''}${l.client ? '<span class="clib">🛡 CLIENTE</span>' : ''}</div>
    ${ring(i.score, i.temp)}
    <div class="bd"><h4>${esc(d.title)}</h4><div class="cat">${esc(d.category || '—')}${cityOf(l) ? ' · 📍 ' + esc(cityOf(l)) : ''}${bairroOf(l) ? ' · 🏘 ' + esc(bairroOf(l)) : ''}</div>
    ${stars(l)}<div class="tags">${i.tags.slice(0, 5).map(tagHtml).join('')}</div>
    <div class="acts">
      <a class="ic wa ${i.wa ? '' : 'off'}" title="WhatsApp com abordagem" target="_blank" rel="noopener" href="${esc(waLink(l))}" data-stop>💬</a>
      <button class="ic ${i.wa || i.tel ? '' : 'off'}" title="Copiar link do WhatsApp com a mensagem" data-copylink="${esc(l.key)}" data-stop>🔗</button>
      <a class="ic ${i.tel ? '' : 'off'}" title="Ligar" href="tel:+${esc(i.tel)}" data-stop>📞</a>
      <a class="ic ${i.emails.length ? '' : 'off'}" title="E-mail" href="mailto:${esc(i.emails[0] || '')}" data-stop>✉️</a>
      <a class="ic ${i.instagram ? '' : 'off'}" title="Instagram" target="_blank" rel="noopener" href="${esc(safeUrl(i.instagram))}" data-stop>📸</a>
      <a class="ic ${d.website ? '' : 'off'}" title="Site" target="_blank" rel="noopener" href="${esc(safeUrl(d.website))}" data-stop>🌐</a>
      <a class="ic" title="Google Maps" target="_blank" rel="noopener" href="${esc(safeUrl(d.link))}" data-stop>📍</a>
    </div></div></article>`;
}
function renderGrid() {
  const ls = filtered();
  $('#grid').innerHTML = ls.length ? ls.map(card).join('') : `<div class="empty-big"><div><b>Nada por aqui ainda</b>Inicie uma varredura ou afrouxe os filtros.</div></div>`;
}

/* ───────── funil ───────── */
const ACK = { lida: ['👁 lida', 'var(--good)', 'read'], entregue: ['✓✓ entregue', 'var(--cyan)', 'delivered'], sem_entrega: ['⚠ sem entrega', 'var(--hot)', 'sent'], enviada: ['📤 enviada', 'var(--ink3)', 'sent'] };
function ackBadge(l) {
  const a = l.ack, t = a && ACK[a.state];
  if (!t) return `<span class="wain" style="color:var(--cyan)">📤 enviada ${esc(ago(l.wa.out))}</span>`;
  const tip = a.state === 'sem_entrega' ? 'Sem confirmação de entrega há mais de 15 min: celular desligado ou número errado' : '';
  return `<span class="wain" style="color:${t[1]}" title="${esc(tip)}">${t[0]} ${esc(ago(a[t[2]] || a.sent))}</span>`;
}
function ackLine(a) {
  const bits = [`📤 enviada ${fmtTs(a.sent)}`]; if (a.delivered) bits.push(`✓✓ entregue ${fmtTs(a.delivered)}`); if (a.read) bits.push(`👁 lida ${fmtTs(a.read)}`);
  if (a.state === 'sem_entrega') bits.push('⚠ sem confirmação de entrega');
  return esc(bits.join(' · ')) + '<br>';
}
function ago(ts) {
  const t = Date.parse(ts); if (!t) return ''; const m = Math.max(0, Math.round((Date.now() - t) / 60000));
  return m < 60 ? `há ${m} min` : m < 1440 ? `há ${Math.floor(m / 60)} h` : `há ${Math.floor(m / 1440)} d`;
}
function renderKanban() {
  const ls = visible();
  $('#kanban').innerHTML = Object.entries(PIPE).map(([k, [name, c]]) => {
    const col = ls.filter(l => l.pipeline === k).sort((a, b) => b.intel.score - a.intel.score);
    return `<section class="kcol" data-p="${k}" style="--c:${c}"><header><b><i></i>${name}</b><span>${col.length}</span></header>
      <div class="kl">${col.slice(0, 300).map(l => `<div class="kc" draggable="true" data-key="${esc(l.key)}">${ring(l.intel.score, l.intel.temp)}<div><b>${esc(l.data.title)}</b><small>${esc(l.intel.tags.slice(0, 2).join(' · ') || l.data.category)}</small>${l.wa?.in ? `<span class="wain">💬 ${esc(l.wa.text || '')}</span>` : l.wa?.out ? ackBadge(l) : ''}
        ${k === 'contatado' || k === 'negociando' ? `<span class="kact">${!l.diag?.sent && (l.intel.wa || l.intel.tel) ? `<button data-kwant="${esc(l.key)}" title="A pessoa pediu o diagnóstico (EU QUERO): o Claude monta e o Garimpo manda o link">🙋 quer o diagnóstico</button>` : l.diag?.sent ? '<em>🧾 diagnóstico enviado</em>' : ''}${k === 'contatado' ? `<button data-kreply="${esc(l.key)}" title="Ela respondeu no WhatsApp: mover para Negociando">💬 respondeu</button>` : ''}</span>` : ''}</div></div>`).join('')}</div></section>`;
  }).join('');
}
document.addEventListener('dragstart', e => { const k = e.target.closest?.('.kc'); if (k) e.dataTransfer.setData('text/plain', k.dataset.key); });
document.addEventListener('dragover', e => { const c = e.target.closest?.('.kcol'); if (c) { e.preventDefault(); $$('.kcol').forEach(x => x.classList.toggle('over', x === c)); } });
document.addEventListener('drop', async e => {
  const c = e.target.closest?.('.kcol'); $$('.kcol').forEach(x => x.classList.remove('over')); if (!c) return; e.preventDefault();
  const key = e.dataTransfer.getData('text/plain'); if (!key) return;
  const l = S.leads.get(key); if (l) { l.pipeline = c.dataset.p; renderKanban(); }
  await api('PATCH', '/api/leads/' + encodeURIComponent(key), { pipeline: c.dataset.p });
  if (c.dataset.p === 'fechado') { boom(); toast('💰 Fechou! Bora pro próximo.'); }
});

/* ───────── inteligência ───────── */
function showTip(e, html) { const t = $('#tip'); t.innerHTML = html; t.style.display = 'block'; t.style.left = Math.min(e.clientX + 14, innerWidth - 270) + 'px'; t.style.top = (e.clientY + 14) + 'px'; }
function hideTip() { $('#tip').style.display = 'none'; }
function hbars(rows, color, opts = {}) {
  const W = 520, rh = 30, lw = opts.lw || 160, max = Math.max(1, ...rows.map(r => r.v)), H = rows.length * rh;
  return `<svg viewBox="0 0 ${W} ${H}" role="img">${rows.map((r, i) => {
    const w = Math.max(4, (W - lw - 70) * r.v / max), y = i * rh;
    return `<g class="hit" data-tip="${esc(r.tip || '')}" ${r.filter ? `data-filter="${esc(r.filter)}"` : ''} ${r.fb ? `data-fb="${esc(r.fb)}"` : ''}><rect x="0" y="${y}" width="${W}" height="${rh}" fill="transparent"/>
      <text class="lbl" x="0" y="${y + 19}">${esc(r.l.length > 22 ? r.l.slice(0, 21) + '…' : r.l)}</text>
      <rect x="${lw}" y="${y + 8}" width="${w}" height="14" rx="4" fill="${r.c || color}"/>
      <text class="val" x="${lw + w + 8}" y="${y + 19}">${esc(r.t ?? r.v)}</text></g>`;
  }).join('')}</svg>`;
}
function renderIntel() {
  const ls = visible().filter(l => !l.intel.closed), n = ls.length || 1, el = $('#intel');
  if (!ls.length) { el.innerHTML = `<div class="panel empty-big"><div><b>Sem dados ainda</b>Rode uma caçada e o mapa de oportunidades aparece aqui.</div></div>`; return; }
  const tc = tagCounts(ls);
  const hot = ls.filter(l => l.intel.temp === 'quente'), noSite = ls.filter(l => l.intel.site_kind !== 'próprio').length;
  const ticket = hot.length * 800;
  // distribuição de score
  const bins = Array.from({ length: 10 }, (_, i) => ({ i, n: 0 })); ls.forEach(l => bins[Math.min(9, Math.floor(l.intel.score / 10))].n++);
  const bmax = Math.max(1, ...bins.map(b => b.n)), BW = 520, BH = 160;
  const hist = `<svg viewBox="0 0 ${BW} ${BH + 24}">${[0, .5, 1].map(g => `<line x1="0" x2="${BW}" y1="${BH - BH * g}" y2="${BH - BH * g}" stroke="rgba(140,170,255,.08)"/>`).join('')}
    ${bins.map(b => { const w = BW / 10 - 4, h = Math.max(b.n ? 4 : 0, BH * b.n / bmax), x = b.i * BW / 10 + 2, c = b.i >= 7 ? TEMPHEX.quente : b.i >= 5 ? TEMPHEX.morno : TEMPHEX.frio;
      return `<g class="hit" data-tip="Score ${b.i * 10}–${b.i * 10 + 9}|${b.n} leads"><rect x="${x}" y="0" width="${w}" height="${BH}" fill="transparent"/><rect x="${x}" y="${BH - h}" width="${w}" height="${h}" rx="4" fill="${c}"/>${b.n ? `<text class="val" x="${x + w / 2}" y="${BH - h - 6}" text-anchor="middle">${b.n}</text>` : ''}<text x="${x + w / 2}" y="${BH + 16}" text-anchor="middle">${b.i * 10}</text></g>`; }).join('')}</svg>`;
  // lacunas
  const gaps = GAP_TAGS.map(t => ({ l: t, v: tc[t] || 0, t: Math.round(100 * (tc[t] || 0) / n) + '%', filter: t, tip: `${t}|${tc[t] || 0} de ${ls.length} negócios — clique para ver` })).filter(r => r.v).sort((a, b) => b.v - a.v);
  // categorias & bairros
  const cnt = f => { const m = {}; ls.forEach(l => { const k = f(l); if (k) m[k] = (m[k] || 0) + 1; }); return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 8); };
  const cats = cnt(l => l.data.category).map(([k, v]) => ({ l: k, v, tip: `${k}|${v} leads` }));
  const bm = {}; ls.forEach(l => { const b = bairroOf(l); if (!b) return; const x = bm[b] = bm[b] || { b, n: 0, hot: 0, nosite: 0, sc: 0, wa: 0 }; x.n++; x.sc += l.intel.score; if (l.intel.temp === 'quente') x.hot++; if (l.intel.site_kind !== 'próprio') x.nosite++; if (l.intel.wa) x.wa++; });
  const hsort = S.heatSort || 'hot', brows = Object.values(bm).map(x => ({ ...x, avg: x.sc / x.n, pns: x.nosite / x.n }));
  brows.sort((a, b) => hsort === 'b' ? a.b.localeCompare(b.b) : (b[hsort] - a[hsort]) || (b.n - a.n));
  const bmaxN = Math.max(1, ...brows.map(x => x.n)), bmaxH = Math.max(1, ...brows.map(x => x.hot));
  const heat = brows.length ? `<table class="heat"><thead><tr><th data-hsort="b">Bairro</th><th data-hsort="n">Leads</th><th data-hsort="hot">🔥 Quentes</th><th data-hsort="avg">Score médio</th><th data-hsort="pns">Sem site</th><th data-hsort="wa">WhatsApp</th></tr></thead><tbody>
    ${brows.slice(0, 60).map(x => `<tr class="r" data-fb="${esc(x.b)}"><td><b>${esc(x.b)}</b></td>
      <td><div class="cell"><span class="b"><i style="width:${100 * x.n / bmaxN}%;background:var(--cyan)"></i></span>${x.n}</div></td>
      <td><div class="cell"><span class="b"><i style="width:${100 * x.hot / bmaxH}%;background:var(--hot)"></i></span>${x.hot}</div></td>
      <td><div class="cell"><span class="b"><i style="width:${x.avg}%;background:var(--violet)"></i></span>${x.avg.toFixed(0)}</div></td>
      <td>${Math.round(100 * x.pns)}%</td><td>${x.wa}</td></tr>`).join('')}</tbody></table>` : '<p class="sub">Sem bairros nos dados.</p>';
  // dispersão avaliações × nota
  const SW = 760, SH = 340, pad = 40, withR = ls.filter(l => l.intel.reviews);
  const maxR = Math.max(10, ...withR.map(l => l.intel.reviews)) * 1.15;
  const ylo = Math.min(4, Math.floor(Math.min(5, ...withR.map(l => l.intel.rating)) * 2) / 2), yhi = 5.05;
  const lx = v => pad + (SW - pad - 14) * Math.log10(Math.max(1, v)) / Math.log10(maxR);
  const ly = v => 40 + (SH - 80) * (yhi - Math.max(ylo, v)) / (yhi - ylo);
  const mx = lx(100), my = ly(4.3);
  const ticksY = []; for (let v = ylo; v <= 5.001; v += 0.5) ticksY.push(+v.toFixed(1));
  const scatter = `<svg viewBox="0 0 ${SW} ${SH}">
    <rect x="${mx}" y="40" width="${SW - mx - 14}" height="${my - 40}" fill="rgba(61,255,168,.035)"/><rect x="${pad}" y="40" width="${mx - pad}" height="${my - 40}" fill="rgba(255,207,74,.05)"/>
    <rect x="${mx}" y="${my}" width="${SW - mx - 14}" height="${SH - 40 - my}" fill="rgba(255,77,109,.05)"/>
    <line x1="${mx}" x2="${mx}" y1="40" y2="${SH - 40}" stroke="rgba(140,170,255,.18)" stroke-dasharray="4 4"/><line x1="${pad}" x2="${SW - 14}" y1="${my}" y2="${my}" stroke="rgba(140,170,255,.18)" stroke-dasharray="4 4"/>
    <text x="${pad}" y="16" style="fill:var(--gold)">💎 JOIAS ESCONDIDAS · nota boa, pouca visibilidade</text>
    <text x="${SW - 14}" y="16" text-anchor="end" style="fill:var(--good)">👑 GIGANTES · fortes, pagam bem</text>
    <text x="${SW - 14}" y="${SH - 4}" text-anchor="end" style="fill:var(--hot)">🚨 REPUTAÇÃO EM RISCO · movimento alto, nota baixa</text>
    <text x="${pad}" y="${SH - 4}">🌱 INICIANTES</text>
    ${ticksY.map(v => `<text x="${pad - 8}" y="${ly(v) + 4}" text-anchor="end">${v.toFixed(1)}</text><line x1="${pad}" x2="${SW - 14}" y1="${ly(v)}" y2="${ly(v)}" stroke="rgba(140,170,255,.05)"/>`).join('')}
    ${[1, 10, 100, 1000, 10000].filter(v => v < maxR).map(v => `<text x="${lx(v)}" y="${SH - 24}" text-anchor="middle">${fmt(v)}</text>`).join('')}
    ${withR.map(l => `<g class="hit" data-key="${esc(l.key)}" data-tip="${esc(l.data.title)}|★ ${l.intel.rating.toFixed(1)} · ${fmt(l.intel.reviews)} aval. · score ${l.intel.score}"><circle cx="${lx(l.intel.reviews)}" cy="${ly(l.intel.rating)}" r="${4 + l.intel.score / 18}" fill="${TEMPHEX[l.intel.temp]}" fill-opacity=".85" stroke="#0a0e17" stroke-width="2"/></g>`).join('')}
  </svg>`;
  el.innerHTML = `
    <div class="panel insight"><div><div class="big">${hot.length}</div><small class="mono" style="color:var(--ink3)">LEADS QUENTES</small></div>
      <ul><li><b>${Math.round(100 * noSite / n)}%</b>não têm site próprio: venda de site/landing é o caminho</li>
      <li><b>${tc['Sem Instagram'] || 0}</b>sem Instagram encontrado</li>
      <li><b>${(tc['Nota baixa'] || 0) + (tc['Nota mediana'] || 0)}</b>precisam de gestão de reputação</li>
      <li><b>R$ ${fmt(ticket)}/mês</b>potencial se fechar todos os quentes a R$ 800</li></ul></div>
    <div class="panel chart"><h3>◭ Distribuição de score</h3><p class="sub">Quantos leads em cada faixa. A partir de 65 o lead é quente; de 45 a 64, morno.</p>${hist}</div>
    <div class="panel chart"><h3>⌀ Lacunas do mercado</h3><p class="sub">O que falta nesses negócios. Clique para filtrar os leads.</p>${hbars(gaps, 'var(--gold)')}</div>
    <div class="panel chart wide"><h3>✦ Mapa de oportunidade · avaliações × nota</h3><p class="sub">Cada ponto é um negócio, colorido pela temperatura (🔥 quente · morno · frio). Eixo horizontal em escala log. Clique para abrir.</p>${scatter}</div>
    <div class="panel chart"><h3>▦ Categorias</h3><p class="sub">O que mais apareceu nessa caçada.</p>${hbars(cats, 'var(--cyan)')}</div>
    <div class="panel chart"><h3>⌂ Top bairros</h3><p class="sub">Onde há mais leads. Clique para filtrar.</p>${hbars(brows.slice().sort((a, b) => b.n - a.n).slice(0, 8).map(x => ({ l: x.b, v: x.n, fb: x.b, tip: `${x.b}|${x.n} leads · ${x.hot} quentes` })), 'var(--violet)')}</div>
    <div class="panel chart wide"><h3>🏘 Ranking de bairros</h3><p class="sub">Onde vale a pena prospectar. Clique no título de uma coluna para ordenar e numa linha para ver os leads do bairro.</p>${heat}</div>`;
}
document.addEventListener('mousemove', e => { const g = e.target.closest?.('[data-tip]'); if (g && g.closest('.chart')) { const [a, b] = g.dataset.tip.split('|'); showTip(e, `<b>${esc(a)}</b><span>${esc(b || '')}</span>`); } else if (!e.target.closest?.('.leaflet-marker-icon')) hideTip(); });

/* ───────── gaveta do lead ───────── */
function md(s) {
  const lines = esc(s).split('\n'); let out = '', inList = false;
  for (let ln of lines) {
    ln = ln.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/`(.+?)`/g, '<code>$1</code>');
    const h = ln.match(/^#{1,3}\s+(.*)/), li = ln.match(/^\s*[-*•]\s+(.*)/);
    if (li) { if (!inList) { out += '<ul>'; inList = true; } out += `<li>${li[1]}</li>`; continue; }
    if (inList) { out += '</ul>'; inList = false; }
    const bq = ln.match(/^\s*&gt;\s?(.*)/);
    out += h ? `<h2>${h[1]}</h2>` : bq ? `<blockquote>${bq[1]}</blockquote>` : ln.trim() ? `<p>${ln}</p>` : '';
  }
  return out + (inList ? '</ul>' : '');
}
function openLead(key) {
  const l = S.leads.get(key); if (!l) return;
  const prev = S.sel; S.sel = key;
  [prev, key].forEach(k => { const x = S.leads.get(k); if (x && S.markers.has(k)) marker(x, false); });
  const d = l.data, i = l.intel, dr = $('#drawer');
  const hist = d.reviews_per_rating && typeof d.reviews_per_rating === 'object' ? d.reviews_per_rating : null;
  const hmax = hist ? Math.max(1, ...Object.values(hist)) : 1;
  const hours = d.open_hours && typeof d.open_hours === 'object' ? Object.entries(d.open_hours) : [];
  const revs = Array.isArray(d.user_reviews) ? d.user_reviews : [];
  const busy = S.aiBusy.has(key);
  dr.innerHTML = `
    <div class="dhero" style="background-image:url('${esc(safeUrl(d.thumbnail))}')"><button class="dclose" id="dclose">✕</button>
      <div class="in">${ring(i.score, i.temp, 'big')}<div style="min-width:0"><span class="tbadge ${i.temp}">${i.temp}</span><h2>${esc(d.title)}</h2><p>${esc(d.category || '')} ${i.reviews ? `· <b style="color:var(--gold)">★ ${i.rating.toFixed(1)}</b> (${fmt(i.reviews)})` : ''}</p></div></div></div>
    <div class="dbody">
      <div class="sec"><div class="tags">${i.tags.map(tagHtml).join('')}</div></div>
      <div class="sec"><h5>Contato</h5><div class="cta">
        <a class="wa ${i.wa ? '' : 'off'}" target="_blank" rel="noopener" id="waBtn" href="${esc(waLink(l))}"><span class="e">💬</span>WhatsApp</a>
        <a class="${i.tel ? '' : 'off'}" href="tel:+${esc(i.tel)}"><span class="e">📞</span>${esc(d.phone || 'Ligar')}</a>
        <a class="${i.emails.length ? '' : 'off'}" id="mailBtn" href="mailto:${esc(i.emails[0] || '')}?subject=${encodeURIComponent(d.title)}&body=${encodeURIComponent(i.pitch)}"><span class="e">✉️</span>E-mail</a>
        <a class="${i.instagram ? '' : 'off'}" target="_blank" rel="noopener" href="${esc(safeUrl(i.instagram))}"><span class="e">📸</span>Instagram</a>
        <a class="${d.website ? '' : 'off'}" target="_blank" rel="noopener" href="${esc(safeUrl(d.website))}"><span class="e">🌐</span>${esc(i.site_kind)}</a>
        <a class="${i.facebook ? '' : 'off'}" target="_blank" rel="noopener" href="${esc(safeUrl(i.facebook))}"><span class="e">📘</span>Facebook</a>
        <a target="_blank" rel="noopener" href="${esc(safeUrl(d.link))}"><span class="e">📍</span>Maps</a>
        <a class="${d.reviews_link ? '' : 'off'}" target="_blank" rel="noopener" href="${esc(safeUrl(d.reviews_link))}"><span class="e">⭐</span>Avaliações</a>
      </div></div>
      <div class="sec"><h5>🧾 Diagnóstico gratuito ${l.diag?.ai ? '<span style="color:var(--good)">personalizado pelo Claude</span>' : ''}</h5>
        ${l.diag?.url ? `<div class="wabox"><a href="${esc(l.diag.url)}" target="_blank" rel="noopener" style="color:var(--good-t);word-break:break-all">${esc(l.diag.url)}</a>${l.diag.sent ? `<br>📤 enviado ${esc(fmtTs(l.diag.sent))}` : ''}${l.diag.state === 'gerando' ? '<br>⏳ Claude montando…' : l.diag.state === 'erro' ? '<br>⚠ deu erro na última tentativa' : ''}</div>` : '<div class="sub">A página é criada em alguns segundos.</div>'}
        <div class="row"><button class="btn" id="dgCopy" ${l.diag?.url ? '' : 'disabled'}>Copiar link</button><button class="btn ai" id="dgGen" ${l.diag?.state === 'gerando' ? 'disabled' : ''}>🧠 Personalizar com Claude</button>${(i.wa || i.tel) && S.wa?.state === 'conectado' ? '<button class="btn gold" id="dgSend">📤 Gerar e mandar no WhatsApp</button>' : ''}</div></div>
      <div class="sec"><h5>Meu cliente?</h5><button class="btn cli ${l.client ? 'on' : ''}" id="cliBtn">${l.client ? '✓ É meu cliente (ver na Blindagem)' : '🛡 Marcar como meu cliente'}</button></div>
      <div class="sec"><h5>Funil</h5><div class="pipesel" id="pipesel">${Object.entries(PIPE).map(([k, [n, c]]) => `<button data-p="${k}" style="--c:${c}" class="${l.pipeline === k ? 'on' : ''}">${n}</button>`).join('')}</div></div>
      <div class="sec"><h5>Por que esse score</h5>
        <div class="split"><div><small>Oportunidade</small><b style="color:var(--gold)">${i.opp}</b></div><div><small>Capacidade</small><b style="color:var(--cyan)">${i.cap}</b></div></div>
        <div class="why">${i.why.map(w => `<div class="${w.k === 'opp' ? 'o' : 'c'}"><span>${esc(w.label)}</span><span class="b"><i style="width:${Math.min(100, w.pts * 4)}%"></i></span><em>+${w.pts}</em></div>`).join('')}</div></div>
      <div class="sec"><h5>Abordagem <span class="mono" style="letter-spacing:0">edite e mande</span></h5>
        <textarea class="pitch" id="pitch" rows="4">${esc(i.pitch)}</textarea>
        <div class="row"><button class="btn" id="copyP">Copiar texto</button>${i.wa || i.tel ? '<button class="btn" id="linkP">🔗 Copiar link api.whatsapp</button>' : ''}${i.wa ? '<button class="btn" id="sendP">Abrir no WhatsApp</button>' : ''}${(i.wa || i.tel) && S.wa?.state === 'conectado' ? '<button class="btn gold" id="sendG">📤 Enviar pelo Garimpo</button>' : ''}</div>
        ${l.wa?.out || l.wa?.in || l.wa?.link ? `<div class="wabox" style="margin-top:10px">${l.wa.link ? `🔗 link copiado ${esc(fmtTs(l.wa.link))}<br>` : ''}${l.ack ? ackLine(l.ack) : l.wa.out ? `📤 você mandou ${esc(fmtTs(l.wa.out))}<br>` : ''}${l.wa.in ? `💬 <b>respondeu ${esc(fmtTs(l.wa.in))}:</b> ${esc(l.wa.text || '')}` : ''}</div>` : ''}</div>
      <div class="sec"><h5>🧠 Análise com Claude</h5>
        <input class="focus" id="aiFocus" placeholder="Foco opcional (ex: vendo tráfego pago, vendo site…)">
        <div class="row"><button class="btn ai" id="aiBtn" ${busy ? 'disabled' : ''}>${l.ai ? 'Analisar de novo' : 'Analisar esse lead'}</button></div>
        <div id="aiOut">${busy ? '<div class="aibox"><div class="thinking"><i></i><i></i><i></i>Claude está pensando…</div></div>' : l.ai ? `<div class="aibox">${md(l.ai)}</div>` : ''}</div></div>
      <div class="sec"><h5>Notas</h5><textarea class="notes" id="notes" rows="3" placeholder="Falei com o dono, retorno sexta…">${esc(l.notes)}</textarea></div>
      <div class="sec"><h5>Ficha</h5><dl class="info">
        <dt>Endereço</dt><dd>${esc(d.address || '—')}</dd>
        <dt>Categorias</dt><dd>${esc(d.categories || d.category || '—')}</dd>
        <dt>Status</dt><dd>${esc(d.status || '—')}</dd>
        <dt>E-mails</dt><dd>${i.emails.map(esc).join(', ') || '—'}</dd>
        <dt>Site</dt><dd>${d.website ? `<a target="_blank" rel="noopener" href="${esc(safeUrl(d.website))}">${esc(d.website)}</a>` : '—'}</dd>
        ${i.tiktok ? `<dt>TikTok</dt><dd><a target="_blank" rel="noopener" href="${esc(safeUrl(i.tiktok))}">${esc(i.tiktok)}</a></dd>` : ''}
        ${i.linkedin ? `<dt>LinkedIn</dt><dd><a target="_blank" rel="noopener" href="${esc(safeUrl(i.linkedin))}">${esc(i.linkedin)}</a></dd>` : ''}
        ${d.price_range ? `<dt>Preço</dt><dd>${esc(d.price_range)}</dd>` : ''}
        ${d.descriptions ? `<dt>Descrição</dt><dd>${esc(d.descriptions)}</dd>` : ''}
        <dt>Busca</dt><dd>${esc(d.input_id)}</dd></dl></div>
      ${hist ? `<div class="sec"><h5>Notas recebidas</h5><div class="hist">${[5, 4, 3, 2, 1].map(s => `<div><span>${s}★</span><span class="b"><i style="width:${100 * (hist[s] || 0) / hmax}%"></i></span><span>${fmt(hist[s] || 0)}</span></div>`).join('')}</div></div>` : ''}
      ${revs.length ? `<div class="sec"><h5>Avaliações recentes</h5>${revs.map(r => `<div class="rev"><b>${'★'.repeat(r.Rating || 0)}</b> <span class="mono" style="font-size:11px;color:var(--ink3)">${esc(r.When || '')}</span><div>${esc(r.Description || '(sem texto)')}</div></div>`).join('')}</div>` : ''}
      ${hours.length ? `<div class="sec"><h5>Horários</h5><dl class="info">${hours.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc([].concat(v).join(', '))}</dd>`).join('')}</dl></div>` : ''}
    </div>`;
  $('#scrim').classList.add('on'); dr.classList.add('on');
  $('#dclose').onclick = closeLead;
  $('#copyP').onclick = () => { copyText($('#pitch').value); toast('Copiado ✓'); };
  $('#dgCopy').onclick = () => { copyText(l.diag.url); toast('Link do diagnóstico copiado'); };
  $('#dgGen').onclick = async () => { await api('POST', '/api/leads/' + encodeURIComponent(key) + '/diag', {}); toast('🧠 Claude montando o diagnóstico…'); };
  const dgSend = $('#dgSend'); if (dgSend) dgSend.onclick = async () => { if (!confirm('Gerar o diagnóstico com o Claude e mandar o link agora pelo WhatsApp?')) return; await api('POST', '/api/leads/' + encodeURIComponent(key) + '/diag', { send: true }); toast('🧾 Gerando e enviando…'); };
  const linkP = $('#linkP'); if (linkP) linkP.onclick = () => copyLink(key, $('#pitch').value);
  const sendG = $('#sendG'); if (sendG) sendG.onclick = async () => {
    if (!confirm('Enviar agora esta mensagem pelo seu WhatsApp?\n\n' + $('#pitch').value)) return;
    sendG.disabled = true; sendG.textContent = 'Enviando…';
    try { const out = await api('POST', '/api/wa/send', { key, text: $('#pitch').value }); S.leads.set(key, out); toast('📤 Enviado'); openLead(key); } catch (er) { toast('Erro: ' + er.message); sendG.disabled = false; sendG.textContent = '📤 Enviar pelo Garimpo'; }
  };
  const sendP = $('#sendP'); if (sendP) sendP.onclick = () => window.open(waLink(l, $('#pitch').value), '_blank', 'noopener');
  $('#pitch').oninput = () => { const w = $('#waBtn'); if (i.wa) w.href = waLink(l, $('#pitch').value); };
  $$('#pipesel button').forEach(b => b.onclick = async () => {
    $$('#pipesel button').forEach(x => x.classList.toggle('on', x === b)); l.pipeline = b.dataset.p;
    await api('PATCH', '/api/leads/' + encodeURIComponent(key), { pipeline: b.dataset.p });
    if (b.dataset.p === 'fechado') { boom(); toast('💰 Fechou! Bora pro próximo.'); }
  });
  $('#cliBtn').onclick = async () => { const v = !l.client; const out = await api('PATCH', '/api/leads/' + encodeURIComponent(key), { client: v }); S.leads.set(key, out); toast(v ? '🛡 Agora é seu cliente: veja na Blindagem' : 'Removido dos clientes'); openLead(key); renderSoft(); };
  let nt; $('#notes').oninput = e => { clearTimeout(nt); nt = setTimeout(() => api('PATCH', '/api/leads/' + encodeURIComponent(key), { notes: e.target.value }), 600); };
  $('#aiBtn').onclick = async () => {
    S.aiBusy.add(key); $('#aiBtn').disabled = true;
    $('#aiOut').innerHTML = '<div class="aibox"><div class="thinking"><i></i><i></i><i></i>Claude está pensando…</div></div>';
    try { await api('POST', '/api/leads/' + encodeURIComponent(key) + '/ai', { focus: $('#aiFocus').value }); } catch (e) { toast('Erro: ' + e.message); S.aiBusy.delete(key); }
  };
  const m = S.markers.get(key); if (m && S.view === 'radar') map.panTo(m.getLatLng(), { animate: true });
}
function closeLead() { $('#scrim').classList.remove('on'); $('#drawer').classList.remove('on'); const k = S.sel; S.sel = null; const x = S.leads.get(k); if (x) marker(x, false); }
$('#scrim').onclick = closeLead;
addEventListener('keydown', e => { if (e.key === 'Escape') closeLead(); });

/* ───────── cliques globais ───────── */
document.addEventListener('click', e => {
  const cl = e.target.closest('[data-copylink]'); if (cl) { copyLink(cl.dataset.copylink); return; }
  if (e.target.closest('[data-stop]')) { const w = e.target.closest('.ic.wa'); if (w) autoContact(w.closest('[data-key]')?.dataset.key); return; }
  const hc = e.target.closest('.hcard'); if (hc) { setHunt(String(S.hunt) === hc.dataset.h ? 'all' : hc.dataset.h); return; }
  const tf = e.target.closest('[data-temp]'); if (tf) { S.f.temp = tf.dataset.temp; renderFilters(); renderGrid(); return; }
  const tg = e.target.closest('[data-tag]'); if (tg) { const t = tg.dataset.tag; S.f.tags.has(t) ? S.f.tags.delete(t) : S.f.tags.add(t); renderFilters(); renderGrid(); return; }
  const gf = e.target.closest('[data-filter]'); if (gf) { S.f.tags = new Set([gf.dataset.filter]); S.f.temp = 'all'; S.bfilter = ''; setView('leads'); return; }
  const fb = e.target.closest('[data-fb]'); if (fb) { S.bfilter = fb.dataset.fb; S.f.tags = new Set(); S.f.temp = 'all'; setView('leads'); return; }
  const hs = e.target.closest('[data-hsort]'); if (hs) { S.heatSort = hs.dataset.hsort; renderIntel(); return; }
  const wa = e.target.closest('a.wa, .ic.wa'); if (wa) { const kk = wa.closest('[data-key]')?.dataset.key || S.sel; autoContact(kk); }
  const k = e.target.closest('[data-key]'); if (k && !e.target.closest('.drawer')) { openLead(k.dataset.key); }
});
document.addEventListener('change', e => { if (e.target.id === 'fsort') { S.f.sort = e.target.value; renderGrid(); } if (e.target.id === 'fbairro') { S.bfilter = e.target.value; renderGrid(); } });
$('#huntSel').onchange = e => setHunt(e.target.value);
$('#citySel').onchange = e => { S.city2 = e.target.value; fitted = false; renderAll(); fitMap(true); };
$('#sound').onclick = () => { S.sound = !S.sound; $('#sound').textContent = S.sound ? '🔊' : '🔇'; try { localStorage.setItem('g_sound', S.sound ? '1' : '0'); } catch (e) {} };
$('#sound').textContent = S.sound ? '🔊' : '🔇';

/* abas */
function setView(v) {
  S.view = v; $$('#tabs button').forEach(b => b.classList.toggle('on', b.dataset.v === v));
  $$('.view').forEach(x => x.classList.toggle('on', x.id === 'v-' + v));
  if (v === 'radar') setTimeout(() => map.invalidateSize(), 50);
  renderView();
}
$$('#tabs button').forEach(b => b.onclick = () => setView(b.dataset.v));
function renderView() { if (S.view === 'wa') renderWa(); if (S.view === 'shield') renderShield(); if (S.view === 'leads') { renderFilters(); renderGrid(); } if (S.view === 'funil') renderKanban(); if (S.view === 'intel') renderIntel(); }
let raf;
function renderAll() { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => { renderZones(); renderHunts(); renderKpis(); renderProgress(); renderTop5(); syncMarkers(); renderView(); }); }
let soft;
function renderSoft() { clearTimeout(soft); soft = setTimeout(() => { renderKpis(); renderTop5(); renderHunts(); if (S.view === 'shield' && !document.activeElement?.matches('#findName')) renderShield(); if (S.view !== 'radar' && !document.activeElement?.matches('#fq')) renderView(); else if (S.view === 'leads') renderGrid(); }, 250); }

/* ───────── formulário ───────── */
function renderKw() { $$('#kwBox .chip').forEach(c => c.remove()); S.kw.forEach((k, i) => { const c = document.createElement('span'); c.className = 'chip'; c.innerHTML = `${esc(k)}<button type="button" data-i="${i}">✕</button>`; $('#kwBox').insertBefore(c, $('#kwIn')); }); }
$('#kwBox').onclick = e => { const b = e.target.closest('button[data-i]'); if (b) { S.kw.splice(+b.dataset.i, 1); renderKw(); } else $('#kwIn').focus(); };
$('#kwIn').onkeydown = e => {
  if ((e.key === 'Enter' || e.key === ',') && $('#kwIn').value.trim()) { e.preventDefault(); addKw($('#kwIn').value); }
  else if (e.key === 'Backspace' && !$('#kwIn').value && S.kw.length) { S.kw.pop(); renderKw(); }
};
function addKw(v) { v.split(',').map(s => s.trim()).filter(Boolean).forEach(s => { if (!S.kw.includes(s)) S.kw.push(s); }); $('#kwIn').value = ''; renderKw(); }
$('#sugs').innerHTML = SUGS.map(s => `<button type="button">${esc(s)}</button>`).join('');
$('#sugs').onclick = e => { const b = e.target.closest('button'); if (b) addKw(b.textContent); };
const depthOut = () => { $('#depthOut').textContent = '~' + ($('#depth').value * 20) + ' lugares'; if (S.mode === 'bairros') drawBairros(); };
$('#depth').oninput = depthOut; depthOut();
let acT, acItems = [], acI = -1;
$('#cityIn').oninput = () => {
  S.city = null; clearTimeout(acT); const v = $('#cityIn').value.trim();
  if (v.length < 2) { $('#acList').hidden = true; return; }
  acT = setTimeout(async () => {
    try { acItems = (await api('GET', '/api/cities?q=' + encodeURIComponent(v))).slice(0, 7); } catch (e) { acItems = []; }
    acI = -1; drawAc();
  }, 180);
};
function drawAc() { const el = $('#acList'); el.hidden = !acItems.length; el.innerHTML = acItems.map((c, i) => `<button type="button" data-ci="${i}" class="${i === acI ? 'on' : ''}">📍 ${esc(c.label)}</button>`).join(''); }
$('#acList').onmousedown = e => { const b = e.target.closest('[data-ci]'); if (b) pickCity(acItems[+b.dataset.ci]); };
$('#cityIn').onkeydown = e => {
  if ($('#acList').hidden) return;
  if (e.key === 'ArrowDown') { acI = Math.min(acItems.length - 1, acI + 1); drawAc(); e.preventDefault(); }
  if (e.key === 'ArrowUp') { acI = Math.max(0, acI - 1); drawAc(); e.preventDefault(); }
  if (e.key === 'Enter') { e.preventDefault(); pickCity(acItems[Math.max(0, acI)]); }
};
$('#cityIn').onblur = () => setTimeout(() => { $('#acList').hidden = true; if (S.mode === 'bairros' && !S.city) ensureCity(); }, 200);
function pickCity(c) { if (!c) return Promise.resolve(); S.city = c; $('#cityIn').value = c.label; $('#acList').hidden = true; map.flyTo([+c.lat, +c.lon], 12, { duration: 1.2 }); return S.mode === 'bairros' ? loadBairros() : Promise.resolve(); }
/* Quem digita a cidade e não clica na sugestão também precisa funcionar: pega a primeira sugestão sozinho. */
async function ensureCity() {
  if (S.city) return;
  const v = $('#cityIn').value.trim(); if (v.length < 2) return;
  let c = acItems[0];
  if (!c || !(c.label || '').toLowerCase().startsWith(v.toLowerCase().split(',')[0].trim().slice(0, 3))) {
    try { c = (await api('GET', '/api/cities?q=' + encodeURIComponent(v)))[0]; } catch (e) { c = null; }
  }
  if (c) await pickCity(c);
}
$('#huntForm').onsubmit = async e => {
  e.preventDefault();
  if ($('#kwIn').value.trim()) addKw($('#kwIn').value);
  if (!S.kw.length) { toast('Diga o que caçar (ex: dentista)'); $('#kwIn').focus(); return; }
  const goBtn = $('#goBtn'); if (S.mode === 'bairros' && (!S.city || S.bairrosFor !== S.city.label)) { goBtn.disabled = true; goBtn.textContent = 'BUSCANDO BAIRROS…'; }
  try { await ensureCity(); if (S.mode === 'bairros' && S.city) await loadBairros(); } finally { goBtn.disabled = false; goBtn.textContent = 'INICIAR VARREDURA'; }
  if (S.mode === 'bairros') {
    if (!S.city) { toast('Escolha a cidade acima primeiro.'); $('#cityIn').focus(); return; }
    await loadBairros();
    if (!S.bairros.length) { toast('Não achei bairros para essa cidade. Use “Cidade inteira”.'); return; }
    if (!S.bsel.size) { toast('Escolha pelo menos um bairro'); return; }
  }
  const btn = $('#goBtn'); btn.disabled = true; btn.textContent = 'LIGANDO RADAR…';
  try {
    const h = await api('POST', '/api/hunts', { keywords: S.kw, city: S.city?.label || $('#cityIn').value.trim(), lat: S.city?.lat, lon: S.city?.lon,
      bairros: S.mode === 'bairros' ? S.bairros.filter(b => S.bsel.has(b.name)) : [],
      depth: +$('#depth').value, emails: $('#optSites').checked, socials: $('#optSites').checked, reviews: $('#optRev').checked });
    S.hunts.set(h.id, h); S.hunt = String(h.id); fitted = false; setView('radar'); renderAll();
    if (S.city && S.mode !== 'bairros') map.flyTo([+S.city.lat, +S.city.lon], 13, { duration: 1.4 });
    if (S.mode === 'bairros') { S.bsel.clear(); drawBairros(); }
    ping(true);
  } catch (err) { toast('Erro: ' + err.message); }
  btn.disabled = false; btn.textContent = 'INICIAR VARREDURA';
};

/* ───────── tempo real ───────── */
function upsertLead(l) {
  const old = S.leads.get(l.key), isNew = !old;
  S.leads.set(l.key, l);
  if (S.hunt === 'all' || String(l.hunt_id) === String(S.hunt)) {
    marker(l, isNew);
    if (isNew && !fitted) { fitMap(); }
    if (isNew && l.intel.temp === 'quente' && !S.seenHot.has(l.key)) { S.seenHot.add(l.key); ping(true); } else if (isNew) ping(false);
  }
  if (S.sel === l.key && $('#drawer').classList.contains('on') && !document.activeElement?.closest('#drawer')) openLead(l.key);
  renderSoft();
}
let lastFit = 0;
function connect() {
  const es = new EventSource('/api/events');
  es.addEventListener('lead', e => { upsertLead(JSON.parse(e.data)); const ah = activeHunt(); if (Date.now() - lastFit > 4000 && ah?.status === 'rodando' && sweepsOf(ah.id).length <= 1) { lastFit = Date.now(); fitMap(true); } });
  es.addEventListener('hunt', e => {
    const h = JSON.parse(e.data), prev = S.hunts.get(h.id); S.hunts.set(h.id, h);
    if (prev && prev.status === 'rodando' && h.status === 'pronta') { boom(); toast(`✔ Caçada #${h.id} concluída`); fitMap(true); }
    renderProgress(); renderHunts();
  });
  es.addEventListener('support', () => setTimeout(showSupport, 2500));
  es.addEventListener('update', e => { S.upd = JSON.parse(e.data); paintUpd(); });
  es.addEventListener('feed', e => feedLine(JSON.parse(e.data)));
  es.addEventListener('sweep', e => {
    const sw = JSON.parse(e.data), prev = S.sweeps.get(sw.id); S.sweeps.set(sw.id, sw);
    if (sw.status === 'rodando' && prev?.status !== 'rodando' && sw.bairro && (S.hunt === 'all' || String(S.hunt) === String(sw.hunt_id)) && S.view === 'radar')
      map.flyTo([+sw.lat, +sw.lon], 15, { duration: 1.6 });
    renderZones(); renderProgress();
  });
  es.addEventListener('client', e => { const c = JSON.parse(e.data); S.findHunt = c.hunt; S.findOk = c.found; toast(c.found ? '🛡 Cliente encontrado e blindagem ligada' : '🛡 Não achei com certeza: escolha o seu na Blindagem'); if (c.hunt) S.findHunt = c.hunt; if (S.view !== 'shield') setView('shield'); else renderShield(); });
  es.addEventListener('wa', e => { S.wa = JSON.parse(e.data); paintWaDot(); if (S.view === 'wa') renderWaStatus(); });
  es.addEventListener('outreach', e => { if (S.view === 'wa') loadQueue(); });
  es.addEventListener('reload', async () => { const st = await api('GET', '/api/state'); st.leads.forEach(l => S.leads.set(l.key, l)); renderAll(); mePreview(); });
  es.addEventListener('engine', e => setEngine(JSON.parse(e.data).alive));
  es.addEventListener('ai', e => {
    const a = JSON.parse(e.data);
    if (a.state === 'done') { S.aiBusy.delete(a.key); const l = S.leads.get(a.key); if (l) l.ai = a.text; if (S.sel === a.key) { $('#aiOut').innerHTML = `<div class="aibox">${md(a.text)}</div>`; const b = $('#aiBtn'); if (b) { b.disabled = false; b.textContent = 'Analisar de novo'; } } toast('🧠 Análise pronta'); }
  });
  es.onopen = () => setEngineConn(true);
  es.onerror = () => setEngineConn(false);
}
function setEngine(a) { $('#engDot').className = 'dot ' + (a ? 'on' : 'off'); $('#engTxt').textContent = a ? 'motor online' : 'motor offline'; }
function setEngineConn(ok) { if (!ok) { $('#engDot').className = 'dot off'; $('#engTxt').textContent = 'garimpo offline'; } }

async function boot() {
  buildKpis();
  try {
    const st = await api('GET', '/api/state');
    st.hunts.forEach(h => S.hunts.set(h.id, h)); st.leads.forEach(l => S.leads.set(l.key, l)); (st.sweeps || []).forEach(x => S.sweeps.set(x.id, x)); S.pipeline = st.pipeline;
    loadWa();
    if (st.cloud) $('#logout').hidden = false;
    setEngine(st.engine); $('#aiDot').className = 'dot ' + (st.claude ? 'on' : 'off');
    const run = st.hunts.find(h => h.status === 'rodando'); if (run) S.hunt = String(run.id);
  } catch (e) { toast('Servidor do Garimpo não respondeu'); }
  renderAll(); setTimeout(() => fitMap(true), 300);
  feedLine({ t: new Date().toLocaleTimeString('pt-BR'), text: '◉ Garimpo pronto. Monte uma caçada à esquerda.', tone: 'stage' });
  connect();
}
boot();


/* ───────── bairros ───────── */
function sweepsOf(hid) { return [...S.sweeps.values()].filter(x => x.hunt_id === hid).sort((a, b) => a.idx - b.idx); }
function autoContact(key) {
  const l = S.leads.get(key); if (!l || l.pipeline !== 'novo') return;
  l.pipeline = 'contatado'; api('PATCH', '/api/leads/' + encodeURIComponent(key), { pipeline: 'contatado' }); toast('Movido para Contatado ✓');
  if ($('#pipesel')) $$('#pipesel button').forEach(x => x.classList.toggle('on', x.dataset.p === 'contatado'));
}
$$('#modeSeg button').forEach(b => b.onclick = () => {
  S.mode = b.dataset.m; $$('#modeSeg button').forEach(x => x.classList.toggle('on', x === b));
  if (S.mode !== 'bairros' && S.boxMode) $('#bBox').click();
  $('#bpick').hidden = S.mode !== 'bairros'; $('#depthLbl').textContent = S.mode === 'bairros' ? 'Alcance por bairro' : 'Alcance por termo';
  if (S.mode === 'bairros') { if (!$('#depth').dataset.touched) $('#depth').value = 1; depthOut(); loadBairros(); } else { renderZones(); }
});
$('#depth').addEventListener('input', () => $('#depth').dataset.touched = 1);
function loadBairros() {
  if (S.bLoad && S.bLoadFor === (S.city && S.city.label)) return S.bLoad;
  S.bLoadFor = S.city && S.city.label; S.bLoad = loadBairros_(); return S.bLoad;
}
async function loadBairros_() {
  const c = S.city;
  if (!c) { const typed = $('#cityIn').value.trim(); $('#blist').innerHTML = '<div class="bload">' + (typed.length >= 2 ? '⌛ Procurando a cidade…' : 'Escolha a cidade acima primeiro.') + '</div>'; $('#bfoot').innerHTML = ''; if (typed.length >= 2) ensureCity(); return; }
  if (S.bairrosFor === c.label) { drawBairros(); return; }
  $('#blist').innerHTML = '<div class="bload">⌛ Buscando os bairros de ' + esc(c.label.split(',')[0]) + ' no OpenStreetMap…</div>';
  try { S.bairros = await api('GET', `/api/bairros?city=${encodeURIComponent(c.label)}&lat=${c.lat}&lon=${c.lon}`); S.bairrosFor = c.label; }
  catch (e) { S.bLoad = null; $('#blist').innerHTML = '<div class="bload">Não consegui os bairros: ' + esc(e.message) + '</div>'; return; }
  S.bsel = new Set(S.bairros.map(b => b.name)); drawBairros();
  if (S.bairros.length) map.flyToBounds(S.bairros.map(b => [b.lat, b.lon]), { padding: [40, 40], duration: 1.2 });
}
function drawBairros() {
  if (S.mode !== 'bairros') return;
  const q = S.bq.toLowerCase(), list = S.bairros.filter(b => !q || b.name.toLowerCase().includes(q));
  $('#blist').innerHTML = S.bairros.length ? list.map(b => `<label class="${S.bsel.has(b.name) ? 'on' : ''}"><input type="checkbox" data-b="${esc(b.name)}" ${S.bsel.has(b.name) ? 'checked' : ''}>${esc(b.name)}</label>`).join('') || '<div class="bload">Nenhum bairro com esse nome.</div>' : '<div class="bload">Não achei bairros para essa cidade. Use “Cidade inteira”.</div>';
  const n = S.bsel.size, kw = Math.max(1, S.kw.length || 1), d = +$('#depth').value, mins = Math.max(1, Math.round(n * kw * d * 25 / 60));
  $('#bfoot').innerHTML = `<span><b>${n}</b> de ${S.bairros.length} bairros</span><span>até ~${fmt(n * kw * d * 20)} lugares · ~${mins} min</span>`;
  renderZones();
}
$('#blist').onchange = e => { const b = e.target.dataset.b; if (!b) return; e.target.checked ? S.bsel.add(b) : S.bsel.delete(b); S.bLast = b; drawBairros(); };
/* Shift + clique: marca ou desmarca a faixa inteira entre o último clicado e este */
$('#blist').addEventListener('click', e => {
  const lab = e.target.closest('label'); if (!lab || !e.shiftKey || !S.bLast) return;
  const input = lab.querySelector('input'), b = input && input.dataset.b; if (!b) return;
  const q = S.bq.toLowerCase(), names = S.bairros.filter(x => !q || x.name.toLowerCase().includes(q)).map(x => x.name);
  const i = names.indexOf(S.bLast), j = names.indexOf(b); if (i < 0 || j < 0) return;
  e.preventDefault();
  const on = !S.bsel.has(b);
  names.slice(Math.min(i, j), Math.max(i, j) + 1).forEach(n => on ? S.bsel.add(n) : S.bsel.delete(n));
  S.bLast = b; drawBairros();
});
$('#bInv').onclick = () => { const q = S.bq.toLowerCase(); S.bairros.filter(b => !q || b.name.toLowerCase().includes(q)).forEach(b => S.bsel.has(b.name) ? S.bsel.delete(b.name) : S.bsel.add(b.name)); drawBairros(); };
/* Retângulo no mapa: marca (ou, com Alt, desmarca) todos os bairros dentro dele. Shift + arrastar também funciona. */
map.boxZoom.disable();
let boxStart = null, boxRect = null;
function boxOn() { return S.mode === 'bairros' && S.bairros.length; }
$('#bBox').onclick = () => {
  S.boxMode = !S.boxMode; $('#bBox').classList.toggle('on', S.boxMode); map.getContainer().classList.toggle('boxsel', S.boxMode);
  S.boxMode ? map.dragging.disable() : map.dragging.enable();
  if (S.boxMode) toast('Arraste no mapa para marcar vários bairros (Alt ao soltar = desmarcar)');
};
map.on('mousedown', e => {
  if (!boxOn() || !(S.boxMode || e.originalEvent.shiftKey)) return;
  map.dragging.disable(); boxStart = e.latlng; boxRect = L.rectangle(L.latLngBounds(boxStart, boxStart), { color: '#ffcf4a', weight: 1.5, fillOpacity: .12, interactive: false }).addTo(map);
});
map.on('mousemove', e => { if (boxStart && boxRect) boxRect.setBounds(L.latLngBounds(boxStart, e.latlng)); });
map.on('mouseup', e => {
  if (!boxStart) return;
  const b = L.latLngBounds(boxStart, e.latlng), remove = e.originalEvent.altKey; boxStart = null;
  if (boxRect) { map.removeLayer(boxRect); boxRect = null; }
  if (!S.boxMode) map.dragging.enable();
  const inside = S.bairros.filter(x => b.contains([x.lat, x.lon]));
  if (!inside.length) return;
  inside.forEach(x => remove ? S.bsel.delete(x.name) : S.bsel.add(x.name));
  drawBairros(); toast(`${inside.length} bairro${inside.length > 1 ? 's' : ''} ${remove ? 'desmarcado' : 'marcado'}${inside.length > 1 ? 's' : ''}`);
});
$('#bq').oninput = e => { S.bq = e.target.value; drawBairros(); };
$('#bAll').onclick = () => { S.bairros.filter(b => !S.bq || b.name.toLowerCase().includes(S.bq.toLowerCase())).forEach(b => S.bsel.add(b.name)); drawBairros(); };
$('#bNone').onclick = () => { S.bairros.filter(b => !S.bq || b.name.toLowerCase().includes(S.bq.toLowerCase())).forEach(b => S.bsel.delete(b.name)); drawBairros(); };

/* zonas no mapa: prévia da seleção, ou o estado de cada bairro da caçada */
function renderZones() {
  if (S.bzLayer) map.removeLayer(S.bzLayer);
  S.bzLayer = L.layerGroup().addTo(map);
  const h = activeHunt(), sw = h ? sweepsOf(h.id).filter(x => x.bairro) : [];
  const preview = S.mode === 'bairros' && S.bairros.length && !(h && h.status === 'rodando');
  const zones = preview ? S.bairros.map(b => ({ name: b.name, lat: b.lat, lon: b.lon, cls: S.bsel.has(b.name) ? 'sel' : '', label: '', tip: S.bsel.has(b.name) ? 'na varredura · clique para tirar' : 'fora · clique para incluir' }))
    : sw.map(x => ({ name: x.bairro, lat: +x.lat, lon: +x.lon, cls: x.status, label: x.status === 'pronta' || x.status === 'rodando' ? String(x.found || 0) : '', tip: { fila: 'na fila', rodando: 'varrendo agora…', pronta: `${x.found || 0} lugares`, erro: 'erro: ' + (x.error || ''), parada: 'parada' }[x.status] || x.status }));
  for (const z of zones) {
    const icon = L.divIcon({ className: '', iconSize: [34, 34], html: `<div class="bz ${z.cls}" style="width:34px;height:34px"><i>${esc(z.label)}</i></div>` });
    const m = L.marker([z.lat, z.lon], { icon, zIndexOffset: -1000 }).addTo(S.bzLayer);
    m.bindTooltip(`🏘 ${esc(z.name)} · ${esc(z.tip)}`, { className: 'btt', direction: 'top', offset: [0, -14] });
    if (preview) m.on('click', () => { S.bsel.has(z.name) ? S.bsel.delete(z.name) : S.bsel.add(z.name); drawBairros(); });
    else m.on('click', () => { S.bfilter = z.name; setView('leads'); });
  }
}


/* ───────── blindagem ───────── */
const FIX = {
  'Sem site': 'Criar um site próprio e colocar no perfil do Google.',
  'Só rede social': 'Trocar o link do Google (hoje vai pro Instagram/Facebook) por um site próprio.',
  'Só plataforma': 'Ter um canal próprio além do iFood/link de cardápio: site com pedido ou agendamento.',
  'Sem Instagram': 'Colocar o Instagram no site e no perfil do Google (o radar não achou).',
  'Sem e-mail': 'Deixar um e-mail de contato visível no site.',
  'Nota baixa': 'Responder todas as avaliações negativas e rodar uma campanha de avaliações com clientes felizes.',
  'Nota mediana': 'Rotina de pedir avaliação aos clientes satisfeitos para passar de 4,5.',
  'Invisível': 'Ação de avaliações (QR code no balcão, mensagem pós-venda): menos de 30 avaliações chama concorrente.',
  'Pouca prova social': 'Meta de avaliações por mês: mais prova social e mais força no Maps.',
  'Perfil incompleto': 'Preencher os horários de funcionamento no Google.',
  'Sem fotos': 'Subir foto de capa e fotos recentes no perfil do Google.',
};
const shieldOf = sc => sc >= 65 ? ['exposto', 'Exposto', 'var(--hot)'] : sc >= 45 ? ['atencao', 'Atenção', 'var(--warm)'] : ['blindado', 'Blindado', 'var(--good)'];
function rankInBairro(l) {
  const b = bairroOf(l), cat = l.data.category; if (!b || !cat) return null;
  const pow = x => (x.intel.rating || 0) * Math.log10((x.intel.reviews || 0) + 1);
  const peers = [...S.leads.values()].filter(x => x.data.category === cat && bairroOf(x) === b && !x.intel.closed).sort((a, c) => pow(c) - pow(a));
  return peers.length > 1 ? { pos: peers.findIndex(x => x.key === l.key) + 1, n: peers.length, b, cat, top: peers[0] } : null;
}
function spark(hist, field, color) {
  const pts = hist.filter(h => h[field] != null); if (pts.length < 2) return '';
  const vs = pts.map(h => +h[field]), lo = Math.min(...vs), hi = Math.max(...vs), W = 200, H = 40, r = hi - lo || 1;
  const xy = vs.map((v, i) => [4 + (W - 8) * i / (vs.length - 1), H - 4 - (H - 8) * (v - lo) / r]);
  return `<svg class="spark" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none"><polyline points="${xy.map(p => p.join(',')).join(' ')}" fill="none" stroke="${color}" stroke-width="2" vector-effect="non-scaling-stroke"/>${xy.map(p => `<circle cx="${p[0]}" cy="${p[1]}" r="2.5" fill="${color}"/>`).join('')}</svg>`;
}
function renderShield() {
  const cl = [...S.leads.values()].filter(l => l.client).sort((a, b) => b.intel.score - a.intel.score);
  const cnt = k => cl.filter(l => shieldOf(l.intel.score)[0] === k).length;
  const gaps = cl.reduce((a, l) => a + l.intel.why.filter(w => w.k === 'opp').length, 0);
  $('#skpis').innerHTML = [['Clientes', cl.length, ''], ['🚨 Expostos', cnt('exposto'), 'var(--hot)'], ['⚠ Atenção', cnt('atencao'), 'var(--warm)'], ['✓ Blindados', cnt('blindado'), 'var(--good)'], ['Brechas abertas', gaps, 'var(--gold)']]
    .map(([a, b, c]) => `<div class="sk"><small>${a}</small><b style="color:${c || 'var(--ink)'}">${b}</b></div>`).join('');
  // candidatos de uma busca por nome que não bateu
  const fh = S.findHunt && S.hunts.get(S.findHunt);
  const cands = fh && !S.findOk ? [...S.leads.values()].filter(l => inHunt(l, fh.id) && !l.client) : [];
  const running = [...S.hunts.values()].filter(h => h.opts?.kind && h.status === 'rodando');
  $('#cands').innerHTML = (running.length ? `<div class="panel cands"><div class="thinking"><i></i><i></i><i></i>${running.map(h => h.opts.kind === 'cliente' ? `Procurando “${esc(h.opts.find)}” no Google Maps… ${h.percent || 0}%` : `Re-checando ${h.opts.clients} cliente(s)… ${h.percent || 0}%`).join(' · ')}</div></div>` : '')
    + (cands.length ? `<div class="panel cands"><h3>Qual destes é o seu cliente “${esc(fh.opts.find)}”?</h3><div class="row">${cands.slice(0, 12).map(l => `<div class="cand"><div><b>${esc(l.data.title)}</b><small>${esc(l.data.category || '')} · ${esc(l.data.address || '')}</small></div><button class="btn gold" data-mkcli="${esc(l.key)}">É este</button></div>`).join('')}</div></div>` : '');
  if (!cl.length) { $('#sgrid').innerHTML = `<div class="panel empty-big" style="grid-column:1/-1"><div><b>Nenhum cliente blindado ainda</b>Digite o nome de um cliente aí em cima (use a cidade escolhida no formulário da esquerda)<br>ou abra qualquer lead e clique em “🛡 Marcar como meu cliente”.</div></div>`; return; }
  $('#sgrid').innerHTML = cl.map(l => {
    const d = l.data, i = l.intel, [cls, lbl, col] = shieldOf(i.score), h = l.history || [], f = h[0], z = h[h.length - 1];
    const opp = i.why.filter(w => w.k === 'opp').sort((a, b) => b.pts - a.pts), cap = i.why.filter(w => w.k === 'cap');
    const rk = rankInBairro(l), dRev = f && z ? z.reviews - f.reviews : 0, dRat = f && z ? +(z.rating - f.rating).toFixed(1) : 0, dSc = f && z ? z.score - f.score : 0;
    return `<article class="cc ${cls}" data-cli="${esc(l.key)}">
      <div class="top"><div class="ph" style="background-image:url('${esc(safeUrl(d.thumbnail))}')"></div>
        <div style="min-width:0"><h4>${esc(d.title)}</h4><div class="sub">${esc(d.category || '')}${bairroOf(l) ? ' · 🏘 ' + esc(bairroOf(l)) : ''}</div>${stars(l)}</div>
        <div class="shield"><div class="ring" style="--s:${i.score};--c:${col}">${i.score}</div><span class="sbadge ${cls}">${lbl}</span></div></div>
      ${!d.review_count && !d.category ? '<div class="sub" style="padding:0 16px 10px;color:var(--warm)">⚠ Dados incompletos: procure de novo com o tipo do negócio (ex: pet shop) para completar.</div>' : ''}
      <div class="mid"><div><h6>Brechas que um prospectador vê (${opp.length})</h6>
        ${opp.length ? opp.map(w => `<div class="gap"><div><b>${esc(w.label)}</b><span>${esc(FIX[w.c] || '')}</span></div><em>+${w.pts}</em></div>`).join('') : '<div class="nogap">Nenhuma brecha visível. Cliente blindado 💪</div>'}
        ${cap.length ? `<h6 style="margin-top:12px">Pontos fortes</h6>${cap.map(w => `<div class="okline">✓ ${esc(w.label)}</div>`).join('')}` : ''}</div>
      <div><h6>Evolução</h6>
        <div class="stat"><span>Exposição</span><b class="${dSc < 0 ? 'up' : dSc > 0 ? 'down' : ''}">${i.score}${dSc ? ` (${dSc > 0 ? '+' : ''}${dSc})` : ''}</b></div>
        <div class="stat"><span>Avaliações</span><b class="${dRev > 0 ? 'up' : dRev < 0 ? 'down' : ''}">${fmt(i.reviews)}${dRev ? ` (${dRev > 0 ? '+' : ''}${dRev})` : ''}</b></div>
        <div class="stat"><span>Nota</span><b class="${dRat > 0 ? 'up' : dRat < 0 ? 'down' : ''}">${i.reviews ? i.rating.toFixed(1) : '—'}${dRat ? ` (${dRat > 0 ? '+' : ''}${dRat})` : ''}</b></div>
        ${rk ? `<div class="stat"><span>No bairro</span><b>#${rk.pos} de ${rk.n}</b></div>` : ''}
        <div class="stat"><span>Checagens</span><b>${h.length}${z ? ' · ' + esc(z.ts.slice(8, 10) + '/' + z.ts.slice(5, 7)) : ''}</b></div>
        ${spark(h, 'reviews', 'var(--cyan)')}
        ${rk && rk.pos > 1 ? `<div class="sub" style="margin-top:6px">Líder no bairro: <b style="color:var(--ink)">${esc(rk.top.data.title)}</b> (★ ${rk.top.intel.rating.toFixed(1)}, ${fmt(rk.top.intel.reviews)})</div>` : ''}
      </div></div>
      <div class="bot"><button class="btn" data-recheck="${esc(l.key)}">↻ Re-checar</button><button class="btn" data-open="${esc(l.key)}">Abrir ficha</button>
        <button class="btn ai" data-plan="${esc(l.key)}">🧠 Plano de blindagem</button><button class="btn" data-uncli="${esc(l.key)}" style="margin-left:auto">Remover</button></div></article>`;
  }).join('');
}
$('#findForm').onsubmit = async e => {
  e.preventDefault(); const name = $('#findName').value.trim(); if (!name) { toast('Digite o nome do seu cliente'); return; }
  if (!S.city && $('#cityIn').value.trim()) { try { const r = await api('GET', '/api/cities?q=' + encodeURIComponent($('#cityIn').value.trim())); if (r[0]) pickCity(r[0]); } catch (er) {} }
  try { const h = await api('POST', '/api/clients/find', { name, cat: $('#findCat').value.trim(), city: S.city?.label || '', lat: S.city?.lat, lon: S.city?.lon }); S.hunts.set(h.id, h); S.findHunt = h.id; S.findOk = null; $('#findName').value = ''; $('#findCat').value = ''; toast(`🛡 Procurando “${name}”${S.city ? ' em ' + S.city.label.split(',')[0] : ''}…`); renderShield(); renderHunts(); }
  catch (er) { toast('Erro: ' + er.message); }
};
$('#recheckAll').onclick = async () => { try { const h = await api('POST', '/api/clients/recheck', {}); S.hunts.set(h.id, h); toast('↻ Re-checando todos os clientes…'); renderShield(); } catch (er) { toast(er.message); } };
document.addEventListener('click', async e => {
  const kb = e.target.closest('[data-kwant],[data-kreply]');
  if (kb) {
    e.stopPropagation(); e.preventDefault();
    const key = kb.dataset.kwant || kb.dataset.kreply, l = S.leads.get(key); if (!l) return;
    if (kb.dataset.kreply) { l.pipeline = 'negociando'; renderKanban(); await api('PATCH', '/api/leads/' + encodeURIComponent(key), { pipeline: 'negociando' }); toast('💬 Movido para Negociando'); return; }
    if (S.wa?.state !== 'conectado') return toast('O WhatsApp não está conectado');
    if (!confirm(`${l.data.title} pediu o diagnóstico?\n\nO Claude monta a página e o link é enviado agora pelo seu WhatsApp.`)) return;
    try { await api('POST', '/api/leads/' + encodeURIComponent(key) + '/diag', { send: true }); toast('🧾 Gerando e enviando o diagnóstico…'); } catch (er) { toast('Erro: ' + er.message); }
    return;
  }
  const t = e.target.closest('[data-mkcli],[data-recheck],[data-open],[data-plan],[data-uncli]'); if (!t) return;
  e.stopPropagation();
  const k = t.dataset.mkcli || t.dataset.recheck || t.dataset.open || t.dataset.plan || t.dataset.uncli;
  if (t.dataset.open) return openLead(k);
  if (t.dataset.mkcli || t.dataset.uncli) { const out = await api('PATCH', '/api/leads/' + encodeURIComponent(k), { client: !!t.dataset.mkcli }); S.leads.set(k, out); if (t.dataset.mkcli) { S.findOk = true; toast('🛡 Blindagem ligada'); } renderShield(); renderKpis(); return; }
  if (t.dataset.recheck) { const h = await api('POST', '/api/clients/recheck', { keys: [k] }); S.hunts.set(h.id, h); toast('↻ Re-checando…'); renderShield(); return; }
  if (t.dataset.plan) {
    openLead(k); S.aiBusy.add(k);
    $('#aiOut').innerHTML = '<div class="aibox"><div class="thinking"><i></i><i></i><i></i>Claude montando o plano de blindagem…</div></div>'; $('#aiBtn').disabled = true;
    await api('POST', '/api/leads/' + encodeURIComponent(k) + '/ai', { focus: 'ESTE NEGÓCIO JÁ É MEU CLIENTE. Não quero vender para ele: quero um plano de blindagem para fechar cada brecha antes que outra agência use isso para roubá-lo. Troque "Melhor oferta" por "Prioridades (ordem de ataque)", a mensagem de WhatsApp por uma mensagem para EU mandar ao meu cliente propondo as melhorias, e a objeção por "risco se não fizer nada".' });
  }
}, true);


/* ───────── WhatsApp ───────── */
const DAYS = ['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom'];
function fmtTs(ts) { if (!ts) return ''; const d = new Date(ts); return isNaN(d) ? ts : d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }); }
function paintWaDot() { const st = S.wa?.state; $('#waDot').className = 'dot ' + (st === 'conectado' ? 'on' : st && st !== 'desconfigurado' ? 'off' : ''); }
async function loadWa() { try { const r = await api('GET', '/api/wa'); S.queue = r.queue; delete r.queue; S.wa = r; paintWaDot(); if (S.view === 'wa') renderWa(true); if (!S.onboarded) { S.onboarded = true; onboard(); } } catch (e) {} }
async function loadQueue() { try { const r = await api('GET', '/api/wa'); S.queue = r.queue; delete r.queue; S.wa = r; renderQueue(); renderWaStatus(); } catch (e) {} }
let waFilled = false;
function renderWa(force) {
  const w = S.wa; if (!w) { loadWa(); return; }
  if (!waFilled || force) {
    const c = w.cfg; waFilled = true;
    $('#evoUrl').value = c.evo_url || ''; $('#evoKey').value = w.has_key ? c.evo_key : ''; $('#evoInst').value = c.evo_instance || '';
    $('#waDaily').value = c.daily; $('#waMin').value = c.min_gap; $('#waMax').value = c.max_gap; $('#waStart').value = c.start; $('#waEnd').value = c.end;
    $('#meArt').value = c.me_art || 'o'; $('#meRegion').value = c.me_region || ''; $('#meServices').value = c.me_services || ''; $('#meLogo').value = c.me_logo || '';
    $('#meMethod').value = c.me_method || ''; $('#diagBase').value = c.diag_base || ''; $('#diagPublish').value = c.diag_publish || '';
    $('#meWa').value = c.me_whatsapp || ''; $('#meIg').value = c.me_instagram || ''; $('#meSite').value = c.me_site || ''; $('#msgMode').value = c.msg_mode || 'diagnostico'; $('#diagAuto').checked = c.diag_auto !== false;
    $('#meName').value = c.me_name || ''; $('#meAgency').value = c.me_agency || ''; $('#meCity').value = c.me_city || ''; $('#meLink').value = c.me_link || '';
    mePreview();
    $('#waDays').innerHTML = DAYS.map((d, i) => `<button type="button" data-day="${i}" class="${c.days.includes(i) ? 'on' : ''}">${d}</button>`).join('');
  }
  renderWaStatus(); if (!S.queue) loadQueue(); else renderQueue();
}
const EVLBL = { conectado: ['conectou', 'ok'], desconectado: ['caiu', 'bad'], reconectando: ['reconectando', 'warn'], msg_in: ['resposta recebida', 'msg'], msg_out: ['mensagem sua', ''],
  gateway_ligado: ['gateway ligado', ''], gateway_reiniciado: ['gateway reiniciado (planejado)', ''], reiniciando: ['reiniciando (planejado)', 'warn'], aguardando: ['aguardando vínculo', ''], 'device.logged_out': ['desvinculado pelo WhatsApp', 'bad'], 'device.temporary_ban': ['BLOQUEIO TEMPORARIO', 'bad'],
  'device.reachout_timelock': ['RESTRICAO de conversas novas', 'bad'] };
function renderWaHealth() {
  const w = S.wa, st = w && w.stats; if (!st) return;
  const since = st.connected_since ? Math.max(0, Date.now() - Date.parse(st.connected_since)) : 0, hrs = Math.floor(since / 3600000), mins = Math.floor(since % 3600000 / 60000);
  $('#hProv').textContent = '· ' + (st.provider === 'gowa' ? 'Go WhatsApp' : 'Evolution');
  $('#hStats').innerHTML = [['Conectado há', st.connected_since ? (hrs ? hrs + 'h ' : '') + mins + 'min' : '—'], ['Quedas (24h)', st.drops_24h], ['Respostas (24h)', st.msgs_in_24h],
    ['Entregues (24h)', st.sent_24h ? `${st.delivered_24h}/${st.sent_24h}` : '—'], ['Lidas (24h)', st.sent_24h ? st.read_24h : '—'],
    ['Medindo desde', st.monitoring_since ? fmtTs(st.monitoring_since) : '—']].map(([a, b]) => `<div class="sk"><small>${a}</small><b style="font-size:18px">${esc(String(b))}</b></div>`).join('');
  $('#hEvents').innerHTML = (st.events || []).length ? st.events.map(e => { const m = EVLBL[e.kind] || [e.kind, '']; return `<div class="hev"><span>${esc(fmtTs(e.ts))}</span><b class="${m[1]}">${esc(m[0])}</b><span>${esc(e.detail || '')}</span></div>`; }).join('')
    : '<div class="sub">Nada registrado ainda. Os eventos aparecem aqui conforme a conexão muda.</div>';
}
function renderWaStatus() {
  const w = S.wa; if (!w) return;
  const g = w.provider === 'gowa';
  $$('#provSeg button').forEach(b => b.classList.toggle('on', b.dataset.prov === w.provider));
  $('#gowaBox').hidden = !g; $('#evoBox').hidden = g;
  const al = $('#waAlert'); al.hidden = !w.alert;
  if (w.alert) { al.className = 'panel wacard wide walert'; al.innerHTML = `<div style="font-size:30px">🛑</div><div><b>${esc(w.alert.text)}</b><p>${esc(fmtTs(w.alert.ts))}. Não volte a ligar os disparos antes de entender o motivo.</p></div>`; }
  if (!w.alert && !w.terms_ok) { al.hidden = false; al.className = 'panel wacard wide walert';
    al.innerHTML = '<div style="font-size:30px">⚖️</div><div style="flex:1"><b>Aviso importante pendente</b><p>Leia e aceite antes de conectar o WhatsApp e enviar mensagens.</p></div><button class="btn gold" id="termsBtn" type="button">Ler e aceitar</button>';
    $('#termsBtn').onclick = showTerms; }
  renderWaHealth();
  const col = { conectado: 'var(--good)', conectando: 'var(--warm)', desconectado: 'var(--hot)', erro: 'var(--hot)', desconfigurado: 'var(--ink3)' }[w.state] || 'var(--ink2)';
  const connEl = g ? $('#gwConn') : $('#waConn');
  connEl.innerHTML = `<i class="dot" style="background:${col}"></i><span style="color:${col}">${esc(w.state)}${w.version ? ' · v' + esc(w.version) : ''}</span>${w.error ? `<span style="color:var(--ink3)">· ${esc(w.error)}</span>` : ''}`;
  const on = w.cfg.auto, t = $('#waToggle');
  t.textContent = on ? '■ PAUSAR DISPAROS' : '▶ LIGAR DISPAROS'; t.classList.toggle('on', on);
  const nx = w.next_at && on ? Math.max(0, Math.round(w.next_at - Date.now() / 1000)) : 0;
  $('#waStats').innerHTML = [['Hoje', `${w.sent_today}/${w.cfg.daily}`], ['Na fila', w.queued],
    ['Próximo', !on ? 'pausado' : w.state !== 'conectado' ? 'sem conexão' : !w.in_window ? 'fora do horário' : nx ? `${Math.floor(nx / 60)}m${String(nx % 60).padStart(2, '0')}s` : 'agora'],
    ['Leitura', w.last_sync ? fmtTs(w.last_sync).split(' ')[1] : '—']].map(([a, b]) => `<div class="sk"><small>${a}</small><b style="font-size:18px">${esc(String(b))}</b></div>`).join('');
}
setInterval(() => { if (S.view === 'wa') renderWaStatus(); }, 1000);
function renderQueue() {
  const f = $('#qFilter').value, rows = (S.queue || []).map(r => { const l = S.leads.get(r.key); return { ...r, st: l?.wa?.in && r.status === 'enviado' ? 'respondeu' : r.status, l }; })
    .filter(r => !f || (f === 'erro' ? ['erro', 'sem_whatsapp'].includes(r.st) : r.st === f));
  const lbl = { fila: 'na fila', enviado: 'enviado', respondeu: 'respondeu', erro: 'erro', sem_whatsapp: 'sem whats', pulado: 'pulado', cancelado: 'cancelado' };
  $('#qlist').innerHTML = rows.length ? rows.slice(0, 300).map(r => `<div class="qi" data-key="${esc(r.key)}"><span class="qst ${r.st}">${lbl[r.st] || r.st}</span>
    <div style="min-width:0"><b>${esc(r.title)}</b> <span class="mono" style="font-size:11px;color:var(--ink3)">${esc(fmtTs(r.sent_at || r.created))}</span>
    ${r.st === 'respondeu' ? `<p class="reply">💬 ${esc(r.l.wa.text || '')}</p>` : `<p>${esc(r.error || r.text)}</p>`}</div>
    ${r.status === 'fila' ? `<button class="btn" data-qdel="${r.id}">tirar</button>` : '<span></span>'}</div>`).join('')
    : '<div class="empty-big"><div><b>Fila vazia</b>Vá em Leads, filtre e clique em 🚀 Prospectar.</div></div>';
}
$('#qFilter').onchange = renderQueue;
$('#qClear').onclick = async () => { if (confirm('Tirar todos que ainda estão na fila?')) { await api('DELETE', '/api/wa/queue'); loadQueue(); } };
document.addEventListener('click', async e => {
  const qd = e.target.closest('[data-qdel]'); if (qd) { e.stopPropagation(); await api('DELETE', '/api/wa/queue/' + qd.dataset.qdel); loadQueue(); return; }
  const dy = e.target.closest('[data-day]'); if (dy) { dy.classList.toggle('on'); }
}, true);
$('#waForm').onsubmit = async e => {
  e.preventDefault(); $('#waConn').innerHTML = '<span class="thinking"><i></i><i></i><i></i>testando…</span>';
  try { S.wa = await api('POST', '/api/wa/settings', { evo_url: $('#evoUrl').value, evo_key: $('#evoKey').value, evo_instance: $('#evoInst').value }); renderWa(true); paintWaDot();
    toast(S.wa.state === 'conectado' ? '✅ WhatsApp conectado' : 'Conexão: ' + S.wa.state + (S.wa.error ? ' · ' + S.wa.error : '')); } catch (er) { toast('Erro: ' + er.message); }
};
function rhythm() { return { daily: +$('#waDaily').value, min_gap: +$('#waMin').value, max_gap: +$('#waMax').value, start: $('#waStart').value, end: $('#waEnd').value, days: $$('#waDays button.on').map(b => +b.dataset.day) }; }
$('#waSaveAuto').onclick = async () => { S.wa = await api('POST', '/api/wa/settings', rhythm()); renderWa(true); toast('Ritmo salvo'); };
$('#waToggle').onclick = async () => {
  const on = !S.wa.cfg.auto;
  if (on && S.wa.state !== 'conectado') return toast('Conecte o WhatsApp primeiro');
  if (on && !S.wa.queued) return toast('A fila está vazia: vá em Leads e clique em 🚀 Prospectar');
  S.wa = await api('POST', '/api/wa/settings', Object.assign(rhythm(), { auto: on })); renderWa(true);
  toast(on ? '▶ Disparos ligados' : '■ Disparos pausados');
};
function prospectModal(list) {
  const ok = list.filter(l => l.intel.wa && !l.client && l.pipeline === 'novo' && !l.intel.closed && !(S.queue || []).some(q => q.key === l.key && ['fila', 'enviado'].includes(q.status)));
  const m = $('#modal'), w = S.wa, daily = w?.cfg?.daily || 30;
  if (!ok.length) { toast('Nenhum lead novo com WhatsApp (celular) nesse filtro'); return; }
  const ex = ok.slice().sort((a, b) => b.intel.score - a.intel.score)[0];
  m.innerHTML = `<div class="box"><h2>🚀 Prospectar ${ok.length} leads</h2>
    <p>${list.length - ok.length ? `${list.length - ok.length} ficaram de fora (sem celular, já contatados, clientes ou na fila). ` : ''}Cada um recebe uma mensagem própria, montada com o que falta no negócio dele. Com ${daily} por dia, leva uns <b>${Math.ceil(ok.length / daily)} dia(s)</b>.</p>
    <p style="margin-top:10px;color:var(--ink3);font-size:12px">Exemplo para ${esc(ex.data.title)}:</p><div class="sample">${esc(ex.intel.pitch)}</div>
    ${w?.state !== 'conectado' ? '<p style="color:var(--warm);margin-top:10px">⚠ O WhatsApp ainda não está conectado. A fila fica guardada e começa quando você conectar e ligar os disparos.</p>' : ''}
    <p style="color:var(--ink3);font-size:12px;margin-top:10px">Para não ter o número bloqueado: comece com poucas mensagens por dia (20 a 30) e intervalos de alguns minutos. Quem pedir para parar vai sozinho para Descartado.</p>
    <p style="color:var(--ink2);font-size:12px;margin-top:10px">Quem responder <b>EU QUERO</b> recebe o diagnóstico personalizado pelo Claude na hora, sozinho.</p>
    <div class="row"><button class="btn" id="mCancel">Cancelar</button><button class="btn gold" id="mGo">Colocar ${ok.length} na fila e ligar os disparos</button></div></div>`;
  m.classList.add('on');
  $('#mCancel').onclick = () => m.classList.remove('on');
  m.onclick = e => { if (e.target === m) m.classList.remove('on'); };
  $('#mGo').onclick = async () => { const r = await api('POST', '/api/wa/queue', { keys: ok.map(l => l.key) }); m.classList.remove('on');
    if (S.wa?.state === 'conectado') S.wa = await api('POST', '/api/wa/settings', { auto: true }); toast(`📤 ${r.added} na fila${r.skipped ? ` · ${r.skipped} pulados` : ''}`); await loadQueue(); setView('wa'); };
}

function mePreview() {
  const ls = [...S.leads.values()].filter(l => l.intel.wa && !l.client && !l.intel.closed).sort((a, b) => b.intel.score - a.intel.score);
  const l = ls[0]; if (!l || !$('#mePreview')) return;
  $('#meFor').textContent = 'Prévia para ' + l.data.title + ' (o lead mais quente)';
  $('#mePreview').textContent = l.intel.pitch;
}
$('#meForm').onsubmit = async e => {
  e.preventDefault();
  S.wa = await api('POST', '/api/wa/settings', { me_name: $('#meName').value, me_agency: $('#meAgency').value, me_city: $('#meCity').value, me_link: $('#meLink').value,
    me_art: $('#meArt').value, me_region: $('#meRegion').value, me_services: $('#meServices').value, me_logo: $('#meLogo').value,
    me_method: $('#meMethod').value, diag_base: $('#diagBase').value, diag_publish: $('#diagPublish').value,
    me_whatsapp: $('#meWa').value, me_instagram: $('#meIg').value, me_site: $('#meSite').value, msg_mode: $('#msgMode').value, diag_auto: $('#diagAuto').checked });
  toast('✍ Apresentação salva, refazendo as mensagens…');
};


/* ───────── gateway local: provedor, QR e código de pareamento ───────── */
$$('#provSeg button').forEach(b => b.onclick = async () => {
  if (S.wa && S.wa.provider === b.dataset.prov) return;
  if (!confirm('Trocar o provedor do WhatsApp? Os disparos ficam pausados até você ligar de novo.')) return;
  $('#gwConn').innerHTML = '<span class="thinking"><i></i><i></i><i></i>trocando…</span>';
  try { S.wa = await api('POST', '/api/wa/settings', { provider: b.dataset.prov }); renderWa(true); paintWaDot(); toast('Provedor: ' + (S.wa.provider === 'gowa' ? 'Go WhatsApp' : 'Evolution')); } catch (er) { toast('Erro: ' + er.message); }
});
$('#gwRecheck').onclick = async () => { S.wa = await api('POST', '/api/wa/test', {}); renderWa(true); paintWaDot(); };
let qrTimer = null;
function closeQr() { clearTimeout(qrTimer); qrTimer = null; $('#modal').classList.remove('on'); }
$('#gwConnect').onclick = () => {
  const m = $('#modal');
  m.innerHTML = `<div class="box"><h2>📱 Conectar o WhatsApp</h2>
    <p>No celular: WhatsApp, Configurações, <b>Aparelhos conectados</b>, <b>Conectar um aparelho</b>.</p>
    <div class="seg" style="margin-top:12px"><button type="button" class="on" id="qrTabQr">Ler QR code</button><button type="button" id="qrTabCode">Usar código no celular</button></div>
    <div class="qrbox" id="qrBody"><div class="thinking" style="justify-content:center"><i></i><i></i><i></i>gerando…</div></div>
    <div class="row"><button class="btn" id="qrClose">Fechar</button></div></div>`;
  m.classList.add('on'); $('#qrClose').onclick = closeQr; m.onclick = e => { if (e.target === m) closeQr(); };
  const show = async mode => {
    $('#qrTabQr').classList.toggle('on', mode === 'qr'); $('#qrTabCode').classList.toggle('on', mode === 'code'); clearTimeout(qrTimer);
    if (mode === 'code') {
      $('#qrBody').innerHTML = `<div class="step">Digite o número do WhatsApp que vai ser vinculado (com DDD) e toque em Gerar. Depois, no celular, escolha <b>Conectar com número de telefone</b> e digite o código.</div>
        <div class="waform" style="margin-top:12px"><input id="payPhone" placeholder="11 99999-9999" inputmode="tel"></div><div class="row" style="justify-content:center"><button class="btn gold" id="payGo">Gerar código</button></div><div id="payOut"></div>`;
      $('#payGo').onclick = async () => { const ph = $('#payPhone').value.replace(/\D/g, ''); const full = ph.length <= 11 ? '55' + ph : ph;
        try { const r = await api('POST', '/api/gowa/pair', { phone: full }); $('#payOut').innerHTML = `<div class="paycode">${esc(r.code)}</div><div class="step">Digite esse código no celular. Ele vale poucos minutos.</div>`; pollConn(); } catch (er) { $('#payOut').innerHTML = `<div class="step" style="color:var(--hot)">${esc(er.message)}</div>`; } };
      return;
    }
    try {
      const r = await api('GET', '/api/gowa/qr');
      if (r.connected) { $('#qrBody').innerHTML = '<div class="step" style="color:var(--good);font-size:16px">✅ Já está conectado.</div>'; return; }
      $('#qrBody').innerHTML = `<img alt="QR code" src="${r.qr}"><div class="step">Aponte a câmera do WhatsApp para o QR. Ele troca sozinho a cada ${r.duration || 30} segundos.</div>`;
      qrTimer = setTimeout(() => show('qr'), Math.max(10, (r.duration || 30) - 3) * 1000);
    } catch (er) { $('#qrBody').innerHTML = `<div class="step" style="color:var(--hot)">${esc(er.message)}</div>`; }
  };
  $('#qrTabQr').onclick = () => show('qr'); $('#qrTabCode').onclick = () => show('code');
  show('qr'); pollConn();
};
async function pollConn() {
  for (let i = 0; i < 150 && $('#modal').classList.contains('on'); i++) {
    await new Promise(r => setTimeout(r, 2000));
    try { S.wa = await api('POST', '/api/wa/test', {}); } catch (e) { continue; }
    if (S.wa.state === 'conectado' || S.wa.state === 'conectando') { closeQr(); toast('✅ WhatsApp conectado pelo gateway'); renderWa(true); paintWaDot(); return; }
  }
}


/* ───────── primeira execução: aviso importante e conexão do WhatsApp ───────── */
function showTerms() {
  const m = $('#modal');
  m.innerHTML = `<div class="box" style="max-height:88vh;overflow:auto"><h2>⚖️ Aviso importante</h2>
    <p>O Garimpo é um software livre, entregue <b>como está, sem garantia</b>. Leia antes de usar:</p>
    <ul class="terms">
      <li><b>WhatsApp não oficial.</b> A conexão usa um cliente de código aberto que <b>não é aprovado pelo WhatsApp</b>. O WhatsApp pode derrubar a sessão, restringir ou <b>banir o número</b>. Se isso acontecer, <b>nem o Garimpo nem os autores dos componentes têm culpa ou responsabilidade</b>. Use um número que você aceita arriscar, comece devagar (20 a 30 por dia) e respeite quem pedir para parar.</li>
      <li><b>O ideal é usar o WhatsApp oficial</b> (WhatsApp Business Platform, a API da Meta), que tem custo e regras de modelos de mensagem, mas é o único caminho autorizado e seguro para volume.</li>
      <li><b>Google Maps.</b> Coletar dados do Google Maps pode contrariar os termos do Google. Seu IP pode ser bloqueado. Use com moderação.</li>
      <li><b>LGPD e mensagens frias.</b> Você é o responsável por ter base legal, oferecer descadastro e cumprir as leis do seu país sobre contato comercial. Isto não é aconselhamento jurídico.</li>
      <li><b>Seus dados ficam no seu computador</b> (pasta <code>data/</code> e <code>gateway/</code>), inclusive uma cópia do histórico do WhatsApp conectado. Proteja essa pasta e nunca a publique.</li>
    </ul>
    <label class="tg" style="margin-top:14px;flex-direction:row"><input type="checkbox" id="termsChk"><i></i>Li, entendi e aceito os riscos</label>
    <div class="row"><button class="btn" id="termsLater" type="button">Agora não</button><button class="btn gold" id="termsOk" type="button" disabled>Aceitar e continuar</button></div></div>`;
  m.classList.add('on');
  $('#termsChk').onchange = e => { $('#termsOk').disabled = !e.target.checked; };
  $('#termsLater').onclick = () => m.classList.remove('on');
  $('#termsOk').onclick = async () => {
    await api('POST', '/api/terms', { accept: true });
    S.wa = Object.assign(await api('GET', '/api/wa'), { queue: undefined }); m.classList.remove('on'); paintWaDot(); renderWa(true); toast('Aviso aceito');
    onboard();
  };
}
function onboard() {
  const w = S.wa; if (!w) return;
  if (!w.terms_ok) return showTerms();
  if (w.provider === 'gowa' && w.gowa && w.gowa.installed && !['conectado', 'conectando'].includes(w.state)) { setView('wa'); setTimeout(() => $('#gwConnect').click(), 500); }
}


/* ───────── apoio ao autor (opcional): ☕ no topo, e um convite na 1ª caçada e a cada 50 ───────── */
async function showSupport() {
  let d; try { d = await api('GET', '/api/support'); } catch (e) { return; }
  const m = $('#modal');
  m.innerHTML = `<div class="box"><div style="width:100%;text-align:center"><div style="font-size:42px">☕</div><h2>Gostou do Garimpo?</h2>
    <p>Ele é grátis e vai continuar grátis. Se te ajudou a achar clientes, um Pix de qualquer valor me ajuda a manter e melhorar. Se quiser me pagar um café, sou muito grato. 💚</p>
    <img src="/pix.svg" alt="QR Code do Pix" width="190" height="190" style="display:block;margin:12px auto 0;border-radius:12px;image-rendering:pixelated;background:#fff">
    <div style="opacity:.7;font-size:12px;margin-top:6px">Aponte a câmera do app do seu banco para o QR Code</div>
    <div style="margin:14px 0;padding:12px;border-radius:12px;background:rgba(255,255,255,.04);border:1px solid var(--line2);word-break:break-all;font-size:12.5px">
      <div style="opacity:.7;margin-bottom:4px">Chave Pix (${esc(d.nome)})</div><b id="pixKey">${esc(d.chave)}</b></div>
    <div class="row"><button class="btn" id="pixLater" type="button">Agora não</button>
      <button class="btn gold" id="pixCopy" type="button">Copiar Pix Copia e Cola</button></div></div></div>`;
  m.classList.add('on');
  $('#pixLater').onclick = () => m.classList.remove('on');
  $('#pixCopy').onclick = async () => {
    try { await navigator.clipboard.writeText(d.copia); }
    catch (e) { const t = document.createElement('textarea'); t.value = d.copia; document.body.appendChild(t); t.select(); document.execCommand('copy'); t.remove(); }
    $('#pixCopy').textContent = '✓ Copiado! Cole no app do banco'; toast('Pix copiado. Valeu demais! 💚');
  };
}
$('#coffee').onclick = showSupport;


/* ───────── tema claro/escuro ───────── */
$('#themeBtn').onclick = () => {
  const next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', next);
  try { localStorage.setItem('garimpo_theme', next); } catch (e) {}
};


/* ───────── atualização pelo painel (git pull + instalador + reinício) ───────── */
function paintUpd() {
  const u = S.upd, b = $('#updBtn'); if (!b || !u) return;
  b.hidden = !(u.git && u.behind > 0) && !u.busy;
  b.title = u.behind ? `Versão nova disponível (${u.behind} ${u.behind > 1 ? 'mudanças' : 'mudança'})` : '';
  const box = $('#updStep'); if (box) box.textContent = u.error || u.step || '';
  if (u.error && $('#updGo')) { $('#updGo').disabled = false; $('#updGo').textContent = 'Tentar de novo'; }
}
function showUpdate() {
  const u = S.upd; if (!u) return;
  const m = $('#modal');
  m.innerHTML = `<div class="box"><div style="width:100%"><h2>⬆ Atualização disponível</h2>
    <p>Você está na versão <b>${esc(u.local || '?')}</b>${u.date ? ' (' + esc(u.date) + ')' : ''}. O que há de novo:</p>
    <ul class="terms" data-noi18n>${(u.changes || []).map(c => `<li>${esc(c)}</li>`).join('') || '<li>…</li>'}</ul>
    ${u.dirty ? '<p style="color:var(--hot)">Esta cópia tem alterações próprias (como a adaptação para Windows), então a atualização automática está desligada.</p>' : '<p style="opacity:.75;font-size:12.5px">O Garimpo baixa a versão nova, confere os componentes e reinicia sozinho. Seus leads e configurações ficam como estão. Se o WhatsApp estiver conectado, ele reconecta em instantes.</p>'}
    <div id="updStep" style="min-height:20px;font-size:13px;color:var(--gold)"></div>
    <div class="row"><button class="btn" id="updLater" type="button">Depois</button>
      <button class="btn gold" id="updGo" type="button" ${u.dirty ? 'disabled' : ''}>Atualizar agora</button></div></div></div>`;
  m.classList.add('on');
  $('#updLater').onclick = () => m.classList.remove('on');
  $('#updGo').onclick = async () => {
    $('#updGo').disabled = true; $('#updLater').disabled = true; $('#updStep').textContent = 'Baixando a versão nova…';
    try { await api('POST', '/api/update/apply'); } catch (er) { $('#updStep').textContent = er.message; $('#updGo').disabled = false; $('#updLater').disabled = false; return; }
    let down = false; const before = u.local, t0 = Date.now();
    for (let i = 0; i < 300; i++) {
      await new Promise(r => setTimeout(r, 1500));
      try {
        const r = await fetch('/api/update'); if (!r.ok) throw 0;
        const j = await r.json();
        if (j.error) { $('#updStep').textContent = j.error; $('#updLater').disabled = false; $('#updGo').disabled = false; $('#updGo').textContent = 'Tentar de novo'; return; }
        if (down || (j.local && j.local !== before) || (Date.now() - t0 > 25000 && !j.busy)) { location.reload(); return; }
      } catch (e) { down = true; $('#updStep').textContent = 'Reiniciando o Garimpo…'; }
    }
    $('#updStep').textContent = 'Demorou mais que o normal. Recarregue a página ou abra o Garimpo de novo.';
  };
}
$('#updBtn').onclick = showUpdate;
api('GET', '/api/update?check=1').then(u => { S.upd = u; paintUpd(); }).catch(() => {});
