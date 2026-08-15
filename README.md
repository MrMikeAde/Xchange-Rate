# Xchange Rate

A free, real-time currency converter supporting 200+ world currencies and cryptocurrencies. No API key, no account, no subscription, no ads, and no hidden markups.

Convert instantly with live mid-market exchange rates, default set to **USD (1)** to **NGN (its live equivalent)**, with 30-day average statistics.

## Features

- **Live rates** for 200+ currencies (USD, EUR, GBP, NGN, JPY, INR, BTC, ETH, and more), pulled from primary CDN endpoint with Cloudflare fallback
- **Default pair**: USD (1) → NGN (live mid-market rate)
- **Instant swap** between source and target currency
- **30-day average stats** for the selected pair
- **Mobile optimized** responsive design — works seamlessly on screens down to 320px with no layout breaking
- **Zero dependencies** beyond Google Fonts and flag-icons CSS — no build step, no framework, no bundler
- **Zero cost to run** — static HTML/CSS/JS, hosted for free

## Tech stack

- Vanilla HTML, CSS, and JavaScript
- [Space Grotesk](https://fonts.google.com/specimen/Space+Grotesk) font & [flag-icons](https://github.com/lipis/flag-icons)
- Live mid-market exchange rate API via jsDelivr CDN / Cloudflare Pages

## Getting started

No install, no build. Just open `index.html` in your browser.

```bash
git clone https://github.com/mrmikeade/xchange-rate.git
cd xchange-rate
open index.html   # or double-click it
```

## Deploying to Netlify / Vercel / GitHub Pages

This is a static single-page app (`index.html`). Simply host `index.html` at your web root.

## Author

Built by [@mrmikeade](https://github.com/mrmikeade)

## License

MIT
