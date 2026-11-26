# Demonstração do painel

Gera uma página única com o painel real (`web/`) funcionando sobre negócios fictícios, para mostrar e experimentar
mudanças de tela sem buscar nada no Google nem tocar no WhatsApp.

```powershell
python demo/build.py
```

O resultado fica em `demo/dist/cacalead.html`. Rode de novo depois de mudar qualquer coisa em `web/`.

- `build.py`: os dados de exemplo (nota e mensagens saem das funções reais do `garimpo.py`) e a montagem da página.
- `mock.js`: o servidor simulado e o mapa ilustrativo.
- `leaflet-min.css`, `demo.css`: estilos que só a demonstração usa.
