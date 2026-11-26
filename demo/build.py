#!/usr/bin/env python3
"""Monta a demonstração do painel em um único HTML: demo/dist/cacalead.html.

Usa os arquivos reais de web/ e as funções reais do garimpo.py (nota, mensagem, formato dos dados), com negócios
fictícios no lugar do Google Maps. O servidor é simulado no navegador por demo/mock.js.

Uso:  python demo/build.py
"""
import json, os, re, shutil, sys, tempfile
from datetime import datetime, timedelta

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)

# nome, categoria, bairro, site, instagram, e-mail, nota, avaliações, tem horário, tem foto, funil
BUSINESSES = [
    ("Padaria Trigo de Exemplo", "Padaria", "Centro", "", "", "", 4.7, 412, True, True, "novo"),
    ("Barbearia Navalha Modelo", "Barbearia", "Velha", "https://instagram.com/exemplo", "", "", 4.9, 138, True, True, "novo"),
    ("Pizzaria Forno Fictício", "Pizzaria", "Garcia", "https://ifood.com.br/exemplo", "", "contato@forno.example.com", 3.8, 267, True, True, "contatado"),
    ("Clínica Sorriso Demonstração", "Dentista", "Vila Nova", "https://sorriso.example.com", "https://instagram.com/exemplo", "oi@sorriso.example.com", 4.8, 1240, True, True, "negociando"),
    ("Pet Shop Patas de Teste", "Pet shop", "Itoupava Norte", "", "", "", 4.1, 22, False, False, "novo"),
    ("Academia Força Amostra", "Academia", "Água Verde", "https://forca.example.com", "", "", 4.4, 86, True, True, "novo"),
    ("Salão Beleza Exemplar", "Salão de beleza", "Fortaleza", "https://linktr.ee/exemplo", "", "", 4.6, 57, True, False, "contatado"),
    ("Hamburgueria Chapa Modelo", "Hamburgueria", "Ponta Aguda", "", "https://instagram.com/exemplo", "", 4.5, 689, True, True, "novo"),
    ("Imobiliária Chave de Exemplo", "Imobiliária", "Centro", "https://chave.example.com", "https://instagram.com/exemplo", "vendas@chave.example.com", 4.2, 74, True, True, "fechado"),
    ("Estética Pele Fictícia", "Clínica de estética", "Velha", "", "", "", 5.0, 9, False, True, "novo"),
    ("Café Grão de Teste", "Cafeteria", "Victor Konder", "https://instagram.com/exemplo", "", "", 4.3, 154, True, True, "descartado"),
    ("Oficina Motor Amostra", "Oficina mecânica", "Itoupava Seca", "", "", "", 3.6, 43, True, False, "novo"),
]
# aparecem ao vivo quando alguém inicia uma varredura na demonstração
LIVE = [
    ("Sorveteria Gelo Modelo", "Sorveteria", "Centro", "", "", "", 4.6, 231, True, True, "novo"),
    ("Floricultura Pétala de Exemplo", "Floricultura", "Jardim Blumenau", "https://instagram.com/exemplo", "", "", 4.8, 64, True, True, "novo"),
    ("Restaurante Panela Fictícia", "Restaurante", "Garcia", "https://cardapioweb.com/exemplo", "", "", 4.0, 518, True, True, "novo"),
    ("Ótica Visão Demonstração", "Ótica", "Vila Nova", "https://visao.example.com", "", "contato@visao.example.com", 4.7, 97, True, True, "novo"),
    ("Lavanderia Bolha de Teste", "Lavanderia", "Velha", "", "", "", 3.9, 17, False, False, "novo"),
    ("Escola de Idiomas Amostra", "Escola de idiomas", "Água Verde", "https://idiomas.example.com", "https://instagram.com/exemplo", "", 4.9, 112, True, True, "novo"),
]
BAIRROS = ["Centro", "Velha", "Garcia", "Vila Nova", "Itoupava Norte", "Itoupava Seca", "Água Verde", "Fortaleza",
           "Ponta Aguda", "Victor Konder", "Jardim Blumenau", "Escola Agrícola"]
