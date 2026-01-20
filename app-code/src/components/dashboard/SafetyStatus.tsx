import { Flame, Wind, Thermometer, Shield, ShieldAlert, ShieldCheck } from 'lucide-react';
import { SensorData } from '@/lib/mockData';

interface SafetyStatusProps {
  data: SensorData;
}

export function SafetyStatus({ data }: SafetyStatusProps) {
  const gasStatus = data.gasLevel > 200 ? 'danger' : data.gasLevel > 150 ? 'warning' : 'safe';
  const tempStatus = data.temperature > 35 ? 'danger' : data.temperature > 30 ? 'warning' : 'safe';
  const fireStatus = data.fireDetected ? 'danger' : 'safe';

  const overallStatus = fireStatus === 'danger' || gasStatus === 'danger' || tempStatus === 'danger' 
    ? 'danger' 
    : gasStatus === 'warning' || tempStatus === 'warning'
    ? 'warning'
    : 'safe';

  const statusConfig = {
    safe: { icon: ShieldCheck, color: 'text-success', bg: 'bg-success/10', label: 'All Systems Normal' },
    warning: { icon: Shield, color: 'text-warning', bg: 'bg-warning/10', label: 'Monitoring Required' },
    danger: { icon: ShieldAlert, color: 'text-destructive', bg: 'bg-destructive/10', label: 'Alert Active' },
  };

  const StatusIcon = statusConfig[overallStatus].icon;

  return (
    <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: '150ms' }}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${statusConfig[overallStatus].bg}`}>
            <StatusIcon className={`w-5 h-5 ${statusConfig[overallStatus].color}`} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Safety Monitoring</h3>
            <p className={`text-sm ${statusConfig[overallStatus].color}`}>
              {statusConfig[overallStatus].label}
            </p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        {/* Gas Level */}
        <div
          className={`p-4 rounded-xl text-center animate-scale-in ${
            gasStatus === 'danger' ? 'bg-destructive/10 border border-destructive/30' :
            gasStatus === 'warning' ? 'bg-warning/10 border border-warning/30' :
            'bg-muted/50 border border-border/50'
          }`}
          style={{ animationDelay: '250ms' }}
        >
          <Wind className={`w-8 h-8 mx-auto mb-2 ${
            gasStatus === 'danger' ? 'text-destructive' :
            gasStatus === 'warning' ? 'text-warning' :
            'text-primary'
          }`} />
          <p className="text-2xl font-bold text-foreground">{data.gasLevel}</p>
          <p className="text-xs text-muted-foreground">PPM Gas Level</p>
        </div>

        {/* Temperature */}
        <div
          className={`p-4 rounded-xl text-center animate-scale-in ${
            tempStatus === 'danger' ? 'bg-destructive/10 border border-destructive/30' :
            tempStatus === 'warning' ? 'bg-warning/10 border border-warning/30' :
            'bg-muted/50 border border-border/50'
          }`}
          style={{ animationDelay: '300ms' }}
        >
          <Thermometer className={`w-8 h-8 mx-auto mb-2 ${
            tempStatus === 'danger' ? 'text-destructive' :
            tempStatus === 'warning' ? 'text-warning' :
            'text-accent'
          }`} />
          <p className="text-2xl font-bold text-foreground">{data.temperature}°C</p>
          <p className="text-xs text-muted-foreground">Temperature</p>
        </div>

        {/* Fire Detection */}
        <div
          className={`p-4 rounded-xl text-center animate-scale-in ${
            fireStatus === 'danger' ? 'bg-destructive/10 border border-destructive/30 animate-pulse' :
            'bg-muted/50 border border-border/50'
          }`}
          style={{ animationDelay: '350ms' }}
        >
          <Flame className={`w-8 h-8 mx-auto mb-2 ${
            fireStatus === 'danger' ? 'text-destructive' : 'text-muted-foreground'
          }`} />
          <p className={`text-lg font-bold ${fireStatus === 'danger' ? 'text-destructive' : 'text-success'}`}>
            {fireStatus === 'danger' ? 'DETECTED' : 'Clear'}
          </p>
          <p className="text-xs text-muted-foreground">Fire Status</p>
        </div>
      </div>
    </div>
  );
}
