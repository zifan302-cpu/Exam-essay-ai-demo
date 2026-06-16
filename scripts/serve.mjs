import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import generatePostgraduate from "../api/generate-postgraduate.js";

const root = fileURLToPath(new URL("..", import.meta.url));
const requestedDir = process.argv[2] || "demo";
const port = Number(process.argv[3] || process.env.PORT || 4173);
const baseDir = join(root, requestedDir);

const types = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".pdf": "application/pdf",
  ".svg": "image/svg+xml; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
};

const server = createServer(async (request, response) => {
  const url = new URL(request.url || "/", `http://localhost:${port}`);

  if (url.pathname === "/api/generate-postgraduate") {
    await handleApi(request, response);
    return;
  }

  const cleanPath = normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, "");
  let filePath = join(baseDir, cleanPath);

  if (!existsSync(filePath) || statSync(filePath).isDirectory()) {
    filePath = join(baseDir, "index.html");
  }

  if (!filePath.startsWith(baseDir) || !existsSync(filePath)) {
    response.writeHead(404);
    response.end("Not found");
    return;
  }

  response.writeHead(200, {
    "Content-Type": types[extname(filePath)] || "application/octet-stream",
  });
  createReadStream(filePath).pipe(response);
});

server.listen(port, () => {
  console.log(`Serving ${requestedDir} at http://localhost:${port}`);
});

async function handleApi(request, response) {
  try {
    request.body = await readJsonBody(request);
    const vercelResponse = createVercelResponse(response);
    await generatePostgraduate(request, vercelResponse);
  } catch (error) {
    response.writeHead(500, { "Content-Type": "application/json; charset=utf-8" });
    response.end(
      JSON.stringify({
        error: "local_api_error",
        message: error instanceof Error ? error.message : String(error),
      }),
    );
  }
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let raw = "";
    request.on("data", (chunk) => {
      raw += chunk;
    });
    request.on("end", () => {
      if (!raw) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch (error) {
        reject(error);
      }
    });
    request.on("error", reject);
  });
}

function createVercelResponse(response) {
  return {
    status(code) {
      response.statusCode = code;
      return this;
    },
    json(payload) {
      if (!response.headersSent) {
        response.setHeader("Content-Type", "application/json; charset=utf-8");
      }
      response.end(JSON.stringify(payload));
      return this;
    },
  };
}
