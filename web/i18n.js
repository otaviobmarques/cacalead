/* CaçaLead · tradução da interface (português ↔ inglês)
 *
 * O painel é escrito em português. Quando o idioma é "en", este arquivo traduz na hora todo texto que aparece na tela
 * (textos, placeholders, dicas e janelas de confirmação), inclusive o que vem do servidor. Não mexe em dados: os nomes
 * dos negócios, as mensagens de prospecção e as páginas de diagnóstico continuam em português (são para o Brasil).
 * Para corrigir ou acrescentar uma tradução, edite as listas D (frases exatas) e R (padrões com número/nome) abaixo.
 */
(function () {
  const D = {
    /* cabeçalho e abas */
    'CaçaLead · Radar de Prospecção': 'CaçaLead · Prospecting Radar', 'radar de prospecção': 'prospecting radar',
    '◎ Radar': '◎ Radar', '◆ Leads': '◆ Leads', '▤ Funil': '▤ Funnel', '◭ Inteligência': '◭ Insights', '🛡 Blindagem': '🛡 Shield', '💬 WhatsApp': '💬 WhatsApp',
    'motor…': 'engine…', 'motor offline': 'engine offline', 'motor online': 'engine online', 'motor': 'engine',
    'Filtrar por cidade': 'Filter by city', 'Filtrar por caçada': 'Filter by hunt', 'Motor de raspagem': 'Scraping engine', 'Claude CLI para análises': 'Claude CLI for analysis',
    'Som ao achar lead quente': 'Sound when a hot lead is found', 'Gostou? Me pague um café': 'Enjoying it? Buy me a coffee', 'Tema claro/escuro': 'Light/dark theme', 'Mudar idioma': 'Change language',
    '⬇ CSV': '⬇ CSV', 'Sair': 'Sign out','Todas as cidades': 'All cities', 'Todas as caçadas': 'All hunts', 'sem cidade': 'no city',
    /* nova caçada */
    '⟟ Nova caçada': '⟟ New hunt', 'O que caçar': 'What to hunt', 'ex: hamburgueria ↵': 'e.g. burger joint ↵', 'Onde': 'Where', 'Cidade… (ex: Porto Alegre)': 'City… (e.g. Porto Alegre)',
    'Modo de varredura': 'Sweep mode', '🏙 Cidade inteira': '🏙 Whole city', '🏘 Bairro a bairro': '🏘 Neighborhood by neighborhood', 'Alcance por termo': 'Reach per term', 'Alcance por bairro': 'Reach per neighborhood',
    'E-mails & redes': 'Emails & socials', 'E-mails &amp; redes': 'Emails & socials', 'Ler avaliações': 'Read reviews', 'Filtrar bairros…': 'Filter neighborhoods…', 'todos': 'all', 'nenhum': 'none',
    'Diga o que caçar (ex: dentista)': 'Tell me what to hunt (e.g. dentist)', 'Escolha pelo menos um bairro': 'Pick at least one neighborhood', 'LIGANDO RADAR…': 'STARTING RADAR…',
    'Encontrar oportunidades': 'Find opportunities', 'Iniciar varredura': 'Start sweep',
    '⌛ Buscando os bairros de': '⌛ Looking up neighborhoods of', 'no OpenStreetMap…': 'on OpenStreetMap…', 'Não consegui os bairros:': 'Could not get the neighborhoods:',
    'Nenhum bairro com esse nome.': 'No neighborhood with that name.', 'Não achei bairros para essa cidade. Use “Cidade inteira”.': 'No neighborhoods found for this city. Use “Whole city”.',
    'até ~': 'up to ~', 'na varredura · clique para tirar': 'in the sweep · click to remove', 'fora · clique para incluir': 'out · click to include', 'varrendo agora…': 'sweeping now…',
    /* caçadas / progresso */
    '☰ Caçadas': '☰ Hunts', 'Nenhuma caçada rodando': 'No hunt running', 'Nenhuma caçada ainda': 'No hunts yet', 'Nenhuma caçada ainda. Monte a primeira aí em cima. ☝️': 'No hunts yet. Set up the first one above. ☝️',
    '■ parar': '■ stop', 'Parar essa caçada? Os leads já achados ficam.': 'Stop this hunt? The leads already found stay.', 'no total': 'in total', 'Pronto': 'Done', 'pronta': 'done', 'rodando': 'running', 'fila': 'queued', 'erro': 'error',
    'Na fila': 'Queued', 'Varrendo o mapa': 'Sweeping the map', 'Lendo avaliações': 'Reading reviews', 'Visitando sites atrás de e-mails e redes': 'Visiting sites for emails and socials', 'Concluída': 'Finished',
    'Mapa': 'Map', 'Avaliações': 'Reviews', 'Sites & redes': 'Sites & socials', 'Sites &amp; redes': 'Sites & socials',
    '★ Lead em destaque': '★ Featured lead', 'O melhor lead da caçada aparece aqui.': 'The best lead of the hunt shows up here.', '⌁ Ao vivo': '⌁ Live', 'Ao vivo': 'Live',
    '◉ CaçaLead pronto. Monte uma caçada à esquerda.': '◉ CaçaLead ready. Set up a hunt on the left.', 'Servidor do CaçaLead não respondeu': 'The CaçaLead server did not respond',
    '🔥 quente': '🔥 hot', '🔥 Quentes': '🔥 Hot', '🌤 Mornos': '🌤 Warm', '🧊 Frios': '🧊 Cold', 'quente': 'hot', 'morno': 'warm', 'frio': 'cold', 'quentes': 'hot', 'Quentes': 'Hot', 'Mornos': 'Warm', 'Frios': 'Cold',
    'LEADS QUENTES': 'HOT LEADS', 'encontrados': 'found', 'do total': 'of total', 'contato direto': 'direct contact', 'sem site próprio': 'no own website', 'com Instagram': 'with Instagram', 'Score médio': 'Average score', 'nota média': 'average rating',
    'Sem site': 'No website', 'E-mails': 'Emails', 'WhatsApp': 'WhatsApp',
    /* leads: filtros e cartões */
    'Todos': 'All', '🏘 Todos os bairros': '🏘 All neighborhoods', 'Maior score': 'Highest score', 'Mais lacunas': 'Most gaps', 'Mais capacidade': 'Most capacity', 'Mais avaliações': 'Most reviews', 'Pior nota': 'Lowest rating', 'Mais recentes': 'Newest', 'Nome': 'Name',
    'Só rede social': 'Social only', 'Só plataforma': 'Platform only', 'Sem Instagram': 'No Instagram', 'Nota baixa': 'Low rating', 'Nota mediana': 'Mid rating', 'Invisível': 'Invisible', 'Pouca prova social': 'Little social proof', 'Perfil incompleto': 'Incomplete profile', 'Sem fotos': 'No photos',
    'Telefone': 'Phone', 'Grande': 'Large', 'Movimentado': 'Busy', 'Sem e-mail': 'No email', 'Sem contato': 'No contact', 'Fechado': 'Closed', 'E-mail': 'Email', 'Pouca avaliação': 'Few reviews',
    'avaliações': 'reviews', 'sem avaliações': 'no reviews',
    '🔗 Copiar links': '🔗 Copy links', '🚀 Prospectar': '🚀 Prospect', 'Esse lead não tem número': 'This lead has no number', '🔗 Link copiado. Quando você mandar, o CaçaLead percebe sozinho.': '🔗 Link copied. When you send it, CaçaLead notices on its own.',
    'Nenhum lead com número nesse filtro': 'No lead with a number in this filter', 'Nada por aqui ainda': 'Nothing here yet', 'Inicie uma varredura ou afrouxe os filtros.': 'Start a sweep or loosen the filters.',
    'Buscar nome, bairro, categoria…': 'Search name, neighborhood, category…', 'Buscar nome, bairro, categoria': 'Search name, neighborhood, category',
    'Sem confirmação de entrega há mais de 15 min: celular desligado ou número errado': 'No delivery confirmation for over 15 min: phone off or wrong number',
    '⚠ sem entrega': '⚠ not delivered', '⚠ sem confirmação de entrega': '⚠ no delivery confirmation', '👁 lida': '👁 read', '✓✓ entregue': '✓✓ delivered', '📤 enviada': '📤 sent',
    'Novo': 'New', 'Contatado': 'Contacted', 'Negociando': 'Negotiating', 'Descartado': 'Discarded',
    '🙋 quer o diagnóstico': '🙋 wants the diagnosis', '🧾 diagnóstico enviado': '🧾 diagnosis sent', '💰 Fechou! Bora pro próximo.': '💰 Closed! On to the next one.',
    'A pessoa pediu o diagnóstico (EU QUERO): o Claude monta e o CaçaLead manda o link': 'They asked for the diagnosis (EU QUERO): Claude builds it and CaçaLead sends the link',
    'Movido para Contatado ✓': 'Moved to Contacted ✓', '💬 Movido para Negociando': '💬 Moved to Negotiating', 'O WhatsApp não está conectado': 'WhatsApp is not connected',
    /* inteligência */
    'Sem dados ainda': 'No data yet', 'Rode uma caçada e o mapa de oportunidades aparece aqui.': 'Run a hunt and the opportunity map shows up here.', 'negócios — clique para ver': 'businesses — click to view',
    'Bairro': 'Neighborhood', 'Sem bairros nos dados.': 'No neighborhoods in the data.', '🚨 REPUTAÇÃO EM RISCO · movimento alto, nota baixa': '🚨 REPUTATION AT RISK · high traffic, low rating',
    '💎 JOIAS ESCONDIDAS · nota boa, pouca visibilidade': '💎 HIDDEN GEMS · good rating, low visibility', '👑 GIGANTES · fortes, pagam bem': '👑 GIANTS · strong, pay well', '🌱 INICIANTES': '🌱 NEWCOMERS',
    'não têm site próprio: venda de site/landing é o caminho': 'have no own website: selling a site/landing page is the way in', 'sem Instagram encontrado': 'no Instagram found', 'precisam de gestão de reputação': 'need reputation management',
    '/mês': '/month', 'potencial se fechar todos os quentes a R$ 800': 'potential if you close all hot leads at R$ 800', 'aval. · score': 'rev. · score',
    '◭ Distribuição de score': '◭ Score distribution', 'Quantos leads em cada faixa. A partir de 65 o lead é quente; de 45 a 64, morno.': 'How many leads in each range. From 65 a lead is hot; 45 to 64 is warm.',
    '⌀ Lacunas do mercado': '⌀ Market gaps', 'O que falta nesses negócios. Clique para filtrar os leads.': 'What these businesses are missing. Click to filter the leads.',
    '✦ Mapa de oportunidade · avaliações × nota': '✦ Opportunity map · reviews × rating', 'Cada ponto é um negócio, colorido pela temperatura (🔥 quente · morno · frio). Eixo horizontal em escala log. Clique para abrir.': 'Each dot is a business, colored by temperature (🔥 hot · warm · cold). Horizontal axis on a log scale. Click to open.',
    '▦ Categorias': '▦ Categories', 'O que mais apareceu nessa caçada.': 'What showed up most in this hunt.', '⌂ Top bairros': '⌂ Top neighborhoods', 'Onde há mais leads. Clique para filtrar.': 'Where there are the most leads. Click to filter.',
    '🏘 Ranking de bairros': '🏘 Neighborhood ranking', 'Onde vale a pena prospectar. Clique no título de uma coluna para ordenar e numa linha para ver os leads do bairro.': 'Where prospecting is worth it. Click a column title to sort and a row to see the neighborhood’s leads.',
    /* ficha do lead */
    'Ligar': 'Call', 'personalizado pelo Claude': 'personalized by Claude', '⚠ deu erro na última tentativa': '⚠ the last attempt failed', 'A página é criada em alguns segundos.': 'The page is created in a few seconds.',
    '📤 Gerar e mandar no WhatsApp': '📤 Generate and send on WhatsApp', '✓ É meu cliente (ver na Blindagem)': '✓ This is my client (see in Shield)', 'Abrir no WhatsApp': 'Open in WhatsApp', '📤 Enviar pelo CaçaLead': '📤 Send via CaçaLead', '📤 você mandou': '📤 you sent it',
    'Analisar de novo': 'Analyze again', 'Analisar esse lead': 'Analyze this lead', 'Claude está pensando…': 'Claude is thinking…', 'Preço': 'Price', 'Descrição': 'Description', 'Notas recebidas': 'Ratings received', '(sem texto)': '(no text)', 'Avaliações recentes': 'Recent reviews',
    'Horários': 'Opening hours', 'Contato': 'Contact', '🧾 Diagnóstico gratuito': '🧾 Free diagnosis', 'Copiar link': 'Copy link', '🧠 Personalizar com Claude': '🧠 Personalize with Claude', 'Funil': 'Funnel', 'Por que esse score': 'Why this score',
    'Oportunidade': 'Opportunity', 'Capacidade': 'Capacity', 'Abordagem': 'Approach', 'Copiar texto': 'Copy text', '🧠 Análise com Claude': '🧠 Analysis with Claude', 'Notas': 'Notes', 'Ficha': 'Profile', 'Endereço': 'Address', 'Categorias': 'Categories', 'Status': 'Status', 'Site': 'Website', 'Busca': 'Search',
    'Link do diagnóstico copiado': 'Diagnosis link copied', '🧠 Claude montando o diagnóstico…': '🧠 Claude is building the diagnosis…', 'Gerar o diagnóstico com o Claude e mandar o link agora pelo WhatsApp?': 'Generate the diagnosis with Claude and send the link now on WhatsApp?',
    '🧾 Gerando e enviando…': '🧾 Generating and sending…', '🧾 Gerando e enviando o diagnóstico…': '🧾 Generating and sending the diagnosis…', 'Enviando…': 'Sending…', '📤 Enviado': '📤 Sent', 'Copiado ✓': 'Copied ✓',
    '🛡 Agora é seu cliente: veja na Blindagem': '🛡 Now it’s your client: see it in Shield', 'Removido dos clientes': 'Removed from clients', 'Meu cliente?': 'My client?', '🛡 Marcar como meu cliente': '🛡 Mark as my client',
    '🧠 Análise pronta': '🧠 Analysis ready', '⏳ Claude montando…': '⏳ Claude is building…', '📤 enviado': '📤 sent',
    /* recomendações */
    'Criar um site próprio e colocar no perfil do Google.': 'Build an own website and add it to the Google profile.', 'Trocar o link do Google (hoje vai pro Instagram/Facebook) por um site próprio.': 'Replace the Google link (currently points to Instagram/Facebook) with an own website.',
    'Ter um canal próprio além do iFood/link de cardápio: site com pedido ou agendamento.': 'Have an own channel besides iFood/menu link: a site with ordering or booking.', 'Colocar o Instagram no site e no perfil do Google (o radar não achou).': 'Put Instagram on the site and the Google profile (the radar did not find it).',
    'Deixar um e-mail de contato visível no site.': 'Show a contact email on the site.', 'Responder todas as avaliações negativas e rodar uma campanha de avaliações com clientes felizes.': 'Answer every negative review and run a review campaign with happy customers.',
    'Rotina de pedir avaliação aos clientes satisfeitos para passar de 4,5.': 'A routine of asking satisfied customers for reviews to get past 4.5.', 'Ação de avaliações (QR code no balcão, mensagem pós-venda): menos de 30 avaliações chama concorrente.': 'A review drive (QR code at the counter, after-sale message): under 30 reviews invites competitors.',
    'Meta de avaliações por mês: mais prova social e mais força no Maps.': 'Monthly review goal: more social proof and more strength on Maps.', 'Preencher os horários de funcionamento no Google.': 'Fill in the opening hours on Google.', 'Subir foto de capa e fotos recentes no perfil do Google.': 'Upload a cover photo and recent photos to the Google profile.',
    /* blindagem */
    '🛡 Blindagem dos seus clientes': '🛡 Shield: your clients', 'Veja seus clientes com os olhos de um prospectador: cada brecha aqui é uma porta para um concorrente entrar.': 'See your clients through a prospector’s eyes: every gap here is a door for a competitor to walk through.',
    '↻ Re-checar todos': '↻ Re-check all', '↻ Re-checando…': '↻ Re-checking…', '↻ Re-checando todos os clientes…': '↻ Re-checking all clients…', '↻ Re-checar': '↻ Re-check', 'Nome do negócio do seu cliente': 'Your client’s business name',
    'Exposto': 'Exposed', 'Atenção': 'Warning', 'Blindado': 'Shielded', 'Clientes': 'Clients', '⚠ Atenção': '⚠ Warning', '🚨 Expostos': '🚨 Exposed', '✓ Blindados': '✓ Shielded', 'Brechas abertas': 'Open gaps', 'É este': 'This one', '” no Google Maps…': '” on Google Maps…',
    'Qual destes é o seu cliente “': 'Which of these is your client “', 'Nenhum cliente blindado ainda': 'No shielded client yet', 'Digite o nome de um cliente aí em cima (use a cidade escolhida no formulário da esquerda)': 'Type a client’s name above (it uses the city picked in the form on the left)',
    'ou abra qualquer lead e clique em “🛡 Marcar como meu cliente”.': 'or open any lead and click “🛡 Mark as my client”.', '⚠ Dados incompletos: procure de novo com o tipo do negócio (ex: pet shop) para completar.': '⚠ Incomplete data: search again with the business type (e.g. pet shop) to complete it.',
    'Nenhuma brecha visível. Cliente blindado 💪': 'No visible gap. Client shielded 💪', 'Pontos fortes': 'Strengths', 'No bairro': 'In the neighborhood', 'Líder no bairro:': 'Neighborhood leader:', 'Brechas que um prospectador vê (': 'Gaps a prospector sees (',
    'Evolução': 'Progress', 'Exposição': 'Exposure', 'Nota': 'Rating', 'Checagens': 'Checks', 'Abrir ficha': 'Open profile', '🧠 Plano de blindagem': '🧠 Shield plan', 'Remover': 'Remove', 'Digite o nome do seu cliente': 'Type your client’s name', '🛡 Blindagem ligada': '🛡 Shield on',
    '🛡 Cliente encontrado e blindagem ligada': '🛡 Client found and shield on', '🛡 Não achei com certeza: escolha o seu na Blindagem': '🛡 Not sure I found it: pick yours in Shield', 'Claude montando o plano de blindagem…': 'Claude is building the shield plan…',
    /* whatsapp: conexão */
    '⚙ Conexão': '⚙ Connection', '🟢 Go WhatsApp (neste computador)':'🟢 Go WhatsApp (on this computer)', 'Go WhatsApp': 'Go WhatsApp', 'Evolution': 'Evolution', 'Evolution (VPS)': 'Evolution (VPS)',
    'Gateway leve (Go) rodando só neste computador, em 127.0.0.1. Avisa o CaçaLead das respostas em tempo real. Ignora grupos e stories.': 'Light gateway (Go) running only on this computer, at 127.0.0.1. Tells CaçaLead about replies in real time. Ignores groups and stories.',
    '📱 Conectar WhatsApp': '📱 Connect WhatsApp', '↻ Testar': '↻ Test', 'Use a Evolution do seu VPS. A API key fica salva só neste computador (data/settings.json).': 'Use the Evolution from your VPS. The API key is stored only on this computer (data/settings.json).',
    'URL da Evolution': 'Evolution URL', 'Instância': 'Instance', 'cole a API key (global ou da instância)': 'paste the API key (global or instance)', 'nome da instância conectada ao seu WhatsApp': 'name of the instance connected to your WhatsApp',
    '🚀 Prospecção automática': '🚀 Automatic prospecting', 'O CaçaLead manda a fila no seu ritmo, só no horário escolhido, com intervalo aleatório entre as mensagens.': 'CaçaLead sends the queue at your pace, only in the chosen hours, with a random gap between messages.',
    'Máximo por dia': 'Max per day', 'Intervalo (segundos)': 'Gap (seconds)', 'Começa': 'Starts', 'Termina': 'Ends', 'Salvar ritmo': 'Save pace', 'Ritmo salvo': 'Pace saved', 'seg': 'Mon', 'ter': 'Tue', 'qua': 'Wed', 'qui': 'Thu', 'sex': 'Fri', 'sáb': 'Sat', 'dom': 'Sun',
    '■ PAUSAR DISPAROS': '■ PAUSE SENDING', '▶ LIGAR DISPAROS': '▶ START SENDING', '▶ Disparos ligados': '▶ Sending on', '■ Disparos pausados': '■ Sending paused', 'Hoje': 'Today', 'Próximo': 'Next', 'Leitura': 'Reading', 'sem conexão': 'no connection', 'fora do horário': 'outside hours', 'sem whats': 'no WhatsApp',
    '📊 Estabilidade da conexão': '📊 Connection stability', 'aguardando vínculo': 'waiting to be linked', 'desvinculado pelo WhatsApp': 'unlinked by WhatsApp', 'RESTRICAO de conversas novas': 'RESTRICTION on new chats', 'Conectado há': 'Connected for', 'Medindo desde': 'Measuring since',
    'Nada registrado ainda. Os eventos aparecem aqui conforme a conexão muda.': 'Nothing recorded yet. Events show up here as the connection changes.', 'Leia e aceite antes de conectar o WhatsApp e enviar mensagens.': 'Read and accept before connecting WhatsApp and sending messages.',
    'Aviso importante pendente': 'Important notice pending', 'Ler e aceitar': 'Read and accept', 'conectado': 'connected', 'desconectado': 'disconnected', 'conectando': 'connecting', 'desconfigurado': 'not set up', 'reiniciando': 'restarting',
    'Conexão:': 'Connection:', 'testando…': 'testing…', '✅ WhatsApp conectado': '✅ WhatsApp connected', 'trocando…': 'switching…', 'Trocar o provedor do WhatsApp? Os disparos ficam pausados até você ligar de novo.': 'Switch the WhatsApp provider? Sending stays paused until you turn it on again.',
    '. Não volte a ligar os disparos antes de entender o motivo.': '. Do not turn sending back on before you understand why.',
    /* fila */
    '📤 Fila e envios': '📤 Queue and sends', 'Enviados': 'Sent', 'Responderam': 'Replied', 'Erros / sem WhatsApp': 'Errors / no WhatsApp', 'Esvaziar fila': 'Empty queue', 'Fila vazia': 'Queue empty', 'Vá em Leads, filtre e clique em 🚀 Prospectar.': 'Go to Leads, filter and click 🚀 Prospect.',
    'Tirar todos que ainda estão na fila?': 'Remove everyone still in the queue?', 'Para encher a fila: aba Leads, filtre (ex.: 🔥 Quentes + WhatsApp) e clique em “🚀 Prospectar”. Quem responde vai sozinho para Negociando no funil.': 'To fill the queue: Leads tab, filter (e.g. 🔥 Hot + WhatsApp) and click “🚀 Prospect”. Anyone who replies moves to Negotiating on its own.',
    'A fila está vazia: vá em Leads e clique em 🚀 Prospectar': 'The queue is empty: go to Leads and click 🚀 Prospect', 'Nenhum lead novo com WhatsApp (celular) nesse filtro': 'No new lead with WhatsApp (mobile) in this filter',
    'ficaram de fora (sem celular, já contatados, clientes ou na fila).': 'were left out (no mobile, already contacted, clients or already queued).', '⚠ O WhatsApp ainda não está conectado. A fila fica guardada e começa quando você conectar e ligar os disparos.': '⚠ WhatsApp is not connected yet. The queue is kept and starts when you connect and turn sending on.',
    'Cada um recebe uma mensagem própria, montada com o que falta no negócio dele. Com': 'Each one gets their own message, built from what their business is missing. With', 'por dia, leva uns': 'per day, it takes about', 'Exemplo para': 'Example for',
    'Para não ter o número bloqueado: comece com poucas mensagens por dia (20 a 30) e intervalos de alguns minutos. Quem pedir para parar vai sozinho para Descartado.': 'To avoid getting the number blocked: start with a few messages per day (20 to 30) and gaps of a few minutes. Anyone who asks to stop goes to Discarded on its own.',
    'Quem responder': 'Anyone who replies', 'recebe o diagnóstico personalizado pelo Claude na hora, sozinho.': 'gets the diagnosis personalized by Claude right away, automatically.', 'Cancelar': 'Cancel', 'Colocar': 'Put', 'na fila e ligar os disparos': 'in the queue and start sending', 'na fila': 'in the queue',
    'Prévia para': 'Preview for', '(o lead mais quente)': '(the hottest lead)', 'Prévia': 'Preview', '✍ Apresentação salva, refazendo as mensagens…': '✍ Introduction saved, rebuilding the messages…',
    /* apresentação */
    '✍ Sua apresentação na mensagem': '✍ Your introduction in the message', 'Entra no começo e no fim de cada mensagem. Ao salvar, todas as mensagens (inclusive as da fila) são refeitas.': 'It goes at the start and end of every message. When you save, all messages (including the queued ones) are rebuilt.',
    'Seu nome': 'Your name', 'Agência': 'Agency', 'Sua cidade': 'Your city', 'Link de exemplo (cliente)': 'Example link (client)', 'Seu WhatsApp (botão do diagnóstico)': 'Your WhatsApp (diagnosis button)', 'Primeira mensagem': 'First message',
    'Curta, oferece o diagnóstico (EU QUERO)': 'Short, offers the diagnosis (EU QUERO)', 'Completa, com todas as dicas': 'Full, with all the tips', 'Cidades vizinhas ("aqui"), separadas por vírgula': 'Nearby cities (“here”), comma-separated', 'Tratamento': 'Form of address',
    'Aqui é o (nome)': 'This is (name) — masculine', 'Aqui é a (nome)': 'This is (name) — feminine', 'Seus serviços (frase)': 'Your services (phrase)', 'Nome do seu método (opcional)': 'Your method’s name (optional)', 'Avançado: páginas de diagnóstico públicas': 'Advanced: public diagnosis pages',
    'Endereço público das páginas (https://seusite.com/diagnostico)': 'Public address of the pages (https://yoursite.com/diagnosis)', 'Destino para publicar via SSH (usuario@servidor:/pasta/)': 'SSH destination to publish (user@server:/folder/)', 'URL da sua logo (https, opcional)': 'Your logo URL (https, optional)',
    'Quando responder EU QUERO, montar o diagnóstico com o Claude e mandar o link sozinho': 'When they answer EU QUERO, build the diagnosis with Claude and send the link automatically', 'Salvar apresentação': 'Save introduction', 'Itajaí, Blumenau': 'Nearby city, another city',
    'tráfego pago, site e fotografia': 'paid traffic, websites and photography', 'usuario@servidor:/var/www/diagnostico/': 'user@server:/var/www/diagnosis/',
    /* QR / pareamento */
    '📱 Conectar o WhatsApp': '📱 Connect WhatsApp', 'No celular: WhatsApp, Configurações,': 'On your phone: WhatsApp, Settings,', 'Aparelhos conectados': 'Linked devices', 'Conectar um aparelho': 'Link a device', 'Usar código no celular': 'Use a code on the phone', 'Fechar': 'Close',
    'Digite o número do WhatsApp que vai ser vinculado (com DDD) e toque em Gerar. Depois, no celular, escolha': 'Type the WhatsApp number to be linked (with area code) and tap Generate. Then, on the phone, choose', 'Conectar com número de telefone': 'Link with phone number', 'e digite o código.': 'and type the code.',
    'Gerar código': 'Generate code', 'gerando…': 'generating…', 'Digite esse código no celular. Ele vale poucos minutos.': 'Type this code on the phone. It is valid for a few minutes.', '✅ Já está conectado.': '✅ Already connected.', 'Aponte a câmera do WhatsApp para o QR. Ele troca sozinho a cada': 'Point the WhatsApp camera at the QR. It refreshes on its own every',
    '✅ WhatsApp conectado pelo gateway': '✅ WhatsApp connected through the gateway', 'Aviso aceito': 'Notice accepted',
    /* aviso importante */
    '⚖️ Aviso importante': '⚖️ Important notice', 'O CaçaLead é um software livre, entregue': 'CaçaLead is free software, provided', 'como está, sem garantia': 'as is, without warranty', '. Leia antes de usar:': '. Read before using:', 'WhatsApp não oficial.': 'Unofficial WhatsApp.',
    'A conexão usa um cliente de código aberto que': 'The connection uses an open-source client that is', 'não é aprovado pelo WhatsApp': 'not approved by WhatsApp', '. O WhatsApp pode derrubar a sessão, restringir ou': '. WhatsApp may drop the session, restrict or', 'banir o número': 'ban the number',
    '. Se isso acontecer,': '. If that happens,', 'nem o CaçaLead nem os autores dos componentes têm culpa ou responsabilidade': 'neither CaçaLead nor the authors of its components are at fault or liable', '. Use um número que você aceita arriscar, comece devagar (20 a 30 por dia) e respeite quem pedir para parar.': '. Use a number you accept risking, start slowly (20 to 30 a day) and respect anyone who asks you to stop.',
    'O ideal é usar o WhatsApp oficial': 'The ideal is to use the official WhatsApp', '(WhatsApp Business Platform, a API da Meta), que tem custo e regras de modelos de mensagem, mas é o único caminho autorizado e seguro para volume.': '(WhatsApp Business Platform, Meta’s API), which has a cost and message-template rules, but is the only authorized and safe path for volume.',
    'Google Maps.': 'Google Maps.', 'Coletar dados do Google Maps pode contrariar os termos do Google. Seu IP pode ser bloqueado. Use com moderação.': 'Collecting Google Maps data may go against Google’s terms. Your IP may be blocked. Use in moderation.',
    'LGPD e mensagens frias.': 'Privacy law and cold messages.', 'Você é o responsável por ter base legal, oferecer descadastro e cumprir as leis do seu país sobre contato comercial. Isto não é aconselhamento jurídico.': 'You are responsible for having a legal basis, offering opt-out and following your country’s laws on commercial contact. This is not legal advice.',
    'Seus dados ficam no seu computador': 'Your data stays on your computer', '), inclusive uma cópia do histórico do WhatsApp conectado. Proteja essa pasta e nunca a publique.': '), including a copy of the connected WhatsApp history. Protect that folder and never publish it.', '(pasta': '(folder',
    'Li, entendi e aceito os riscos': 'I have read, understood and accept the risks', 'Agora não': 'Not now', 'Aceitar e continuar': 'Accept and continue',
    /* apoio */
    'Gostou do CaçaLead?': 'Enjoying CaçaLead?', 'Ele é grátis e vai continuar grátis. Se te ajudou a achar clientes, um Pix de qualquer valor me ajuda a manter e melhorar. Se quiser me pagar um café, sou muito grato. 💚': 'It is free and will stay free. If it helped you find clients, a Pix of any amount helps me maintain and improve it. If you want to buy me a coffee, I am very grateful. 💚',
    'Aponte a câmera do app do seu banco para o QR Code': 'Point your bank app’s camera at the QR Code', 'Chave Pix (': 'Pix key (', 'Copiar Pix Copia e Cola': 'Copy Pix copy-and-paste code', '✓ Copiado! Cole no app do banco': '✓ Copied! Paste it in your bank app', 'Pix copiado. Valeu demais! 💚': 'Pix copied. Thank you so much! 💚',
    'QR Code do Pix': 'Pix QR Code',
    /* atualização */
    '⬆ Atualizar': '⬆ Update', '⬆ Atualização disponível': '⬆ Update available', 'Atualizar agora': 'Update now', 'Depois': 'Later', 'Tentar de novo': 'Try again', 'Baixando a versão nova…': 'Downloading the new version…', 'Conferindo os componentes (instalador)…': 'Checking the components (installer)…', 'Reiniciando o CaçaLead…': 'Restarting CaçaLead…',
    'O CaçaLead baixa a versão nova, confere os componentes e reinicia sozinho. Seus leads e configurações ficam como estão. Se o WhatsApp estiver conectado, ele reconecta em instantes.': 'CaçaLead downloads the new version, checks the components and restarts by itself. Your leads and settings stay as they are. If WhatsApp is connected, it reconnects in moments.',
    'Esta cópia tem alterações próprias (como a adaptação para Windows), então a atualização automática está desligada.': 'This copy has its own changes (such as the Windows port), so automatic update is off.', 'Demorou mais que o normal. Recarregue a página ou abra o CaçaLead de novo.': 'It took longer than usual. Reload the page or open CaçaLead again.',
    'não consegui falar com o GitHub': 'could not reach GitHub', 'não há atualização disponível (ou o CaçaLead não foi instalado com git clone)': 'no update available (or CaçaLead was not installed with git clone)', 'esta cópia tem alterações próprias, então a atualização automática está desligada': 'this copy has its own changes, so automatic update is off', 'já está atualizando': 'already updating',
    /* misc */
    'lead': 'lead', 'leads': 'leads', 'leads ·': 'leads ·', 'há': 'for', 'de': 'of', 'em': 'in', '✔ Caçada #': '✔ Hunt #', 'concluída': 'finished', 'avaliações · score': 'reviews · score',
    'Ficha completa': 'Full profile', 'Esc': 'Esc',
    /* mensagens do servidor (feed e erros) */
    '■ Caçada interrompida': '■ Hunt stopped', 'JSON inválido': 'Invalid JSON', 'Leia e aceite o aviso importante antes de conectar o WhatsApp.': 'Read and accept the important notice before connecting WhatsApp.', 'Leia e aceite o aviso importante antes de usar o WhatsApp.': 'Read and accept the important notice before using WhatsApp.',
    'WhatsApp não conectado': 'WhatsApp not connected', 'assinatura inválida': 'invalid signature', 'cabeçalho X-Garimpo ausente': 'X-Garimpo header missing', 'diga o nome do negócio': 'type the business name', 'diga o que caçar': 'tell me what to hunt', 'esse número não tem WhatsApp': 'this number has no WhatsApp',
    'host não permitido': 'host not allowed', 'informe o número com DDD': 'enter the number with area code', 'lead não existe': 'lead does not exist', 'não encontrado': 'not found', 'o gateway não subiu': 'the gateway did not start', 'origem não permitida': 'origin not allowed', 'rota desconhecida': 'unknown route',
    '⚠ Para mandar o link do diagnóstico, informe o endereço público dele em WhatsApp, Sua apresentação, Avançado': '⚠ To send the diagnosis link, enter its public address under WhatsApp, Your introduction, Advanced',
    /* análise: motivos */
    'Não tem site nenhum': 'Has no website at all', 'O “site” é só uma rede social': 'The “website” is just a social network', 'Depende de plataforma (iFood/link/cardápio)': 'Depends on a platform (iFood/link/menu)', 'Não achamos Instagram': 'No Instagram found', 'Sem e-mail público': 'No public email',
    'Horário não preenchido no Google': 'Opening hours not filled in on Google', 'Sem foto de capa': 'No cover photo', 'Celular/WhatsApp direto': 'Direct mobile/WhatsApp', 'Tem telefone fixo': 'Has a landline', 'E-mail encontrado': 'Email found', 'Clientes amam o produto (nota alta)': 'Customers love the product (high rating)',
    'conectou': 'connected', 'caiu': 'dropped', 'reconectando': 'reconnecting', 'resposta recebida': 'reply received', 'mensagem sua': 'your message', 'gateway ligado': 'gateway started', 'gateway reiniciado (planejado)': 'gateway restarted (planned)', 'reiniciando (planejado)': 'restarting (planned)',
    'BLOQUEIO TEMPORARIO': 'TEMPORARY BLOCK', 'Quedas (24h)': 'Drops (24h)', 'Respostas (24h)': 'Replies (24h)', 'Entregues (24h)': 'Delivered (24h)', 'Lidas (24h)': 'Read (24h)',
    '· o gateway não está instalado ou não subiu (pasta gateway/)': '· the gateway is not installed or did not start (gateway/ folder)',
    'Colocar os leads filtrados na fila de disparo automático': 'Put the filtered leads in the automatic sending queue', 'Copiar link do WhatsApp com a mensagem': 'Copy the WhatsApp link with the message', 'Copiar os links api.whatsapp dos leads filtrados': 'Copy the api.whatsapp links of the filtered leads',
    'Ela respondeu no WhatsApp: mover para Negociando': 'She replied on WhatsApp: move to Negotiating', 'WhatsApp com abordagem': 'WhatsApp with the approach message', 'Mudar para português': 'Mudar para português',
    '🛡 Cliente:': '🛡 Client:', 'links copiados': 'links copied', '🛡 CLIENTE': '🛡 CLIENT', '💬 respondeu': '💬 replied', '🔗 Copiar link api.whatsapp': '🔗 Copy api.whatsapp link', '🔗 link copiado': '🔗 link copied', 'edite e mande': 'edit and send',
    'Erro:': 'Error:', 'erro:': 'error:', 'garimpo offline': 'garimpo offline', 'Escolha a cidade acima primeiro.': 'Pick the city above first.', 'Procurando “': 'Looking for “', '🛡 Procurando “': '🛡 Looking for “', 'cliente(s)…': 'client(s)…',
    'Conecte o WhatsApp primeiro': 'Connect WhatsApp first', 'dia(s)': 'day(s)', 'Provedor:': 'Provider:', 'Ler QR code': 'Scan QR code', 'VARRENDO': 'SWEEPING', 'Procurar e blindar': 'Search and shield', 'Salvar e testar': 'Save and test', 'Intervalo (seg)': 'Gap (sec)',
    '⌀ Sem site': '⌀ No website', '◎ Score médio': '◎ Average score', '◎ Score': '◎ Score',
    'Foco opcional (ex: vendo tráfego pago, vendo site…)': 'Optional focus (e.g. I sell paid traffic, I sell websites…)', 'Falei com o dono, retorno sexta…': 'Talked to the owner, following up Friday…', 'https://evolution.seudominio.com.br': 'https://evolution.yourdomain.com',
    'pausado': 'paused', 'parada': 'stopped', 'pausados': 'paused', 'enviado': 'sent', 'respondeu': 'replied', 'cancelado': 'cancelled', 'pulado': 'skipped', 'pulados': 'skipped', 'gerando': 'generating', 'agora': 'now', 'checagem': 'check', 'cliente': 'client', 'atencao': 'warning',
    'inverter': 'invert', 'Inverte a seleção dos bairros mostrados': 'Inverts the selection of the neighborhoods shown', '▭ no mapa': '▭ on map', 'Dica: Shift + clique marca uma faixa de bairros. No mapa, arraste um retângulo para marcar vários.': 'Tip: Shift + click selects a range of neighborhoods. On the map, drag a rectangle to select several.',
    'Arraste no mapa para marcar vários bairros de uma vez. Segure Alt ao soltar para desmarcar. (Atalho: Shift + arrastar)': 'Drag on the map to select several neighborhoods at once. Hold Alt when releasing to deselect. (Shortcut: Shift + drag)', 'Arraste no mapa para marcar vários bairros (Alt ao soltar = desmarcar)': 'Drag on the map to select several neighborhoods (Alt on release = deselect)',
    'BUSCANDO BAIRROS…': 'LOOKING UP NEIGHBORHOODS…', '⌛ Procurando a cidade…': '⌛ Looking for the city…',
    'Próprio': 'Own', 'próprio': 'own', 'nenhum': 'none', 'rede social': 'social network', 'plataforma': 'platform'
  };

  /* Padrões com números e nomes. Cada item: [regex que casa o texto inteiro, resposta com $1, $2…] */
  const R = [
    [/^(\d+) bairros? (marcados?|desmarcados?)$/, function (m) { return m[1] + ' neighborhood' + (m[1] > 1 ? 's' : '') + ' ' + (m[2].indexOf('des') === 0 ? 'deselected' : 'selected'); }],
    [/^(\d+) no total$/, '$1 in total'],
    [/^Versão nova disponível \((\d+) mudanças?\)$/, 'New version available ($1 change(s))'], [/^Você está na versão$/, 'You are on version'], [/^(\(.+\))?\. O que há de novo:$/, '$1. What is new:'],
    [/^📤 você mandou (.+)$/, '📤 you sent it $1'], [/^🔗 você mandou (.+)$/, '🔗 you sent it $1'],
    [/^Nota baixa \(([\d.,]+)\) — reputação a recuperar$/, 'Low rating ($1): reputation to recover'], [/^Nota mediana \(([\d.,]+)\)$/, 'Mid rating ($1)'],
    [/^Pouquíssimas avaliações \((\d+)\)$/, 'Very few reviews ($1)'], [/^Poucas avaliações \((\d+)\)$/, 'Few reviews ($1)'], [/^Negócio grande \((\d+) avaliações\)$/, 'Large business ($1 reviews)'],
    [/^Movimento forte \((\d+) avaliações\)$/, 'Strong traffic ($1 reviews)'], [/^Movimento ok \((\d+) avaliações\)$/, 'Decent traffic ($1 reviews)'],
    [/^(\d[\d.]*) lugares$/, '$1 places'], [/^~?(\d[\d.]*) lugares$/, '~$1 places'], [/^(\d+) leads?$/, '$1 leads'], [/^(\d+) bairros?$/, '$1 neighborhoods'], [/^(\d+) min$/, '$1 min'], [/^há (\d+)\s?(min|h|d|s)$/, '$1 $2 ago'],
    [/^(\d+)% do total$/, '$1% of total'], [/^(\d+)% sem site próprio$/, '$1% without an own website'], [/^(\d+) com Instagram$/, '$1 with Instagram'], [/^(\d+) leads? · (\d+) quentes?$/, '$1 leads · $2 hot'],
    [/^Conectado há (.+)$/, 'Connected for $1'], [/^Caçada #(\d+) concluída$/, 'Hunt #$1 finished'], [/^✔ Caçada #(\d+) concluída$/, '✔ Hunt #$1 finished'], [/^◉ Nova caçada #(\d+): (.+)$/, '◉ New hunt #$1: $2'],
    [/^▸ (.+)$/, function (m) { return '▸ ' + tr(m[1]); }], [/^📍 Bairro (\d+)\/(\d+): (.+)$/, '📍 Neighborhood $1/$2: $3'], [/^✔ Caçada concluída · (\d+) lugares · (\d+) quentes$/, '✔ Hunt finished · $1 places · $2 hot'],
    [/^✔ Checagem concluída · (\d+) lugares · (\d+) quentes$/, '✔ Check finished · $1 places · $2 hot'], [/^✔ (.+): (\d+) lugares$/, '✔ $1: $2 places'], [/^✖ (.+): (\d+) lugares$/, '✖ $1: $2 places'],
    [/^↺ (.+) \(já estava no CaçaLead\)$/, '↺ $1 (already in CaçaLead)'], [/^(.+) · score (\d+)$/, '$1 · score $2'], [/^📧 e-mail achado · (.+)$/, '📧 email found · $1'], [/^💬 avaliações lidas · (.+)$/, '💬 reviews read · $1'],
    [/^🧠 Claude analisando · (.+)$/, '🧠 Claude analyzing · $1'], [/^🧠 análise pronta · (.+)$/, '🧠 analysis ready · $1'], [/^🧾 Diagnóstico pronto: (.+)$/, '🧾 Diagnosis ready: $1'], [/^🧾 Montando o diagnóstico de (.+) com o Claude…$/, '🧾 Building the diagnosis for $1 with Claude…'],
    [/^📤 Diagnóstico enviado para (.+)$/, '📤 Diagnosis sent to $1'], [/^📤 Mensagem enviada para (.+) \((\d+)\/(\d+) hoje\)$/, '📤 Message sent to $1 ($2/$3 today)'], [/^📤 Mensagem enviada para (.+)$/, '📤 Message sent to $1'],
    [/^✖ envio falhou para (.+): (.+)$/, '✖ send failed for $1: $2'], [/^⌀ (.+): número sem WhatsApp$/, '⌀ $1: number without WhatsApp'], [/^🙋 (.+) quer o diagnóstico$/, '🙋 $1 wants the diagnosis'], [/^🙋 (.+) pediu o diagnóstico.*$/, '🙋 $1 asked for the diagnosis'],
    [/^💬 (.+) respondeu.*$/, '💬 $1 replied'], [/^🚫 (.+) pediu para parar.*$/, '🚫 $1 asked to stop'], [/^🤖 resposta automática de (.+)$/, '🤖 automatic reply from $1'], [/^👁 (.+) leu a mensagem$/, '👁 $1 read the message'],
    [/^🛡 Cliente encontrado: (.+) · exposição (\d+)$/, '🛡 Client found: $1 · exposure $2'], [/^🛡 Procurando (?:seu cliente )?“(.+?)”(?: em (.+))?…$/, function (m) { return '🛡 Looking for your client “' + m[1] + '”' + (m[2] ? ' in ' + m[2] : '') + '…'; }],
    [/^🛡 Não achei “(.+)” com certeza\. Abra a Blindagem e marque o certo\.$/, '🛡 Not sure I found “$1”. Open Shield and mark the right one.'], [/^🛡 (.+): exposição (\d+) → (\d+)$/, '🛡 $1: exposure $2 → $3'], [/^🛡 Re-checando (\d+) clientes?…$/, '🛡 Re-checking $1 clients…'],
    [/^⚠ Claude não respondeu, vai a versão padrão do diagnóstico de (.+)$/, '⚠ Claude did not respond, the default diagnosis for $1 will be used'], [/^✖ Não consegui publicar o diagnóstico de (.+)$/, '✖ Could not publish the diagnosis for $1'],
    [/^Brechas que um prospectador vê \((.+)\)$/, 'Gaps a prospector sees ($1)'], [/^Líder no bairro: (.+) \(★ (.+)\)$/, 'Neighborhood leader: $1 (★ $2)'], [/^(\d+) na fila$/, '$1 in the queue'], [/^(\d+) ficaram de fora.*$/, '$1 were left out'],
    [/^Fila: (\d+)$/, 'Queue: $1'], [/^(\d+)\/(\d+) hoje$/, '$1/$2 today'], [/^Próximo em (.+)$/, 'Next in $1'], [/^(\d+) quedas?$/, '$1 drops'], [/^Ele troca sozinho a cada (\d+) segundos\.$/, 'It refreshes every $1 seconds.'],
    [/^Cada um recebe uma mensagem própria, montada com o que falta no negócio dele\. Com (\d+)\/dia.*$/, 'Each one gets their own message. At $1/day…'], [/^Colocar (\d+) leads? na fila e ligar os disparos$/, 'Queue $1 leads and start sending'],
    [/^(\d+) leads? na fila(.*)$/, '$1 leads in the queue$2'], [/^Enviar agora esta mensagem pelo seu WhatsApp\?\s*([\s\S]*)$/, 'Send this message on your WhatsApp now?\n\n$1'], [/^(.+) pediu o diagnóstico\?\s*O Claude monta a página e o link é enviado agora pelo seu WhatsApp\.$/, '$1 asked for the diagnosis?\n\nClaude builds the page and the link is sent now on your WhatsApp.'],
    [/^(\d+) negócios$/, '$1 businesses'], [/^R\$ ([\d.]+)\/mês$/, 'R$ $1/month'], [/^(\d+) (?:precisam|sem) (.+)$/, function (m) { return m[1] + ' ' + tr(m[0].replace(/^\d+ /, '')); }]
  ];

  const MAP = new Map(Object.entries(D));
  /* trechos curtos e seguros dentro de textos compostos (nunca mexe em mensagens longas) */
  const W = [[/(\d[\d.]*) lugares\b/g, '$1 places'], [/\bhá (\d+)\s?(d|h|min|s)\b/g, '$1$2 ago'], [/(\d[\d.]*) aval\./g, '$1 reviews'], [/(\d+) quentes?\b/g, '$1 hot'], [/(\d[\d.]*) avaliações\b/g, '$1 reviews'], [/^nota média (.+)$/g, 'average rating $1'], [/\bde (\d+) negócios — clique para ver/g, 'of $1 businesses — click to view']];

  function tr(s) {
    if (!s) return s;
    const lead = s.match(/^\s*/)[0], tail = s.match(/\s*$/)[0], core = s.trim();
    if (!core) return s;
    let out = MAP.get(core);
    if (out === undefined) {
      for (let i = 0; i < R.length; i++) { const m = core.match(R[i][0]); if (m) { out = typeof R[i][1] === 'function' ? R[i][1](m) : core.replace(R[i][0], R[i][1]); break; } }
    }
    if (out === undefined) {
      const sep = core.indexOf(' · ') >= 0 ? ' · ' : core.indexOf('|') >= 0 ? '|' : '';
      if (sep) out = core.split(sep).map(function (x) { return tr(x); }).join(sep);
    }
    if (out === undefined || out === core) {
      out = core;
      for (let i = 0; i < W.length; i++) out = out.replace(W[i][0], W[i][1]);
    }
    return lead + out + tail;
  }

  let lang = 'pt';
  try { lang = localStorage.getItem('garimpo_lang') || ((navigator.language || 'pt').toLowerCase().indexOf('pt') === 0 ? 'pt' : 'en'); } catch (e) {}
  const origText = new WeakMap(), origAttr = new WeakMap();
  const ATTRS = ['placeholder', 'title', 'aria-label', 'alt', 'data-tip'];
  const SKIP = { SCRIPT: 1, STYLE: 1, TEXTAREA: 1, CODE: 0 };

  function doText(n) {
    const p = n.parentNode; if (!p || SKIP[p.nodeName] || (p.closest && p.closest('[data-noi18n]'))) return;
    const rec = origText.get(n), cur = n.nodeValue;
    if (rec && cur === rec.en) { if (lang === 'pt') { n.nodeValue = rec.pt; origText.delete(n); } return; }
    if (lang !== 'en') return;
    const t = tr(cur);
    if (t !== cur) { origText.set(n, { pt: cur, en: t }); n.nodeValue = t; }
  }
  function doAttrs(el) {
    if (!el.getAttribute || (el.closest && el.closest('[data-noi18n]'))) return;
    let rec = origAttr.get(el);
    for (let i = 0; i < ATTRS.length; i++) {
      const a = ATTRS[i], cur = el.getAttribute(a); if (cur == null) continue;
      if (rec && rec[a] && cur === rec[a].en) { if (lang === 'pt') { el.setAttribute(a, rec[a].pt); delete rec[a]; } continue; }
      if (lang !== 'en') continue;
      const t = tr(cur);
      if (t !== cur) { if (!rec) { rec = {}; origAttr.set(el, rec); } rec[a] = { pt: cur, en: t }; el.setAttribute(a, t); }
    }
  }
  function walk(root) {
    if (root.nodeType === 3) return doText(root);
    if (root.nodeType !== 1 && root.nodeType !== 9) return;
    if (root.nodeType === 1) doAttrs(root);
    const w = document.createTreeWalker(root, 5 /* elementos + texto */, null);
    let n; while ((n = w.nextNode())) { if (n.nodeType === 3) doText(n); else doAttrs(n); }
  }
  let queue = new Set(), scheduled = false;
  function flush() { scheduled = false; const q = queue; queue = new Set(); q.forEach(walk); if (lang === 'en') document.title = tr(document.title); }
  function push(n) { queue.add(n); if (!scheduled) { scheduled = true; setTimeout(flush, 30); } }

  const obs = new MutationObserver(function (ms) {
    for (let i = 0; i < ms.length; i++) {
      const m = ms[i];
      if (m.type === 'childList') m.addedNodes.forEach(push);
      else if (m.type === 'characterData') push(m.target);
      else push(m.target);
    }
  });

  function paintBtn() { const b = document.getElementById('langBtn'); if (b) { b.textContent = lang === 'en' ? 'PT' : 'EN'; b.title = lang === 'en' ? 'Mudar para português' : 'Switch to English'; b.setAttribute('data-noi18n', ''); } }
  function apply() {
    document.documentElement.lang = lang === 'en' ? 'en' : 'pt-BR';
    if (lang === 'pt') document.title = 'CaçaLead · Radar de Prospecção';
    walk(document.body); if (lang === 'en') document.title = tr(document.title); paintBtn();
  }
  window.garimpoLang = {
    get: function () { return lang; }, tr: function (s) { return lang === 'en' ? tr(s) : s; },
    set: function (l) { lang = l; try { localStorage.setItem('garimpo_lang', l); } catch (e) {} apply(); },
    toggle: function () { this.set(lang === 'en' ? 'pt' : 'en'); }
  };
  /* diálogos do navegador também passam pela tradução */
  ['alert', 'confirm', 'prompt'].forEach(function (k) { const f = window[k].bind(window); window[k] = function (m) { const a = Array.prototype.slice.call(arguments); a[0] = window.garimpoLang.tr(String(m)); return f.apply(null, a); }; });

  function start() {
    obs.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS });
    const b = document.getElementById('langBtn'); if (b) b.onclick = function () { window.garimpoLang.toggle(); };
    apply();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
  window.garimpoLang.dict = D; window.garimpoLang.rules = R;
})();
