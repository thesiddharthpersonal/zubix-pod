import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Phone, Send, Check, X, MessageSquare } from 'lucide-react';
import { CallBooking, User, Pod } from '@/types';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { callBookingApi } from '@/services/api/callBookings';
import { podsApi } from '@/services/api/pods';

const BookCall = () => {
  const navigate = useNavigate();
  const { user, joinedPods } = useAuth();
  const isPodOwner = user?.role === 'pod_owner';

  const [activeTab, setActiveTab] = useState(isPodOwner ? 'received' : 'book');
  const [selectedPodId, setSelectedPodId] = useState('');
  const [selectedPerson, setSelectedPerson] = useState('');
  const [purpose, setPurpose] = useState('');
  const [loading, setLoading] = useState(false);

  const [pods, setPods] = useState<(Pod & { coOwners: User[] })[]>([]);
  const [userBookings, setUserBookings] = useState<CallBooking[]>([]);
  const [receivedBookings, setReceivedBookings] = useState<CallBooking[]>([]);

  const [respondDialog, setRespondDialog] = useState<{ open: boolean; booking: CallBooking | null; action: 'accept' | 'reject' }>({
    open: false,
    booking: null,
    action: 'accept',
  });
  const [remark, setRemark] = useState('');

  // Fetch joined pods with owners and co-owners
  useEffect(() => {
    const fetchPods = async () => {
      try {
        const podsWithDetails = await Promise.all(
          joinedPods.map(async (pod) => {
            try {
              const details = await podsApi.getPodById(pod.id);
              return {
                ...pod,
                owner: details.owner,
                coOwners: details.coOwners || [],
              };
            } catch (error) {
              console.error(`Failed to fetch details for pod ${pod.id}:`, error);
              return null;
            }
          })
        );
        setPods(podsWithDetails.filter(Boolean) as (Pod & { coOwners: User[] })[]);
      } catch (error) {
        console.error('Failed to fetch pods:', error);
      }
    };

    if (joinedPods.length > 0) {
      fetchPods();
    }
  }, [joinedPods]);

  // Fetch user's call bookings
  useEffect(() => {
    const fetchUserBookings = async () => {
      if (!user) return;
      
      try {
        const bookings = await callBookingApi.getUserBookings(user.id);
        setUserBookings(bookings);
      } catch (error) {
        console.error('Failed to fetch user bookings:', error);
      }
    };

    fetchUserBookings();
  }, [user]);

  // Fetch received bookings for all users
  useEffect(() => {
    const fetchReceivedBookings = async () => {
      if (!user) return;
      
      try {
        const bookings = await callBookingApi.getReceivedBookings(user.id);
        console.log('Received bookings:', bookings);
        console.log('Current user ID:', user.id);
        setReceivedBookings(bookings);
      } catch (error) {
        console.error('Failed to fetch received bookings:', error);
      }
    };

    fetchReceivedBookings();
  }, [user]);

  const selectedPod = pods.find(p => p.id === selectedPodId);
  const availablePeople = selectedPod
    ? [
        { ...selectedPod.owner, role: 'owner' as const },
        ...selectedPod.coOwners.map(co => ({ ...co, role: 'co-owner' as const })),
      ]
    : [];

  const handleSubmitBooking = async () => {
    if (!selectedPodId || !selectedPerson || !purpose.trim() || !user) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const [targetUserId, targetRole] = selectedPerson.split(':');
      
      await callBookingApi.createBooking(user.id, {
        podId: selectedPodId,
        targetUserId,
        targetRole: targetRole as 'owner' | 'co-owner',
        purpose: purpose.trim(),
      });

      toast.success('Call booking request sent!');
      
      // Refresh bookings
      const bookings = await callBookingApi.getUserBookings(user.id);
      setUserBookings(bookings);
      
      // Reset form
      setSelectedPodId('');
      setSelectedPerson('');
      setPurpose('');
      setActiveTab('my-requests');
    } catch (error: any) {
      console.error('Failed to create booking:', error);
      toast.error(error.message || 'Failed to send booking request');
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async () => {
    if (!respondDialog.booking || !user) return;
    
    try {
      setLoading(true);
      await callBookingApi.respondToBooking({
        bookingId: respondDialog.booking.id,
        status: respondDialog.action === 'accept' ? 'accepted' : 'rejected',
        remark: remark.trim() || undefined,
      });

      // Refresh received bookings
      const bookings = await callBookingApi.getReceivedBookings(user.id);
      setReceivedBookings(bookings);
      
      toast.success(`Request ${respondDialog.action === 'accept' ? 'accepted' : 'rejected'}`);
      setRespondDialog({ open: false, booking: null, action: 'accept' });
      setRemark('');
    } catch (error: any) {
      console.error('Failed to respond to booking:', error);
      toast.error(error.message || 'Failed to respond to booking');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: CallBooking['status']) => {
    switch (status) {
      case 'accepted': return 'bg-success/10 text-success';
      case 'rejected': return 'bg-destructive/10 text-destructive';
      default: return 'bg-warning/10 text-warning';
    }
  };

  const getTimeAgo = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const seconds = Math.floor((new Date().getTime() - dateObj.getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const BookingCard = ({ booking, type }: { booking: CallBooking; type: 'sent' | 'received' }) => {
    const person = type === 'sent' ? booking.target : booking.requester;
    const podName = booking.pod?.name || booking.podName || 'Unknown Pod';
    
    if (!person) {
      return null;
    }
    
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src={person.avatar} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {person.fullName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold text-foreground">{person.fullName}</p>
                <Badge className={getStatusColor(booking.status)}>
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{podName} • {type === 'sent' ? booking.targetRole : 'User'}</p>
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{booking.purpose}</p>

              {booking.remark && (
                <div className="mt-3 p-2 bg-secondary/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">Remark:</p>
                  <p className="text-sm text-foreground">{booking.remark}</p>
                </div>
              )}

              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-muted-foreground">{getTimeAgo(booking.createdAt)}</span>
                
                {type === 'received' && booking.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setRespondDialog({ open: true, booking, action: 'reject' })}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                    <Button
                      variant="hero"
                      size="sm"
                      onClick={() => setRespondDialog({ open: true, booking, action: 'accept' })}
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Accept
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const pendingReceivedCount = receivedBookings.filter(b => b.status === 'pending').length;

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center gap-3 p-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/others')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-foreground">Book a Call</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 max-w-2xl">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full mb-6 grid-cols-3">
            {!isPodOwner && <TabsTrigger value="book" className="flex-1">Book Call</TabsTrigger>}
            <TabsTrigger value="my-requests" className="flex-1">
              My Requests
            </TabsTrigger>
            <TabsTrigger value="received" className="flex-1">
              Received
              {pendingReceivedCount > 0 && (
                <span className="ml-2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                  {pendingReceivedCount}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Book a Call Form (for users) */}
          {!isPodOwner && (
            <TabsContent value="book">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="w-5 h-5" />
                    Request a Call
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Select Pod *</Label>
                    <Select value={selectedPodId} onValueChange={(v) => { setSelectedPodId(v); setSelectedPerson(''); }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a pod" />
                      </SelectTrigger>
                      <SelectContent>
                        {pods.map(pod => (
                          <SelectItem key={pod.id} value={pod.id}>{pod.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Select Owner/Co-Owner *</Label>
                    <Select value={selectedPerson} onValueChange={setSelectedPerson} disabled={!selectedPodId}>
                      <SelectTrigger>
                        <SelectValue placeholder={selectedPodId ? "Choose a person" : "Select a pod first"} />
                      </SelectTrigger>
                      <SelectContent>
                        {availablePeople.map(person => (
                          <SelectItem key={person.id} value={`${person.id}:${person.role}`}>
                            <div className="flex items-center gap-2">
                              <span>{person.fullName}</span>
                              <Badge variant="outline" className="text-xs">
                                {person.role === 'owner' ? 'Owner' : 'Co-Owner'}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Purpose of Call *</Label>
                    <Textarea
                      placeholder="Briefly describe why you want to book this call..."
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <Button variant="hero" className="w-full" onClick={handleSubmitBooking} disabled={loading}>
                    <Send className="w-4 h-4 mr-2" />
                    {loading ? 'Sending...' : 'Send Request'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* My Requests */}
          <TabsContent value="my-requests" className="space-y-3">
            {userBookings.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">No call requests yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Book a call with pod owners to get started
                </p>
              </div>
            ) : (
              userBookings.map(booking => (
                <BookingCard key={booking.id} booking={booking} type="sent" />
              ))
            )}
          </TabsContent>

          {/* Received Requests */}
          <TabsContent value="received" className="space-y-3">
            {receivedBookings.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">No call requests received</p>
                <p className="text-sm text-muted-foreground mt-1">
                  When users request calls with you, they'll appear here
                </p>
              </div>
            ) : (
              receivedBookings.map(booking => (
                <BookingCard key={booking.id} booking={booking} type="received" />
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Respond Dialog */}
      <Dialog open={respondDialog.open} onOpenChange={(open) => setRespondDialog({ ...respondDialog, open })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {respondDialog.action === 'accept' ? 'Accept' : 'Reject'} Call Request
            </DialogTitle>
            <DialogDescription>
              {respondDialog.action === 'accept'
                ? 'Accept this call request and optionally add a message.'
                : 'Reject this call request. You can provide a reason.'}
            </DialogDescription>
          </DialogHeader>
          
          {respondDialog.booking && (
            <div className="py-4">
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {respondDialog.booking.requester.fullName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{respondDialog.booking.requester.fullName}</p>
                  <p className="text-sm text-muted-foreground">{respondDialog.booking.purpose}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>
                  <MessageSquare className="w-4 h-4 inline mr-1" />
                  Remark (optional)
                </Label>
                <Textarea
                  placeholder={respondDialog.action === 'accept' 
                    ? "e.g., Looking forward to the call! Please share your pitch deck beforehand."
                    : "e.g., Unfortunately, I'm not available this week. Please try again later."}
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setRespondDialog({ open: false, booking: null, action: 'accept' })} disabled={loading}>
              Cancel
            </Button>
            <Button
              variant={respondDialog.action === 'accept' ? 'hero' : 'destructive'}
              onClick={handleRespond}
              disabled={loading}
            >
              {loading ? 'Processing...' : respondDialog.action === 'accept' ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Accept
                </>
              ) : (
                <>
                  <X className="w-4 h-4 mr-2" />
                  Reject
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BookCall;
