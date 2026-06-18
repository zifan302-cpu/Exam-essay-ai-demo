import { generatePostgraduateEssay, HttpError } from "../server/generate-postgraduate-core.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "method_not_allowed" });
  }

  try {
    const result = await generatePostgraduateEssay(parseBody(req.body));
    return res.status(200).json(result);
  } catch (error) {
    if (error instanceof HttpError) {
      return res.status(error.status).json(error.payload);
    }

    return res.status(500).json({
      error: "generation_failed",
      message: error instanceof Error ? error.message : String(error),
    });
  }
}

function parseBody(body) {
  if (!body) return {};
  if (typeof body === "string") {
    try {
      return JSON.parse(body);
    } catch {
      return {};
    }
  }
  return body;
}
