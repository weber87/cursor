export const MEAL_TYPES = [
  { value: "breakfast", label: "Breakfast", icon: "🌅" },
  { value: "lunch", label: "Lunch", icon: "☀️" },
  { value: "dinner", label: "Dinner", icon: "🌙" },
  { value: "snack", label: "Snack", icon: "🍎" },
] as const;

export type MealType = (typeof MEAL_TYPES)[number]["value"];

export interface MacroTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export function sumMacros(
  meals: { calories: number; protein: number; carbs: number; fat: number }[]
): MacroTotals {
  return meals.reduce(
    (acc, m) => ({
      calories: acc.calories + m.calories,
      protein: acc.protein + m.protein,
      carbs: acc.carbs + m.carbs,
      fat: acc.fat + m.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
}

export function todayString() {
  return new Date().toISOString().split("T")[0];
}

export function formatDate(date: Date) {
  return date.toISOString().split("T")[0];
}
