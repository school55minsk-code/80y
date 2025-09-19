import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const body = req.body; // array of posts
    const fileContent = JSON.stringify(body, null, 2);

    // 1) Login to Icedrive to get session token
    const tokenRes = await fetch("https://api.icedrive.net/v1/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: process.env.ICEDRIVE_USERNAME,
        password: process.env.ICEDRIVE_PASSWORD
      })
    });
    const tokenData = await tokenRes.json();
    if (!tokenRes.ok) return res.status(500).json({ error: "Icedrive login failed", details: tokenData });
    const token = tokenData?.data?.session_token;

    // 2) Update file content (base64-encoded)
    const uploadRes = await fetch("https://api.icedrive.net/v1/file/edit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        file_id: process.env.ICEDRIVE_FILE_ID,
        content: Buffer.from(fileContent).toString("base64")
      })
    });
    const uploadData = await uploadRes.json();
    if (!uploadRes.ok) return res.status(500).json({ error: "Icedrive edit failed", details: uploadData });

    return res.status(200).json({ success: true, icedrive: uploadData });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}
