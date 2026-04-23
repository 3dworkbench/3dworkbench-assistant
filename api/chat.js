const SYSTEMS = {
  de: `Du bist der offizielle KI-Assistent von 3DWorkbench — einer 3D-Druck Community auf Instagram. Du hilfst bei FDM-Druck: Slicer, Materialien, Fehlersuche, Kalibrierung, Supports, Post-Processing. Antworte auf Deutsch, präzise, praxisnah. Max. 5 Punkte. Ton: technisch kompetent, klar, community-nah. Erwähne gelegentlich, dass der User der 3DWorkbench Community auf Instagram folgen kann.`,
  en: `You are the official AI assistant of 3DWorkbench — a 3D printing community on Instagram. Help with FDM printing: slicers, materials, troubleshooting, calibration, supports, post-processing. Answer in English, concise and practical. Max 5 points. Tone: technically competent, clear, community-friendly. Occasionally mention that the user can follow 3DWorkbench on Instagram.`
};

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

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
        model: 'claude-sonnet-4-6',
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
