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
import { Calendar, MapPin, Clock, Users, Plus, Video, Building2, Ticket, ClipboardList, Mail, Phone, User as UserIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PodEvent, User } from '@/types';
import TopNav from '@/components/layout/TopNav';
import BottomNav from '@/components/layout/BottomNav';
import { toast } from 'sonner';
import { format } from 'date-fns';

// Mock users for registration display
const MOCK_USERS: User[] = [
  { id: 'user1', fullName: 'Rahul Sharma', email: 'rahul@startup.com', mobile: '+91 98765 43210', username: 'rahulsharma', role: 'user', createdAt: new Date() },
  { id: 'user2', fullName: 'Priya Patel', email: 'priya@techventure.in', mobile: '+91 87654 32109', username: 'priyapatel', role: 'user', createdAt: new Date() },
  { id: 'user3', fullName: 'Amit Kumar', email: 'amit@innovate.co', mobile: '+91 76543 21098', username: 'amitkumar', role: 'user', createdAt: new Date() },
];

const MOCK_EVENTS: PodEvent[] = [
  { id: '1', podId: '1', name: 'Demo Day 2024', type: 'offline', date: new Date(2024, 11, 15), time: '10:00 AM', location: 'Bangalore Tech Park', description: '10 startups pitch to top VCs', registeredUserIds: ['user1'], createdBy: 'owner1', createdAt: new Date() },
  { id: '2', podId: '1', name: 'Founder Fireside Chat', type: 'online', date: new Date(2024, 11, 10), time: '6:00 PM', description: 'AMA with successful founders', registeredUserIds: ['user1', 'user2', 'user3'], createdBy: 'owner1', createdAt: new Date() },
  { id: '3', podId: '2', name: 'Investor Office Hours', type: 'online', date: new Date(2024, 11, 10), time: '3:00 PM', description: '1-on-1 sessions with angel investors', registeredUserIds: ['user1', 'user2'], createdBy: 'owner2', createdAt: new Date() },
  { id: '4', podId: '1', name: 'Startup Networking', type: 'offline', date: new Date(2024, 11, 20), time: '5:00 PM', location: 'WeWork HSR', description: 'Meet fellow founders', registeredUserIds: [], createdBy: 'owner1', createdAt: new Date() },
  { id: '5', podId: '2', name: 'Pitch Practice', type: 'online', date: new Date(2024, 11, 15), time: '2:00 PM', description: 'Practice your pitch with mentors', registeredUserIds: ['user1'], createdBy: 'owner2', createdAt: new Date() },
];

