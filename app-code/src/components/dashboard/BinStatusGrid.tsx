import { MapPin, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { fetchRealSensorData } from '@/lib/realData';

const statusColors = {
  normal: { bg: 'bg-primary/10', border: 'border-primary/30', text: 'text-primary', progress: 'bg-primary' },
  warning: { bg: 'bg-warning/10', border: 'border-warning/30', text: 'text-warning', progress: 'bg-warning' },
  critical: { bg: 'bg-destructive/10', border: 'border-destructive/30', text: 'text-destructive', progress: 'bg-destructive' },
};

export function BinStatusGrid() {
  const [animated, setAnimated] = useState(false);
  const [sensorData, setSensorData] = useState({ fillLevel: 0, gasLevel: 0, fireDetected: false });

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchRealSensorData();
      setSensorData(data);
    };
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const getStatus = (fillLevel: number, gasLevel: number, fireDetected: boolean) => {
    if (fireDetected || fillLevel > 80 || gasLevel > 3000) return 'critical';
    if (fillLevel > 60 || gasLevel > 2500) return 'warning';
    return 'normal';
  };

  const bins = [
    {
      id: 'BIN-001',
      location: 'Main Street & 5th Ave',
      fillLevel: sensorData.fillLevel,
      gasLevel: sensorData.gasLevel,
      fireDetected: sensorData.fireDetected,
      status: getStatus(sensorData.fillLevel, sensorData.gasLevel, sensorData.fireDetected)
    }
  ];

  return (
    <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: '200ms' }}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Trash2 className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Live Bin Status</h3>
        </div>
        <span className="text-sm text-muted-foreground">{bins.length} bins monitored</span>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {bins.map((bin, index) => {
          const status = statusColors[bin.status as keyof typeof statusColors];
          
          return (
            <div
              key={bin.id}
              className={`p-4 rounded-xl border ${status.border} ${status.bg} hover:shadow-lg transition-all cursor-pointer group animate-scale-in`}
              style={{ animationDelay: `${300 + index * 50}ms` }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-foreground">{bin.id}</span>
                <div className={`w-2 h-2 rounded-full ${status.progress} status-indicator`} />
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                <MapPin className="w-3 h-3" />
                <span className="truncate">{bin.location}</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Fill Level</span>
                  <span className={`font-medium ${status.text}`}>{bin.fillLevel}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full ${status.progress} rounded-full transition-all duration-1000 ease-out`}
                    style={{ width: animated ? `${bin.fillLevel}%` : '0%' }}
                  />
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Gas Level</span>
                  <span className="font-medium text-foreground">{bin.gasLevel} ppm</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Fire Status</span>
                  <span className={`font-medium ${bin.fireDetected ? 'text-destructive' : 'text-primary'}`}>
                    {bin.fireDetected ? 'DETECTED' : 'Normal'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
