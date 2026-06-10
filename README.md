# ClassMapper 🧸

A weekly classroom seating chart generator for kindergarten/primary school teachers — built with React, Vite, and Tailwind CSS. 100% static, no backend; everything is stored in your browser's localStorage.

## Features

- 🏫 **Class Roster** — track each student's gender, attention span, energy level, social style, academic pace, behavior, special needs, and peer relationships.
- 🗺️ **Weekly Map** — generate a seating chart with one click using a rule-based algorithm, choosing from rows, pods, or U-shape layouts.
- 📐 **Seating Rules** — toggle hard rules (always enforced) and soft rules (with adjustable priority), plus add your own plain-English custom rules.
- 📋 **History** — browse, preview, export, and delete your last 10 weekly maps.
- ⚙️ **Settings** — set your teacher/classroom name and optionally add a free Gemini API key for AI-generated weekly summaries (falls back to an automatic summary if no key is set).
- 📄 **PDF export** — export a colourful, child-friendly seating map + summary as an A4 PDF.

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds the app and deploys `dist/` to the `gh-pages` branch via GitHub Actions. Enable GitHub Pages in the repo settings with source set to "Deploy from branch" → `gh-pages`.

The app will be live at `https://<your-username>.github.io/classmapper/`.