const Events = () => {
  const navigate = useNavigate();
  const { user, joinedPods } = useAuth();
  const [events, setEvents] = useState(MOCK_EVENTS);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({ name: '', type: 'online' as 'online' | 'offline', date: '', time: '', location: '', description: '', helpline: '', podId: '' });
  const [selectedEvent, setSelectedEvent] = useState<PodEvent | null>(null);
  const [selectedPod, setSelectedPod] = useState<string>('all');

  const isPodOwner = user?.role === 'pod_owner';
  const [activeTab, setActiveTab] = useState<'all' | 'registered' | 'registrations'>('all');

  // Get owner's events with registrations
  const ownerEvents = useMemo(() => {
    return events.filter((e) => e.createdBy === 'owner1'); // Mock: assuming current pod owner is owner1
  }, [events]);

  const getRegisteredUsers = (userIds: string[]): User[] => {
    return MOCK_USERS.filter((u) => userIds.includes(u.id));
  };

  // Get registered events
  const registeredEvents = useMemo(() => {
    return events
      .filter((e) => e.registeredUserIds.includes(user?.id || ''))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [events, user?.id]);

  // Filter events by selected pod
  const filteredEvents = useMemo(() => {
    if (selectedPod === 'all') return events;
    return events.filter((e) => e.podId === selectedPod);
  }, [events, selectedPod]);

  // Group events by date and sort in ascending order
  const groupedEvents = useMemo(() => {
    const sorted = [...filteredEvents].sort((a, b) => a.date.getTime() - b.date.getTime());
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
  }, [filteredEvents]);

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

        {/* Pod Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
          <Badge
            variant={selectedPod === 'all' ? 'default' : 'outline'}
            className="cursor-pointer whitespace-nowrap"
            onClick={() => setSelectedPod('all')}
          >
            All Pods
          </Badge>
          {joinedPods.map((pod) => (
            <Badge
              key={pod.id}
              variant={selectedPod === pod.id ? 'default' : 'outline'}
              className="cursor-pointer whitespace-nowrap"
              onClick={() => setSelectedPod(pod.id)}
            >
              {pod.name}
            </Badge>
          ))}
          <Badge
            variant="outline"
            className="cursor-pointer whitespace-nowrap text-primary border-primary hover:bg-primary/10"
            onClick={() => navigate('/discover')}
          >
            <Plus className="w-3 h-3 mr-1" />
            Explore More
          </Badge>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <Badge
            variant={activeTab === 'all' ? 'default' : 'outline'}
            className="cursor-pointer px-4 py-2"
            onClick={() => setActiveTab('all')}
          >
            All Events
          </Badge>
          <Badge
            variant={activeTab === 'registered' ? 'default' : 'outline'}
            className="cursor-pointer px-4 py-2 flex items-center gap-1"
            onClick={() => setActiveTab('registered')}
          >
            <Ticket className="w-3.5 h-3.5" />
            My Registrations ({registeredEvents.length})
          </Badge>
          {isPodOwner && (
            <Badge
              variant={activeTab === 'registrations' ? 'default' : 'outline'}
              className="cursor-pointer px-4 py-2 flex items-center gap-1"
              onClick={() => setActiveTab('registrations')}
            >
              <ClipboardList className="w-3.5 h-3.5" />
              Event Registrations
            </Badge>
          )}
        </div>

        {/* My Registered Events */}
        {activeTab === 'registered' && (
          <div className="space-y-3">
            {registeredEvents.length === 0 ? (
              <div className="text-center py-12">
                <Ticket className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">You haven't registered for any events yet</p>
              </div>
            ) : (
              registeredEvents.map((event) => (
                <Card key={event.id} className="card-hover border-primary/20 bg-primary/5">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${event.type === 'online' ? 'bg-info/10 text-info' : 'bg-accent/10 text-accent'}`}>
                        {event.type === 'online' ? <Video className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold text-foreground">{event.name}</h3>
                          <Badge variant="default" className="shrink-0">Registered</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{event.description}</p>
                        <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{format(event.date, 'MMM d, yyyy')}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{event.time}</span>
                          {event.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{event.location}</span>}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {/* All Events grouped by date */}
        {activeTab === 'all' && (
          <>
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
          </>
        )}

        {/* Event Registrations for Pod Owners */}
        {activeTab === 'registrations' && isPodOwner && (
          <div className="space-y-4">
            {selectedEvent ? (
              // Show registrations for selected event
              <div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedEvent(null)}
                  className="mb-4"
                >
                  ← Back to Events
                </Button>
                <Card className="mb-4">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${selectedEvent.type === 'online' ? 'bg-info/10 text-info' : 'bg-accent/10 text-accent'}`}>
                        {selectedEvent.type === 'online' ? <Video className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{selectedEvent.name}</h3>
                        <div className="flex flex-wrap gap-3 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{format(selectedEvent.date, 'MMM d, yyyy')}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{selectedEvent.time}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Registered Users ({selectedEvent.registeredUserIds.length})
                </h4>

                {selectedEvent.registeredUserIds.length === 0 ? (
                  <div className="text-center py-8 bg-muted/20 rounded-lg">
                    <Users className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No registrations yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {getRegisteredUsers(selectedEvent.registeredUserIds).map((regUser) => (
                      <Card key={regUser.id} className="card-hover">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                              <UserIcon className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-foreground">{regUser.fullName}</h4>
                              <p className="text-sm text-muted-foreground">@{regUser.username}</p>
                              <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Mail className="w-3.5 h-3.5" />
                                  {regUser.email}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Phone className="w-3.5 h-3.5" />
                                  {regUser.mobile}
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              // Show list of owner's events
              <div>
                <p className="text-sm text-muted-foreground mb-4">View registrations for events you've created</p>
                {ownerEvents.length === 0 ? (
                  <div className="text-center py-12">
                    <ClipboardList className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">You haven't created any events yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {ownerEvents.map((event) => (
                      <Card
                        key={event.id}
                        className="card-hover cursor-pointer"
                        onClick={() => setSelectedEvent(event)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${event.type === 'online' ? 'bg-info/10 text-info' : 'bg-accent/10 text-accent'}`}>
                              {event.type === 'online' ? <Video className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <h3 className="font-semibold text-foreground">{event.name}</h3>
                                <Badge variant="secondary" className="shrink-0">
                                  <Users className="w-3 h-3 mr-1" />
                                  {event.registeredUserIds.length}
                                </Badge>
                              </div>
                              <div className="flex flex-wrap gap-3 mt-1 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{format(event.date, 'MMM d, yyyy')}</span>
                                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{event.time}</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
};

export default Events;
