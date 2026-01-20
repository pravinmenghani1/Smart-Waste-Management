import { useEffect, useState } from 'react';

interface FillLevelGaugeProps {
  level: number;
  binId: string;
}

export function FillLevelGauge({ level, binId }: FillLevelGaugeProps) {
  const [animatedLevel, setAnimatedLevel] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedLevel(level), 100);
    return () => clearTimeout(timer);
  }, [level]);

  const getColor = (level: number) => {
    if (level >= 85) return { stroke: 'hsl(var(--destructive))', bg: 'bg-destructive/20', text: 'text-destructive' };
    if (level >= 70) return { stroke: 'hsl(var(--warning))', bg: 'bg-warning/20', text: 'text-warning' };
    return { stroke: 'hsl(var(--primary))', bg: 'bg-primary/20', text: 'text-primary' };
  };

  const { stroke, bg, text } = getColor(level);
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (animatedLevel / 100) * circumference;

  return (
    <div className="glass-card p-6 flex flex-col items-center animate-fade-in">
      <p className="text-sm font-medium text-muted-foreground mb-4">{binId} Fill Level</p>
      <div className="relative w-32 h-32">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="8"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={stroke}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out drop-shadow-lg"
            style={{ filter: `drop-shadow(0 0 8px ${stroke})` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-foreground">{level}%</span>
          <span className="text-xs text-muted-foreground">Capacity</span>
        </div>
      </div>
      <div className={`mt-4 px-3 py-1 rounded-full text-xs font-medium ${bg} ${text}`}>
        {level >= 85 ? 'Critical' : level >= 70 ? 'Warning' : 'Normal'}
      </div>
    </div>
  );
}
