"""Modo nuvem: login por senha, sessão em cookie assinado e o endereço público (biblioteca padrão).

Ligado só com GARIMPO_CLOUD=1 (o Dockerfile faz isso). No seu computador nada disto vale.
Variáveis:
  GARIMPO_PASSWORD   a senha do painel (obrigatória, 12 caracteres ou mais)
  GARIMPO_HOST       domínio próprio; sem ele vale o RAILWAY_PUBLIC_DOMAIN que o Railway preenche
"""
import hashlib, hmac, html, os, secrets, threading, time

ENABLED = os.environ.get("GARIMPO_CLOUD") == "1"
PASSWORD = os.environ.get("GARIMPO_PASSWORD", "")
MIN_PASSWORD = 12
HOST = (os.environ.get("GARIMPO_HOST") or os.environ.get("RAILWAY_PUBLIC_DOMAIN") or "").strip().lower() if ENABLED else ""
PUBLIC_URL = f"https://{HOST}" if HOST else ""

COOKIE = "__Host-garimpo"  # o prefixo obriga o navegador a exigir HTTPS e a prender o cookie a este domínio
SESSION_SECONDS = 14 * 86400
WINDOW, PER_IP, OVERALL = 15 * 60, 5, 100  # tentativas erradas de senha a cada 15 minutos

HEADERS = {"X-Content-Type-Options": "nosniff", "X-Frame-Options": "DENY", "Referrer-Policy": "same-origin",
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
    return bool(HOST) and len(PASSWORD) >= MIN_PASSWORD


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
<title>Garimpo · Entrar</title><style>
:root{color-scheme:dark}*{box-sizing:border-box}
body{margin:0;min-height:100vh;display:grid;place-items:center;padding:24px;background:#05070c;color:#e8eefc;font:15px/1.5 system-ui,sans-serif}
main{width:100%;max-width:360px;padding:28px;border:1px solid #1d2740;border-radius:18px;background:#0b1020}
h1{margin:0 0 4px;font-size:22px;letter-spacing:.28em;color:#ffcf4a}p{margin:0 0 18px;color:#9aa6c4}
label{display:block;margin-bottom:6px;font-size:13px}
input{width:100%;padding:12px;margin-bottom:14px;border:1px solid #2a365a;border-radius:10px;background:#05070c;color:inherit;font:inherit}
button{width:100%;padding:12px;border:0;border-radius:10px;background:#ffcf4a;color:#1a1300;font:700 15px system-ui,sans-serif;cursor:pointer}
input:focus-visible,button:focus-visible{outline:2px solid #2ef2ff;outline-offset:2px}
.err{color:#ff7b93}code{color:#2ef2ff}
</style></head><body><main><h1>GARIMPO</h1>__BODY__</main></body></html>"""

FORM = """<p>Radar de prospecção</p>__ERROR__<form method="post" action="/login">
<label for="password">Senha</label><input id="password" name="password" type="password" autocomplete="current-password" required autofocus>
<button type="submit">Entrar</button></form>"""


def login_page(error=""):
    message = f'<p class="err" role="alert">{html.escape(error)}</p>' if error else ""
    return PAGE.replace("__BODY__", FORM.replace("__ERROR__", message)).encode()


def setup_page():
    missing = []
    if len(PASSWORD) < MIN_PASSWORD:
        missing.append(f"<p>Crie a variável <code>GARIMPO_PASSWORD</code> no serviço, com a senha do painel "
                       f"({MIN_PASSWORD} caracteres ou mais).</p>")
    if not HOST:
        missing.append("<p>Gere um domínio público para o serviço (ou defina <code>GARIMPO_HOST</code>).</p>")
    return PAGE.replace("__BODY__", "<p>Falta terminar a configuração</p>" + "".join(missing)
                        + "<p>Depois, publique o serviço de novo.</p>").encode()
