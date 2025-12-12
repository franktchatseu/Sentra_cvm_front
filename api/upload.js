// Vercel serverless function for file uploads
// Uses CommonJS for better Vercel compatibility

const formidable = require('formidable');
const fs = require('fs');
const FormData = require('form-data');

module.exports = async function handler(req, res) {
  // Enable CORS
  const origin = req.headers.origin;
  res.setHeader("Access-Control-Allow-Origin", origin || "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    // Parse the multipart form data
    const form = formidable({
      maxFileSize: 50 * 1024 * 1024, // 50MB
      keepExtensions: true,
    });

    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve([fields, files]);
      });
    });

    console.log("Upload request received:", {
      fields: Object.keys(fields),
      files: Object.keys(files),
    });

    // Get the endpoint from query params
    const { endpoint } = req.query;
    if (!endpoint) {
      res.status(400).json({ error: "Missing endpoint parameter" });
      return;
    }

    const API_BASE_URL = "http://cvm.groupngs.com:8080/api/database-service";
    const targetUrl = `${API_BASE_URL}/${endpoint}`;

    // Create a new FormData to send to the backend
    const formData = new FormData();

    // Add all fields
    for (const [key, value] of Object.entries(fields)) {
      const val = Array.isArray(value) ? value[0] : value;
      formData.append(key, val || '');
    }

    // Add all files
    for (const [key, fileArray] of Object.entries(files)) {
      const file = Array.isArray(fileArray) ? fileArray[0] : fileArray;
      if (file && file.filepath) {
        formData.append(key, fs.createReadStream(file.filepath), {
          filename: file.originalFilename || file.newFilename,
          contentType: file.mimetype,
        });
      }
    }

    // Prepare headers
    const headers = {
      ...formData.getHeaders(),
    };

    if (req.headers.authorization) {
      headers["Authorization"] = req.headers.authorization;
    }

    console.log("Forwarding to:", targetUrl);

    // Forward to backend
    const response = await fetch(targetUrl, {
      method: "POST",
      headers,
      body: formData,
    });

    const responseText = await response.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      data = responseText;
    }

    console.log("Backend response status:", response.status);

    res.status(response.status);
    if (typeof data === "string") {
      res.send(data);
    } else {
      res.json(data);
    }
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({
      error: "Upload failed",
      message: error.message,
    });
  }
};

module.exports.config = {
  api: {
    bodyParser: false,
  },
};
