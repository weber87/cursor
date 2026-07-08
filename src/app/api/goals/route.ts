import { NextResponse } from "next/server";
import { getOrCreateUser, prisma } from "@/lib/db";

export async function GET() {
  const user = await getOrCreateUser();

  const goals = await prisma.userProfile.findUnique({
    where: { id: user.id },
    select: {
      calorieGoal: true,
      proteinGoal: true,
      carbsGoal: true,
      fatGoal: true,
      targetWeight: true,
      startWeight: true,
      name: true,
    },
  });

  return NextResponse.json(goals);
}

export async function PUT(request: Request) {
  const user = await getOrCreateUser();
  const body = await request.json();

  const updated = await prisma.userProfile.update({
    where: { id: user.id },
    data: {
      ...(body.calorieGoal !== undefined && { calorieGoal: body.calorieGoal }),
      ...(body.proteinGoal !== undefined && { proteinGoal: body.proteinGoal }),
      ...(body.carbsGoal !== undefined && { carbsGoal: body.carbsGoal }),
      ...(body.fatGoal !== undefined && { fatGoal: body.fatGoal }),
      ...(body.targetWeight !== undefined && { targetWeight: body.targetWeight }),
      ...(body.startWeight !== undefined && { startWeight: body.startWeight }),
      ...(body.name !== undefined && { name: body.name }),
    },
  });

  return NextResponse.json(updated);
}

export async function POST(request: Request) {
  const user = await getOrCreateUser();
  const body = await request.json();

  const { calorieGoal, proteinGoal, carbsGoal, fatGoal, activityLevel, goal } = body;

  let calculatedCalories = calorieGoal;
  if (!calculatedCalories && body.weight && body.height && body.age && body.sex) {
    const bmr =
      body.sex === "male"
        ? 10 * body.weight + 6.25 * body.height - 5 * body.age + 5
        : 10 * body.weight + 6.25 * body.height - 5 * body.age - 161;

    const multipliers: Record<string, number> = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9,
    };
    const tdee = bmr * (multipliers[activityLevel] || 1.55);

    if (goal === "lose") calculatedCalories = Math.round(tdee - 500);
    else if (goal === "gain") calculatedCalories = Math.round(tdee + 300);
    else calculatedCalories = Math.round(tdee);
  }

  const protein = proteinGoal || Math.round((calculatedCalories * 0.3) / 4);
  const carbs = carbsGoal || Math.round((calculatedCalories * 0.4) / 4);
  const fat = fatGoal || Math.round((calculatedCalories * 0.3) / 9);

  const updated = await prisma.userProfile.update({
    where: { id: user.id },
    data: {
      calorieGoal: calculatedCalories || user.calorieGoal,
      proteinGoal: protein,
      carbsGoal: carbs,
      fatGoal: fat,
      ...(body.targetWeight && { targetWeight: body.targetWeight }),
      ...(body.startWeight && { startWeight: body.startWeight }),
    },
  });

  return NextResponse.json(updated);
}
