"""Modo nuvem: login por senha, sessão em cookie assinado e o endereço público (biblioteca padrão).

Ligado só com GARIMPO_CLOUD=1 (o Dockerfile faz isso). No seu computador nada disto vale.
Variáveis:
  GARIMPO_PASSWORD   a senha do painel (obrigatória, 12 caracteres ou mais)
  GARIMPO_HOST       domínio próprio (ou vários, separados por vírgula; o primeiro é o principal, usado nos links).
                     O RAILWAY_PUBLIC_DOMAIN, que o Railway preenche, também é aceito.
"""
import base64, hashlib, hmac, html, os, secrets, threading, time

LOGO = os.path.join(os.path.dirname(os.path.abspath(__file__)), "web", "logo.png")

ENABLED = os.environ.get("GARIMPO_CLOUD") == "1"
PASSWORD = os.environ.get("GARIMPO_PASSWORD", "")
MIN_PASSWORD = 12
_names = (os.environ.get("GARIMPO_HOST", "") + "," + os.environ.get("RAILWAY_PUBLIC_DOMAIN", "")).split(",")
HOSTS = list(dict.fromkeys(h.strip().lower() for h in _names if h.strip())) if ENABLED else []
ORIGINS = [f"https://{h}" for h in HOSTS]
PUBLIC_URL = ORIGINS[0] if ORIGINS else ""

COOKIE = "__Host-garimpo"  # o prefixo obriga o navegador a exigir HTTPS e a prender o cookie a este domínio
SESSION_SECONDS = 14 * 86400
WINDOW, PER_IP, OVERALL = 15 * 60, 5, 100  # tentativas erradas de senha a cada 15 minutos

# Referrer-Policy: o mapa do OpenStreetMap bloqueia quem não informa de qual site vem. Assim vai só o domínio, nunca o caminho.
HEADERS = {"X-Content-Type-Options": "nosniff", "X-Frame-Options": "DENY", "Referrer-Policy": "strict-origin-when-cross-origin",
           "Strict-Transport-Security": "max-age=31536000"}

_key = b""
_attempts, _lock = [], threading.Lock()  # [(quando, ip)]


def init(data_dir):
    """Lê (ou cria) a chave que assina as sessões. Trocar a senha também derruba as sessões abertas."""
    global _key
    os.makedirs(data_dir, exist_ok=True)
    path = os.path.join(data_dir, "session.key")
    try:
        with open(path, "rb") as f:
            seed = f.read()
    except OSError:
        seed = b""
    if len(seed) < 32:
        seed = secrets.token_bytes(32)
        with open(path, "wb") as f:
            f.write(seed)
        try:
            os.chmod(path, 0o600)
        except OSError:
            pass
    _key = hmac.new(seed, PASSWORD.encode(), hashlib.sha256).digest()


def ready():
    return bool(HOSTS) and len(PASSWORD) >= MIN_PASSWORD


def _sign(text):
    return hmac.new(_key, text.encode(), hashlib.sha256).hexdigest()


def login(password, ip):
    """("ok", cookie) | ("errada", None) | ("bloqueado", None)."""
    now = time.time()
    with _lock:
        _attempts[:] = [a for a in _attempts if now - a[0] < WINDOW]
        if len(_attempts) >= OVERALL or sum(a[1] == ip for a in _attempts) >= PER_IP:
            return "bloqueado", None
        attempt = (now, ip)
        _attempts.append(attempt)  # conta antes de conferir: pedidos simultâneos não furam o limite
    if not ready() or not hmac.compare_digest(password.encode(), PASSWORD.encode()):
        return "errada", None
    with _lock:
        _attempts[:] = [a for a in _attempts if a[1] != ip]
    expires = str(int(now) + SESSION_SECONDS)
    return "ok", f"{COOKIE}={expires}.{_sign(expires)}; Path=/; Max-Age={SESSION_SECONDS}; Secure; HttpOnly; SameSite=Lax"


def logout_cookie():
    return f"{COOKIE}=; Path=/; Max-Age=0; Secure; HttpOnly; SameSite=Lax"


def logged_in(cookie_header):
    if not ready() or not _key:
        return False
    for part in (cookie_header or "").split(";"):
        name, _, value = part.strip().partition("=")
        if name != COOKIE:
            continue
        expires, _, signature = value.partition(".")
        if (expires.isascii() and expires.isdigit() and signature.isascii()
                and hmac.compare_digest(signature, _sign(expires)) and int(expires) > time.time()):
            return True
    return False


PAGE = """<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex">
<title>CaçaLead · Entrar</title><style>
:root{color-scheme:light}*{box-sizing:border-box}
body{margin:0;min-height:100vh;display:grid;place-items:center;padding:16px;background:#F0F6F3;color:#101819;font:14px/22px Inter,Arial,sans-serif}
main{width:100%;max-width:380px;padding:32px;border:1px solid #DCE5DF;border-radius:16px;background:#fff}
h1{margin:0 0 8px}h1 img{display:block;width:220px;max-width:100%;height:auto}p{margin:0 0 24px;color:#31423C}
label{display:block;margin-bottom:8px;font-size:12px;font-weight:600}
input{width:100%;height:44px;padding:0 12px;margin-bottom:16px;border:1px solid #BFCFC5;border-radius:10px;font:inherit}
button{width:100%;height:44px;border:0;border-radius:10px;background:#087C35;color:#fff;font:700 14px Inter,Arial,sans-serif;cursor:pointer}
input:focus-visible,button:focus-visible{outline:2px solid #087C35;outline-offset:2px}
.err{color:#B42318}code{color:#087C35;font-weight:600}
</style></head><body><main><h1><img src="__LOGO__" alt="CaçaLead"></h1>__BODY__</main></body></html>"""

FORM = """<p>Seu próximo cliente está no radar.</p>__ERROR__<form method="post" action="/login">
<label for="password">Senha</label><input id="password" name="password" type="password" autocomplete="current-password" required autofocus>
<button type="submit">Entrar</button></form>"""


def _page(body):
    """A tela de entrada abre antes do login, então o logo vai embutido nela."""
    try:
        with open(LOGO, "rb") as f:
            logo = "data:image/png;base64," + base64.b64encode(f.read()).decode()
    except OSError:
        logo = ""
    return PAGE.replace("__LOGO__", logo).replace("__BODY__", body).encode()


def login_page(error=""):
    message = f'<p class="err" role="alert">{html.escape(error)}</p>' if error else ""
    return _page(FORM.replace("__ERROR__", message))


def setup_page():
    missing = []
    if len(PASSWORD) < MIN_PASSWORD:
        missing.append(f"<p>Crie a variável <code>GARIMPO_PASSWORD</code> no serviço, com a senha do painel "
                       f"({MIN_PASSWORD} caracteres ou mais).</p>")
    if not HOSTS:
        missing.append("<p>Gere um domínio público para o serviço (ou defina <code>GARIMPO_HOST</code>).</p>")
    return _page("<p>Falta terminar a configuração</p>" + "".join(missing) + "<p>Depois, publique o serviço de novo.</p>")
