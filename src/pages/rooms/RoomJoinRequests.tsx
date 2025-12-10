import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Check, X, Loader2 } from 'lucide-react';
import { roomsApi } from '@/services/api/rooms';
import { useToast } from '@/hooks/use-toast';
import { RoomJoinRequest } from '@/types';

const RoomJoinRequests = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<RoomJoinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [roomName, setRoomName] = useState('');

  useEffect(() => {
    fetchRequests();
    fetchRoomDetails();
  }, [roomId]);

  const fetchRoomDetails = async () => {
    if (!roomId) return;
    try {
      const room = await roomsApi.getRoomById(roomId);
      setRoomName(room.name);
    } catch (error) {
      console.error('Error fetching room details:', error);
    }
  };

  const fetchRequests = async () => {
    if (!roomId) return;
    
    try {
      setLoading(true);
      const data = await roomsApi.getRoomJoinRequests(roomId);
      setRequests(data);
    } catch (error: any) {
      console.error('Error fetching join requests:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load join requests',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async (requestId: string, status: 'ACCEPTED' | 'REJECTED') => {
    if (!roomId) return;

    try {
      setProcessing(requestId);
      await roomsApi.handleJoinRequest(roomId, requestId, status);
      
      toast({
        title: 'Success',
        description: `Join request ${status.toLowerCase()} successfully`,
      });

      // Remove the processed request from the list
      setRequests(prev => prev.filter(req => req.id !== requestId));
    } catch (error: any) {
      console.error('Error processing join request:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to process join request',
        variant: 'destructive',
      });
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-semibold text-foreground">Join Requests</h1>
              {roomName && (
                <p className="text-sm text-muted-foreground">{roomName}</p>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        {requests.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No pending join requests</p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((request) => (
              <Card key={request.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={request.user?.profilePhoto} />
                      <AvatarFallback>
                        {request.user?.fullName?.[0] || request.user?.username?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">
                        {request.user?.fullName || request.user?.username}
                      </h3>
                      <p className="text-sm text-muted-foreground">@{request.user?.username}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Requested {new Date(request.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="hero"
                        size="sm"
                        onClick={() => handleRequest(request.id, 'ACCEPTED')}
                        disabled={processing === request.id}
                      >
                        {processing === request.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRequest(request.id, 'REJECTED')}
                        disabled={processing === request.id}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default RoomJoinRequests;
