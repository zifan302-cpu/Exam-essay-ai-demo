import { generatePostgraduateEssay, HttpError } from "../../server/generate-postgraduate-core.js";

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === "OPTIONS") {
    return json({}, 204);
  }

  if (request.method !== "POST") {
    return json({ error: "method_not_allowed" }, 405);
  }

  try {
    const input = await request.json();
    const result = await generatePostgraduateEssay(input, env);
    return json(result, 200);
  } catch (error) {
    if (error instanceof HttpError) {
      return json(error.payload, error.status);
    }

    return json(
      {
        error: "generation_failed",
        message: error instanceof Error ? error.message : String(error),
      },
      500,
    );
  }
}

function json(payload, status) {
  return new Response(status === 204 ? null : JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
