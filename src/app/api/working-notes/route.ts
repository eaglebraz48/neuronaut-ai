import { NextResponse } from 'next/server';

/*
  This endpoint stores HIGH-LEVEL working notes only.
  No dates, no commitments, no plans.
*/

type WorkingNote = {
  id: string;
  text: string;
};

let notes: WorkingNote[] = [];

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ notes }, { status: 200 });
    }

    const note: WorkingNote = {
      id: crypto.randomUUID(),
      text,
    };

    notes = [note, ...notes].slice(0, 6); // cap notes

    return NextResponse.json({ notes }, { status: 200 });
  } catch {
    return NextResponse.json({ notes }, { status: 200 });
  }
}

export async function GET() {
  return NextResponse.json({ notes }, { status: 200 });
}
