import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Users, MessageSquare, HelpCircle, Plus, Lock, Globe, Search, Loader2 } from 'lucide-react';
import { Room } from '@/types';
import TopNav from '@/components/layout/TopNav';
import BottomNav from '@/components/layout/BottomNav';
import { roomsApi } from '@/services/api/rooms';
import { useToast } from '@/hooks/use-toast';
import { getManagedPods } from '@/lib/utils';

const Rooms = () => {
  console.log('🏠 Rooms component rendering');
  const navigate = useNavigate();
  const { joinedPods, user } = useAuth();
  console.log('🏠 Rooms - Auth data:', { user: user?.id, joinedPodsCount: joinedPods?.length });
  const { toast } = useToast();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPod, setSelectedPod] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newRoom, setNewRoom] = useState({
    name: '',
    description: '',
    privacy: 'PUBLIC' as 'PUBLIC' | 'PRIVATE',
    type: 'GENERAL' as 'GENERAL' | 'QA',
    podId: '',
  });

  useEffect(() => {
    fetchRooms();
  }, [joinedPods]);

  const fetchRooms = async () => {
    if (joinedPods.length === 0) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // Fetch rooms from all joined pods
      const allRooms = await Promise.all(
        joinedPods.map(pod => roomsApi.getPodRooms(pod.id))
      );
      setRooms(allRooms.flat());
    } catch (error) {
      console.error('Error fetching rooms:', error);
      toast({
        title: 'Error',
        description: 'Failed to load rooms',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  let filteredRooms: Room[] = [];
  let managedPods: any[] = [];
  let canCreateRoom = false;

  try {
    filteredRooms = rooms.filter((room) => {
      const matchesPod = selectedPod === 'all' || room.podId === selectedPod;
      const matchesSearch = room.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesPod && matchesSearch;
    });

    // Check if user owns or co-owns any pods
    managedPods = getManagedPods(joinedPods, user?.id);
    canCreateRoom = managedPods.length > 0;
    
    // Debug logging
    console.log('Rooms - Current User ID:', user?.id);
    console.log('Rooms - Joined Pods:', joinedPods);
    console.log('Rooms - Managed Pods:', managedPods);
    console.log('Rooms - Can Create Room:', canCreateRoom);
  } catch (error) {
    console.error('Error in Rooms component logic:', error);
  }

  const handleCreateRoom = async () => {
    if (!newRoom.name.trim() || !newRoom.podId) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      setCreating(true);
      const createdRoom = await roomsApi.createRoom(newRoom);
      
      setRooms([createdRoom, ...rooms]);
      setIsCreateDialogOpen(false);
      setNewRoom({ name: '', description: '', privacy: 'PUBLIC', type: 'GENERAL', podId: '' });
      
      toast({
        title: 'Success',
        description: 'Room created successfully',
      });
    } catch (error: any) {
      console.error('Error creating room:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create room',
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  };

  const handleRoomClick = async (room: Room) => {
    // Check if it's a private room and user is not a member
    if (room.privacy === 'PRIVATE' && !room.isMember) {
      // Check if there's already a pending request
      if (room.joinRequestStatus === 'PENDING') {
        toast({
          title: 'Request Pending',
          description: 'Your join request is pending approval from the pod owner',
        });
        return;
      }

      // Send join request
      try {
        const result = await roomsApi.requestJoinRoom(room.id);
        toast({
          title: 'Request Sent',
          description: result.message || 'Your join request has been submitted',
        });
        
        // Refresh rooms to update status
        fetchRooms();
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to send join request',
          variant: 'destructive',
        });
      }
      return;
    }

    // Navigate to room
    if (room.type === 'QA') {
      navigate(`/rooms/${room.id}/qa`);
    } else {
      navigate(`/rooms/${room.id}/chat`);
    }
  };

  // TEMPORARY TEST - Remove after debugging
  // return <div style={{padding: '20px', background: 'white', color: 'black'}}>TEST: Rooms component is rendering. Loading: {loading ? 'true' : 'false'}</div>;

  if (loading) {
    console.log('🏠 Rooms - Showing loading spinner');
    return (
      <div className="min-h-screen bg-background pb-20">
        <TopNav />
        <div className="flex items-center justify-center h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="ml-2">Loading rooms...</p>
        </div>
        <BottomNav />
      </div>
    );
  }

  console.log('🏠 Rooms - Rendering main content');
  return (
    <div className="min-h-screen bg-background pb-20">
      <TopNav />

      <main className="container mx-auto px-4 py-4 max-w-2xl">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-foreground">Rooms</h1>
          {canCreateRoom && (
            <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
              setIsCreateDialogOpen(open);
              if (open && managedPods.length > 0 && !newRoom.podId) {
                setNewRoom({ ...newRoom, podId: managedPods[0].id });
              }
            }}>
              <DialogTrigger asChild>
                <Button variant="hero" size="sm">
                  <Plus className="w-4 h-4" />
                  Create Room
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Room</DialogTitle>
                  <DialogDescription>Create a space for your community to connect</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>Room Name *</Label>
                    <Input
                      value={newRoom.name}
                      onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                      placeholder="Enter room name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={newRoom.description}
                      onChange={(e) => setNewRoom({ ...newRoom, description: e.target.value })}
                      placeholder="Enter room description (optional)"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Pod *</Label>
                    <Select value={newRoom.podId} onValueChange={(v) => setNewRoom({ ...newRoom, podId: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select pod" />
                      </SelectTrigger>
                      <SelectContent>
                        {managedPods.map((pod) => (
                          <SelectItem key={pod.id} value={pod.id}>{pod.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Privacy</Label>
                    <Select value={newRoom.privacy} onValueChange={(v) => setNewRoom({ ...newRoom, privacy: v as 'PUBLIC' | 'PRIVATE' })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PUBLIC">Public</SelectItem>
                        <SelectItem value="PRIVATE">Private</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Room Type</Label>
                    <Select value={newRoom.type} onValueChange={(v) => setNewRoom({ ...newRoom, type: v as 'GENERAL' | 'QA' })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GENERAL">General Chat</SelectItem>
                        <SelectItem value="QA">Q&A</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    variant="hero" 
                    className="w-full" 
                    onClick={handleCreateRoom}
                    disabled={creating}
                  >
                    {creating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Room'
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search rooms..."
            className="pl-9"
          />
        </div>

        {/* Pod Filter */}
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
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
        </div>

        {/* Rooms List */}
        <div className="space-y-3">
          {filteredRooms.map((room) => {
            const pod = joinedPods.find(p => p.id === room.podId);
            const isPodOwner = pod?.ownerId === user?.id;
            return (
              <RoomCard 
                key={room.id} 
                room={room} 
                podName={selectedPod === 'all' ? pod?.name : undefined}
                isPodOwner={isPodOwner}
                onClick={() => handleRoomClick(room)} 
              />
            );
          })}
        </div>

        {filteredRooms.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No rooms found</p>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

const RoomCard = ({ room, podName, isPodOwner, onClick }: { room: Room; podName?: string; isPodOwner?: boolean; onClick: () => void }) => {
  // Pod owners and room members should not see "Request to Join"
  const isMemberOrOwner = room.isMember || isPodOwner;
  const isPrivateNotMember = room.privacy === 'PRIVATE' && !isMemberOrOwner;
  const hasPendingRequest = room.joinRequestStatus === 'PENDING';

  return (
    <Card className="cursor-pointer card-hover" onClick={onClick}>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            room.type === 'QA' ? 'bg-accent/10 text-accent' : 'bg-primary/10 text-primary'
          }`}>
            {room.type === 'QA' ? <HelpCircle className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground truncate">{room.name}</h3>
              {room.privacy === 'PRIVATE' ? (
                <Lock className="w-4 h-4 text-muted-foreground shrink-0" />
              ) : (
                <Globe className="w-4 h-4 text-muted-foreground shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              {podName && (
                <Badge variant="outline" className="text-xs">{podName}</Badge>
              )}
              <Badge variant="secondary" className="text-xs">{room.type === 'QA' ? 'Q&A' : 'Chat'}</Badge>
              {hasPendingRequest && (
                <Badge variant="outline" className="text-xs border-yellow-500 text-yellow-600">
                  Request Pending
                </Badge>
              )}
              {isPrivateNotMember && !hasPendingRequest && (
                <Badge variant="outline" className="text-xs">
                  Request to Join
                </Badge>
              )}
              {room._count && isMemberOrOwner && (
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MessageSquare className="w-4 h-4" />
                  {room._count.messages}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Rooms;