CITIES = [("Blumenau, SC", -26.9194, -49.0661), ("Itajaí, SC", -26.9078, -48.6619), ("Joinville, SC", -26.3044, -48.8456),
          ("Florianópolis, SC", -27.5954, -48.5480), ("Porto Alegre, RS", -30.0346, -51.2177), ("Curitiba, PR", -25.4284, -49.2733)]


def spot(i):
    """Um ponto em volta do centro de Blumenau, sempre o mesmo para o mesmo índice."""
    return round(-26.9194 + ((i * 37) % 23 - 11) * 0.0023, 6), round(-49.0661 + ((i * 53) % 29 - 14) * 0.0024, 6)


def row(i, b):
    name, cat, bairro, site, insta, email, rating, reviews, hours, photo, _ = b
    lat, lon = spot(i)
    return {"title": name, "category": cat, "address": f"Rua de Exemplo, {100 + i * 7} - {bairro}, Blumenau - SC",
            "website": site, "phone": f"+55 00 90000-{i + 1:04d}",  # DDD 00 não existe: nenhum botão chama alguém de verdade
            "review_count": reviews, "review_rating": rating, "latitude": lat, "longitude": lon,
            "thumbnail": "exemplo" if photo else "", "open_hours": {"segunda-feira": ["08:00–18:00"]} if hours else None,
            "complete_address": {"borough": bairro, "city": "Blumenau", "state": "SC"}, "emails": email, "instagram": insta,
            "link": "https://maps.example.com/", "data_id": f"demo-{i + 1}", "_bairro": bairro}


def fixtures(g):
    g.wa_save(dict(g.WA_DEFAULTS, terms_version=g.TERMS_VERSION, me_name="Ana", me_art="a", me_agency="Agência Exemplo",
                   me_city="Blumenau", diag_salt="demonstracao"))
    ago = lambda **kw: (datetime.now() - timedelta(**kw)).isoformat(timespec="seconds")
    opts = {"email": True, "socials": True, "reviews_max": 0, "bairros": 0}
    g.q("INSERT INTO hunts(id,keywords,city,lat,lon,depth,opts,created,status,stage,percent,places,error,finished)"
        " VALUES(1,?,?,?,?,2,?,?,'pronta','done',100,?,'',?)",
        (json.dumps(["comércio local"], ensure_ascii=False), "Blumenau, SC", "-26.9194", "-49.0661", json.dumps(opts),
         ago(days=2), len(BUSINESSES), ago(days=2)))
    g.q("INSERT INTO sweeps(hunt_id,idx,bairro,lat,lon,engine_id,status,stage,percent,places,found) VALUES(1,0,'',?,?,'demo','pronta','done',100,?,?)",
        ("-26.9194", "-49.0661", len(BUSINESSES), len(BUSINESSES)))
    for i, b in enumerate(BUSINESSES + LIVE):
        data = row(i, b)
        intel = g.analyse(data)
        key, hunt = data["data_id"], 1 if i < len(BUSINESSES) else 2
        g.q("INSERT INTO leads(key,hunt_id,data,intel,hash,first_seen,updated,pipeline,diag_dirty) VALUES(?,?,?,?,'',?,?,?,0)",
            (key, hunt, json.dumps(data, ensure_ascii=False), json.dumps(intel, ensure_ascii=False),
             ago(days=2, minutes=-i), ago(days=1), b[10]))
        g.q("INSERT INTO lead_hunts(key, hunt_id) VALUES(?,?)", (key, hunt))
    # um cliente na Blindagem, com histórico
    g.q("UPDATE leads SET client=1 WHERE key='demo-9'")
    for days, score, rating, reviews in ((60, 62, 3.9, 41), (30, 48, 4.0, 58), (1, 33, 4.2, 74)):
        g.q("INSERT INTO lead_history(key,ts,score,rating,reviews,site,insta) VALUES('demo-9',?,?,?,?,'próprio',1)",
            (ago(days=days), score, rating, reviews))
    # conversas e fila de exemplo
    for key, status, replied in (("demo-3", "enviado", None), ("demo-7", "enviado", None),
                                 ("demo-4", "enviado", "Oi! Pode mandar, quero ver sim."), ("demo-1", "fila", None), ("demo-8", "fila", None)):
        lead = g.q("SELECT intel FROM leads WHERE key=?", (key,), one=True)
        intel = json.loads(lead["intel"])
        sent = ago(hours=5) if status == "enviado" else None
        g.q("INSERT INTO outreach(key,phone,text,status,created,sent_at) VALUES(?,?,?,?,?,?)",
            (key, intel["wa"], intel["pitch"], status, ago(hours=6), sent))
        if sent:
            g.q("INSERT INTO wa_msgs(id,key,sent_at,delivered_at,read_at) VALUES(?,?,?,?,?)",
                ("m-" + key, key, sent, sent, sent if key != "demo-7" else None))
            g.q("UPDATE leads SET wa_out=?, wa_in=?, wa_in_text=? WHERE key=?",
                (sent, ago(hours=3) if replied else None, replied, key))
    g.WA.update(state="conectado", version="demonstração")
    wa = dict(g.wa_public(), queue=[g.outreach_out(r) for r in g.q("SELECT * FROM outreach ORDER BY id DESC")])
    wa["gowa"]["installed"] = True  # na demonstração o painel aparece como conectado
    leads = g.all_leads()
    for lead in leads:
        lead["diag"]["url"] = f"https://exemplo.example.com/diagnostico/{lead['key']}/"
    return {
        "state": {"hunts": [g.hunt_out(r) for r in g.q("SELECT * FROM hunts ORDER BY id DESC")],
                  "leads": [x for x in leads if x["hunt_id"] == 1],
                  "sweeps": [dict(r) for r in g.q("SELECT * FROM sweeps")], "engine": True, "claude": True,
                  "pipeline": g.PIPELINE},
        "pool": [x for x in leads if x["hunt_id"] == 2],
        "wa": wa,
        "cities": [{"label": c, "lat": a, "lon": o} for c, a, o in CITIES],
        "bairros": [{"name": n, "lat": spot(i + 3)[0], "lon": spot(i + 3)[1], "kind": "suburb"} for i, n in enumerate(BAIRROS)],
    }


