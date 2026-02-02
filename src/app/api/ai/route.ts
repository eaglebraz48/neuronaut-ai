import { NextResponse } from "next/server";
import { askNeuronaut } from "@/lib/ai";

export async function POST(req: Request) {
  const { prompt } = await req.json();

  const answer = await askNeuronaut(prompt);

  return NextResponse.json({ answer });
}
