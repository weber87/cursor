"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import { TrendingDown, TrendingUp, Minus, Scale } from "lucide-react";
import { RecommendationCard } from "@/components/RecommendationCard";

interface ReportData {
  dailyData: {
    date: string;
    label: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    mealCount: number;
    weight: number | null;
  }[];
  avgTotals: { calories: number; protein: number; carbs: number; fat: number };
  weightChange: number | null;
  totalMeals: number;
  daysLogged: number;
  goals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    targetWeight: number | null;
    startWeight: number | null;
  };
  weightHistory: { date: string; weight: number }[];
}

interface Recommendation {
  id: string;
  type: "success" | "warning" | "tip" | "goal";
  title: string;
  description: string;
}

export default function ProgressPage() {
  const [report, setReport] = useState<ReportData | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [weight, setWeight] = useState("");
  const [savingWeight, setSavingWeight] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const [reportRes, recsRes] = await Promise.all([
          fetch("/api/reports?days=7"),
          fetch("/api/recommendations"),
        ]);
        if (cancelled) return;
        setReport(await reportRes.json());
        const recsData = await recsRes.json();
        setRecommendations(recsData.recommendations || []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const refreshReport = async () => {
    const [reportRes, recsRes] = await Promise.all([
      fetch("/api/reports?days=7"),
      fetch("/api/recommendations"),
    ]);
    setReport(await reportRes.json());
    const recsData = await recsRes.json();
    setRecommendations(recsData.recommendations || []);
  };

  const logWeight = async () => {
    if (!weight) return;
    setSavingWeight(true);
    try {
      await fetch("/api/weight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weight: parseFloat(weight),
          date: format(new Date(), "yyyy-MM-dd"),
        }),
      });
      setWeight("");
      await refreshReport();
    } finally {
      setSavingWeight(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const goals = report?.goals || { calories: 2000, protein: 150, carbs: 250, fat: 65 };
  const avg = report?.avgTotals || { calories: 0, protein: 0, carbs: 0, fat: 0 };
  const weightChange = report?.weightChange;

  return (
    <div className="px-4 pt-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Progress</h1>
        <p className="text-sm text-muted">Your weekly nutrition report</p>
      </header>

      <div className="mb-6 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-card p-4 shadow-sm border border-border/50">
          <p className="text-xs text-muted">Avg Calories</p>
          <p className="mt-1 text-2xl font-bold">{Math.round(avg.calories)}</p>
          <p className="text-[10px] text-muted">Goal: {goals.calories}</p>
        </div>
        <div className="rounded-2xl bg-card p-4 shadow-sm border border-border/50">
          <p className="text-xs text-muted">Days Logged</p>
          <p className="mt-1 text-2xl font-bold">{report?.daysLogged || 0}/7</p>
          <p className="text-[10px] text-muted">{report?.totalMeals || 0} meals total</p>
        </div>
        <div className="rounded-2xl bg-card p-4 shadow-sm border border-border/50">
          <p className="text-xs text-muted">Avg Protein</p>
          <p className="mt-1 text-2xl font-bold">{Math.round(avg.protein)}g</p>
          <p className="text-[10px] text-muted">Goal: {goals.protein}g</p>
        </div>
        <div className="rounded-2xl bg-card p-4 shadow-sm border border-border/50">
          <p className="text-xs text-muted">Weight Change</p>
          <div className="mt-1 flex items-center gap-1">
            {weightChange != null ? (
              <>
                {weightChange < 0 ? (
                  <TrendingDown size={18} className="text-primary" />
                ) : weightChange > 0 ? (
                  <TrendingUp size={18} className="text-fat" />
                ) : (
                  <Minus size={18} className="text-muted" />
                )}
                <p className="text-2xl font-bold">
                  {weightChange > 0 ? "+" : ""}
                  {weightChange.toFixed(1)}
                </p>
              </>
            ) : (
              <p className="text-2xl font-bold text-muted">—</p>
            )}
          </div>
          <p className="text-[10px] text-muted">lbs this week</p>
        </div>
      </div>

      <div className="mb-6 rounded-2xl bg-card p-4 shadow-sm border border-border/50">
        <h2 className="mb-4 text-sm font-semibold">Daily Calories</h2>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={report?.dailyData || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="var(--muted)" />
              <YAxis tick={{ fontSize: 11 }} stroke="var(--muted)" />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid var(--border)",
                  fontSize: "12px",
                }}
              />
              <Bar
                dataKey="calories"
                fill="var(--primary)"
                radius={[6, 6, 0, 0]}
              />
              <Bar
                dataKey={() => goals.calories}
                fill="transparent"
                stroke="var(--muted)"
                strokeDasharray="4 4"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {(report?.weightHistory?.length ?? 0) > 0 && (
        <div className="mb-6 rounded-2xl bg-card p-4 shadow-sm border border-border/50">
          <h2 className="mb-4 text-sm font-semibold">Weight Trend</h2>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={report?.weightHistory || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10 }}
                  stroke="var(--muted)"
                  tickFormatter={(d) => format(new Date(d + "T12:00:00"), "M/d")}
                />
                <YAxis
                  domain={["dataMin - 2", "dataMax + 2"]}
                  tick={{ fontSize: 10 }}
                  stroke="var(--muted)"
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid var(--border)",
                    fontSize: "12px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  dot={{ fill: "var(--primary)", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="mb-6 rounded-2xl bg-card p-4 shadow-sm border border-border/50">
        <div className="mb-3 flex items-center gap-2">
          <Scale size={16} className="text-primary" />
          <h2 className="text-sm font-semibold">Log Weight</h2>
        </div>
        <div className="flex gap-2">
          <input
            type="number"
            step="0.1"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="Weight in lbs"
            className="flex-1 rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <button
            onClick={logWeight}
            disabled={!weight || savingWeight}
            className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            {savingWeight ? "..." : "Save"}
          </button>
        </div>
      </div>

      {recommendations.length > 0 && (
        <div className="mb-6 space-y-3">
          <h2 className="text-sm font-semibold">AI Recommendations</h2>
          {recommendations.map((rec) => (
            <RecommendationCard key={rec.id} {...rec} />
          ))}
        </div>
      )}
    </div>
  );
}
