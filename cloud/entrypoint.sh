#!/bin/sh
# Liga os dados ao disco persistente (/data) e roda o Garimpo sem privilégios de administrador.
set -e

if ! grep -q " /data " /proc/mounts; then
  echo "AVISO: não há disco montado em /data. Leads e a sessão do WhatsApp serão perdidos na próxima publicação."
fi

mkdir -p /data/app /data/gateway
rm -rf /app/data /app/gateway/data
ln -s /data/app /app/data
ln -s /data/gateway /app/gateway/data
chown -R app:app /data

export HOME=/home/app
exec setpriv --reuid=app --regid=app --init-groups python /app/garimpo.py
