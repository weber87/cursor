import { NextResponse } from "next/server";
import { getOrCreateUser, prisma, sumMacros } from "@/lib/db";
import { generateRecommendations } from "@/lib/ai";
import { subDays, format, eachDayOfInterval } from "date-fns";

export async function GET() {
  const user = await getOrCreateUser();
  const days = 7;

  const endDate = new Date();
  const startDate = subDays(endDate, days - 1);
  const dateRange = eachDayOfInterval({ start: startDate, end: endDate });
  const dateStrings = dateRange.map((d) => format(d, "yyyy-MM-dd"));

  const meals = await prisma.meal.findMany({
    where: { userId: user.id, date: { in: dateStrings } },
  });

  const weightEntries = await prisma.weightEntry.findMany({
    where: { userId: user.id, date: { in: dateStrings } },
    orderBy: { date: "asc" },
  });

  const daysWithMeals = dateStrings.filter((date) =>
    meals.some((m) => m.date === date)
  );

  const dailyCalories = daysWithMeals.map((date) => {
    const dayMeals = meals.filter((m) => m.date === date);
    return sumMacros(dayMeals).calories;
  });

  const avgCalories =
    dailyCalories.length > 0
      ? dailyCalories.reduce((a, b) => a + b, 0) / dailyCalories.length
      : 0;

  const allTotals = sumMacros(meals);
  const avgProtein = daysWithMeals.length > 0 ? allTotals.protein / daysWithMeals.length : 0;
  const avgCarbs = daysWithMeals.length > 0 ? allTotals.carbs / daysWithMeals.length : 0;
  const avgFat = daysWithMeals.length > 0 ? allTotals.fat / daysWithMeals.length : 0;

  const mealTypeDistribution = meals.reduce(
    (acc, m) => {
      acc[m.mealType] = (acc[m.mealType] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const weights = weightEntries.map((w) => w.weight);
  const weightChange =
    weights.length >= 2 ? weights[weights.length - 1] - weights[0] : null;

  const recommendations = generateRecommendations({
    avgCalories,
    calorieGoal: user.calorieGoal,
    avgProtein,
    proteinGoal: user.proteinGoal,
    avgCarbs,
    carbsGoal: user.carbsGoal,
    avgFat,
    fatGoal: user.fatGoal,
    daysLogged: daysWithMeals.length,
    weightChange,
    targetWeight: user.targetWeight,
    mealTypeDistribution,
  });

  return NextResponse.json({ recommendations });
}
