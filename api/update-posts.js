import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Метод не разрешён" });
  }

  try {
    const body = req.body; // массив постов
    const fileContent = JSON.stringify(body, null, 2);

    // 1. Логинимся в Icedrive, чтобы получить session_token
    const tokenRes = await fetch("https://api.icedrive.net/v1/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: process.env.ICEDRIVE_USERNAME,
        password: process.env.ICEDRIVE_PASSWORD
      })
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData?.data?.session_token) {
      return res.status(500).json({ error: "Ошибка авторизации в Icedrive", details: tokenData });
    }
    const token = tokenData.data.session_token;

    // 2. Обновляем файл posts.json
    const uploadRes = await fetch("https://api.icedrive.net/v1/file/edit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        file_id: process.env.ICEDRIVE_FILE_ID, // ID файла posts.json
        content: Buffer.from(fileContent).toString("base64") // содержимое в base64
      })
    });

    const uploadData = await uploadRes.json();
    if (!uploadRes.ok) {
      return res.status(500).json({ error: "Ошибка обновления файла в Icedrive", details: uploadData });
    }

    return res.status(200).json({ success: true, icedrive: uploadData });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
}
