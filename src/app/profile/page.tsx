"use client";

import { useEffect, useState } from "react";
import { Save, Target, Calculator } from "lucide-react";

interface Goals {
  name: string;
  calorieGoal: number;
  proteinGoal: number;
  carbsGoal: number;
  fatGoal: number;
  targetWeight: number | null;
  startWeight: number | null;
}

export default function ProfilePage() {
  const [goals, setGoals] = useState<Goals | null>(null);
  const [form, setForm] = useState({
    name: "",
    calorieGoal: "2000",
    proteinGoal: "150",
    carbsGoal: "250",
    fatGoal: "65",
    targetWeight: "",
  });
  const [calculator, setCalculator] = useState({
    weight: "",
    height: "",
    age: "",
    sex: "male",
    activityLevel: "moderate",
    goal: "maintain",
  });
  const [showCalculator, setShowCalculator] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/goals")
      .then((r) => r.json())
      .then((data) => {
        setGoals(data);
        setForm({
          name: data.name || "",
          calorieGoal: String(data.calorieGoal),
          proteinGoal: String(data.proteinGoal),
          carbsGoal: String(data.carbsGoal),
          fatGoal: String(data.fatGoal),
          targetWeight: data.targetWeight ? String(data.targetWeight) : "",
        });
      });
  }, []);

  const saveGoals = async () => {
    setSaving(true);
    try {
      await fetch("/api/goals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          calorieGoal: parseInt(form.calorieGoal),
          proteinGoal: parseInt(form.proteinGoal),
          carbsGoal: parseInt(form.carbsGoal),
          fatGoal: parseInt(form.fatGoal),
          targetWeight: form.targetWeight ? parseFloat(form.targetWeight) : null,
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const calculateGoals = async () => {
    const res = await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        weight: parseFloat(calculator.weight),
        height: parseFloat(calculator.height),
        age: parseInt(calculator.age),
        sex: calculator.sex,
        activityLevel: calculator.activityLevel,
        goal: calculator.goal,
        targetWeight: form.targetWeight ? parseFloat(form.targetWeight) : undefined,
        startWeight: parseFloat(calculator.weight),
      }),
    });
    const data = await res.json();
    setForm({
      ...form,
      calorieGoal: String(data.calorieGoal),
      proteinGoal: String(data.proteinGoal),
      carbsGoal: String(data.carbsGoal),
      fatGoal: String(data.fatGoal),
    });
    setShowCalculator(false);
  };

  return (
    <div className="px-4 pt-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Profile & Goals</h1>
        <p className="text-sm text-muted">Customize your nutrition targets</p>
      </header>

      <div className="mb-6 rounded-2xl bg-gradient-to-br from-primary to-primary-dark p-6 text-white">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 text-2xl">
            👤
          </div>
          <div>
            <p className="text-lg font-bold">{form.name || "You"}</p>
            <p className="text-sm opacity-80">
              {form.calorieGoal} cal/day target
            </p>
          </div>
        </div>
        {goals?.startWeight && (
          <div className="mt-4 flex gap-4 text-sm">
            <div>
              <p className="opacity-70">Start</p>
              <p className="font-bold">{goals.startWeight} lbs</p>
            </div>
            {form.targetWeight && (
              <div>
                <p className="opacity-70">Target</p>
                <p className="font-bold">{form.targetWeight} lbs</p>
              </div>
            )}
          </div>
        )}
      </div>

      <button
        onClick={() => setShowCalculator(!showCalculator)}
        className="mb-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-primary/30 bg-primary-light/30 py-3.5 text-sm font-medium text-primary-dark"
      >
        <Calculator size={16} />
        {showCalculator ? "Hide Calculator" : "Calculate My Goals"}
      </button>

      {showCalculator && (
        <div className="mb-6 space-y-3 rounded-2xl bg-card p-4 border border-border/50 animate-fade-in">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-muted">Weight (lbs)</label>
              <input
                type="number"
                value={calculator.weight}
                onChange={(e) => setCalculator({ ...calculator, weight: e.target.value })}
                className="w-full rounded-xl border border-border px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted">Height (cm)</label>
              <input
                type="number"
                value={calculator.height}
                onChange={(e) => setCalculator({ ...calculator, height: e.target.value })}
                className="w-full rounded-xl border border-border px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted">Age</label>
              <input
                type="number"
                value={calculator.age}
                onChange={(e) => setCalculator({ ...calculator, age: e.target.value })}
                className="w-full rounded-xl border border-border px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted">Sex</label>
              <select
                value={calculator.sex}
                onChange={(e) => setCalculator({ ...calculator, sex: e.target.value })}
                className="w-full rounded-xl border border-border px-3 py-2.5 text-sm outline-none focus:border-primary"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs text-muted">Activity Level</label>
            <select
              value={calculator.activityLevel}
              onChange={(e) => setCalculator({ ...calculator, activityLevel: e.target.value })}
              className="w-full rounded-xl border border-border px-3 py-2.5 text-sm outline-none focus:border-primary"
            >
              <option value="sedentary">Sedentary (desk job)</option>
              <option value="light">Light (1-3 days/week)</option>
              <option value="moderate">Moderate (3-5 days/week)</option>
              <option value="active">Active (6-7 days/week)</option>
              <option value="very_active">Very Active (athlete)</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs text-muted">Goal</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: "lose", label: "Lose Weight" },
                { value: "maintain", label: "Maintain" },
                { value: "gain", label: "Gain Muscle" },
              ].map((g) => (
                <button
                  key={g.value}
                  onClick={() => setCalculator({ ...calculator, goal: g.value })}
                  className={`rounded-xl py-2 text-xs font-medium transition-all ${
                    calculator.goal === g.value
                      ? "bg-primary text-white"
                      : "bg-border/50 text-muted"
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={calculateGoals}
            disabled={!calculator.weight || !calculator.height || !calculator.age}
            className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            Calculate
          </button>
        </div>
      )}

      <div className="space-y-4 rounded-2xl bg-card p-5 shadow-sm border border-border/50">
        <div className="flex items-center gap-2">
          <Target size={16} className="text-primary" />
          <h2 className="text-sm font-semibold">Daily Targets</h2>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted">Display Name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded-xl border border-border px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted">Calories</label>
            <input
              type="number"
              value={form.calorieGoal}
              onChange={(e) => setForm({ ...form, calorieGoal: e.target.value })}
              className="w-full rounded-xl border border-border px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted">Target Weight (lbs)</label>
            <input
              type="number"
              step="0.1"
              value={form.targetWeight}
              onChange={(e) => setForm({ ...form, targetWeight: e.target.value })}
              placeholder="Optional"
              className="w-full rounded-xl border border-border px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted">Protein (g)</label>
            <input
              type="number"
              value={form.proteinGoal}
              onChange={(e) => setForm({ ...form, proteinGoal: e.target.value })}
              className="w-full rounded-xl border border-border px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted">Carbs (g)</label>
            <input
              type="number"
              value={form.carbsGoal}
              onChange={(e) => setForm({ ...form, carbsGoal: e.target.value })}
              className="w-full rounded-xl border border-border px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted">Fat (g)</label>
            <input
              type="number"
              value={form.fatGoal}
              onChange={(e) => setForm({ ...form, fatGoal: e.target.value })}
              className="w-full rounded-xl border border-border px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <button
          onClick={saveGoals}
          disabled={saving}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 disabled:opacity-50"
        >
          <Save size={16} />
          {saved ? "Saved!" : saving ? "Saving..." : "Save Goals"}
        </button>
      </div>

      <div className="mt-6 mb-4 rounded-2xl bg-card p-4 text-center border border-border/50">
        <p className="text-xs text-muted">
          NutriAI v1.0 · AI-powered nutrition tracking
        </p>
        <p className="mt-1 text-[10px] text-muted">
          Set OPENAI_API_KEY for real food photo analysis
        </p>
      </div>
    </div>
  );
}
