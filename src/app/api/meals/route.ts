import { NextResponse } from "next/server";
import { getOrCreateUser, prisma, todayString, sumMacros } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date") || todayString();
  const user = await getOrCreateUser();

  const meals = await prisma.meal.findMany({
    where: { userId: user.id, date },
    orderBy: { createdAt: "asc" },
  });

  const totals = sumMacros(meals);

  return NextResponse.json({
    date,
    meals,
    totals,
    goals: {
      calories: user.calorieGoal,
      protein: user.proteinGoal,
      carbs: user.carbsGoal,
      fat: user.fatGoal,
    },
  });
}

export async function POST(request: Request) {
  const user = await getOrCreateUser();
  const body = await request.json();

  const meal = await prisma.meal.create({
    data: {
      name: body.name,
      calories: Math.round(body.calories),
      protein: body.protein ?? 0,
      carbs: body.carbs ?? 0,
      fat: body.fat ?? 0,
      mealType: body.mealType || "snack",
      source: body.source || "manual",
      imageUrl: body.imageUrl || null,
      notes: body.notes || null,
      date: body.date || todayString(),
      userId: user.id,
    },
  });

  return NextResponse.json(meal, { status: 201 });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await prisma.meal.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
