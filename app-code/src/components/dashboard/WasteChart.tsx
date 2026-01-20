import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { fetchHistoricalData } from '@/lib/realData';

export function WasteChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const historicalData = await fetchHistoricalData(24);
      setData(historicalData);
    };
    loadData();
  }, []);

  return (
    <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: '300ms' }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Live Sensor Data (24h)</h3>
          <p className="text-sm text-muted-foreground">Real-time data from IoT sensors</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-xs text-muted-foreground">Fill Level</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-accent" />
            <span className="text-xs text-muted-foreground">Gas Level</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-warning" />
            <span className="text-xs text-muted-foreground">Total Weight</span>
          </div>
        </div>
      </div>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="fillGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(158, 64%, 52%)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="hsl(158, 64%, 52%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gasGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(187, 92%, 50%)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="hsl(187, 92%, 50%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis 
              dataKey="time" 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={12} 
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={12} 
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: 'var(--radius)',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
            />
            <Area
              type="monotone"
              dataKey="fillLevel"
              stroke="hsl(158, 64%, 52%)"
              strokeWidth={2}
              fill="url(#fillGradient)"
            />
            <Area
              type="monotone"
              dataKey="gasLevel"
              stroke="hsl(187, 92%, 50%)"
              strokeWidth={2}
              fill="url(#gasGradient)"
            />
            <Area
              type="monotone"
              dataKey="totalWaste"
              stroke="hsl(38, 92%, 50%)"
              strokeWidth={2}
              fill="url(#weightGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
