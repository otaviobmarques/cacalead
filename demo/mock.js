/* Servidor de mentira da demonstração: responde às chamadas /api/ e ao canal ao vivo dentro do próprio navegador.
   Nada sai da página. Carrega antes do app.js. */
(() => {
  const D = window.DEMO;
  const now = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 19);  // hora local
  const clock = () => new Date().toLocaleTimeString('pt-BR');
  const leads = new Map(D.state.leads.map(l => [l.key, l]));
  const hunts = D.state.hunts, sweeps = D.state.sweeps, pool = D.pool.slice();
  const queue = D.wa.queue; delete D.wa.queue;
  const wa = D.wa;
  const listeners = {};
  const emit = (type, payload) => (listeners[type] || []).forEach(fn => fn({ data: JSON.stringify(payload) }));
  const feed = (hunt, text, tone = 'info', key = null) => emit('feed', { hunt, text, tone, key, t: clock() });
  const say = text => { const t = document.getElementById('toast'); if (!t) return; t.textContent = text; t.classList.add('on'); setTimeout(() => t.classList.remove('on'), 3200); };
  const countWa = () => { wa.queued = queue.filter(x => x.status === 'fila').length; };

  window.EventSource = class {
    constructor() { setTimeout(() => this.onopen && this.onopen(), 50); }
    addEventListener(type, fn) { (listeners[type] = listeners[type] || []).push(fn); }
    close() {}
  };

  function runHunt(body) {
    const id = Math.max(0, ...hunts.map(h => h.id)) + 1;
    const city = body.city || 'Blumenau, SC';
    const hunt = { id, engine_id: null, keywords: body.keywords || ['comércio local'], city, lat: String(body.lat || ''), lon: String(body.lon || ''),
      depth: body.depth || 2, opts: {}, created: now(), status: 'rodando', stage: 'search', percent: 0, places: 0, error: '', finished: null };
    hunts.unshift(hunt);
    const sweep = { id: sweeps.length + 1, hunt_id: id, idx: 0, bairro: '', lat: hunt.lat, lon: hunt.lon, engine_id: 'demo', status: 'rodando', stage: 'search', percent: 0, places: 0, found: 0, error: '' };
    sweeps.push(sweep);
    const batch = pool.splice(0, 6);
    setTimeout(() => { emit('sweep', sweep); feed(id, `◉ Nova caçada #${id}: ${hunt.keywords.join(', ')} (demonstração, negócios fictícios)`, 'stage'); }, 100);
    const finish = () => {
      Object.assign(hunt, { status: 'pronta', stage: 'done', percent: 100, finished: now() });
      Object.assign(sweep, { status: 'pronta', stage: 'done', percent: 100 });
      emit('sweep', sweep); emit('hunt', hunt);
      feed(id, batch.length ? `✔ Caçada concluída · ${batch.length} lugares` : '✔ Os exemplos acabaram. Recarregue a página para ver de novo.', 'done');
    };
    batch.forEach((lead, i) => setTimeout(() => {
      if (hunt.status !== 'rodando') return;
      lead.hunt_id = id; lead.hunts = [id]; lead.first_seen = lead.updated = now(); leads.set(lead.key, lead);
      hunt.places = sweep.found = sweep.places = i + 1; hunt.percent = sweep.percent = Math.round((i + 1) / batch.length * 95);
      emit('hunt', hunt); emit('sweep', sweep); emit('lead', lead);
      feed(id, `${lead.data.title} · ${lead.data.category} · score ${lead.intel.score}`, lead.intel.temp, lead.key);
    }, 900 + i * 1300));
    setTimeout(() => { if (hunt.status === 'rodando') finish(); }, 1400 + batch.length * 1300);
    return hunt;
  }

  function analysis(lead) {
    const gaps = lead.intel.gaps.slice(0, 3).map(g => '- ' + g).join('\n') || '- Perfil bem cuidado';
    return `## Exemplo de análise\nNo sistema instalado, este texto é escrito pelo Claude para cada negócio.\n\n## Diagnóstico de ${lead.data.title}\n${gaps}\n\n## Melhor oferta\nPerfil do Google ajustado e um site simples com botão de WhatsApp.`;
  }

  function handle(method, path, query, body) {
    let m;
    if (path === '/api/state') return D.state.leads = [...leads.values()], D.state;
    if (path === '/api/wa' && method === 'GET') return countWa(), Object.assign({}, wa, { queue });
    if (path === '/api/update') return { git: false, behind: 0, changes: [], local: '', date: '', dirty: false, error: '', busy: false, step: '' };
    if (path === '/api/cities') { const q = (query.get('q') || '').toLowerCase().split(',')[0]; return D.cities.filter(c => c.label.toLowerCase().includes(q)); }
    if (path === '/api/bairros') return D.bairros;
    if (path === '/api/hunts' && method === 'POST') return runHunt(body);
    if ((m = path.match(/^\/api\/hunts\/(\d+)$/)) && method === 'DELETE') {
      const h = hunts.find(x => x.id === +m[1]); if (h) { h.status = 'parada'; h.finished = now(); sweeps.filter(s => s.hunt_id === h.id).forEach(s => { s.status = 'parada'; emit('sweep', s); }); emit('hunt', h); }
      return { ok: true };
    }
    if ((m = path.match(/^\/api\/leads\/(.+?)(\/ai|\/diag)?$/))) {
      const lead = leads.get(decodeURIComponent(m[1])); if (!lead) return [404, { error: 'lead não existe' }];
      if (m[2] === '/ai') { setTimeout(() => { lead.ai = analysis(lead); emit('ai', { key: lead.key, state: 'done', text: lead.ai }); }, 1400); return { ok: true }; }
      if (m[2] === '/diag') { setTimeout(() => say('Na demonstração a página de diagnóstico não é gerada.'), 600); return { ok: true }; }
      if ('pipeline' in body) lead.pipeline = body.pipeline;
      if ('notes' in body) lead.notes = body.notes;
      if ('client' in body) lead.client = !!body.client;
      if (body.wa_link) lead.wa.link = now();
      lead.updated = now(); setTimeout(() => emit('lead', lead), 0); return lead;
    }
    if (path === '/api/clients/find' || path === '/api/clients/recheck') {
      const name = (body.name || '').toLowerCase();
      const found = name && [...leads.values()].find(l => l.data.title.toLowerCase().includes(name));
      if (found) { found.client = true; found.pipeline = 'fechado'; setTimeout(() => { emit('lead', found); emit('client', { hunt: hunts[0].id, key: found.key, found: true }); }, 300); }
      else setTimeout(() => say(name ? 'Na demonstração, procure um nome que já está nos leads.' : 'Checagem simulada.'), 300);
      return hunts[0];
    }
    if (path === '/api/wa/settings') {
      for (const [k, v] of Object.entries(body)) { if (k === 'auto' || k in wa.cfg) wa.cfg[k] = v; if (k === 'provider') wa.provider = v; }
      return countWa(), wa;
    }
    if (path === '/api/wa/queue' && method === 'POST') {
      let added = 0, skipped = 0;
      for (const key of body.keys || []) {
        const l = leads.get(key);
        if (!l || !l.intel.wa || l.client || l.pipeline !== 'novo' || queue.some(x => x.key === key && x.status !== 'cancelado')) { skipped++; continue; }
        queue.unshift({ id: queue.length + 1, key, phone: l.intel.wa, text: l.intel.pitch, status: 'fila', created: now(), sent_at: null, jid: null, error: '', title: l.data.title, pipeline: l.pipeline }); added++;
      }
      countWa(); return { added, skipped };
    }
    if ((m = path.match(/^\/api\/wa\/queue(?:\/(\d+))?$/)) && method === 'DELETE') {
      queue.filter(x => x.status === 'fila' && (!m[1] || x.id === +m[1])).forEach(x => { x.status = 'cancelado'; }); countWa(); return { ok: true };
    }
    if (path === '/api/wa/send') {
      const l = leads.get(body.key); if (!l) return [404, { error: 'lead não existe' }];
      if (l.pipeline === 'novo') l.pipeline = 'contatado'; l.wa.out = now(); setTimeout(() => say('Demonstração: nenhuma mensagem foi enviada.'), 400); return l;
    }
    if (path === '/api/wa/test') return wa;
    if (path === '/api/terms') return wa.terms_ok = true, { terms_ok: true };
    if (path.startsWith('/api/gowa/')) return [503, { error: 'Na demonstração o WhatsApp não é conectado.' }];
    return [404, { error: 'não disponível na demonstração' }];
  }

  const realFetch = window.fetch.bind(window);
  window.fetch = async (input, init = {}) => {
    const url = typeof input === 'string' ? input : input.url;
    if (!url.startsWith('/api/')) return realFetch(input, init);
    const u = new URL(url, 'http://demo.invalid');
    let out = handle((init.method || 'GET').toUpperCase(), u.pathname, u.searchParams, init.body ? JSON.parse(init.body) : {});
    let status = 200;
    if (Array.isArray(out) && typeof out[0] === 'number') [status, out] = out;
    return new Response(JSON.stringify(out), { status, headers: { 'Content-Type': 'application/json' } });
  };

  /* A demonstração não abre janelas de confirmação, links externos nem downloads. */
  window.confirm = () => true;
  window.open = () => { say('Links externos ficam desligados na demonstração.'); return null; };
  document.addEventListener('click', e => {
    const a = e.target.closest && e.target.closest('a[href]');
    if (!a || a.getAttribute('href').startsWith('#')) return;
    e.preventDefault(); e.stopPropagation();
    say(a.id === 'export' ? 'A planilha CSV é baixada no sistema instalado.' : 'Links externos ficam desligados na demonstração.');
  }, true);

  /* Mapa ilustrativo: a página publicada não pode carregar as imagens do OpenStreetMap. As cores são claras porque o
     tema escuro aplica um filtro por cima, como faz com o mapa real. */
  const Grid = L.GridLayer.extend({
    createTile(c) {
      const s = this.getTileSize(), tile = document.createElement('canvas'); tile.width = s.x; tile.height = s.y;
      const g = tile.getContext('2d'); g.fillStyle = '#efece6'; g.fillRect(0, 0, s.x, s.y);
      const rnd = n => { const v = Math.sin(c.x * 12.9898 + c.y * 78.233 + c.z * 37.719 + n) * 43758.5453; return v - Math.floor(v); };
      g.strokeStyle = '#bdb7ac';
      for (let i = 0; i < 6; i++) { g.lineWidth = i < 2 ? 5 : 2; g.beginPath(); const p = (i * 47 + 20) % 256; if (i % 2) { g.moveTo(0, p); g.lineTo(256, p); } else { g.moveTo(p, 0); g.lineTo(p, 256); } g.stroke(); }
      g.fillStyle = '#d6e6cf'; if (rnd(1) > 0.6) g.fillRect(30 + rnd(2) * 120, 30 + rnd(3) * 120, 60, 44);
      return tile;
    },
  });
  L.tileLayer = () => new Grid({ attribution: 'mapa ilustrativo' });
})();
