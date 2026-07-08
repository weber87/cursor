import { NextResponse } from "next/server";
import { getOrCreateUser, prisma } from "@/lib/db";

export async function GET() {
  const user = await getOrCreateUser();

  const entries = await prisma.weightEntry.findMany({
    where: { userId: user.id },
    orderBy: { date: "asc" },
  });

  return NextResponse.json(entries);
}

export async function POST(request: Request) {
  const user = await getOrCreateUser();
  const body = await request.json();
  const { weight, date, notes } = body;

  if (!weight || !date) {
    return NextResponse.json({ error: "Weight and date required" }, { status: 400 });
  }

  const entry = await prisma.weightEntry.upsert({
    where: { userId_date: { userId: user.id, date } },
    update: { weight, notes: notes || null },
    create: { weight, date, notes: notes || null, userId: user.id },
  });

  if (!user.startWeight) {
    await prisma.userProfile.update({
      where: { id: user.id },
      data: { startWeight: weight },
    });
  }

  return NextResponse.json(entry, { status: 201 });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await prisma.weightEntry.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
