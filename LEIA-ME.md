# Site OnPrime

Página de links da OnPrime. HTML, CSS e JavaScript puros: não precisa instalar nada.
Para ver no computador, abra o `index.html` no navegador.

## Estrutura

```
index.html                 página e textos em português
.htaccess                  compressão e cache na HostGator
llms.txt                   resumo da loja para IAs (ChatGPT, Claude, Perplexity)
assets/css/style.css       visual: cores, fontes, espaçamentos, animações
assets/js/i18n.js          textos em inglês
assets/js/main.js          idioma, tema claro/escuro, cursor, animação ao rolar
assets/img/logo.png        logo completa ("on" ciano + "prime" branco, fundo transparente)
assets/img/logo-icone.png  só o símbolo "on" (foto redonda do topo e ícone da aba)
assets/img/banner-1.jpg    iPhone 18 Pro Max
assets/img/banner-2.jpg    Apple Watch Series 12
assets/img/banner-3.jpg    AirPods 5
assets/img/banner-4.jpg    Xiaomi
assets/img/banner-5.jpg    JBL
assets/img/destaque-N.jpg  carrossel "Em destaque" (1 a 6, 1080 × 1220 px)
```

## Onde trocar cada coisa

| O quê | Onde |
|---|---|
| Textos em português | `index.html`. Os blocos editáveis têm comentário `EDITAR`. |
| Textos em inglês | `assets/js/i18n.js`. Cada chave corresponde a um `data-i18n="…"` no HTML. |
| Links (WhatsApp, Instagram, catálogo) | `index.html`: seção `REDES SOCIAIS`, botão principal, produtos e links. |
| Logo | Troque `assets/img/logo.png`. No tema claro ela é invertida automaticamente (o branco vira preto, o ciano continua ciano). |
| Símbolo do topo | Troque `assets/img/logo-icone.png`. |
| Banners dos produtos | `assets/img/banner-N.jpg`, 1600 × 720 px. Troque mantendo o nome. |
| Carrossel "Em destaque" | `index.html`, seção `CARROSSEL DE DESTAQUES`. Imagens `assets/img/destaque-N.jpg` (1080 × 1220 px). Tempo entre slides: `DELAY` no `main.js`. |
| Mapa | `index.html`, seção `MAPA`. Como trocar o local está no comentário. |
| Palavras da faixa rolando | `index.html`, em `.ticker`. Escreva cada palavra uma vez só. |
| Resumo para IAs | `llms.txt`. Atualize quando mudar produtos, links ou contato. |
| Cor da marca (#00deff) | `assets/css/style.css`, tokens `--brand*` no topo. Mude `--brand` e `--brand-rgb` juntos. |
| Título no Google e no compartilhamento | `<title>` e `<meta>` no topo do `index.html`. |

## Animação ao rolar

Todo elemento com a classe `rv` aparece quando entra na tela (sobe, ganha nitidez e surge).
Os banners abrem com um zoom saindo e um brilho ciano passando. Uma barra ciano no topo
mostra quanto da página já foi lida. Quem ativa "reduzir movimento" no celular vê tudo parado.

## Regras

- Se mudar um texto em português, mude também o inglês com a mesma chave no `i18n.js`.
- Para um texto novo traduzível, adicione `data-i18n="chave"` no HTML e a mesma `chave` no `i18n.js`.
- Nomes dos produtos não são traduzidos.
- O idioma e o tema escolhidos ficam salvos no navegador de cada visitante.

## Publicar na HostGator

1. No cPanel, abra o **Gerenciador de Arquivos** e entre na pasta `public_html` (ou na pasta do domínio).
2. Envie **somente** isto, mantendo as pastas:
   - `index.html`
   - `.htaccess`
   - `llms.txt`
   - a pasta `assets` inteira
3. Não envie este `LEIA-ME.md`.
4. O `.htaccess` começa com ponto e fica oculto. No Gerenciador de Arquivos, ative "Mostrar arquivos ocultos" em Configurações.
5. Ative o SSL grátis do domínio no cPanel. Depois, no `.htaccess`, tire o `#` das 3 últimas linhas para forçar `https://`.
6. Abra o site no celular e teste os botões.

Depois de publicar, troque no `index.html` o `content="assets/img/banner-1.jpg"` do `og:image`
pelo endereço completo, por exemplo `https://seudominio.com.br/assets/img/banner-1.jpg`.
Sem isso, a imagem não aparece quando o link é compartilhado no WhatsApp.
