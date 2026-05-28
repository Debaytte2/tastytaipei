// Webhook URL: https://tastytaipei-kb8h.vercel.app/api/line-webhook
// Set this in LINE Developers console → Messaging API channel → Webhook settings
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const events = req.body?.events || [];
  for (const event of events) {
    if (event.source?.userId) {
      console.log('LINE User ID:', event.source.userId);
    }
  }
  return res.status(200).end();
}
