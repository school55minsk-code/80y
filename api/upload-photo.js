import { put } from "@vercel/blob";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Метод не разрешён" });
  }

  try {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    // токен автоматически берётся из process.env.BLOB_READ_WRITE_TOKEN
    const blob = await put(`photo-${Date.now()}.jpg`, buffer, { access: "public" });

    res.status(200).json({ url: blob.url });
  } catch (err) {
    console.error("Ошибка загрузки:", err);
    res.status(500).json({ error: "Ошибка загрузки файла" });
  }
}
