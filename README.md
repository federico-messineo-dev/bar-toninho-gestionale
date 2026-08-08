# Caffè Toninho — Gestione Magazzino

Progressive Web App offline-first per la gestione dell'inventario, del menu e delle giacenze del Caffè Toninho.

## Stack

- React 19 + TypeScript
- Vite + vite-plugin-pwa
- Tailwind CSS v4
- Zustand + Dexie.js (IndexedDB)
- Supabase (auth + sync + storage)

## Setup

```bash
npm install
cp .env.example .env   # poi inserisci le tue chiavi
npm run dev
```

## Variabili d'ambiente

| Variabile | Descrizione |
|-----------|-------------|
| `VITE_SUPABASE_URL` | URL del progetto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Chiave anonima Supabase |
| `VITE_ADMIN_EMAILS` | Email separate da virgola per il ruolo admin |

## Build & Deploy

```bash
npm run build
npm run preview   # preview locale
```

Deploy automatico su Vercel: basta collegare il repo. Configurare le env vars nel pannello Vercel.

## Struttura

```
src/
  components/   UI riutilizzabili
  pages/        Pagine (routing)
  store/        Zustand store
  db/           Dexie schema + seed
  hooks/        Hook custom (useAuth, useSync)
  lib/          Client Supabase
  utils/        Sync queue
  data/         prodotti.json
scripts/        Script seed Supabase
```

## Licenza

Progetto privato — Caffè Toninho.