def read(*parts):
    with open(os.path.join(*parts), encoding="utf-8") as f:
        return f.read()


def script(text):
    return "<script>\n" + text.replace("</script", "<\\/script") + "\n</script>"


def main():
    tmp = tempfile.mkdtemp(prefix="cacalead-demo-")  # o garimpo.py cria o banco ao lado dele: nada toca nos seus dados
    try:
        for name in ("garimpo.py", "diag.py", "plataforma.py"):
            shutil.copy(os.path.join(ROOT, name), tmp)
        sys.dont_write_bytecode = True
        sys.path.insert(0, tmp)
        import garimpo
        data = fixtures(garimpo)
        garimpo.CONN.close()
    finally:
        shutil.rmtree(tmp, ignore_errors=True)

    web = os.path.join(ROOT, "web")
    index = read(web, "index.html")
    body = index.split("<body>", 1)[1].rsplit("</body>", 1)[0]
    body = re.sub(r"<script\b[^>]*></script>\s*", "", body)
    fonts = re.search(r'<link href="https://fonts\.googleapis\.com[^>]+>', index).group(0)
    page = "\n".join([
        "<title>CaçaLead</title>",
        fonts,
        "<style>", read(HERE, "leaflet-min.css"), read(web, "app.css"), read(HERE, "demo.css"), "</style>",
        body,
        '<div class="demo-flag">Demonstração com dados fictícios. Nada é buscado nem enviado.</div>',
        '<script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js"></script>',
        script("window.DEMO = " + json.dumps(data, ensure_ascii=False).replace("</", "<\\/") + ";"),
        script(read(HERE, "mock.js")),
        script(read(web, "app.js")),
        script(read(web, "i18n.js")),
    ])
    out = os.path.join(HERE, "dist", "cacalead.html")
    os.makedirs(os.path.dirname(out), exist_ok=True)
    with open(out, "w", encoding="utf-8", newline="\n") as f:
        f.write(page)
    print(f"{out}  ({len(page.encode()) // 1024} KB, {len(data['state']['leads'])} leads de exemplo)")


if __name__ == "__main__":
    main()
