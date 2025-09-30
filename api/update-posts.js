import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Метод не разрешён' });

  try {
    const posts = req.body; // массив постов
    await redis.set('posts', posts);
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка записи в Redis' });
  }
}
