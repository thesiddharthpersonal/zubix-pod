import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Calendar, MapPin, Clock, Users, Plus, Video, Building2, Ticket, ClipboardList, Mail, Phone, User as UserIcon, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PodEvent, User } from '@/types';
import TopNav from '@/components/layout/TopNav';
import BottomNav from '@/components/layout/BottomNav';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { eventsApi } from '@/services/api/events';
import { getManagedPods } from '@/lib/utils';

const Events = () => {
  const navigate = useNavigate();
  const { user, joinedPods } = useAuth();
  const [events, setEvents] = useState<PodEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({ name: '', type: 'ONLINE', date: '', time: '', location: '', description: '', helpline: '', podId: '' });
  const [selectedEvent, setSelectedEvent] = useState<PodEvent | null>(null);
  const [selectedPod, setSelectedPod] = useState<string>('all');
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [registeringEvent, setRegisteringEvent] = useState<PodEvent | null>(null);
  const [eventParticipants, setEventParticipants] = useState<{ [eventId: string]: any[] }>({});
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<PodEvent | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingEvent, setDeletingEvent] = useState<PodEvent | null>(null);

  // Check if user owns or co-owns any pods
  const managedPods = useMemo(() => getManagedPods(joinedPods, user?.id), [joinedPods, user?.id]);
  const canManageEvents = managedPods.length > 0;
  const [activeTab, setActiveTab] = useState<'all' | 'registered' | 'registrations'>('all');

  // Fetch events on mount
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        console.log('Fetching events...');
        const data = await eventsApi.getEventsFeed();
        console.log('Events fetched:', data);
        setEvents(data.map(event => ({
          ...event,
          date: new Date(event.date),
          createdAt: new Date(event.createdAt)
        })));
      } catch (error) {
        console.error('Failed to fetch events:', error);
        toast.error('Failed to load events');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchEvents();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Fetch participants for owner's events
  useEffect(() => {
    const fetchParticipants = async () => {
      if (!canManageEvents || activeTab !== 'registrations') return;

      try {
        const ownerEventIds = events.filter(e => e.createdBy === user?.id).map(e => e.id);
        const participantsData: { [eventId: string]: User[] } = {};

        for (const eventId of ownerEventIds) {
          const participants = await eventsApi.getEventParticipants(eventId);
          participantsData[eventId] = participants;
        }

        setEventParticipants(participantsData);
      } catch (error) {
        console.error('Failed to fetch participants:', error);
      }
    };

    fetchParticipants();
  }, [events, canManageEvents, activeTab, user?.id]);

  // Fetch participants for selected event
  useEffect(() => {
    const fetchSelectedEventParticipants = async () => {
      if (!selectedEvent) return;

      try {
        console.log('Fetching participants for event:', selectedEvent.id);
        const participants = await eventsApi.getEventParticipants(selectedEvent.id);
        console.log('Participants fetched:', participants);
        setEventParticipants(prev => ({
          ...prev,
          [selectedEvent.id]: participants
        }));
      } catch (error) {
        console.error('Failed to fetch selected event participants:', error);
      }
    };

    fetchSelectedEventParticipants();
  }, [selectedEvent]);

  const openRegisterDialog = (event: PodEvent) => {
    setRegisteringEvent(event);
    setIsRegisterOpen(true);
  };

  const handleConfirmRegister = async () => {
    if (registeringEvent) {
      try {
        await eventsApi.joinEvent(registeringEvent.id);
        
        // Refresh events to get updated participant list
        const data = await eventsApi.getEventsFeed();
        setEvents(data.map(event => ({
          ...event,
          date: new Date(event.date),
          createdAt: new Date(event.createdAt)
        })));
        
        toast.success('Registered successfully!');
        setIsRegisterOpen(false);
        setRegisteringEvent(null);
      } catch (error: any) {
        console.error('Failed to register:', error);
        toast.error(error.response?.data?.message || 'Failed to register for event');
      }
    }
  };

  // Get owner's events with registrations (includes events from pods user owns or co-owns)
  const ownerEvents = useMemo(() => {
    const managedPodIds = managedPods.map(pod => pod.id);
    return events.filter((e) => managedPodIds.includes(e.podId));
  }, [events, managedPods]);

  const getRegisteredUsers = (eventId: string) => {
    return eventParticipants[eventId] || [];
  };

  // Get registered events
  const registeredEvents = useMemo(() => {
    return events
      .filter((e) => e.participants?.some(p => p.userId === user?.id))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [events, user?.id]);

  // Filter events by selected pod
  const filteredEvents = useMemo(() => {
    if (selectedPod === 'all') return events;
    return events.filter((e) => e.podId === selectedPod);
  }, [events, selectedPod]);

  // Group events by date and sort in ascending order
  const groupedEvents = useMemo(() => {
    const sorted = [...filteredEvents].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const groups: { [key: string]: PodEvent[] } = {};
    
    sorted.forEach((event) => {
      const dateKey = format(new Date(event.date), 'yyyy-MM-dd');
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

  const handleCreate = async () => {
    if (!newEvent.name || !newEvent.date || !newEvent.time || !newEvent.podId) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const eventData = {
        ...newEvent,
        type: newEvent.type as 'ONLINE' | 'OFFLINE',
        description: newEvent.description || undefined,
        location: newEvent.type === 'OFFLINE' ? newEvent.location : undefined,
        helpline: newEvent.helpline || undefined,
      };

      await eventsApi.createEvent(eventData);
      
      // Refresh events
      const data = await eventsApi.getEventsFeed();
      setEvents(data.map(event => ({
        ...event,
        date: new Date(event.date),
        createdAt: new Date(event.createdAt)
      })));
      
      setIsCreateOpen(false);
      setNewEvent({ name: '', type: 'ONLINE', date: '', time: '', location: '', description: '', helpline: '', podId: '' });
      toast.success('Event created!');
    } catch (error: any) {
      console.error('Failed to create event:', error);
      toast.error(error.response?.data?.message || 'Failed to create event');
    }
  };

  const openEditDialog = (event: PodEvent) => {
    setEditingEvent(event);
    setNewEvent({
      name: event.name,
      type: event.type,
      date: format(new Date(event.date), 'yyyy-MM-dd'),
      time: event.time,
      location: event.location || '',
      description: event.description || '',
      helpline: event.helpline || '',
      podId: event.podId
    });
    setIsEditOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingEvent || !newEvent.name || !newEvent.date || !newEvent.time) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const eventData = {
        name: newEvent.name,
        type: newEvent.type as 'ONLINE' | 'OFFLINE',
        date: newEvent.date,
        time: newEvent.time,
        description: newEvent.description || undefined,
        location: newEvent.type === 'OFFLINE' ? newEvent.location : undefined,
        helpline: newEvent.helpline || undefined,
      };

      const updated = await eventsApi.updateEvent(editingEvent.id, eventData);
      setEvents(prev => prev.map(e => e.id === editingEvent.id ? updated : e));
      
      setIsEditOpen(false);
      setEditingEvent(null);
      setNewEvent({ name: '', type: 'ONLINE', date: '', time: '', location: '', description: '', helpline: '', podId: '' });
      toast.success('Event updated!');
    } catch (error: any) {
      console.error('Failed to update event:', error);
      toast.error(error.response?.data?.message || 'Failed to update event');
    }
  };

  const openDeleteDialog = (event: PodEvent) => {
    setDeletingEvent(event);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingEvent) return;

    try {
      await eventsApi.deleteEvent(deletingEvent.id);
      setEvents(prev => prev.filter(e => e.id !== deletingEvent.id));
      
      setIsDeleteDialogOpen(false);
      setDeletingEvent(null);
      toast.success('Event deleted!');
    } catch (error: any) {
      console.error('Failed to delete event:', error);
      toast.error(error.response?.data?.message || 'Failed to delete event');
    }
  };

  const handleDownloadCSV = async (eventId: string) => {
    try {
      const response = await eventsApi.downloadParticipantsCSV(eventId);
      
      // Create a blob from the response
      const blob = new Blob([response], { type: 'text/csv;charset=utf-8;' });
      
      // Create download link
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      
      // Generate filename
      const event = events.find(e => e.id === eventId);
      const eventName = event?.name.replace(/[^a-z0-9]/gi, '_') || 'event';
      const date = new Date().toISOString().split('T')[0];
      link.setAttribute('download', `${eventName}_participants_${date}.csv`);
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('CSV downloaded successfully!');
    } catch (error: any) {
      console.error('Failed to download CSV:', error);
      toast.error(error.response?.data?.error || 'Failed to download CSV');
    }
  };

  const canManageEvent = (event: PodEvent) => {
    if (!user) return false;
    const eventPod = joinedPods.find(p => p.id === event.podId);
    if (!eventPod) return false;
    return eventPod.ownerId === user.id || eventPod.isCoOwner === true || eventPod.userRole === 'co-owner';
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopNav />
      <main className="container mx-auto px-4 py-4 max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-foreground">Events</h1>
          {canManageEvents && (
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild><Button variant="hero" size="sm"><Plus className="w-4 h-4" />Create</Button></DialogTrigger>
              <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create Event</DialogTitle>
                  <p className="text-sm text-muted-foreground mt-1">Fill in the details for your event</p>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>Pod *</Label>
                    <Select value={newEvent.podId} onValueChange={(v) => setNewEvent({ ...newEvent, podId: v })}>
                      <SelectTrigger><SelectValue placeholder="Select a pod" /></SelectTrigger>
                      <SelectContent>{managedPods.map(pod => <SelectItem key={pod.id} value={pod.id}>{pod.name}</SelectItem>)}</SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">Required: Choose which pod is organizing this event</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Event Name *</Label>
                    <Input 
                      value={newEvent.name} 
                      onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })} 
                      placeholder="Enter event name"
                    />
                    <p className="text-xs text-muted-foreground">Required: Minimum 3 characters. Enter a clear, descriptive name</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Event Type *</Label>
                    <Select value={newEvent.type} onValueChange={(v) => setNewEvent({ ...newEvent, type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ONLINE">Online</SelectItem>
                        <SelectItem value="OFFLINE">Offline</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">Required: Select whether event is online or in-person</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Date *</Label>
                      <Input type="date" value={newEvent.date} onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })} />
                      <p className="text-xs text-muted-foreground">Required</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Time *</Label>
                      <Input type="time" value={newEvent.time} onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })} />
                      <p className="text-xs text-muted-foreground">Required</p>
                    </div>
                  </div>
                  
                  {newEvent.type === 'OFFLINE' && (
                    <div className="space-y-2">
                      <Label>Location</Label>
                      <Input 
                        value={newEvent.location} 
                        onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })} 
                        placeholder="Enter venue address"
                      />
                      <p className="text-xs text-muted-foreground">Optional: Add venue details for offline events</p>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea 
                      value={newEvent.description} 
                      onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })} 
                      placeholder="Describe your event..."
                      rows={3} 
                    />
                    <p className="text-xs text-muted-foreground">Optional: Provide event details, agenda, or additional information</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Helpline Number</Label>
                    <Input 
                      value={newEvent.helpline} 
                      onChange={(e) => setNewEvent({ ...newEvent, helpline: e.target.value })} 
                      placeholder="Contact number for inquiries"
                    />
                    <p className="text-xs text-muted-foreground">Optional: Add contact number for event-related queries</p>
                  </div>
                  
                  <Button variant="hero" className="w-full" onClick={handleCreate}>Create Event</Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading events...</p>
          </div>
        ) : (
          <>
            {/* Pod Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
          <Badge
            variant={selectedPod === 'all' ? 'default' : 'outline'}
            className="cursor-pointer whitespace-nowrap rounded-lg px-4 py-2"
            onClick={() => setSelectedPod('all')}
          >
            All Pods
          </Badge>
          {joinedPods.map((pod) => (
            <Badge
              key={pod.id}
              variant={selectedPod === pod.id ? 'default' : 'outline'}
              className="cursor-pointer whitespace-nowrap rounded-lg px-4 py-2"
              onClick={() => setSelectedPod(pod.id)}
            >
              {pod.name}
            </Badge>
          ))}
          <Badge
            variant="outline"
            className="cursor-pointer whitespace-nowrap text-primary border-primary hover:bg-primary/10 rounded-lg px-4 py-2"
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
            className="cursor-pointer rounded-lg px-4 py-2"
            onClick={() => setActiveTab('all')}
          >
            All Events
          </Badge>
          <Badge
            variant={activeTab === 'registered' ? 'default' : 'outline'}
            className="cursor-pointer rounded-lg px-4 py-2 flex items-center gap-1"
            onClick={() => setActiveTab('registered')}
          >
            <Ticket className="w-3.5 h-3.5" />
            My Registrations ({registeredEvents.length})
          </Badge>
          {canManageEvents && (
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
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${event.type.toUpperCase() === 'ONLINE' ? 'bg-info/10 text-info' : 'bg-accent/10 text-accent'}`}>
                        {event.type.toUpperCase() === 'ONLINE' ? <Video className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold text-foreground">{event.name}</h3>
                          <Badge variant="default" className="shrink-0">Registered</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{event.description}</p>
                        <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{format(new Date(event.date), 'MMM d, yyyy')}</span>
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
                      const isRegistered = event.participants?.some(p => p.userId === user?.id);
                      const isCreator = event.createdBy === user?.id;
                      const participantCount = event.participants?.length || 0;
                      return (
                        <Card key={event.id} className="card-hover">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${event.type.toUpperCase() === 'ONLINE' ? 'bg-info/10 text-info' : 'bg-accent/10 text-accent'}`}>
                                {event.type.toUpperCase() === 'ONLINE' ? <Video className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1">
                                    <h3 className="font-semibold text-foreground">{event.name}</h3>
                                  </div>
                                  <div className="flex items-center gap-2 shrink-0">
                                    <Badge variant="secondary">{event.type}</Badge>
                                    {canManageEvent(event) && (
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreVertical className="w-4 h-4" />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                          <DropdownMenuItem onClick={() => openEditDialog(event)}>
                                            <Pencil className="w-4 h-4 mr-2" />
                                            Edit
                                          </DropdownMenuItem>
                                          <DropdownMenuItem 
                                            onClick={() => openDeleteDialog(event)}
                                            className="text-destructive focus:text-destructive"
                                          >
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Delete
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    )}
                                  </div>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{event.description}</p>
                                <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{event.time}</span>
                                  {event.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{event.location}</span>}
                                  <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{participantCount}</span>
                                </div>
                                <div className="mt-3">
                                  {isCreator ? (
                                    <Badge variant="outline">Event Creator</Badge>
                                  ) : isRegistered ? (
                                    <Button variant="secondary" size="sm" disabled>Registered</Button>
                                  ) : (
                                    <Button variant="hero" size="sm" onClick={() => openRegisterDialog(event)}>Register</Button>
                                  )}
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

        {/* Event Registrations for Pod Owners and Co-Owners */}
        {activeTab === 'registrations' && canManageEvents && (
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
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${selectedEvent.type.toUpperCase() === 'ONLINE' ? 'bg-info/10 text-info' : 'bg-accent/10 text-accent'}`}>
                        {selectedEvent.type.toUpperCase() === 'ONLINE' ? <Video className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{selectedEvent.name}</h3>
                        <div className="flex flex-wrap gap-3 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{format(new Date(selectedEvent.date), 'MMM d, yyyy')}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{selectedEvent.time}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Registered Users ({getRegisteredUsers(selectedEvent.id).length})
                  </h4>
                  {getRegisteredUsers(selectedEvent.id).length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadCSV(selectedEvent.id)}
                    >
                      <ClipboardList className="w-4 h-4 mr-2" />
                      Download CSV
                    </Button>
                  )}
                </div>

                {getRegisteredUsers(selectedEvent.id).length === 0 ? (
                  <div className="text-center py-8 bg-muted/20 rounded-lg">
                    <Users className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No registrations yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {getRegisteredUsers(selectedEvent.id).map((participant) => (
                      <Card key={participant.id} className="card-hover">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                              <UserIcon className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-foreground">{participant.user.fullName}</h4>
                              <p className="text-sm text-muted-foreground">@{participant.user.username}</p>
                              <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Mail className="w-3.5 h-3.5" />
                                  {participant.user.email}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Phone className="w-3.5 h-3.5" />
                                  {participant.user.mobile}
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
                    {ownerEvents.map((event) => {
                      const participantCount = getRegisteredUsers(event.id).length;
                      return (
                        <Card
                          key={event.id}
                          className="card-hover cursor-pointer"
                          onClick={() => setSelectedEvent(event)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${event.type.toUpperCase() === 'ONLINE' ? 'bg-info/10 text-info' : 'bg-accent/10 text-accent'}`}>
                                {event.type.toUpperCase() === 'ONLINE' ? <Video className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <h3 className="font-semibold text-foreground">{event.name}</h3>
                                  <Badge variant="secondary" className="shrink-0">
                                    <Users className="w-3 h-3 mr-1" />
                                    {participantCount}
                                  </Badge>
                                </div>
                                <div className="flex flex-wrap gap-3 mt-1 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{format(new Date(event.date), 'MMM d, yyyy')}</span>
                                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{event.time}</span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        {/* Registration Dialog */}
        {/* Registration Confirmation Dialog */}
        <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Register for Event</DialogTitle>
            </DialogHeader>
            {registeringEvent && (
              <div className="space-y-4 mt-4">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <h4 className="font-medium text-foreground">{registeringEvent.name}</h4>
                  <div className="flex flex-wrap gap-3 mt-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{format(new Date(registeringEvent.date), 'MMM d, yyyy')}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{registeringEvent.time}</span>
                  </div>
                  {registeringEvent.description && (
                    <p className="text-sm text-muted-foreground mt-2">{registeringEvent.description}</p>
                  )}
                </div>

                <div className="p-3 bg-primary/5 rounded-lg">
                  <p className="text-sm text-foreground">
                    You are registering as <span className="font-semibold">{user?.fullName}</span>
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">{user?.email}</p>
                </div>

                <Button variant="hero" className="w-full" onClick={handleConfirmRegister}>
                  Confirm Registration
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Event Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Event</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">Update your event details</p>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Event Name *</Label>
                <Input value={newEvent.name} onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })} placeholder="Enter event name" />
                <p className="text-xs text-muted-foreground">Required: Minimum 3 characters</p>
              </div>
              
              <div className="space-y-2">
                <Label>Event Type *</Label>
                <Select value={newEvent.type} onValueChange={(v) => setNewEvent({ ...newEvent, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ONLINE">Online</SelectItem>
                    <SelectItem value="OFFLINE">Offline</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Required: Select event type</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date *</Label>
                  <Input type="date" value={newEvent.date} onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })} />
                  <p className="text-xs text-muted-foreground">Required</p>
                </div>
                <div className="space-y-2">
                  <Label>Time *</Label>
                  <Input type="time" value={newEvent.time} onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })} />
                  <p className="text-xs text-muted-foreground">Required</p>
                </div>
              </div>
              
              {newEvent.type === 'OFFLINE' && (
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input value={newEvent.location} onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })} placeholder="Enter venue address" />
                  <p className="text-xs text-muted-foreground">Optional: Venue details for offline events</p>
                </div>
              )}
              
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={newEvent.description} onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })} placeholder="Describe your event..." rows={3} />
                <p className="text-xs text-muted-foreground">Optional: Event details and agenda</p>
              </div>
              
              <div className="space-y-2">
                <Label>Helpline Number</Label>
                <Input value={newEvent.helpline} onChange={(e) => setNewEvent({ ...newEvent, helpline: e.target.value })} placeholder="Contact number for inquiries" />
                <p className="text-xs text-muted-foreground">Optional: Contact for queries</p>
              </div>
              
              <Button variant="hero" className="w-full" onClick={handleUpdate}>Update Event</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Event</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{deletingEvent?.name}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        </>
        )}
      </main>
      <BottomNav />
    </div>
  );
};

export default Events;
