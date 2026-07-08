import { Trash2, Camera, PenLine } from "lucide-react";
import { MEAL_TYPES } from "@/lib/constants";

interface Meal {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  mealType: string;
  source: string;
}

interface MealCardProps {
  meal: Meal;
  onDelete?: (id: string) => void;
}

export function MealCard({ meal, onDelete }: MealCardProps) {
  const typeInfo = MEAL_TYPES.find((t) => t.value === meal.mealType);

  return (
    <div className="animate-fade-in flex items-center gap-3 rounded-2xl bg-card p-4 shadow-sm border border-border/50">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-light text-lg">
        {typeInfo?.icon || "🍽️"}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate font-semibold text-sm">{meal.name}</h3>
          {meal.source === "photo" ? (
            <Camera size={12} className="shrink-0 text-primary" />
          ) : (
            <PenLine size={12} className="shrink-0 text-muted" />
          )}
        </div>
        <p className="text-xs text-muted capitalize">
          {typeInfo?.label || meal.mealType} · P {Math.round(meal.protein)}g · C {Math.round(meal.carbs)}g · F {Math.round(meal.fat)}g
        </p>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold text-primary">{meal.calories}</span>
        {onDelete && (
          <button
            onClick={() => onDelete(meal.id)}
            className="rounded-lg p-1.5 text-muted transition-colors hover:bg-red-50 hover:text-red-500"
            aria-label="Delete meal"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
