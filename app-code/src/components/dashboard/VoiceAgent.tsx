import { useState, useEffect, useRef } from 'react';
import { Phone, PhoneOff, Mic, Volume2, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Conversation } from '@elevenlabs/client';

interface CallLog {
  id: string;
  timestamp: string;
  duration: string;
  type: 'inbound' | 'outbound';
  status: 'completed' | 'missed' | 'active';
  summary: string;
}

export function VoiceAgent() {
  const [isCallActive, setIsCallActive] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [agentStatus, setAgentStatus] = useState<'idle' | 'connecting' | 'active' | 'ended'>('idle');
  const conversationRef = useRef<Conversation | null>(null);
  const [callLogs, setCallLogs] = useState<CallLog[]>([
    {
      id: '1',
      timestamp: '2026-01-19 08:45 AM',
      duration: '2:34',
      type: 'outbound',
      status: 'completed',
      summary: 'Checked bin fill levels and collection schedule'
    },
    {
      id: '2',
      timestamp: '2026-01-18 03:20 PM',
      duration: '1:12',
      type: 'inbound',
      status: 'completed',
      summary: 'System alert: High gas level detected'
    }
  ]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCallActive) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCallActive]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startCall = async () => {
    setAgentStatus('connecting');
    setIsCallActive(true);
    setCallDuration(0);

    try {
      // Request microphone permission first
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const agentId = import.meta.env.VITE_ELEVENLABS_AGENT_ID;
      
      if (!agentId) {
        throw new Error('ElevenLabs Agent ID not configured');
      }

      console.log('Starting session with agent:', agentId);

      conversationRef.current = await Conversation.startSession({
        agentId,
        onConnect: () => {
          console.log('Connected to ElevenLabs');
          setAgentStatus('active');
        },
        onDisconnect: () => {
          console.log('Disconnected from ElevenLabs');
          endCall();
        },
        onError: (error) => {
          console.error('ElevenLabs error:', error);
          setAgentStatus('idle');
          setIsCallActive(false);
        }
      });
    } catch (error) {
      console.error('Failed to start call:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to start voice call: ${errorMsg}`);
      setAgentStatus('idle');
      setIsCallActive(false);
    }
  };

  const endCall = async () => {
    setAgentStatus('ended');
    
    if (conversationRef.current) {
      await conversationRef.current.endSession();
      conversationRef.current = null;
    }
    
    const newLog: CallLog = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleString(),
      duration: formatDuration(callDuration),
      type: 'outbound',
      status: 'completed',
      summary: 'Voice interaction completed'
    };
    
    setCallLogs([newLog, ...callLogs]);
    
    setTimeout(() => {
      setIsCallActive(false);
      setAgentStatus('idle');
      setCallDuration(0);
    }, 1000);
  };

  const testVoiceAgent = async () => {
    try {
      const apiUrl = window.location.hostname === 'localhost' 
        ? 'http://localhost:8080/api/voice/context'
        : `http://${window.location.hostname}:8080/api/voice/context`;
        
      const response = await fetch(apiUrl);
      const data = await response.json();
      console.log('Voice agent context:', data);
      alert('Voice agent is ready! Check console for context data.');
    } catch (error) {
      console.error('Test failed:', error);
      alert('Failed to connect to voice agent. Check backend logs.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Voice Call Interface */}
      <Card className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-primary/20">
            <Phone className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Voice Assistant</h3>
            <p className="text-sm text-muted-foreground">Talk to your AI waste management assistant</p>
          </div>
        </div>

        {/* Call Status */}
        <div className="flex flex-col items-center justify-center py-8">
          {!isCallActive ? (
            <>
              <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                <Phone className="w-12 h-12 text-primary" />
              </div>
              <p className="text-lg font-medium mb-2">Ready to assist</p>
              <p className="text-sm text-muted-foreground mb-6">
                Ask about bin levels, schedules, alerts, and more
              </p>
              <div className="flex gap-3">
                <Button onClick={startCall} size="lg" className="bg-primary hover:bg-primary/90">
                  <Phone className="w-5 h-5 mr-2" />
                  Start Voice Call
                </Button>
                <Button onClick={testVoiceAgent} variant="outline" size="lg">
                  Test Connection
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-4 ${
                agentStatus === 'connecting' ? 'bg-warning/20 animate-pulse' :
                agentStatus === 'active' ? 'bg-success/20' :
                'bg-muted'
              }`}>
                {agentStatus === 'connecting' ? (
                  <Mic className="w-12 h-12 text-warning animate-pulse" />
                ) : agentStatus === 'active' ? (
                  <Volume2 className="w-12 h-12 text-success" />
                ) : (
                  <PhoneOff className="w-12 h-12 text-muted-foreground" />
                )}
              </div>
              
              <p className="text-lg font-medium mb-2">
                {agentStatus === 'connecting' && 'Connecting...'}
                {agentStatus === 'active' && 'Call Active'}
                {agentStatus === 'ended' && 'Call Ended'}
              </p>
              
              <p className="text-3xl font-bold text-primary mb-6">
                {formatDuration(callDuration)}
              </p>

              {agentStatus === 'active' && (
                <div className="flex items-center gap-2 mb-6 text-sm text-muted-foreground">
                  <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  <span>Listening...</span>
                </div>
              )}

              {agentStatus !== 'ended' && (
                <Button onClick={endCall} size="lg" variant="destructive">
                  <PhoneOff className="w-5 h-5 mr-2" />
                  End Call
                </Button>
              )}
            </>
          )}
        </div>

        {/* Quick Info */}
        <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border/50">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{callLogs.length}</p>
            <p className="text-xs text-muted-foreground">Total Calls</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">98%</p>
            <p className="text-xs text-muted-foreground">Uptime</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">24/7</p>
            <p className="text-xs text-muted-foreground">Available</p>
          </div>
        </div>
      </Card>

      {/* Call History */}
      <Card className="glass-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <Clock className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Call History</h3>
        </div>
        
        <div className="space-y-3">
          {callLogs.map((log) => (
            <div
              key={log.id}
              className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <div className={`p-2 rounded-lg ${
                log.type === 'outbound' ? 'bg-primary/20' : 'bg-accent/20'
              }`}>
                <Phone className={`w-4 h-4 ${
                  log.type === 'outbound' ? 'text-primary' : 'text-accent'
                }`} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-sm">
                    {log.type === 'outbound' ? 'Outbound Call' : 'System Alert Call'}
                  </p>
                  {log.status === 'completed' ? (
                    <CheckCircle2 className="w-4 h-4 text-success" />
                  ) : (
                    <XCircle className="w-4 h-4 text-destructive" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground mb-1">{log.summary}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{log.timestamp}</span>
                  <span>•</span>
                  <span>{log.duration}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Features */}
      <Card className="glass-card p-6">
        <h3 className="text-lg font-semibold mb-4">What You Can Ask</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            'What\'s my bin fill level?',
            'When is my next collection?',
            'Are there any alerts?',
            'What\'s my current bill?',
            'How do I dispose of batteries?',
            'Report a missed collection'
          ].map((question, index) => (
            <div
              key={index}
              className="p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
            >
              "{question}"
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
