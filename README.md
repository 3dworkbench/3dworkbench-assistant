# 3D Print Support Bot — Deployment Guide

## Projektstruktur

```
3d-support-bot/
├── api/
│   └── chat.js        ← Serverless Function (API-Key bleibt sicher)
├── public/
│   └── index.html     ← Die Chatbot-Webseite
├── vercel.json        ← Vercel Konfiguration
└── README.md
```

---

## Deployment auf Vercel (kostenlos)

### Schritt 1 — GitHub Account
Falls noch nicht vorhanden: https://github.com → kostenloses Konto erstellen.

### Schritt 2 — Neues Repository anlegen
1. Auf GitHub: "New repository" klicken
2. Name z.B. `3d-print-support`
3. Public oder Private — egal
4. Alle Dateien aus diesem Ordner hochladen (drag & drop)

### Schritt 3 — Vercel Account
1. https://vercel.com → "Sign up" mit GitHub-Account
2. "New Project" → dein Repository auswählen
3. Deploy klicken (keine weiteren Einstellungen nötig)

### Schritt 4 — API-Key hinterlegen
1. Im Vercel Dashboard → dein Projekt → "Settings" → "Environment Variables"
2. Neue Variable hinzufügen:
   - Name:  `ANTHROPIC_API_KEY`
   - Value: deinen API-Key von https://console.anthropic.com
3. "Save" klicken
4. Unter "Deployments" → "Redeploy" klicken

### Schritt 5 — Fertig!
Vercel gibt dir eine URL wie `https://3d-print-support.vercel.app`
Diese URL kannst du in deiner Instagram-Bio oder in Stories teilen!

---

## API-Key holen
1. https://console.anthropic.com → Anmelden / Registrieren
2. "API Keys" → "Create Key"
3. Key kopieren und sicher aufbewahren

## Kosten
- Vercel Hosting: kostenlos
- Anthropic API: ca. $0.003 pro Nachricht (sehr günstig)
  - Bei 500 Nachrichten/Monat ≈ $1.50

---

## Anpassungen
- Bot-Name, Farben und Chips kannst du direkt in `public/index.html` ändern
- Das System-Prompt (Persönlichkeit des Bots) ist in `api/chat.js` unter `const SYSTEM = ...`
