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

const Rooms = () => {
  const navigate = useNavigate();
  const { joinedPods, user } = useAuth();
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

  const filteredRooms = rooms.filter((room) => {
    const matchesPod = selectedPod === 'all' || room.podId === selectedPod;
    const matchesSearch = room.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPod && matchesSearch;
  });

  // Check if user owns any pods
  const ownedPods = joinedPods.filter(pod => pod.ownerId === user?.id);
  const canCreateRoom = ownedPods.length > 0;

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

  const handleRoomClick = (room: Room) => {
    if (room.type === 'QA') {
      navigate(`/rooms/${room.id}/qa`);
    } else {
      navigate(`/rooms/${room.id}/chat`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <TopNav />
        <div className="flex items-center justify-center h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopNav />

      <main className="container mx-auto px-4 py-4 max-w-2xl">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-foreground">Rooms</h1>
          {canCreateRoom && (
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
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
                        {ownedPods.map((pod) => (
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
            return (
              <RoomCard 
                key={room.id} 
                room={room} 
                podName={selectedPod === 'all' ? pod?.name : undefined}
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

const RoomCard = ({ room, podName, onClick }: { room: Room; podName?: string; onClick: () => void }) => (
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
          <div className="flex items-center gap-3 mt-1">
            {podName && (
              <Badge variant="outline" className="text-xs">{podName}</Badge>
            )}
            <Badge variant="secondary" className="text-xs">{room.type === 'QA' ? 'Q&A' : 'Chat'}</Badge>
            {room._count && (
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

export default Rooms;
