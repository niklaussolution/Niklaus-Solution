import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { url } = req.query;

  if (!url || typeof url !== 'string') {
    res.status(400).json({ error: 'Missing url parameter' });
    return;
  }

  try {
    const apiUrl = `https://is.gd/create.php?format=simple&url=${encodeURIComponent(url)}`;
    const response = await fetch(apiUrl, {
      headers: { 'User-Agent': 'NiklausSolutions/1.0' },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      throw new Error(`is.gd responded with ${response.status}`);
    }

    const shortUrl = (await response.text()).trim();

    if (!shortUrl.startsWith('https://is.gd/') && !shortUrl.startsWith('http://is.gd/')) {
      throw new Error('Unexpected response from is.gd');
    }

    res.status(200).json({ shortUrl });
  } catch (err: any) {
    console.error('[shorten] Error:', err.message);
    res.status(500).json({ error: 'Failed to shorten URL', detail: err.message });
  }
}