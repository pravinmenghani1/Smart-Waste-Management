// Mock sensor data for demonstration
export const generateSensorData = () => ({
  fillLevel: Math.floor(Math.random() * 30) + 55, // 55-85%
  wetWaste: (Math.random() * 1.5 + 1.2).toFixed(2), // 1.2-2.7 kg
  dryWaste: (Math.random() * 0.8 + 0.5).toFixed(2), // 0.5-1.3 kg
  metalWaste: (Math.random() * 0.3 + 0.1).toFixed(2), // 0.1-0.4 kg
  gasLevel: Math.floor(Math.random() * 200) + 50, // 50-250 ppm
  temperature: Math.floor(Math.random() * 15) + 22, // 22-37°C
  fireDetected: Math.random() > 0.98, // 2% chance
  lastUpdated: new Date().toISOString(),
});

export const mockBins = [
  { id: 'BIN-001', location: 'Main Street & 5th Ave', lat: 12.9716, lng: 77.5946, fillLevel: 78, status: 'warning' },
  { id: 'BIN-002', location: 'Central Park North', lat: 12.9656, lng: 77.6085, fillLevel: 45, status: 'normal' },
  { id: 'BIN-003', location: 'City Hall Plaza', lat: 12.9792, lng: 77.5913, fillLevel: 92, status: 'critical' },
  { id: 'BIN-004', location: 'Market Square', lat: 12.9628, lng: 77.5921, fillLevel: 34, status: 'normal' },
  { id: 'BIN-005', location: 'Tech Park Entrance', lat: 12.9854, lng: 77.6029, fillLevel: 67, status: 'normal' },
  { id: 'BIN-006', location: 'University Campus', lat: 12.9512, lng: 77.5764, fillLevel: 85, status: 'warning' },
];

export const mockAlerts = [
  { id: 1, type: 'warning', message: 'BIN-001 reaching 80% capacity', time: '2 mins ago', binId: 'BIN-001' },
  { id: 2, type: 'critical', message: 'BIN-003 requires immediate collection', time: '5 mins ago', binId: 'BIN-003' },
  { id: 3, type: 'info', message: 'Scheduled maintenance for BIN-004', time: '15 mins ago', binId: 'BIN-004' },
  { id: 4, type: 'success', message: 'BIN-005 collection completed', time: '1 hour ago', binId: 'BIN-005' },
];

export const mockHistoricalData = [
  { date: 'Mon', wet: 12.5, dry: 8.3, metal: 2.1 },
  { date: 'Tue', wet: 14.2, dry: 9.1, metal: 1.8 },
  { date: 'Wed', wet: 11.8, dry: 7.6, metal: 2.4 },
  { date: 'Thu', wet: 15.3, dry: 10.2, metal: 1.9 },
  { date: 'Fri', wet: 16.1, dry: 11.5, metal: 2.7 },
  { date: 'Sat', wet: 13.4, dry: 8.9, metal: 2.2 },
  { date: 'Sun', wet: 10.2, dry: 6.4, metal: 1.5 },
];

export const mockAIInsights = [
  {
    id: 1,
    title: 'Optimize Collection Route',
    description: 'Based on fill patterns, rerouting trucks via Market Square first can save 15% fuel.',
    priority: 'high',
    impact: '+15% efficiency',
  },
  {
    id: 2,
    title: 'Wet Waste Surge Expected',
    description: 'Historical data suggests 23% increase in organic waste on weekends. Pre-position resources.',
    priority: 'medium',
    impact: 'Proactive planning',
  },
  {
    id: 3,
    title: 'Metal Recycling Opportunity',
    description: 'BIN-006 shows consistent metal waste. Consider dedicated recycling pickup.',
    priority: 'low',
    impact: '+$200/month revenue',
  },
];

export const mockChatHistory = [
  { role: 'assistant' as const, content: 'Hello! I\'m your AI Waste Management Assistant. How can I help you today?' },
];

export type SensorData = ReturnType<typeof generateSensorData>;
export type Bin = typeof mockBins[0];
export type Alert = typeof mockAlerts[0];
export type AIInsight = typeof mockAIInsights[0];
