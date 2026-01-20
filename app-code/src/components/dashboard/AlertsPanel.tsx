import { AlertTriangle, Bell, CheckCircle2, Info, X } from 'lucide-react';
import { mockAlerts, Alert } from '@/lib/mockData';
import { useState } from 'react';

const alertConfig = {
  warning: { icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/30' },
  critical: { icon: AlertTriangle, color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/30' },
  info: { icon: Info, color: 'text-info', bg: 'bg-info/10', border: 'border-info/30' },
  success: { icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10', border: 'border-success/30' },
};

export function AlertsPanel() {
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);

  const dismissAlert = (id: number) => {
    setAlerts(alerts.filter(a => a.id !== id));
  };

  return (
    <div className="glass-card p-6 h-full animate-slide-in-right" style={{ animationDelay: '400ms' }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Live Alerts</h3>
        </div>
        <span className="text-xs text-muted-foreground px-2 py-1 rounded-full bg-muted">
          {alerts.length} active
        </span>
      </div>
      <div className="space-y-3 max-h-[400px] overflow-y-auto scrollbar-thin pr-2">
        {alerts.map((alert, index) => {
          const config = alertConfig[alert.type as keyof typeof alertConfig];
          const Icon = config.icon;
          
          return (
            <div
              key={alert.id}
              className={`p-3 rounded-lg border ${config.bg} ${config.border} flex items-start gap-3 group animate-fade-in`}
              style={{ animationDelay: `${500 + index * 100}ms` }}
            >
              <Icon className={`w-4 h-4 ${config.color} mt-0.5 flex-shrink-0`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground leading-tight">{alert.message}</p>
                <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
              </div>
              <button
                onClick={() => dismissAlert(alert.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-foreground/10 rounded"
              >
                <X className="w-3 h-3 text-muted-foreground" />
              </button>
            </div>
          );
        })}
        {alerts.length === 0 && (
          <div className="text-center py-8">
            <CheckCircle2 className="w-8 h-8 text-success mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">All clear! No active alerts.</p>
          </div>
        )}
      </div>
    </div>
  );
}
