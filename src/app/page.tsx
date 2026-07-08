"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Plus, Sparkles } from "lucide-react";
import { CalorieRing } from "@/components/CalorieRing";
import { MacroBar } from "@/components/MacroBar";
import { MealCard } from "@/components/MealCard";
import { DatePicker } from "@/components/DatePicker";
import { RecommendationCard } from "@/components/RecommendationCard";

interface DiaryData {
  date: string;
  meals: {
    id: string;
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    mealType: string;
    source: string;
  }[];
  totals: { calories: number; protein: number; carbs: number; fat: number };
  goals: { calories: number; protein: number; carbs: number; fat: number };
}

interface Recommendation {
  id: string;
  type: "success" | "warning" | "tip" | "goal";
  title: string;
  description: string;
}

export default function HomePage() {
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [data, setData] = useState<DiaryData | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const [diaryRes, recsRes] = await Promise.all([
          fetch(`/api/meals?date=${date}`),
          fetch("/api/recommendations"),
        ]);
        if (cancelled) return;
        setData(await diaryRes.json());
        const recsData = await recsRes.json();
        setRecommendations(recsData.recommendations?.slice(0, 2) || []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [date]);

  const refreshDiary = async () => {
    const diaryRes = await fetch(`/api/meals?date=${date}`);
    setData(await diaryRes.json());
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/meals?id=${id}`, { method: "DELETE" });
    await refreshDiary();
  };

  if (loading && !data) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const totals = data?.totals || { calories: 0, protein: 0, carbs: 0, fat: 0 };
  const goals = data?.goals || { calories: 2000, protein: 150, carbs: 250, fat: 65 };
  const meals = data?.meals || [];

  return (
    <div className="px-4 pt-6">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Nutri<span className="text-primary">AI</span>
          </h1>
          <p className="text-xs text-muted">Your smart nutrition companion</p>
        </div>
        <Link
          href="/log"
          className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-transform hover:scale-105 active:scale-95"
        >
          <Plus size={16} />
          Log Meal
        </Link>
      </header>

      <DatePicker date={date} onChange={setDate} />

      <div className="mt-6 flex justify-center">
        <CalorieRing consumed={totals.calories} goal={goals.calories} />
      </div>

      <div className="mt-6 space-y-3 rounded-2xl bg-card p-5 shadow-sm border border-border/50">
        <h2 className="text-sm font-semibold">Macronutrients</h2>
        <MacroBar label="Protein" current={totals.protein} goal={goals.protein} color="var(--protein)" />
        <MacroBar label="Carbs" current={totals.carbs} goal={goals.carbs} color="var(--carbs)" />
        <MacroBar label="Fat" current={totals.fat} goal={goals.fat} color="var(--fat)" />
      </div>

      {recommendations.length > 0 && (
        <div className="mt-6 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-primary" />
            <h2 className="text-sm font-semibold">AI Insights</h2>
          </div>
          {recommendations.map((rec) => (
            <RecommendationCard key={rec.id} {...rec} />
          ))}
        </div>
      )}

      <div className="mt-6 mb-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold">
            Meals {meals.length > 0 && `(${meals.length})`}
          </h2>
        </div>

        {meals.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-border p-8 text-center">
            <p className="text-4xl mb-2">🍽️</p>
            <p className="font-medium text-sm">No meals logged yet</p>
            <p className="mt-1 text-xs text-muted">
              Tap &quot;Log Meal&quot; to add food manually or snap a photo
            </p>
            <Link
              href="/log"
              className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary-light px-4 py-2 text-sm font-medium text-primary-dark"
            >
              <Plus size={14} />
              Get started
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {meals.map((meal) => (
              <MealCard key={meal.id} meal={meal} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
