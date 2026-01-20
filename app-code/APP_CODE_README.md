# React Application Code

## Location
- **S3:** s3://iotimplementation/final/app-code/
- **Local:** /home/ubuntu/arch/app-code/

## Contents
79 files, 448 KB

### Main Files
- **package.json** - Dependencies and scripts
- **vite.config.ts** - Vite configuration with proxy
- **tsconfig.json** - TypeScript configuration
- **tailwind.config.ts** - Tailwind CSS configuration
- **index.html** - Entry HTML file

### Source Code (src/)
- **App.tsx** - Main application component
- **main.tsx** - Application entry point
- **index.css** - Global styles

### Components
- **dashboard/** - Dashboard components (FillLevelGauge, WasteChart, etc.)
- **layout/** - Layout components (Sidebar)
- **ui/** - shadcn/ui components (50+ components)

### Libraries
- **lib/realData.ts** - Real sensor data API client
- **lib/mockData.ts** - Mock data for testing
- **lib/utils.ts** - Utility functions

### Pages
- **pages/Index.tsx** - Main dashboard page
- **pages/NotFound.tsx** - 404 page

## Key Features
- Real-time sensor data display
- Fill level gauge
- Gas level monitoring
- Fire detection alerts
- Weight tracking charts
- Historical data visualization
- Responsive design
- Auto-refresh every 5 seconds

## Technology Stack
- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- Recharts (for charts)

## API Integration
Uses Vite proxy to connect to backend API:
- `/api/sensors/latest` - Latest sensor readings
- `/api/sensors/history` - Historical data

## Running the App
```bash
cd /home/ubuntu/waste-management-system
npm run dev -- --host 0.0.0.0 --port 3000
```

Access at: http://98.82.140.84:3000/
