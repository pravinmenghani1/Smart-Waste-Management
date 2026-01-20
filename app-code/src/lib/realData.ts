// Real sensor data service
export interface SensorData {
  fillLevel: number;
  wetWaste: string;
  dryWaste: string;
  metalWaste: string;
  gasLevel: number;
  temperature: number;
  fireDetected: boolean;
  lastUpdated: string;
}

export const fetchRealSensorData = async (): Promise<SensorData> => {
  try {
    const response = await fetch('/api/sensors/latest');
    const result = await response.json();
    
    if (result.success) {
      return {
        fillLevel: result.data.fillLevel || 0,
        wetWaste: Math.max(0, result.data.wetWaste || 0).toFixed(3),
        dryWaste: Math.max(0, result.data.dryWaste || 0).toFixed(3),
        metalWaste: Math.max(0, result.data.metalWaste || 0).toFixed(3),
        gasLevel: result.data.gasLevel || 0,
        temperature: 25, // Default temperature
        fireDetected: result.data.fireDetected || false,
        lastUpdated: result.data.lastUpdated || new Date().toISOString(),
      };
    }
    
    // Fallback to zero values if API fails
    return {
      fillLevel: 0,
      wetWaste: '0.00',
      dryWaste: '0.00', 
      metalWaste: '0.00',
      gasLevel: 0,
      temperature: 25,
      fireDetected: false,
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Failed to fetch real sensor data:', error);
    // Return zero values on error
    return {
      fillLevel: 0,
      wetWaste: '0.00',
      dryWaste: '0.00',
      metalWaste: '0.00', 
      gasLevel: 0,
      temperature: 25,
      fireDetected: false,
      lastUpdated: new Date().toISOString(),
    };
  }
};

export const mockBins = [
  { id: 'BIN-001', location: 'Main Street & 5th Ave', lat: 12.9716, lng: 77.5946, fillLevel: 0, status: 'normal' },
];

export const mockAlerts: any[] = [];

export const mockHistoricalData = [
  { date: 'Mon', wet: 0, dry: 0, metal: 0 },
  { date: 'Tue', wet: 0, dry: 0, metal: 0 },
  { date: 'Wed', wet: 0, dry: 0, metal: 0 },
  { date: 'Thu', wet: 0, dry: 0, metal: 0 },
  { date: 'Fri', wet: 0, dry: 0, metal: 0 },
  { date: 'Sat', wet: 0, dry: 0, metal: 0 },
  { date: 'Sun', wet: 0, dry: 0, metal: 0 },
];

export const fetchHistoricalData = async (hours: number = 24) => {
  try {
    const response = await fetch(`/api/sensors/history?hours=${hours}`);
    const result = await response.json();
    
    if (result.success) {
      return result.data;
    }
    return mockHistoricalData;
  } catch (error) {
    console.error('Failed to fetch historical data:', error);
    return mockHistoricalData;
  }
};

export const mockAIInsights: any[] = [];

export const mockChatHistory = [
  { role: 'assistant' as const, content: 'Hello! I\'m your AI Waste Management Assistant. How can I help you today?' },
];

export type Bin = typeof mockBins[0];
export type Alert = any;
export type AIInsight = any;
