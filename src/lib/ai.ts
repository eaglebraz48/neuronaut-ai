import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.AZURE_OPENAI_KEY,
  baseURL: process.env.AZURE_OPENAI_ENDPOINT, // Azure endpoint
  defaultQuery: { "api-version": "2024-02-15-preview" },
  defaultHeaders: {
    "api-key": process.env.AZURE_OPENAI_KEY,
  },
});

export async function askNeuronaut(prompt: string) {
  const res = await client.chat.completions.create({
    model: "gpt-4o-mini", // your Azure deployment name
    messages: [{ role: "user", content: prompt }],
    temperature: 0.6,
  });

  return res.choices[0].message.content;
}
