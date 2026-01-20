import { Brain, Lightbulb, TrendingUp, Zap } from 'lucide-react';
import { mockAIInsights } from '@/lib/mockData';

const priorityConfig = {
  high: { color: 'text-destructive', bg: 'bg-destructive/10', icon: Zap },
  medium: { color: 'text-warning', bg: 'bg-warning/10', icon: TrendingUp },
  low: { color: 'text-info', bg: 'bg-info/10', icon: Lightbulb },
};

export function AIInsightsPanel() {
  return (
    <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: '500ms' }}>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-primary/20">
          <Brain className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">AI Insights</h3>
          <p className="text-sm text-muted-foreground">Powered by Claude 3.5</p>
        </div>
      </div>
      <div className="space-y-4">
        {mockAIInsights.map((insight, index) => {
          const config = priorityConfig[insight.priority as keyof typeof priorityConfig];
          const Icon = config.icon;
          
          return (
            <div
              key={insight.id}
              className="p-4 rounded-lg bg-muted/50 border border-border/50 hover:border-primary/30 transition-colors cursor-pointer group animate-fade-in"
              style={{ animationDelay: `${600 + index * 100}ms` }}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${config.bg}`}>
                  <Icon className={`w-4 h-4 ${config.color}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">
                      {insight.title}
                    </h4>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${config.bg} ${config.color}`}>
                      {insight.impact}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {insight.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
