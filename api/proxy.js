// Vercel serverless function to proxy API requests
// Uses CommonJS for better Vercel compatibility

module.exports = async function handler(req, res) {
  // Enable CORS
  const origin = req.headers.origin;
  const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://sentra-wheat.vercel.app",
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
  ].filter(Boolean);

  if (allowedOrigins.includes(origin) || process.env.NODE_ENV === "development") {
    res.setHeader("Access-Control-Allow-Origin", origin || "*");
  }

  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept, Origin");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Max-Age", "86400");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  try {
    const { path } = req.query;
    const apiPath = Array.isArray(path) ? path.join("/") : path || "";

    const API_BASE_URL = "http://cvm.groupngs.com:8080/api/database-service";
    const targetUrl = `${API_BASE_URL}/${apiPath}`;

    console.log("Proxy request:", {
      method: req.method,
      apiPath,
      targetUrl,
    });

    // Prepare headers
    const headers = {
      "Content-Type": "application/json",
    };

    if (req.headers.authorization) {
      headers["Authorization"] = req.headers.authorization;
    }

    // Prepare body
    let body = undefined;
    if (req.method !== "GET" && req.method !== "HEAD" && req.body) {
      body = JSON.stringify(req.body);
    }

    // Forward the request
    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
    });

    // Handle response
    let data;
    const responseContentType = response.headers.get("content-type");

    if (responseContentType && responseContentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    res.status(response.status);

    if (typeof data === "string") {
      res.send(data);
    } else {
      res.json(data);
    }
  } catch (error) {
    console.error("Proxy error:", error);
    res.status(500).json({
      error: "Proxy request failed",
      message: error.message,
    });
  }
};
