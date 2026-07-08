"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Camera,
  PenLine,
  Upload,
  Loader2,
  Check,
  Sparkles,
  X,
} from "lucide-react";
import { MEAL_TYPES } from "@/lib/constants";

type Tab = "photo" | "manual";

interface FoodAnalysis {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: string;
  confidence: number;
  items: { name: string; calories: number }[];
  notes: string;
  source: "ai" | "demo";
}

export default function LogPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [tab, setTab] = useState<Tab>("photo");
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<FoodAnalysis | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const [form, setForm] = useState({
    name: "",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
    mealType: "lunch",
    notes: "",
  });

  const stopCamera = () => {
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
    setCameraActive(false);
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      setStream(mediaStream);
      setCameraActive(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      }, 100);
    } catch {
      fileInputRef.current?.click();
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx?.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
    setPreview(dataUrl);
    stopCamera();
    analyzeImage(dataUrl);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setPreview(dataUrl);
      analyzeImage(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async (imageData: string) => {
    setAnalyzing(true);
    setAnalysis(null);
    try {
      const res = await fetch("/api/analyze-food", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageData }),
      });
      const data = await res.json();
      setAnalysis(data);
      setForm({
        name: data.name,
        calories: String(data.calories),
        protein: String(data.protein),
        carbs: String(data.carbs),
        fat: String(data.fat),
        mealType: getMealTypeByTime(),
        notes: data.notes || "",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const getMealTypeByTime = () => {
    const hour = new Date().getHours();
    if (hour < 11) return "breakfast";
    if (hour < 15) return "lunch";
    if (hour < 20) return "dinner";
    return "snack";
  };

  const saveMeal = async () => {
    if (!form.name || !form.calories) return;
    setSaving(true);
    try {
      await fetch("/api/meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          calories: parseInt(form.calories),
          protein: parseFloat(form.protein) || 0,
          carbs: parseFloat(form.carbs) || 0,
          fat: parseFloat(form.fat) || 0,
          mealType: form.mealType,
          source: tab === "photo" ? "photo" : "manual",
          notes: form.notes || null,
          date: format(new Date(), "yyyy-MM-dd"),
        }),
      });
      router.push("/");
    } finally {
      setSaving(false);
    }
  };

  const resetPhoto = () => {
    setPreview(null);
    setAnalysis(null);
    setForm({ name: "", calories: "", protein: "", carbs: "", fat: "", mealType: "lunch", notes: "" });
  };

  return (
    <div className="px-4 pt-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Log a Meal</h1>
        <p className="text-sm text-muted">Snap a photo or enter details manually</p>
      </header>

      <div className="mb-6 flex rounded-2xl bg-border/50 p-1">
        <button
          onClick={() => { setTab("photo"); resetPhoto(); }}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition-all ${
            tab === "photo" ? "bg-card shadow-sm text-primary" : "text-muted"
          }`}
        >
          <Camera size={16} />
          Photo AI
        </button>
        <button
          onClick={() => { setTab("manual"); stopCamera(); }}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition-all ${
            tab === "manual" ? "bg-card shadow-sm text-primary" : "text-muted"
          }`}
        >
          <PenLine size={16} />
          Manual
        </button>
      </div>

      {tab === "photo" && !preview && !cameraActive && (
        <div className="space-y-4">
          <button
            onClick={startCamera}
            className="flex w-full flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-primary/30 bg-primary-light/30 p-10 transition-colors hover:border-primary/50"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white">
              <Camera size={28} />
            </div>
            <div className="text-center">
              <p className="font-semibold">Take a Photo</p>
              <p className="mt-1 text-xs text-muted">AI will identify food and estimate nutrition</p>
            </div>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card py-3.5 text-sm font-medium transition-colors hover:bg-border/30"
          >
            <Upload size={16} />
            Upload from Gallery
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>
      )}

      {cameraActive && (
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-2xl bg-black">
            <video ref={videoRef} autoPlay playsInline className="w-full" />
          </div>
          <div className="flex gap-3">
            <button
              onClick={stopCamera}
              className="flex-1 rounded-xl border border-border py-3 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              onClick={capturePhoto}
              className="flex-1 rounded-xl bg-primary py-3 text-sm font-semibold text-white"
            >
              Capture
            </button>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />

      {preview && (
        <div className="mb-4 overflow-hidden rounded-2xl">
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Food preview" className="w-full max-h-48 object-cover" />
            <button
              onClick={resetPhoto}
              className="absolute right-2 top-2 rounded-full bg-black/50 p-1.5 text-white"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {analyzing && (
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-card p-8 border border-border/50">
          <Loader2 size={32} className="animate-spin text-primary" />
          <p className="font-medium text-sm">Analyzing your food...</p>
          <p className="text-xs text-muted">Estimating calories and macros</p>
        </div>
      )}

      {analysis && !analyzing && (
        <div className="mb-4 rounded-2xl border border-primary/20 bg-primary-light/30 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={14} className="text-primary" />
            <span className="text-xs font-semibold text-primary">
              {analysis.source === "ai" ? "AI Analysis" : "Demo Analysis"}
            </span>
            <span className="ml-auto text-xs text-muted">
              {Math.round(analysis.confidence * 100)}% confidence
            </span>
          </div>
          <p className="text-sm font-semibold">{analysis.name}</p>
          <p className="text-xs text-muted">{analysis.servingSize}</p>
          {analysis.items.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {analysis.items.map((item, i) => (
                <span key={i} className="rounded-full bg-card px-2 py-0.5 text-[10px] text-muted">
                  {item.name} · {item.calories} cal
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {(tab === "manual" || analysis) && !analyzing && (
        <div className="space-y-4 animate-fade-in">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted">Food Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Grilled chicken salad"
              className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted">Meal Type</label>
            <div className="grid grid-cols-4 gap-2">
              {MEAL_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setForm({ ...form, mealType: type.value })}
                  className={`flex flex-col items-center gap-1 rounded-xl py-2.5 text-xs transition-all ${
                    form.mealType === type.value
                      ? "bg-primary text-white shadow-md"
                      : "bg-card border border-border text-muted"
                  }`}
                >
                  <span className="text-base">{type.icon}</span>
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted">Calories</label>
              <input
                type="number"
                value={form.calories}
                onChange={(e) => setForm({ ...form, calories: e.target.value })}
                placeholder="0"
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted">Protein (g)</label>
              <input
                type="number"
                value={form.protein}
                onChange={(e) => setForm({ ...form, protein: e.target.value })}
                placeholder="0"
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted">Carbs (g)</label>
              <input
                type="number"
                value={form.carbs}
                onChange={(e) => setForm({ ...form, carbs: e.target.value })}
                placeholder="0"
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted">Fat (g)</label>
              <input
                type="number"
                value={form.fat}
                onChange={(e) => setForm({ ...form, fat: e.target.value })}
                placeholder="0"
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <button
            onClick={saveMeal}
            disabled={!form.name || !form.calories || saving}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
          >
            {saving ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Check size={18} />
            )}
            {saving ? "Saving..." : "Add to Diary"}
          </button>
        </div>
      )}
    </div>
  );
}
