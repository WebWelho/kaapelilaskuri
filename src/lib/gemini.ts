/**
 * Vertex AI Gemini client — europe-west4 only.
 * Vaatii GOOGLE_SERVICE_ACCOUNT_KEY env-muuttujan.
 */

import { VertexAI } from "@google-cloud/vertexai";

// EU-regional endpoint (GA, data residency taattu)
// 3.x preview vain global endpoint = ei EU data residency
const MODEL_NAME = "gemini-2.5-flash";

function createModel(modelName: string = MODEL_NAME) {
  const credJson = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!credJson) {
    throw new Error(
      "GOOGLE_SERVICE_ACCOUNT_KEY not configured — Vertex AI required",
    );
  }

  const credentials = JSON.parse(credJson);
  const vertex = new VertexAI({
    project: credentials.project_id,
    location: "global",
    apiEndpoint: "aiplatform.googleapis.com",
    googleAuthOptions: { credentials },
  });

  return vertex.getGenerativeModel({ model: modelName });
}

export async function generateContent(
  parts: Array<
    { text: string } | { inlineData: { data: string; mimeType: string } }
  >,
  options?: {
    temperature?: number;
    maxOutputTokens?: number;
  },
): Promise<string> {
  const { temperature = 0.3, maxOutputTokens = 8000 } = options ?? {};

  const model = createModel();
  const result = await model.generateContent({
    contents: [{ role: "user", parts }],
    generationConfig: { temperature, maxOutputTokens },
  });

  return (
    result.response?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? ""
  );
}
