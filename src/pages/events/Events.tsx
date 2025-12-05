import { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, MapPin, Clock, Users, Plus, Video, Building2 } from 'lucide-react';
import { PodEvent } from '@/types';
import TopNav from '@/components/layout/TopNav';
import BottomNav from '@/components/layout/BottomNav';
import { toast } from 'sonner';
import { format } from 'date-fns';

const MOCK_EVENTS: PodEvent[] = [
  { id: '1', podId: '1', name: 'Demo Day 2024', type: 'offline', date: new Date(2024, 11, 15), time: '10:00 AM', location: 'Bangalore Tech Park', description: '10 startups pitch to top VCs', registeredUserIds: ['user1'], createdBy: 'owner1', createdAt: new Date() },
  { id: '2', podId: '1', name: 'Founder Fireside Chat', type: 'online', date: new Date(2024, 11, 10), time: '6:00 PM', description: 'AMA with successful founders', registeredUserIds: [], createdBy: 'owner1', createdAt: new Date() },
  { id: '3', podId: '2', name: 'Investor Office Hours', type: 'online', date: new Date(2024, 11, 10), time: '3:00 PM', description: '1-on-1 sessions with angel investors', registeredUserIds: ['user1', 'user2'], createdBy: 'owner2', createdAt: new Date() },
  { id: '4', podId: '1', name: 'Startup Networking', type: 'offline', date: new Date(2024, 11, 20), time: '5:00 PM', location: 'WeWork HSR', description: 'Meet fellow founders', registeredUserIds: [], createdBy: 'owner1', createdAt: new Date() },
  { id: '5', podId: '2', name: 'Pitch Practice', type: 'online', date: new Date(2024, 11, 15), time: '2:00 PM', description: 'Practice your pitch with mentors', registeredUserIds: ['user1'], createdBy: 'owner2', createdAt: new Date() },
];

const Events = () => {
  const { user, joinedPods } = useAuth();
  const [events, setEvents] = useState(MOCK_EVENTS);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({ name: '', type: 'online' as 'online' | 'offline', date: '', time: '', location: '', description: '', helpline: '', podId: '' });

  const isPodOwner = user?.role === 'pod_owner';

  // Group events by date and sort in ascending order
  const groupedEvents = useMemo(() => {
    const sorted = [...events].sort((a, b) => a.date.getTime() - b.date.getTime());
    const groups: { [key: string]: PodEvent[] } = {};
    
    sorted.forEach((event) => {
      const dateKey = format(event.date, 'yyyy-MM-dd');
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(event);
    });

    return Object.entries(groups).map(([dateKey, events]) => ({
      date: new Date(dateKey),
      dateKey,
      events,
    }));
  }, [events]);

  const handleRegister = (eventId: string) => {
    setEvents(events.map((e) => e.id === eventId ? { ...e, registeredUserIds: [...e.registeredUserIds, user?.id || ''] } : e));
    toast.success('Registered successfully!');
  };

  const handleCreate = () => {
    setIsCreateOpen(false);
    toast.success('Event created!');
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopNav />
      <main className="container mx-auto px-4 py-4 max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-foreground">Events</h1>
          {isPodOwner && (
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild><Button variant="hero" size="sm"><Plus className="w-4 h-4" />Create</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Create Event</DialogTitle></DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="space-y-2"><Label>Event Name</Label><Input value={newEvent.name} onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Type</Label><Select value={newEvent.type} onValueChange={(v) => setNewEvent({ ...newEvent, type: v as 'online' | 'offline' })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="online">Online</SelectItem><SelectItem value="offline">Offline</SelectItem></SelectContent></Select></div>
                  <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>Date</Label><Input type="date" value={newEvent.date} onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })} /></div><div className="space-y-2"><Label>Time</Label><Input type="time" value={newEvent.time} onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })} /></div></div>
                  {newEvent.type === 'offline' && <div className="space-y-2"><Label>Location</Label><Input value={newEvent.location} onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })} /></div>}
                  <div className="space-y-2"><Label>Description</Label><Textarea value={newEvent.description} onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })} rows={3} /></div>
                  <Button variant="hero" className="w-full" onClick={handleCreate}>Create Event</Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Events grouped by date */}
        <div className="space-y-6">
          {groupedEvents.map(({ date, dateKey, events: dayEvents }) => (
            <div key={dateKey}>
              {/* Date Header */}
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-primary text-primary-foreground rounded-lg px-3 py-2 text-center min-w-[60px]">
                  <div className="text-lg font-bold">{format(date, 'd')}</div>
                  <div className="text-xs uppercase">{format(date, 'MMM')}</div>
                </div>
                <div>
                  <div className="font-semibold text-foreground">{format(date, 'EEEE')}</div>
                  <div className="text-sm text-muted-foreground">{format(date, 'MMMM yyyy')}</div>
                </div>
              </div>

              {/* Events for this date */}
              <div className="space-y-3 ml-[72px]">
                {dayEvents.map((event) => {
                  const isRegistered = event.registeredUserIds.includes(user?.id || '');
                  return (
                    <Card key={event.id} className="card-hover">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${event.type === 'online' ? 'bg-info/10 text-info' : 'bg-accent/10 text-accent'}`}>
                            {event.type === 'online' ? <Video className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="font-semibold text-foreground">{event.name}</h3>
                              <Badge variant="secondary" className="shrink-0">{event.type}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{event.description}</p>
                            <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{event.time}</span>
                              {event.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{event.location}</span>}
                              <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{event.registeredUserIds.length}</span>
                            </div>
                            <div className="mt-3">
                              {isRegistered ? <Button variant="secondary" size="sm" disabled>Registered</Button> : <Button variant="hero" size="sm" onClick={() => handleRegister(event.id)}>Register</Button>}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {groupedEvents.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No upcoming events</p>
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
};

export default Events;
