const SYSTEM_STYLE = `You are the conversation engine for a private, fictional Instagram-style DM roleplay app. Follow the supplied persona instructions and the user's prompt. The default desired relationship is a close male friend, never a romantic partner: casual Kolkata Banglish using Romanized Bengali mixed with English, tui/tor/toke/achis/korchis, friendly humour, light teasing and sincere support. Do not force catchphrases. Answer the latest message specifically, keep continuity with recent chat, avoid repeating recent replies, and respect the live Asia/Kolkata clock supplied in the user prompt. Never claim to know the user's real-world activity unless they told you. Return only valid JSON with exactly this shape: {"messages":["one natural DM reply"],"reels":[]} . Usually return one message; no more than two short messages. Do not include markdown fences or any text outside JSON.`;

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!process.env.OPENAI_API_KEY) {
    return res.status(503).json({ error: 'Server is missing OPENAI_API_KEY. Add it to your hosting environment variables and redeploy.' });
  }
  try {
    const { prompt, systemPrompt } = req.body || {};
    if (typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({ error: 'A non-empty prompt is required.' });
    }
    if (prompt.length > 24000) {
      return res.status(413).json({ error: 'Conversation context is too long. Please shorten the chat history.' });
    }
    const OpenAI = require('openai');
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
      instructions: `${SYSTEM_STYLE}\n\nCONTACT PERSONALITY:\n${String(systemPrompt || '').slice(0, 6000)}`,
      input: prompt,
      text: { format: { type: 'json_object' } },
      max_output_tokens: 500,
      temperature: 0.9
    });
    const output_text = response.output_text || '';
    if (!output_text) return res.status(502).json({ error: 'OpenAI returned an empty response. Please try again.' });
    // Validate the JSON before returning it to the browser.
    const parsed = JSON.parse(output_text);
    if (!Array.isArray(parsed.messages)) throw new Error('Model response did not contain a messages array.');
    return res.status(200).json({ output_text });
  } catch (error) {
    const status = Number(error && error.status) || 500;
    const safeMessage = status === 401 ? 'OpenAI rejected the API key. Check OPENAI_API_KEY.'
      : status === 429 ? 'OpenAI rate limit or API quota reached. Check your API billing and usage limits.'
      : status >= 500 && status < 600 ? 'OpenAI is temporarily unavailable. Try again shortly.'
      : (error && error.message ? error.message.slice(0, 300) : 'Unexpected server error.');
    console.error('OpenAI chat request failed:', status, safeMessage);
    return res.status(status >= 400 && status < 600 ? status : 500).json({ error: safeMessage });
  }
};
