# Instagram-style DM app — OpenAI GPT backend

This project preserves the existing Instagram-style HTML interface and connects its live chat engine to OpenAI GPT through a server-side API route. The default contact persona is a **male best friend** who chats in casual Kolkata Banglish (`ki korchis`, `kothay achis`, `tui/tor/achis/korchis`) and is explicitly non-romantic.

## Deploy to Vercel

1. Create an API key at https://platform.openai.com/api-keys. Never paste it into the HTML or commit it to Git.
2. Upload this whole project folder to a private GitHub repository, or deploy it using the Vercel CLI.
3. In Vercel, import the repository. **Keep the Vercel Root Directory set to `.` (the project root). Do not set it to `public/`.** The `api/` folder must sit beside `public/` at the deployed project root; otherwise `/api/chat` returns 404.
4. In **Project → Settings → Environment Variables**, add:
   - `OPENAI_API_KEY` = your secret key
   - `OPENAI_MODEL` = `gpt-4.1-mini` (optional; default model)
5. Redeploy the project after adding the environment variable.
6. Open the deployed site. The browser calls `/api/chat` on the same origin. If you previously deployed only the HTML or selected `public/` as the Root Directory, redeploy this complete project with the root set to `.`.

Vercel automatically deploys files in `public/` as static assets and files in `api/` as serverless functions; no extra routing config is needed.

## Local development

Requires Node.js 18+ and the Vercel CLI.

```bash
npm install
npm install --global vercel
cp .env.example .env.local
# Edit .env.local and set OPENAI_API_KEY to your secret key
npx vercel dev
```

Open the local URL printed by `vercel dev`. Do not open `public/index.html` directly with `file://`; the backend route will not exist in that mode.

## Security and costs

- The OpenAI key is read only by the server from `OPENAI_API_KEY`; it is not placed in browser code or localStorage.
- OpenAI API usage is billed separately from ChatGPT subscriptions. Set usage limits and alerts in your OpenAI Platform project.
- The browser sends the recent chat context and current Asia/Kolkata time to the backend. GPT generates a new response for each turn; it is not a fixed response list.
- Offline mode remains optional but uses the app's built-in sample engine, not GPT.
- If a key is exposed, revoke it and create a replacement.
