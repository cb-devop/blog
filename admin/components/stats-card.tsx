import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: string;
  trendColor?: "green" | "red";
}

export function StatsCard({ title, value, icon: Icon, trend, trendColor = "green" }: StatsCardProps) {
  return (
    <div className="bg-card rounded-xl border shadow-sm p-6 card-hover">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
        </div>
        <div className="p-3 bg-primary/5 rounded-lg">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center gap-2">
          <span
            className={
              trendColor === "red"
                ? "text-sm text-destructive font-medium"
                : "text-sm text-green-600 font-medium"
            }
          >
            {trend}
          </span>
          <span className="text-sm text-muted-foreground">vs last month</span>
        </div>
      )}
    </div>
  );
}