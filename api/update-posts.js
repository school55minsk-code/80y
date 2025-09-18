import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = req.body; // массив постов
    const fileContent = JSON.stringify(body, null, 2);

    // Получаем access_token Icedrive
    const tokenRes = await fetch("https://api.icedrive.net/v1/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: process.env.ICEDRIVE_USERNAME,
        password: process.env.ICEDRIVE_PASSWORD
      })
    });
    const tokenData = await tokenRes.json();
    const token = tokenData.data.session_token;

    // Загружаем файл
    const uploadRes = await fetch("https://api.icedrive.net/v1/file/upload", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        file_id: process.env.ICEDRIVE_FILE_ID, // ID файла posts.json
        content: Buffer.from(fileContent).toString("base64")
      })
    });

    const uploadData = await uploadRes.json();
    res.status(200).json({ success: true, icedrive: uploadData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}
