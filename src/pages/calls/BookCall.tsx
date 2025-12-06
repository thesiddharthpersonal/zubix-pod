import { useState } from 'react';
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
import { ArrowLeft, Phone, Calendar, Clock, Send, Check, X, MessageSquare } from 'lucide-react';
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

// Mock pods with owners and co-owners
const MOCK_PODS: (Pod & { coOwners: User[] })[] = [
  {
    id: '1',
    name: 'TechStars India',
    logo: undefined,
    subcategory: 'Accelerator',
    focusAreas: ['SaaS', 'FinTech'],
    organisationName: 'TechStars',
    organisationType: 'Private',
    operatingCity: 'Bangalore',
    socialLinks: {},
    ownerId: 'owner1',
    owner: { id: 'owner1', fullName: 'Vikram Mehta', username: 'vikram', email: 'v@e.com', mobile: '', role: 'pod_owner', createdAt: new Date() },
    coOwnerIds: ['coowner1', 'coowner2'],
    coOwners: [
      { id: 'coowner1', fullName: 'Sneha Kapoor', username: 'sneha', email: 's@e.com', mobile: '', role: 'pod_owner', createdAt: new Date() },
      { id: 'coowner2', fullName: 'Arjun Reddy', username: 'arjun', email: 'a@e.com', mobile: '', role: 'pod_owner', createdAt: new Date() },
    ],
    memberIds: [],
    isApproved: true,
    createdAt: new Date(),
  },
  {
    id: '2',
    name: 'Angel Network Mumbai',
    logo: undefined,
    subcategory: 'Angel Network',
    focusAreas: ['Pre-Seed', 'Seed'],
    organisationName: 'Angel Network',
    organisationType: 'Private',
    operatingCity: 'Mumbai',
    socialLinks: {},
    ownerId: 'owner2',
    owner: { id: 'owner2', fullName: 'Priya Shah', username: 'priya', email: 'p@e.com', mobile: '', role: 'pod_owner', createdAt: new Date() },
    coOwnerIds: ['coowner3'],
    coOwners: [
      { id: 'coowner3', fullName: 'Karan Malhotra', username: 'karan', email: 'k@e.com', mobile: '', role: 'pod_owner', createdAt: new Date() },
    ],
    memberIds: [],
    isApproved: true,
    createdAt: new Date(),
  },
];

// Mock bookings for the user
const MOCK_USER_BOOKINGS: CallBooking[] = [
  {
    id: '1',
    podId: '1',
    podName: 'TechStars India',
    requesterId: 'user1',
    requester: {} as User,
    targetUserId: 'owner1',
    targetUser: { id: 'owner1', fullName: 'Vikram Mehta', username: 'vikram', email: '', mobile: '', role: 'pod_owner', createdAt: new Date() },
    targetRole: 'owner',
    purpose: 'Discuss investment opportunity for my AI startup',
    preferredDate: new Date(Date.now() + 86400000 * 3),
    preferredTime: '3:00 PM',
    status: 'pending',
    createdAt: new Date(Date.now() - 86400000),
  },
];

// Mock received bookings for pod owners
const MOCK_RECEIVED_BOOKINGS: CallBooking[] = [
  {
    id: '2',
    podId: '1',
    podName: 'TechStars India',
    requesterId: 'user2',
    requester: { id: 'user2', fullName: 'Rahul Sharma', username: 'rahul', email: '', mobile: '', role: 'user', createdAt: new Date() },
    targetUserId: 'owner1',
    targetUser: {} as User,
    targetRole: 'owner',
    purpose: 'Want to pitch my EdTech startup and explore mentorship',
    preferredDate: new Date(Date.now() + 86400000 * 2),
    preferredTime: '11:00 AM',
    status: 'pending',
    createdAt: new Date(Date.now() - 3600000 * 5),
  },
  {
    id: '3',
    podId: '1',
    podName: 'TechStars India',
    requesterId: 'user3',
    requester: { id: 'user3', fullName: 'Neha Gupta', username: 'neha', email: '', mobile: '', role: 'user', createdAt: new Date() },
    targetUserId: 'owner1',
    targetUser: {} as User,
    targetRole: 'owner',
    purpose: 'Seeking guidance on fundraising strategy',
    status: 'accepted',
    remark: 'Looking forward to the call! Please prepare your pitch deck.',
    createdAt: new Date(Date.now() - 86400000 * 2),
    respondedAt: new Date(Date.now() - 86400000),
  },
];

