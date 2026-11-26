# Garimpo

**Radar de prospecção local.** Acha negócios no Google Maps, mostra em tempo real quem tem mais chance de virar
cliente, e conversa com eles pelo WhatsApp. Tudo num painel que roda no seu computador.

Esta cópia ([otaviobmarques/cacalead](https://github.com/otaviobmarques/cacalead)) é uma adaptação para Windows do
[Garimpo](https://github.com/Willclaf/garimpo), de Willclaf, distribuído sob a licença MIT.

> ⚠️ **Leia o [aviso importante](DISCLAIMER.md) antes de usar.** O WhatsApp é conectado por um cliente **não oficial**:
> ele pode cair, ser restringido ou ter o número banido, e **isso não é culpa do Garimpo nem de quem o publicou**.
> **O ideal é usar a API oficial do WhatsApp** (WhatsApp Business Platform, da Meta).

## O que ele faz

- **Caçadas ao vivo:** busque "dentista em Porto Alegre" e veja os lugares aparecendo num mapa com radar, com os
  dados chegando em tempo real. Dá para varrer **bairro a bairro** para passar do limite de ~120 resultados do Google.
- **Nota de oportunidade (0 a 100):** cada lead recebe uma nota pelo que falta nele (sem site, sem Instagram, nota baixa,
  poucas avaliações) e pela capacidade de pagar e de ser contatado. Quente, morno ou frio, com o motivo de cada ponto.
- **Leads:** filtros, ficha completa, telefone com WhatsApp, e-mails e redes achados no site, exportação em CSV.
- **Funil de vendas:** Novo, Contatado, Negociando, Fechado e Descartado, com recibos de entrega e leitura.
- **Inteligência:** gráficos de lacunas do mercado, mapa de oportunidade e ranking de bairros.
- **Blindagem:** audite os seus próprios clientes como um concorrente faria e veja as brechas.
- **WhatsApp:** conecta por QR code, manda mensagens variadas (sem cara de texto de IA), mostra "digitando…",
  respeita limite por dia, horário e intervalo, lê as respostas e move o lead no funil. Pausa os disparos sozinho se o
  WhatsApp restringir o número.
- **Diagnóstico gratuito por lead:** uma página bonita, para celular, com a nota de presença digital, comparação com a
  concorrência e plano de ação. Quem responde "EU QUERO" recebe o link sozinho.
- **Tema claro e escuro** (botão ◐) e **interface em português ou inglês** (botão EN/PT no topo). As mensagens de
  prospecção e as páginas de diagnóstico continuam em português, porque são para o público brasileiro.
- **Atualização pelo painel:** quando sai versão nova, aparece o botão **⬆ Atualizar**. Um clique baixa, confere os
  componentes e reinicia o Garimpo, sem perder leads nem configurações.
- **IA opcional:** com o [Claude Code](https://www.anthropic.com/claude-code) instalado, o Garimpo analisa cada lead e
  personaliza o diagnóstico. Sem ele, o resto funciona igual.

## Instalação

Precisa de **Windows 10/11 (64 bits), macOS ou Linux**, **Python 3.9+**, `git` e `curl` (o Windows já vem com o `curl`).
Ocupa uns 150 MB, mais o Chrome para Testing (~100 MB) se você não tiver Chrome, Chromium, Edge ou Brave.

### Windows

1. Instale o [Python](https://www.python.org/downloads/windows/) (marque **Add python.exe to PATH**) e o
   [Git](https://git-scm.com/download/win).
2. Baixe esta pasta e clique duas vezes em **`garimpo.bat`**. Na primeira vez ele instala os componentes; depois abre o
   painel em **http://127.0.0.1:7777**. Deixe a janela preta aberta enquanto usa.
3. Para fechar tudo (painel, gateway do WhatsApp e motor de busca), clique duas vezes em **`parar-garimpo.bat`**.

No terminal: `.\garimpo.bat start`, `stop`, `status` ou `install`. Fechar a janela para o painel, mas o gateway do
WhatsApp e o motor continuam rodando em segundo plano até você usar o `parar-garimpo.bat`.

Prefira uma pasta fora do OneDrive ou do Dropbox: a sincronização atrapalha o banco de dados e enviaria para a nuvem a
sessão do seu WhatsApp.

### macOS e Linux

```bash
git clone https://github.com/otaviobmarques/cacalead.git
cd cacalead
./install.sh
```

O instalador baixa e **confere por hash** os dois componentes de terceiros (veja os [créditos](CREDITS.md)):

1. o **motor de busca** do Google Maps ([google-maps-scraper-kit](https://github.com/Mahanaicoach/google-maps-scraper-kit));
2. o **módulo do WhatsApp** ([go-whatsapp-web-multidevice](https://github.com/aldinokemal/go-whatsapp-web-multidevice)).

Depois ele abre o painel em **http://localhost:7777**. No macOS, também dá para clicar duas vezes em `Garimpo.command`.

### Na nuvem (Railway ou outro servidor com Docker)

O `Dockerfile` monta o Garimpo com o Chromium, o motor de busca e o gateway do WhatsApp, em **modo nuvem**: todo o painel
exige senha. Só as páginas de diagnóstico (`/diagnostico/…`) abrem sem senha, para os seus clientes.

1. Crie o serviço a partir deste repositório e anexe um **disco (volume) em `/data`**. Sem ele, os leads e a sessão do
   WhatsApp somem a cada publicação.
2. Gere um domínio público para o serviço, apontando para a porta **8080**.
3. Nas variáveis do serviço, crie **`GARIMPO_PASSWORD`** com a senha do painel (12 caracteres ou mais) e publique de novo.
   Com domínio próprio, defina também `GARIMPO_HOST`.

Rode uma única réplica. Depois de 5 senhas erradas, o endereço de quem tentou fica bloqueado por 15 minutos. A análise com
Claude não vem instalada na imagem, e a atualização pelo painel não vale aqui (publique pelo Git). Conectar o WhatsApp
a partir de um servidor tende a aumentar o risco de bloqueio, e o Google pode limitar mais as buscas vindas dele.

### Primeira vez

1. O painel mostra o **aviso importante**. Você precisa ler e aceitar para conectar o WhatsApp.
2. Em seguida ele já pede o **QR code**: no celular, WhatsApp, Configurações, **Aparelhos conectados**, Conectar um
   aparelho. Se preferir, use "Usar código no celular".
3. Preencha **WhatsApp, Sua apresentação** (nome, agência, cidade) para as mensagens saírem com o seu nome.
4. Monte a primeira caçada à esquerda e clique em **Iniciar varredura**.

Para parar: `./garimpo stop`. Para abrir de novo: `./garimpo start`.

### Atualizar

Se você instalou com `git clone`, o botão **⬆ Atualizar** aparece no topo do painel quando há versão nova (ele confere o
GitHub ao abrir e a cada 6 horas). Pelo terminal dá no mesmo: `git pull && ./garimpo install`. Se você alterou arquivos do
Garimpo, o botão não atualiza sozinho (para não sobrescrever o seu trabalho): use o `git pull`.

## Como usar o WhatsApp com cuidado

- Os disparos **começam desligados**. Você coloca leads na fila (aba Leads, filtro, botão 🚀 Prospectar) e liga.
- Comece com **20 a 30 por dia**, intervalos de 2 a 5 minutos, em horário comercial. Já vem assim.
- Use um número que você aceite arriscar.
- Quem responde "não tenho interesse" ou "pare" vai para Descartado sozinho. Respostas automáticas de empresas
  (horário de funcionamento etc.) não contam como resposta.
- Se aparecer o aviso vermelho de restrição ou bloqueio, os disparos pausam sozinhos. Não religue sem entender o motivo.

## Diagnóstico por link (opcional)

Sem configurar nada, as páginas de diagnóstico ficam só no seu computador (`http://localhost:7777/diagnostico/…`) e a
primeira mensagem sai no formato completo, sem o "responda EU QUERO".

Para mandar o link a clientes, as páginas precisam estar num endereço público. Em **WhatsApp, Sua apresentação,
Avançado**, informe:

- o **endereço público** (por exemplo `https://seusite.com/diagnostico`);
- o **destino no seu servidor** (por exemplo `usuario@servidor:/var/www/diagnostico/`), com chave SSH já
  configurada. O Garimpo envia as páginas sozinho: por `rsync` no macOS e no Linux, e por `scp` no Windows (a pasta de
  destino precisa existir, e o primeiro acesso por `ssh` tem de ser feito à mão para aceitar o servidor).

Sirva essa pasta com `X-Robots-Tag: noindex` para o Google não indexar. Cada página tem um código aleatório no endereço.

## Configuração

Quase tudo se configura no painel. Variáveis de ambiente opcionais:

| Variável | Para que serve | Padrão |
|---|---|---|
| `GARIMPO_PORT` | porta do painel | `7777` |
| `GARIMPO_ENGINE_PORT` | porta do motor de busca | `8791` |
| `GARIMPO_GOWA_PORT` | porta do gateway do WhatsApp | `3010` |
| `CLAUDE_BIN` | caminho do comando `claude` (IA) | procura no `PATH` |

## Segurança e privacidade

- O painel só aceita conexões do **próprio computador** (`127.0.0.1`) e recusa chamadas vindas de outros sites abertos
  no seu navegador (checa `Host`, `Origin` e um cabeçalho próprio).
- O gateway do WhatsApp também só escuta em `127.0.0.1`, com **usuário e senha gerados na sua instalação**, e avisa o
  Garimpo por **webhook assinado (HMAC)**. Ele não envia dados para ninguém além dos servidores do WhatsApp.
- Seus leads, configurações e a **sessão do WhatsApp** ficam em `data/` e `gateway/data/` **no seu computador**.
  O `.gitignore` os exclui. **Nunca publique essas pastas.**
- Nenhuma telemetria. Os únicos acessos de rede são: WhatsApp, Google Maps (pelo motor de busca), OpenStreetMap
  (mapa e bairros), as fontes do Google Fonts e, se você configurar, o seu servidor de diagnósticos.

## Como funciona

```
 navegador (painel)  ⇄  garimpo.py (127.0.0.1:7777, SQLite)  ⇄  motor de busca (Chrome sem janela → Google Maps)
                                  ⇅
                        gateway do WhatsApp (127.0.0.1:3010)  ⇄  servidores do WhatsApp
```

- `garimpo.py`: servidor, banco, nota dos leads, mensagens, fila de disparo, funil e leitura das respostas.
- `diag.py`: gera a página do diagnóstico.
- `web/`: o painel (HTML, CSS e JavaScript puro, sem build).
- `install.py`: baixa e confere os componentes de terceiros.

## Limitações

- A interface tem versão em inglês, mas as mensagens para os leads e os diagnósticos são em português (Brasil).
- Mensagens e regras de números pensadas para o **Brasil, em português**. Celulares brasileiros têm duas grafias
  (com e sem o 9 depois do DDD): o Garimpo escolhe sozinho (DDD 31 ou maior fica sem o 9, ou usa a conversa que já
  existe), mas isso foi validado apenas em alguns DDDs.
- No Windows, só 64 bits. A atualização pelo painel fica desligada em cópias com alterações próprias.
- Sem a API oficial do WhatsApp (ainda).
- O Google muda o Maps de tempos em tempos e o motor pode precisar de atualização.

## Contribuir

Issues e pull requests são bem-vindos. Antes de abrir um PR, rode `python3 -m py_compile garimpo.py diag.py install.py`
e confira que nada de dado pessoal foi parar no código.

## Apoie ☕

O Garimpo é grátis e vai continuar assim. Ele mostra um convite discreto na primeira caçada concluída e depois a cada 50
(o botão ☕ no topo do painel abre o mesmo convite, com QR Code, quando você quiser). Se ele te ajudou, um Pix de qualquer valor ajuda
a manter e melhorar:

<img src="web/pix.svg" width="160" alt="QR Code do Pix">

**Chave Pix:** `c6a0d335-775a-4a2e-bb7a-2dfbf3f2cb67` (Willian Claf)

Se fizer um fork, troque os dados em `SUPPORT` no `garimpo.py`.

## Licença e créditos

[MIT](LICENSE). O Garimpo usa o trabalho de muita gente: veja os [créditos](CREDITS.md).

---

## English summary

**Garimpo** is a local lead-prospecting radar: it finds businesses on Google Maps, scores them by opportunity, and
talks to them over WhatsApp, in a live dashboard that runs on your own machine (macOS/Linux, Python 3.9+, stdlib only).
`./install.sh` downloads and hash-verifies the third-party pieces (the Google Maps engine by
[@Mahanaicoach](https://github.com/Mahanaicoach) and the WhatsApp gateway by
[@aldinokemal](https://github.com/aldinokemal), built on [whatsmeow](https://github.com/tulir/whatsmeow)), then opens the
panel and asks you to scan the WhatsApp QR code. The panel has a light/dark theme, an English/Portuguese switch (EN/PT
button) and a one-click **⬆ Update** button for `git clone` installs.

**Warning:** the WhatsApp connection is **unofficial**. Your number can be restricted or banned, and the authors are not
responsible. Prefer the official WhatsApp Business Platform. Read [DISCLAIMER.md](DISCLAIMER.md). The UI and message
templates are in Brazilian Portuguese.
