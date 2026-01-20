import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  trend?: { value: number; isPositive: boolean };
  color: 'primary' | 'accent' | 'warning' | 'destructive' | 'info';
  delay?: number;
}

const colorClasses = {
  primary: 'text-primary bg-primary/10 border-primary/20',
  accent: 'text-accent bg-accent/10 border-accent/20',
  warning: 'text-warning bg-warning/10 border-warning/20',
  destructive: 'text-destructive bg-destructive/10 border-destructive/20',
  info: 'text-info bg-info/10 border-info/20',
};

const iconBgClasses = {
  primary: 'bg-primary/20',
  accent: 'bg-accent/20',
  warning: 'bg-warning/20',
  destructive: 'bg-destructive/20',
  info: 'bg-info/20',
};

export function MetricCard({ title, value, unit, icon: Icon, trend, color, delay = 0 }: MetricCardProps) {
  return (
    <div 
      className="sensor-card animate-fade-in"
      style={{ animationDelay: `${delay * 1000}ms` }}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="flex items-baseline gap-1">
            <span className={`text-3xl font-bold ${colorClasses[color].split(' ')[0]}`}>
              {value}
            </span>
            {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
          </div>
          {trend && (
            <div className={`flex items-center gap-1 text-xs ${trend.isPositive ? 'text-success' : 'text-destructive'}`}>
              <span>{trend.isPositive ? '↑' : '↓'}</span>
              <span>{Math.abs(trend.value)}% from last hour</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${iconBgClasses[color]}`}>
          <Icon className={`w-6 h-6 ${colorClasses[color].split(' ')[0]}`} />
        </div>
      </div>
    </div>
  );
}
