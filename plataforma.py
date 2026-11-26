"""O que muda entre Windows e macOS/Linux, num lugar só (biblioteca padrão)."""
import json, os, signal, subprocess, sys, time

WINDOWS = os.name == "nt"


def utf8_console():
    """Os textos têm acento e símbolos (→ ✓): no Windows, uma saída redirecionada em cp1252 quebraria o print."""
    for stream in (sys.stdout, sys.stderr):
        try:
            stream.reconfigure(encoding="utf-8", errors="replace")
        except (AttributeError, ValueError):
            pass


def background_kwargs():
    """Argumentos do Popen para um processo que continua vivo depois que o Garimpo fecha."""
    if WINDOWS:  # console próprio e escondido: fechar a janela do Garimpo não derruba o processo
        return {"creationflags": subprocess.CREATE_NO_WINDOW | subprocess.CREATE_NEW_PROCESS_GROUP}
    return {"start_new_session": True}


def _powershell(script, **env):
    """Roda um comando do PowerShell. Valores variáveis entram por variável de ambiente, nunca dentro do script."""
    p = subprocess.run(["powershell", "-NoProfile", "-NonInteractive", "-Command",
                        "[Console]::OutputEncoding=[Text.Encoding]::UTF8; " + script],
                       env=dict(os.environ, **env), capture_output=True, text=True, encoding="utf-8", errors="replace",
                       timeout=30)
    return p.stdout or ""


def pids_of(exe, argument):
    """PIDs dos processos que rodam exatamente este executável (de outra instalação não entra)."""
    if WINDOWS:
        out = _powershell("Get-CimInstance Win32_Process | Where-Object { $_.ExecutablePath -eq $env:GARIMPO_EXE } "
                          "| ForEach-Object { $_.ProcessId }", GARIMPO_EXE=os.path.normpath(exe))
    else:
        out = subprocess.run(["pgrep", "-f", f"{exe} {argument}"], capture_output=True, text=True).stdout
    return [int(x) for x in out.split() if x.isdigit()]


def listening_pids(port):
    """PIDs de quem escuta na porta TCP."""
    if WINDOWS:
        out = _powershell("Get-NetTCPConnection -State Listen -LocalPort ([int]$env:GARIMPO_P) -ErrorAction SilentlyContinue "
                          "| ForEach-Object { $_.OwningProcess }", GARIMPO_P=str(int(port)))
    else:
        out = subprocess.run(["lsof", f"-tiTCP:{int(port)}", "-sTCP:LISTEN"], capture_output=True, text=True).stdout
    return sorted({int(x) for x in out.split() if x.isdigit()})


def command_line(pid):
    if WINDOWS:
        return _powershell("(Get-CimInstance Win32_Process -Filter ('ProcessId=' + [int]$env:GARIMPO_PID)).CommandLine",
                           GARIMPO_PID=str(int(pid)))
    return subprocess.run(["ps", "-p", str(int(pid)), "-o", "command="], capture_output=True, text=True).stdout


def terminate(pid):
    """Encerra o processo. No Windows o encerramento é imediato; o SQLite do gateway e o do Garimpo aguentam isso."""
    try:
        os.kill(int(pid), signal.SIGTERM)
        return True
    except (OSError, ValueError):
        return False


def safe_path(base, rel):
    """Caminho de `rel` dentro de `base`, ou None se tentar sair dela. Confere o texto ANTES de tocar no disco:
    no Windows, só resolver um \\\\servidor\\pasta já abre uma conexão de rede com as suas credenciais."""
    parts = [x for x in rel.replace("\\", "/").split("/") if x not in ("", ".")]
    if any(x == ".." or ":" in x or "\0" in x for x in parts):
        return None
    root = os.path.realpath(base)
    path = os.path.realpath(os.path.join(root, *parts))
    return path if path == root or path.startswith(root + os.sep) else None


def publish_folder(folder, dest):
    """Sobe as páginas para o servidor. Devolve (ok, mensagem de erro).
    macOS e Linux: rsync. Windows: scp (já vem no sistema), só com as pastas que mudaram desde o último envio."""
    if not WINDOWS:
        p = subprocess.run(["rsync", "-az", "--exclude", "_assets", "--", folder + "/", dest],
                           capture_output=True, text=True, timeout=300)
        return p.returncode == 0, p.stderr
    stamp = os.path.join(folder, ".publicado.json")
    try:
        with open(stamp, encoding="utf-8") as f:
            last = json.load(f)
        since = float(last["quando"]) if last.get("destino") == dest else 0.0
    except (OSError, ValueError, KeyError, TypeError):
        since = 0.0
    started = time.time()
    changed = []
    for name in sorted(os.listdir(folder)):
        page = os.path.join(folder, name, "index.html")
        if name != "_assets" and not name.startswith("-") and os.path.isfile(page) and os.path.getmtime(page) >= since:
            changed.append(name)
    target = dest if dest.endswith(("/", ":")) else dest + "/"
    for i in range(0, len(changed), 50):  # em lotes: a linha de comando do Windows tem limite
        p = subprocess.run(["scp", "-B", "-q", "-r", "--", *changed[i:i + 50], target], cwd=folder,
                           stdin=subprocess.DEVNULL, capture_output=True, text=True, encoding="utf-8", errors="replace",
                           timeout=300)
        if p.returncode:
            return False, p.stderr
    with open(stamp, "w", encoding="utf-8") as f:
        json.dump({"destino": dest, "quando": started}, f)
    return True, ""
