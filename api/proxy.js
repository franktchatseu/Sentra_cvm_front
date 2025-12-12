// Vercel serverless function to proxy API requests
// Supports both JSON and multipart/form-data (file uploads)

export const config = {
  api: {
    bodyParser: false, // Disable body parsing to handle raw body for file uploads
  },
};

export default async function handler(req, res) {
  // Enable CORS with more specific headers
  const origin = req.headers.origin;
  const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://sentra-wheat.vercel.app",
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
  ].filter(Boolean);

  if (
    allowedOrigins.includes(origin) ||
    process.env.NODE_ENV === "development"
  ) {
    res.setHeader("Access-Control-Allow-Origin", origin || "*");
  }

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS, PATCH"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With, Accept, Origin"
  );
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
      contentType: req.headers["content-type"],
    });

    // Check if this is a multipart/form-data request (file upload)
    const contentType = req.headers["content-type"] || "";
    const isMultipart = contentType.includes("multipart/form-data");

    // Prepare headers for the backend request
    const headers = {};

    // Forward authorization header if present
    if (req.headers.authorization) {
      headers["Authorization"] = req.headers.authorization;
    }

    let body = undefined;

    if (req.method !== "GET" && req.method !== "HEAD") {
      if (isMultipart) {
        // For multipart requests, forward the raw body and content-type
        headers["Content-Type"] = contentType;
        body = await getRawBody(req);
      } else {
        // For JSON requests, parse and stringify
        headers["Content-Type"] = "application/json";
        const jsonBody = await getJsonBody(req);
        if (jsonBody) {
          body = JSON.stringify(jsonBody);
        }
      }
    }

    // Forward the request
    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
    });

    // Handle different response types
    let data;
    const responseContentType = response.headers.get("content-type");

    if (responseContentType && responseContentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // Forward response status and data
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
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
}

// Helper function to get raw body for multipart requests
async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

// Helper function to get JSON body
async function getJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      if (body) {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          resolve(null);
        }
      } else {
        resolve(null);
      }
    });
    req.on("error", reject);
  });
}
