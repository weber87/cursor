interface RecommendationCardProps {
  type: "success" | "warning" | "tip" | "goal";
  title: string;
  description: string;
}

const styles = {
  success: "border-emerald-200 bg-emerald-50",
  warning: "border-amber-200 bg-amber-50",
  tip: "border-blue-200 bg-blue-50",
  goal: "border-purple-200 bg-purple-50",
};

const icons = {
  success: "✅",
  warning: "⚠️",
  tip: "💡",
  goal: "🎯",
};

export function RecommendationCard({ type, title, description }: RecommendationCardProps) {
  return (
    <div className={`rounded-2xl border p-4 ${styles[type]}`}>
      <div className="flex items-start gap-3">
        <span className="text-lg">{icons[type]}</span>
        <div>
          <h3 className="font-semibold text-sm">{title}</h3>
          <p className="mt-1 text-xs leading-relaxed text-muted">{description}</p>
        </div>
      </div>
    </div>
  );
}
