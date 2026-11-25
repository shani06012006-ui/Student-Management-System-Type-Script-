interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  accent?: "indigo" | "green" | "amber" | "sky";
}

export function StatCard({ label, value, hint, accent = "indigo" }: StatCardProps) {
  return (
    <div className={`stat-card stat-card--${accent}`}>
      <span className="stat-card__label">{label}</span>
      <strong className="stat-card__value">{value}</strong>
      {hint && <span className="stat-card__hint">{hint}</span>}
    </div>
  );
}
