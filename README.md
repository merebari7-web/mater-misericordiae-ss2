# SS2 Lesson Notes — Mater Misericordiae Secondary School, Rumomasi

**Class:** SS2  
**Term:** First 2026/2027 Academic Session

This GitHub Pages-ready site presents the supplied lesson text. The subject source files in `content/` keep the original wording, including the repeated Biology section; the site displays them as preformatted text. No lesson corrections, paraphrasing or deduplication are intended.

## Subjects

- Biology
- Chemistry
- Digital Technology
- Citizenship and Heritage Studies
- English Language

## Files

- `index.html` — site shell
- `styles.css` — responsive layout and preformatted notes styling
- `app.js` — navigation and search
- `content/manifest.json` — subject metadata
- `content/*.txt` — supplied lesson text

## Run locally

From this folder, run:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000/`.

## GitHub Pages

The site is static and has no build step or external libraries. Publish from the repository's `main` branch and `/ (root)` using **Settings → Pages → Build and deployment → Deploy from a branch**.
