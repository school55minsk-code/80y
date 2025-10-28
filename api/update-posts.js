import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Метод не разрешён' });
  }

  try {
    let posts = req.body; // массив постов

    // каждому посту гарантируем наличие id
    posts = posts.map(p => ({
      ...p,
      id: p.id || crypto.randomUUID()
    }));

    await kv.set('posts', posts);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("KV error:", err);
    res.status(500).json({ error: 'Ошибка записи в KV' });
  }
}
