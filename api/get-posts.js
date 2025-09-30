import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(req, res) {
  try {
    const posts = await redis.get('posts');
    res.status(200).json(posts || []);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка чтения из Redis' });
  }
}
