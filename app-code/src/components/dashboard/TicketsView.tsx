import { useState, useEffect } from 'react';
import { Ticket, Image as ImageIcon, Calendar, MapPin, User, FileText, ExternalLink } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TicketData {
  ticketId: string;
  issueType: string;
  description: string;
  location: string;
  priority: string;
  status: string;
  createdAt: string;
  imageUrl?: string;
  imageUploadedAt?: string;
  customerName?: string;
  uploadReason?: string;
  imageLocation?: string;
}

export function TicketsView() {
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      console.log('Fetching tickets...');
      const response = await fetch('/api/tickets');
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Tickets data:', data);
      if (data.success) {
        setTickets(data.tickets);
        console.log('Tickets set:', data.tickets.length);
      } else {
        setError('Failed to load tickets');
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
      setError('Error loading tickets');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-destructive';
      case 'medium': return 'bg-warning';
      case 'low': return 'bg-success';
      default: return 'bg-muted';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-primary';
      case 'in_progress': return 'bg-warning';
      case 'resolved': return 'bg-success';
      default: return 'bg-muted';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading tickets...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-destructive">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Service Tickets</h2>
          <p className="text-sm text-muted-foreground">View all tickets with uploaded images</p>
        </div>
        <div className="text-lg px-4 py-2 bg-primary/10 rounded-lg">
          {tickets.length} Total
        </div>
      </div>

      {tickets.length === 0 ? (
        <Card className="glass-card p-12 text-center">
          <Ticket className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No Tickets Yet</h3>
          <p className="text-sm text-muted-foreground">
            Create tickets via AI Assistant and upload images via Vision Analysis
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {tickets.map((ticket) => (
            <Card key={ticket.ticketId} className="glass-card p-6">
              <div className="flex gap-6">
                {/* Image Section */}
                <div className="flex-shrink-0">
                  {ticket.imageUrl ? (
                    <div className="w-48 h-48 rounded-lg bg-muted border border-border flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        <ImageIcon className="w-12 h-12 mx-auto mb-2" />
                        <p className="text-xs">Image Uploaded</p>
                        <p className="text-xs mt-1 px-2 break-all">{ticket.imageUrl.split('/').pop()}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="w-48 h-48 rounded-lg bg-muted border border-dashed border-border flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        <ImageIcon className="w-8 h-8 mx-auto mb-2" />
                        <p className="text-xs">No image</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Ticket Details */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold">{ticket.ticketId}</h3>
                        <Badge className={getPriorityColor(ticket.priority)}>
                          {ticket.priority}
                        </Badge>
                        <Badge className={getStatusColor(ticket.status)}>
                          {ticket.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground capitalize">
                        {ticket.issueType ? ticket.issueType.replace(/_/g, ' ') : 'General Issue'}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm">{ticket.description}</p>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{ticket.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(ticket.createdAt).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Image Metadata */}
                  {ticket.imageUrl && (
                    <div className="pt-3 border-t border-border/50">
                      <p className="text-xs font-medium text-muted-foreground mb-2">Image Details:</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {ticket.customerName && (
                          <div className="flex items-center gap-2">
                            <User className="w-3 h-3 text-muted-foreground" />
                            <span>{ticket.customerName}</span>
                          </div>
                        )}
                        {ticket.uploadReason && (
                          <div className="flex items-center gap-2">
                            <FileText className="w-3 h-3 text-muted-foreground" />
                            <span>{ticket.uploadReason}</span>
                          </div>
                        )}
                        {ticket.imageLocation && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3 h-3 text-muted-foreground" />
                            <span>{ticket.imageLocation}</span>
                          </div>
                        )}
                        {ticket.imageUploadedAt && (
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3 h-3 text-muted-foreground" />
                            <span>Uploaded: {new Date(ticket.imageUploadedAt).toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
