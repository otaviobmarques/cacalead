#!/usr/bin/env python3
"""Parar e conferir o CaçaLead no Windows (o que ./garimpo stop | status faz no macOS e no Linux).

Uso:  python ctl.py stop | status
"""
import os, subprocess, sys, urllib.request

ROOT = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, ROOT)
import plataforma

PORT = int(os.environ.get("GARIMPO_PORT", "7777"))


def status():
    try:
        opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))
        with opener.open(f"http://127.0.0.1:{PORT}/api/state", timeout=5):
            pass
        print(f"CaçaLead no ar: http://127.0.0.1:{PORT}")
    except OSError:
        print("CaçaLead parado.")


def stop():
    stopped = False
    for pid in plataforma.listening_pids(PORT):
        if "garimpo.py" not in plataforma.command_line(pid):
            print(f"A porta {PORT} está com outro programa (PID {pid}). Não mexi nele.")
        elif plataforma.terminate(pid):
            print("CaçaLead parado.")
            stopped = True
    gowa = os.path.join(ROOT, "gateway", "bin", "gowa.exe" if plataforma.WINDOWS else "gowa")
    if [p for p in plataforma.pids_of(gowa, "rest") if plataforma.terminate(p)]:
        print("Gateway do WhatsApp parado.")
        stopped = True
    engine = os.path.join(ROOT, "vendor", "kit", "scripts", "engine.py")
    if os.path.isfile(engine):
        r = subprocess.run([sys.executable, engine, "stop"], capture_output=True, text=True, encoding="utf-8",
                           errors="replace")
        if r.returncode:
            print((r.stderr or r.stdout).strip())
        elif "Engine stopped" in r.stdout:
            print("Motor de busca parado.")
            stopped = True
    if not stopped:
        print("Não havia nada rodando.")


if __name__ == "__main__":
    plataforma.utf8_console()
    action = {"stop": stop, "status": status}.get(sys.argv[1] if len(sys.argv) == 2 else "")
    if not action:
        sys.exit("uso: python ctl.py stop | status")
    action()
