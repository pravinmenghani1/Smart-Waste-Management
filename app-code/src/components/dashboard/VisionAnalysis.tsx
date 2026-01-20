import { useState, useCallback } from 'react';
import { Camera, Upload, MapPin, Loader2, CheckCircle2, ImageIcon, Sparkles, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AnalysisResult {
  wasteTypes: { type: string; percentage: number; color: string }[];
  recommendations: string[];
  severity: 'low' | 'medium' | 'high';
  imageUrl?: string;
}

export function VisionAnalysis() {
  const [image, setImage] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [ticketId, setTicketId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [uploadReason, setUploadReason] = useState('');
  const [locationText, setLocationText] = useState('');

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const captureLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          // Mock location for demo
          setLocation({ lat: 12.9716, lng: 77.5946 });
        }
      );
    } else {
      // Mock location for demo
      setLocation({ lat: 12.9716, lng: 77.5946 });
    }
  }, []);

  const analyzeImage = useCallback(async () => {
    if (!image) return;
    
    setIsAnalyzing(true);
    
    try {
      const response = await fetch('/api/ai/vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: image,
          location: location,
          ticketId: ticketId || undefined,
          customerName: customerName || undefined,
          uploadReason: uploadReason || undefined,
          locationText: locationText || undefined
        })
      });

      const data = await response.json();
      
      if (data.success && data.analysis) {
        const colorMap: Record<string, string> = {
          'Organic': 'bg-primary',
          'Plastic': 'bg-accent',
          'Paper': 'bg-warning',
          'Cardboard': 'bg-warning',
          'Metal': 'bg-info',
          'Glass': 'bg-purple-500',
          'Other': 'bg-muted-foreground'
        };

        const wasteTypes = data.analysis.wasteTypes.map((wt: any) => ({
          type: wt.type,
          percentage: wt.percentage,
          color: colorMap[wt.type.split('/')[0]] || 'bg-muted-foreground'
        }));

        setResult({
          wasteTypes: wasteTypes,
          recommendations: data.analysis.recommendations,
          severity: data.analysis.severity,
          imageUrl: data.imageUrl
        });
      } else {
        setResult({
          wasteTypes: [{ type: 'Analysis Error', percentage: 100, color: 'bg-destructive' }],
          recommendations: ['Unable to analyze image. Please try again.'],
          severity: 'low'
        });
      }
    } catch (error) {
      console.error('Vision analysis error:', error);
      setResult({
        wasteTypes: [{ type: 'Connection Error', percentage: 100, color: 'bg-destructive' }],
        recommendations: ['Failed to connect to AI service. Please try again later.'],
        severity: 'low'
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, [image, location]);

  return (
    <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: '200ms' }}>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-accent/20">
          <Camera className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Vision Analysis</h3>
          <p className="text-sm text-muted-foreground">AI-powered waste classification</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Image Upload Area */}
        <div className="relative">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className={`block w-full aspect-video rounded-xl border-2 border-dashed transition-all cursor-pointer ${
              image 
                ? 'border-primary/50' 
                : 'border-border hover:border-primary/50 hover:bg-muted/50'
            }`}
          >
            {image ? (
              <img
                src={image}
                alt="Uploaded waste"
                className="w-full h-full object-cover rounded-xl"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-8 text-muted-foreground">
                <ImageIcon className="w-12 h-12 mb-3" />
                <p className="text-sm font-medium">Drop an image or click to upload</p>
                <p className="text-xs mt-1">Supports JPG, PNG, WebP</p>
              </div>
            )}
          </label>
        </div>

        {/* Ticket Information Form */}
        <div className="space-y-3 p-4 rounded-lg bg-muted/30 border border-border/50">
          <div className="flex items-center gap-2 mb-2">
            <Ticket className="w-4 h-4 text-primary" />
            <h4 className="text-sm font-medium">Link to Service Ticket (Optional)</h4>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="ticketId" className="text-xs">Ticket ID</Label>
              <Input
                id="ticketId"
                placeholder="WM-2026-XXXXXX"
                value={ticketId}
                onChange={(e) => setTicketId(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div>
              <Label htmlFor="customerName" className="text-xs">Your Name</Label>
              <Input
                id="customerName"
                placeholder="Enter your name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="locationText" className="text-xs">Location</Label>
            <Input
              id="locationText"
              placeholder="e.g., Baner, Pune"
              value={locationText}
              onChange={(e) => setLocationText(e.target.value)}
              className="h-9 text-sm"
            />
          </div>

          <div>
            <Label htmlFor="uploadReason" className="text-xs">Reason for Upload</Label>
            <Input
              id="uploadReason"
              placeholder="e.g., Evidence for illegal dumping complaint"
              value={uploadReason}
              onChange={(e) => setUploadReason(e.target.value)}
              className="h-9 text-sm"
            />
          </div>
        </div>

        {/* Location Button */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={captureLocation}
            className={`flex-1 ${location ? 'border-primary/50 text-primary' : ''}`}
          >
            <MapPin className="w-4 h-4 mr-2" />
            {location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : 'Capture GPS'}
            {location && <CheckCircle2 className="w-4 h-4 ml-2 text-success" />}
          </Button>
          <Button
            onClick={analyzeImage}
            disabled={!image || isAnalyzing}
            className="flex-1 bg-primary hover:bg-primary/90"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Analyze with AI
              </>
            )}
          </Button>
        </div>

        {/* Analysis Results */}
        {result && (
          <div className="space-y-4 pt-4 border-t border-border/50 animate-fade-in">
            <div>
              <h4 className="text-sm font-medium text-foreground mb-3">Waste Composition</h4>
              <div className="space-y-2">
                {result.wasteTypes.map((type) => (
                  <div key={type.type} className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">{type.type}</span>
                        <span className="font-medium text-foreground">{type.percentage}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full ${type.color} rounded-full transition-all duration-1000`}
                          style={{ width: `${type.percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-foreground mb-3">AI Recommendations</h4>
              <ul className="space-y-2">
                {result.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
