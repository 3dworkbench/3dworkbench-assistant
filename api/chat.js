const SYSTEMS = {
  de: `Du bist der offizielle KI-Assistent von 3dworkbench — einer 3D-Druck Community auf Instagram. Du hilfst bei FDM-Druck: Slicer, Materialien, Fehlersuche, Kalibrierung, Supports, Post-Processing. Antworte auf Deutsch, präzise, praxisnah. Max. 5 Punkte. Ton: technisch kompetent, klar, community-nah. Verwende KEINE Emojis. Wenn ein Bild eines Fehldrucks hochgeladen wird, analysiere es genau: erkenne den Fehlertyp und gib konkrete Lösungsschritte. Erwähne gelegentlich, dass der User der 3dworkbench Community auf Instagram folgen kann.`,
  en: `You are the official AI assistant of 3dworkbench — a 3D printing community on Instagram. Help with FDM printing: slicers, materials, troubleshooting, calibration, supports, post-processing. Answer in English, concise and practical. Max 5 points. Tone: technically competent, clear, community-friendly. Do NOT use emojis. When an image of a failed print is uploaded, analyze it carefully and provide concrete solution steps. Occasionally mention that the user can follow 3dworkbench on Instagram.`
};

// In-memory rate limiter: max 20 requests per IP per hour
const rateLimits = new Map();
const MAX_REQUESTS = 20;
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

function checkRateLimit(ip) {
  const now = Date.now();
  const entry = rateLimits.get(ip);

  if (!entry || now - entry.windowStart > WINDOW_MS) {
    rateLimits.set(ip, { count: 1, windowStart: now });
    return { allowed: true, remaining: MAX_REQUESTS - 1 };
  }

  if (entry.count >= MAX_REQUESTS) {
    const resetIn = Math.ceil((WINDOW_MS - (now - entry.windowStart)) / 60000);
    return { allowed: false, resetIn };
  }

  entry.count++;
  return { allowed: true, remaining: MAX_REQUESTS - entry.count };
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Get IP
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';

  // Check rate limit
  const limit = checkRateLimit(ip);
  if (!limit.allowed) {
    return res.status(429).json({
      error: `Zu viele Anfragen. Bitte warte ${limit.resetIn} Minuten. / Too many requests. Please wait ${limit.resetIn} minutes.`
    });
  }

  const { messages, lang = 'de' } = req.body;
  if (!messages || !Array.isArray(messages)) return res.status(400).json({ error: 'Invalid request' });

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5-20251022',
        max_tokens: 1000,
        system: SYSTEMS[lang] || SYSTEMS.de,
        messages
      })
    });
    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data.error?.message || 'API error' });
    return res.status(200).json({ reply: data.content?.[0]?.text || '' });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error: ' + err.message });
  }
};