const BookCall = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isPodOwner = user?.role === 'pod_owner';

  const [activeTab, setActiveTab] = useState(isPodOwner ? 'received' : 'book');
  const [selectedPodId, setSelectedPodId] = useState('');
  const [selectedPerson, setSelectedPerson] = useState('');
  const [purpose, setPurpose] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('');

  const [userBookings, setUserBookings] = useState<CallBooking[]>(MOCK_USER_BOOKINGS);
  const [receivedBookings, setReceivedBookings] = useState<CallBooking[]>(MOCK_RECEIVED_BOOKINGS);

  const [respondDialog, setRespondDialog] = useState<{ open: boolean; booking: CallBooking | null; action: 'accept' | 'reject' }>({
    open: false,
    booking: null,
    action: 'accept',
  });
  const [remark, setRemark] = useState('');

  const selectedPod = MOCK_PODS.find(p => p.id === selectedPodId);
  const availablePeople = selectedPod
    ? [
        { ...selectedPod.owner, role: 'owner' as const },
        ...selectedPod.coOwners.map(co => ({ ...co, role: 'co-owner' as const })),
      ]
    : [];

  const handleSubmitBooking = () => {
    if (!selectedPodId || !selectedPerson || !purpose.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }
    // TODO: Call callBookingApi.createBooking()
    toast.success('Call booking request sent!');
    setSelectedPodId('');
    setSelectedPerson('');
    setPurpose('');
    setPreferredDate('');
    setPreferredTime('');
    setActiveTab('my-requests');
  };

  const handleRespond = () => {
    if (!respondDialog.booking) return;
    
    setReceivedBookings(prev =>
      prev.map(b =>
        b.id === respondDialog.booking!.id
          ? { ...b, status: respondDialog.action === 'accept' ? 'accepted' : 'rejected', remark, respondedAt: new Date() }
          : b
      )
    );
    
    toast.success(`Request ${respondDialog.action === 'accept' ? 'accepted' : 'rejected'}`);
    setRespondDialog({ open: false, booking: null, action: 'accept' });
    setRemark('');
  };

  const getStatusColor = (status: CallBooking['status']) => {
    switch (status) {
      case 'accepted': return 'bg-success/10 text-success';
      case 'rejected': return 'bg-destructive/10 text-destructive';
      default: return 'bg-warning/10 text-warning';
    }
  };

  const getTimeAgo = (date: Date): string => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const BookingCard = ({ booking, type }: { booking: CallBooking; type: 'sent' | 'received' }) => {
    const person = type === 'sent' ? booking.targetUser : booking.requester;
    
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src={person.profilePhoto} />
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
              <p className="text-xs text-muted-foreground">{booking.podName} • {type === 'sent' ? booking.targetRole : 'User'}</p>
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{booking.purpose}</p>
              
              {(booking.preferredDate || booking.preferredTime) && (
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  {booking.preferredDate && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(booking.preferredDate).toLocaleDateString()}
                    </span>
                  )}
                  {booking.preferredTime && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {booking.preferredTime}
                    </span>
                  )}
                </div>
              )}

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
          <TabsList className={`w-full mb-6 ${isPodOwner ? 'grid-cols-3' : 'grid-cols-2'}`}>
            {!isPodOwner && <TabsTrigger value="book" className="flex-1">Book Call</TabsTrigger>}
            <TabsTrigger value="my-requests" className="flex-1">
              {isPodOwner ? 'My Requests' : 'My Requests'}
            </TabsTrigger>
            {isPodOwner && (
              <TabsTrigger value="received" className="flex-1">
                Received
                {pendingReceivedCount > 0 && (
                  <span className="ml-2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                    {pendingReceivedCount}
                  </span>
                )}
              </TabsTrigger>
            )}
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
                        {MOCK_PODS.map(pod => (
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

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Preferred Date (optional)</Label>
                      <Input
                        type="date"
                        value={preferredDate}
                        onChange={(e) => setPreferredDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Preferred Time (optional)</Label>
                      <Input
                        type="time"
                        value={preferredTime}
                        onChange={(e) => setPreferredTime(e.target.value)}
                      />
                    </div>
                  </div>

                  <Button variant="hero" className="w-full" onClick={handleSubmitBooking}>
                    <Send className="w-4 h-4 mr-2" />
                    Send Request
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

          {/* Received Requests (for pod owners) */}
          {isPodOwner && (
            <TabsContent value="received" className="space-y-3">
              {receivedBookings.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Phone className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">No call requests received</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    When users request calls, they'll appear here
                  </p>
                </div>
              ) : (
                receivedBookings.map(booking => (
                  <BookingCard key={booking.id} booking={booking} type="received" />
                ))
              )}
            </TabsContent>
          )}
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
            <Button variant="outline" onClick={() => setRespondDialog({ open: false, booking: null, action: 'accept' })}>
              Cancel
            </Button>
            <Button
              variant={respondDialog.action === 'accept' ? 'hero' : 'destructive'}
              onClick={handleRespond}
            >
              {respondDialog.action === 'accept' ? (
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
