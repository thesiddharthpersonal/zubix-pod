import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Users, MessageSquare, HelpCircle, Plus, Lock, Globe, Search } from 'lucide-react';
import { Room } from '@/types';
import TopNav from '@/components/layout/TopNav';
import BottomNav from '@/components/layout/BottomNav';

// Mock rooms data
const MOCK_ROOMS: Room[] = [
  {
    id: '1',
    name: 'General Discussion',
    podId: '1',
    privacy: 'public',
    type: 'general',
    memberIds: ['user1', 'user2', 'user3'],
    createdBy: 'owner1',
    createdAt: new Date(),
  },
  {
    id: '2',
    name: 'Founder Q&A',
    podId: '1',
    privacy: 'public',
    type: 'qa',
    memberIds: ['user1', 'user2'],
    createdBy: 'owner1',
    createdAt: new Date(),
  },
  {
    id: '3',
    name: 'Private Mentorship',
    podId: '1',
    privacy: 'private',
    type: 'general',
    memberIds: ['user1'],
    createdBy: 'owner1',
    createdAt: new Date(),
  },
  {
    id: '4',
    name: 'Investor Office Hours',
    podId: '2',
    privacy: 'public',
    type: 'qa',
    memberIds: ['user1', 'user2', 'user3', 'user4'],
    createdBy: 'owner2',
    createdAt: new Date(),
  },
];

const Rooms = () => {
  const navigate = useNavigate();
  const { joinedPods, user } = useAuth();
  const [selectedPod, setSelectedPod] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newRoom, setNewRoom] = useState({
    name: '',
    privacy: 'public' as 'public' | 'private',
    type: 'general' as 'general' | 'qa',
    podId: '',
  });

  const filteredRooms = MOCK_ROOMS.filter((room) => {
    const matchesPod = selectedPod === 'all' || room.podId === selectedPod;
    const matchesSearch = room.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPod && matchesSearch;
  });

  const isPodOwner = user?.role === 'pod_owner';

  const handleCreateRoom = () => {
    console.log('Creating room:', newRoom);
    setIsCreateDialogOpen(false);
    setNewRoom({ name: '', privacy: 'public', type: 'general', podId: '' });
  };

  const handleRoomClick = (room: Room) => {
    if (room.type === 'qa') {
      navigate(`/rooms/${room.id}/qa`);
    } else {
      navigate(`/rooms/${room.id}/chat`);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopNav />

      <main className="container mx-auto px-4 py-4 max-w-2xl">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-foreground">Rooms</h1>
          {isPodOwner && (
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
                    <Label>Room Name</Label>
                    <Input
                      value={newRoom.name}
                      onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                      placeholder="Enter room name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Pod</Label>
                    <Select value={newRoom.podId} onValueChange={(v) => setNewRoom({ ...newRoom, podId: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select pod" />
                      </SelectTrigger>
                      <SelectContent>
                        {joinedPods.map((pod) => (
                          <SelectItem key={pod.id} value={pod.id}>{pod.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Privacy</Label>
                    <Select value={newRoom.privacy} onValueChange={(v) => setNewRoom({ ...newRoom, privacy: v as 'public' | 'private' })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Room Type</Label>
                    <Select value={newRoom.type} onValueChange={(v) => setNewRoom({ ...newRoom, type: v as 'general' | 'qa' })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General Chat</SelectItem>
                        <SelectItem value="qa">Q&A</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button variant="hero" className="w-full" onClick={handleCreateRoom}>
                    Create Room
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
          room.type === 'qa' ? 'bg-accent/10 text-accent' : 'bg-primary/10 text-primary'
        }`}>
          {room.type === 'qa' ? <HelpCircle className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground truncate">{room.name}</h3>
            {room.privacy === 'private' ? (
              <Lock className="w-4 h-4 text-muted-foreground shrink-0" />
            ) : (
              <Globe className="w-4 h-4 text-muted-foreground shrink-0" />
            )}
          </div>
          <div className="flex items-center gap-3 mt-1">
            {podName && (
              <Badge variant="outline" className="text-xs">{podName}</Badge>
            )}
            <Badge variant="secondary" className="text-xs">{room.type === 'qa' ? 'Q&A' : 'Chat'}</Badge>
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              {room.memberIds.length}
            </span>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default Rooms;
