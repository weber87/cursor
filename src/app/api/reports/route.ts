import { NextResponse } from "next/server";
import { getOrCreateUser, prisma, sumMacros } from "@/lib/db";
import { subDays, format, eachDayOfInterval } from "date-fns";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get("days") || "7");
  const user = await getOrCreateUser();

  const endDate = new Date();
  const startDate = subDays(endDate, days - 1);
  const dateRange = eachDayOfInterval({ start: startDate, end: endDate });
  const dateStrings = dateRange.map((d) => format(d, "yyyy-MM-dd"));

  const meals = await prisma.meal.findMany({
    where: {
      userId: user.id,
      date: { in: dateStrings },
    },
  });

  const weightEntries = await prisma.weightEntry.findMany({
    where: {
      userId: user.id,
      date: { in: dateStrings },
    },
    orderBy: { date: "asc" },
  });

  const dailyData = dateStrings.map((date) => {
    const dayMeals = meals.filter((m) => m.date === date);
    const totals = sumMacros(dayMeals);
    const weight = weightEntries.find((w) => w.date === date);
    return {
      date,
      label: format(new Date(date + "T12:00:00"), "EEE"),
      ...totals,
      mealCount: dayMeals.length,
      weight: weight?.weight ?? null,
    };
  });

  const daysWithMeals = dailyData.filter((d) => d.mealCount > 0);
  const avgTotals =
    daysWithMeals.length > 0
      ? {
          calories: daysWithMeals.reduce((s, d) => s + d.calories, 0) / daysWithMeals.length,
          protein: daysWithMeals.reduce((s, d) => s + d.protein, 0) / daysWithMeals.length,
          carbs: daysWithMeals.reduce((s, d) => s + d.carbs, 0) / daysWithMeals.length,
          fat: daysWithMeals.reduce((s, d) => s + d.fat, 0) / daysWithMeals.length,
        }
      : { calories: 0, protein: 0, carbs: 0, fat: 0 };

  const weights = weightEntries.map((w) => w.weight);
  const weightChange =
    weights.length >= 2 ? weights[weights.length - 1] - weights[0] : null;

  const totalMeals = meals.length;
  const mealTypeDistribution = meals.reduce(
    (acc, m) => {
      acc[m.mealType] = (acc[m.mealType] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return NextResponse.json({
    dailyData,
    avgTotals,
    weightChange,
    totalMeals,
    daysLogged: daysWithMeals.length,
    mealTypeDistribution,
    goals: {
      calories: user.calorieGoal,
      protein: user.proteinGoal,
      carbs: user.carbsGoal,
      fat: user.fatGoal,
      targetWeight: user.targetWeight,
      startWeight: user.startWeight,
    },
    weightHistory: await prisma.weightEntry.findMany({
      where: { userId: user.id },
      orderBy: { date: "asc" },
    }),
  });
}
