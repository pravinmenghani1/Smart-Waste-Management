import { useState, useEffect } from 'react';
import { 
  Droplets, 
  Leaf, 
  Cog, 
  Scale,
  RefreshCw,
  LogOut
} from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { FillLevelGauge } from '@/components/dashboard/FillLevelGauge';
import { WasteChart } from '@/components/dashboard/WasteChart';
import { AlertsPanel } from '@/components/dashboard/AlertsPanel';
import { AIInsightsPanel } from '@/components/dashboard/AIInsightsPanel';
import { BinStatusGrid } from '@/components/dashboard/BinStatusGrid';
import { SafetyStatus } from '@/components/dashboard/SafetyStatus';
import { AIChatbot } from '@/components/dashboard/AIChatbot';
import { VisionAnalysis } from '@/components/dashboard/VisionAnalysis';
import { LiveSensorStatus } from '@/components/dashboard/LiveSensorStatus';
import { SettingsPanel } from '@/components/dashboard/SettingsPanel';
import { VoiceAgent } from '@/components/dashboard/VoiceAgent';
import { TicketsView } from '@/components/dashboard/TicketsView';
import { fetchRealSensorData, SensorData } from '@/lib/realData';
import { Button } from '@/components/ui/button';

interface IndexProps {
  signOut?: () => void;
  user?: any;
}

const Index = ({ signOut, user }: IndexProps) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sensorData, setSensorData] = useState<SensorData>({
    fillLevel: 0,
    wetWaste: '0.00',
    dryWaste: '0.00',
    metalWaste: '0.00',
    gasLevel: 0,
    temperature: 25,
    fireDetected: false,
    lastUpdated: new Date().toISOString(),
  });
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Fetch real-time sensor updates
  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchRealSensorData();
      setSensorData(data);
      setLastUpdate(new Date());
    };

    fetchData(); // Initial fetch
    
    const interval = setInterval(fetchData, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const refreshData = async () => {
    const data = await fetchRealSensorData();
    setSensorData(data);
    setLastUpdate(new Date());
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border/50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {activeTab === 'dashboard' && 'Smart Waste Dashboard'}
                {activeTab === 'chat' && 'AI Assistant'}
                {activeTab === 'vision' && 'Vision Analysis'}
                {activeTab === 'voice' && 'Voice Assistant'}
                {activeTab === 'tickets' && 'Service Tickets'}
                {activeTab === 'alerts' && 'Alert Center'}
                {activeTab === 'settings' && 'Settings'}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Real-time IoT monitoring & AI-powered insights
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Logged in as</p>
                <p className="text-sm font-medium text-foreground">
                  {user?.username || 'User'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Last updated</p>
                <p className="text-sm font-medium text-foreground">
                  {lastUpdate.toLocaleTimeString()}
                </p>
              </div>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={refreshData}
                className="hover:bg-primary/10 hover:text-primary hover:border-primary/50"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
              {signOut && (
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={signOut}
                  className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-6">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Waste Metrics Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                  title="Wet Waste"
                  value={sensorData.wetWaste}
                  unit="kg"
                  icon={Droplets}
                  color="primary"
                  trend={{ value: 12, isPositive: true }}
                  delay={0}
                />
                <MetricCard
                  title="Dry Waste"
                  value={sensorData.dryWaste}
                  unit="kg"
                  icon={Leaf}
                  color="accent"
                  trend={{ value: 5, isPositive: false }}
                  delay={0.1}
                />
                <MetricCard
                  title="Metal Waste"
                  value={sensorData.metalWaste}
                  unit="kg"
                  icon={Cog}
                  color="warning"
                  trend={{ value: 8, isPositive: true }}
                  delay={0.2}
                />
                <MetricCard
                  title="Total Weight"
                  value={(parseFloat(sensorData.wetWaste) + parseFloat(sensorData.dryWaste) + parseFloat(sensorData.metalWaste)).toFixed(2)}
                  unit="kg"
                  icon={Scale}
                  color="info"
                  trend={{ value: 3, isPositive: true }}
                  delay={0.3}
                />
              </div>

              {/* Safety Status */}
              <SafetyStatus data={sensorData} />

              {/* Main Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Charts */}
                <div className="lg:col-span-2 space-y-6">
                  <WasteChart />
                  <BinStatusGrid />
                </div>

                {/* Right Column - Alerts & Insights */}
                <div className="space-y-6">
                  <LiveSensorStatus />
                  <AlertsPanel />
                  <FillLevelGauge level={sensorData.fillLevel} binId="BIN-001" />
                </div>
              </div>

              {/* AI Insights */}
              <AIInsightsPanel />
            </div>
          )}

          {activeTab === 'chat' && (
            <div className="max-w-4xl mx-auto">
              <AIChatbot />
            </div>
          )}

          {activeTab === 'vision' && (
            <div className="max-w-2xl mx-auto">
              <VisionAnalysis />
            </div>
          )}

          {activeTab === 'voice' && (
            <div className="max-w-2xl mx-auto">
              <VoiceAgent />
            </div>
          )}

          {activeTab === 'tickets' && (
            <div className="max-w-6xl mx-auto">
              <TicketsView />
            </div>
          )}

          {activeTab === 'alerts' && (
            <div className="max-w-2xl">
              <AlertsPanel />
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-2xl">
              <SettingsPanel />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
