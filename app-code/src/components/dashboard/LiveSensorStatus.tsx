import { useState, useEffect } from 'react';
import { Activity, Thermometer, Droplets, Scale } from 'lucide-react';
import { fetchRealSensorData, SensorData } from '@/lib/realData';

export function LiveSensorStatus() {
  const [sensorData, setSensorData] = useState<SensorData>({
    fillLevel: 0,
    wetWaste: '0.000',
    dryWaste: '0.000',
    metalWaste: '0.000',
    gasLevel: 0,
    temperature: 25,
    fireDetected: false,
    lastUpdated: new Date().toISOString(),
  });

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchRealSensorData();
      setSensorData(data);
    };

    fetchData();
    const interval = setInterval(fetchData, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-card p-4 animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Live Sensor Feed</h3>
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
      </div>
      
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Droplets className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-muted-foreground">Fill Level</p>
            <p className="font-semibold text-foreground">{sensorData.fillLevel}%</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center">
            <Thermometer className="w-4 h-4 text-warning" />
          </div>
          <div>
            <p className="text-muted-foreground">Gas Level</p>
            <p className="font-semibold text-foreground">{sensorData.gasLevel} ppm</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
            <Scale className="w-4 h-4 text-accent" />
          </div>
          <div>
            <p className="text-muted-foreground">Wet Waste</p>
            <p className="font-semibold text-foreground">{sensorData.wetWaste} kg</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg ${sensorData.fireDetected ? 'bg-destructive/10' : 'bg-primary/10'} flex items-center justify-center`}>
            <Activity className={`w-4 h-4 ${sensorData.fireDetected ? 'text-destructive' : 'text-primary'}`} />
          </div>
          <div>
            <p className="text-muted-foreground">Fire Status</p>
            <p className={`font-semibold ${sensorData.fireDetected ? 'text-destructive' : 'text-primary'}`}>
              {sensorData.fireDetected ? 'ALERT' : 'Normal'}
            </p>
          </div>
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t border-border/50">
        <p className="text-xs text-muted-foreground">
          Last updated: {new Date(sensorData.lastUpdated).toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}
