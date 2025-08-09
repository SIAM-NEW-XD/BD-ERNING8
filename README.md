# earning-web

Simple static frontend extracted from bot.html.  
Files:
- `index.html`
- `css/styles.css`
- `js/app.js`

## Quick setup (GitHub Pages)
1. Put files in a repo following the structure.
2. Enable GitHub Pages from repo settings (branch `main` / `/docs` etc).
3. Visit `https://<your-username>.github.io/<repo>/`.

## IMPORTANT: Telegram bot token security
- **Do NOT put your Telegram bot token in client-side JS**. In original file there was a token — remove it.
- Create a small backend endpoint (Heroku/Cloud Run/Netlify Functions/Vercel Serverless) that receives a POST from the frontend and *server-side* calls `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/sendMessage` to the admin chat id.
- Set `BACKEND_SEND_WITHDRAW_URL` in `js/app.js` to that endpoint.
- Alternatively, if this is purely for testing locally, you can temporarily call Telegram from client but it's unsafe.

## Notes
- Monetag ad SDK script was included as in original. Check ad-provider policy before deploying.
- If you want me to also create a tiny Node/Express server example (serverless function) to forward withdraw messages safely, বল দে — আমি ইউজ করবার মতো code দেব।
