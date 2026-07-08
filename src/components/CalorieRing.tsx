interface CalorieRingProps {
  consumed: number;
  goal: number;
  size?: number;
}

export function CalorieRing({ consumed, goal, size = 160 }: CalorieRingProps) {
  const remaining = Math.max(goal - consumed, 0);
  const over = consumed > goal;
  const percentage = Math.min((consumed / goal) * 100, 100);
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth={10}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={over ? "var(--fat)" : "var(--primary)"}
          strokeWidth={10}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-3xl font-bold tracking-tight">
          {over ? consumed - goal : remaining}
        </span>
        <span className="text-xs text-muted">
          {over ? "over" : "remaining"}
        </span>
        <span className="mt-1 text-[10px] text-muted">
          {consumed} / {goal} cal
        </span>
      </div>
    </div>
  );
}
