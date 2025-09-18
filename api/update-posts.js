import crypto from "crypto";
import FormData from "form-data";
import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = req.body; // массив постов
    const timestamp = Math.floor(Date.now() / 1000);
    const public_id = "posts";
    const resource_type = "raw";

    const string_to_sign = `public_id=${public_id}&resource_type=${resource_type}&timestamp=${timestamp}${process.env.CLOUDINARY_API_SECRET}`;
    const signature = crypto.createHash("sha1").update(string_to_sign).digest("hex");

    const formData = new FormData();
    formData.append("file", JSON.stringify(body, null, 2));
    formData.append("public_id", public_id);
    formData.append("resource_type", resource_type);
    formData.append("timestamp", timestamp);
    formData.append("api_key", process.env.CLOUDINARY_API_KEY);
    formData.append("signature", signature);
    formData.append("overwrite", "true");

    const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/${resource_type}/upload`, {
      method: "POST",
      body: formData
    });

    const data = await cloudRes.json();
    res.status(200).json({ success: true, cloudinary: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}
