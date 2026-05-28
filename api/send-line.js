export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { lineMsg } = req.body;
  const TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  const USER_ID = process.env.LINE_USER_ID;
  if (!TOKEN || !USER_ID) return res.status(200).json({ ok: true, note: 'LINE not configured' });
  const r = await fetch('https://api.line.me/v2/bot/message/push', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${TOKEN}` },
    body: JSON.stringify({ to: USER_ID, messages: [{ type: 'text', text: lineMsg }] })
  });
  const data = await r.json();
  return res.status(200).json({ ok: r.ok, data });
}
