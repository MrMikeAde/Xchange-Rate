# Xchange Rate

A free, live currency converter. No API key, no account, no subscription, no ads.

Convert between 31 major world currencies using live mid-market rates sourced from the European Central Bank, with 30-day high, low, and average stats for whichever pair you're checking.

## Features

- **Live rates** for 31 currencies (USD, EUR, GBP, JPY, INR, and more), pulled from the [Frankfurter API](https://frankfurter.dev) — a free, keyless, open-source service backed by ECB reference data
- **Instant swap** between source and target currency
- **30-day high / low / average** for the selected pair
- **Zero dependencies** beyond a single Google Fonts import — no build step, no framework, no bundler
- **Zero cost to run** — static HTML/CSS/JS, hosted for free, calling a free API

## Tech stack

- Vanilla HTML, CSS, and JavaScript
- [Frankfurter API](https://frankfurter.dev) for exchange rate data (ECB source, updated once per business day around 16:00 CET)
- [Space Grotesk](https://fonts.google.com/specimen/Space+Grotesk) via Google Fonts

## Getting started

No install, no build. Just open the file.

```bash
git clone https://github.com/mrmikeade/xchange-rate.git
cd xchange-rate
open currency-converter.html   # or double-click it
```

## Deploying to Netlify

This is a static site, so Netlify's free tier is a perfect fit:

1. Push this repo to GitHub.
2. In Netlify, click **Add new site → Import an existing project**, and connect your GitHub account.
3. Select this repo. No build command is needed — set the publish directory to the repo root (or wherever `currency-converter.html` lives).
4. If you want it served at your domain root, rename `currency-converter.html` to `index.html`, or add a Netlify redirect from `/` to it.
5. Deploy. You'll get a free `*.netlify.app` URL with HTTPS, and it will auto-redeploy on every push to `main`.

Drag-and-drop deploys (no GitHub connection required) also work — just drop the file onto [app.netlify.com/drop](https://app.netlify.com/drop).

## Notes

- Rates update once per business day (ECB doesn't publish on weekends or EU bank holidays, so the API returns the most recent available rate on those days).
- All 31 currencies are those Frankfurter's free ECB-backed endpoint supports.

## Author

Built by [@mrmikeade](https://github.com/mrmikeade)

## License

MIT
