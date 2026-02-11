

# Configurar PWA (Progressive Web App)

## Objetivo
Transformar o app em um PWA completo, permitindo instalacao pelo navegador, suporte offline e cache inteligente de recursos.

## Mudancas Planejadas

### 1. Instalar dependencia `vite-plugin-pwa`
- Adicionar `vite-plugin-pwa` ao projeto

### 2. Configurar `vite.config.ts`
- Importar e adicionar o plugin `VitePWA` com:
  - Registro automatico do service worker (`registerType: 'autoUpdate'`)
  - Estrategia de cache `generateSW` (Workbox)
  - Cache de runtime para chamadas de API do Supabase, fontes Google e imagens
  - Manifest inline com nome, cores, icones e configuracoes de display standalone

### 3. Atualizar `index.html`
- Adicionar meta tags PWA:
  - `<meta name="theme-color" content="#1f2937">`
  - `<meta name="apple-mobile-web-app-capable" content="yes">`
  - `<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">`
  - `<link rel="apple-touch-icon" href="/pwa-192x192.png">`

### 4. Criar icones PWA
- Criar `public/pwa-192x192.png` e `public/pwa-512x512.png` (icones SVG simples gerados inline, usando o favicon existente como referencia)

### 5. Atualizar `AddToHomeScreenDialog.tsx`
- Detectar o evento `beforeinstallprompt` do navegador para oferecer instalacao nativa via botao (em vez de apenas instrucoes manuais)

---

## Detalhes Tecnicos

### Manifest (dentro do VitePWA)
```text
name: "Assistente Inteligente Pro"
short_name: "Assistente AI"
description: "5 Assistentes de IA especializados"
theme_color: "#1f2937"
background_color: "#1f2937"
display: "standalone"
orientation: "portrait"
start_url: "/"
icons: 192x192 e 512x512
```

### Estrategia de Cache (Workbox)
- **Fontes Google**: CacheFirst (30 dias)
- **Imagens**: CacheFirst (30 dias, max 50 entradas)
- **API Supabase**: NetworkFirst (24h fallback)
- **Assets estaticos**: pre-cache automatico pelo Workbox

### Registro do Service Worker
- Adicionar registro em `src/main.tsx` usando `registerSW` do `vite-plugin-pwa/virtual`
- Mostrar toast quando houver atualizacao disponivel

