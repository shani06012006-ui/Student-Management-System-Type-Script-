import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  tone?: "accent" | "success" | "warning" | "info" | "danger";
}

export function StatCard({ label, value, hint, icon: Icon, tone = "accent" }: StatCardProps) {
  return (
    <div className={`stat-card stat-card--${tone}`}>
      <div className="stat-card__icon">
        <Icon size={20} />
      </div>
      <div className="stat-card__body">
        <span className="stat-card__label">{label}</span>
        <strong className="stat-card__value">{value}</strong>
        {hint && <span className="stat-card__hint">{hint}</span>}
      </div>
    </div>
  );
}