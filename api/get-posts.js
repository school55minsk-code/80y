import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  try {
    let posts = await kv.get('posts');
    if (!posts) posts = [];

    // На всякий случай: если в старых постах нет id — добавим
    posts = posts.map(p => ({
      ...p,
      id: p.id || crypto.randomUUID()
    }));

    res.status(200).json(posts);
  } catch (err) {
    console.error("KV error:", err);
    res.status(500).json({ error: 'Ошибка чтения из KV' });
  }
}

