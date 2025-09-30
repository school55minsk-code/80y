import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  try {
    let posts = await kv.get('posts');
    if (!posts) posts = []; // если в базе пусто
    res.status(200).json(posts);
  } catch (err) {
    console.error("KV error:", err);
    res.status(500).json({ error: 'Ошибка чтения из KV' });
  }
}
