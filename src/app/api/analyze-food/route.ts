import { NextResponse } from "next/server";
import { analyzeFoodImage } from "@/lib/ai";

export async function POST(request: Request) {
  const body = await request.json();
  const { image } = body;

  if (!image) {
    return NextResponse.json({ error: "Image required" }, { status: 400 });
  }

  const analysis = await analyzeFoodImage(image);
  return NextResponse.json(analysis);
}
