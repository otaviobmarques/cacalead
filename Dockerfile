# Garimpo na nuvem (modo com senha). Veja a seção "Na nuvem" do README.
FROM python:3.13-slim

# TZ: o horário dos disparos (ex.: 09:00 às 18:00) vale no fuso do Brasil.
ENV PYTHONUNBUFFERED=1 PYTHONDONTWRITEBYTECODE=1 TZ=America/Sao_Paulo GARIMPO_CLOUD=1 PORT=8080

RUN apt-get update \
 && apt-get install -y --no-install-recommends chromium fonts-liberation fonts-noto-color-emoji git curl ca-certificates procps tini tzdata \
 && rm -rf /var/lib/apt/lists/* \
 && useradd --create-home --uid 10001 app

WORKDIR /app
# Motor de busca e gateway do WhatsApp, baixados das fontes originais e conferidos por hash.
COPY install.py ./
RUN python install.py

COPY . .
RUN chown -R app:app /app/vendor && chmod +x cloud/entrypoint.sh

EXPOSE 8080
ENTRYPOINT ["tini", "--", "/app/cloud/entrypoint.sh"]
