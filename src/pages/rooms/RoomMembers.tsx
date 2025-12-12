import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ArrowLeft, Users as UsersIcon, Trash2, User as UserIcon, Shield } from 'lucide-react';
import { roomsApi } from '@/services/api/rooms';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface RoomMember {
  id: string;
  username: string;
  fullName: string;
  email?: string;
  profilePhoto?: string;
  role: string;
  joinedAt: Date;
}

const RoomMembers = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [members, setMembers] = useState<RoomMember[]>([]);
  const [roomName, setRoomName] = useState('');
  const [loading, setLoading] = useState(true);
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);
  const [memberToRemove, setMemberToRemove] = useState<RoomMember | null>(null);

  useEffect(() => {
    if (!roomId) return;
    loadMembers();
    loadRoomInfo();
  }, [roomId]);

  const loadRoomInfo = async () => {
    try {
      const room = await roomsApi.getRoomById(roomId!);
      setRoomName(room.name);
    } catch (error) {
      console.error('Failed to load room info:', error);
    }
  };

  const loadMembers = async () => {
    try {
      setLoading(true);
      console.log('Loading members for room:', roomId);
      const response = await roomsApi.getRoomMembers(roomId!);
      console.log('Members response:', response);
      setMembers(response.members);
    } catch (error: any) {
      console.error('Failed to load members - Full error:', error);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      
      if (error.response?.status === 403) {
        toast.error('You do not have permission to view room members');
        navigate(-1);
      } else if (error.response?.status === 404) {
        toast.error('Room not found');
        navigate(-1);
      } else {
        const errorMessage = error.response?.data?.error || error.message || 'Failed to load members';
        console.error('Showing error message:', errorMessage);
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;

    try {
      setRemovingMemberId(memberToRemove.id);
      await roomsApi.removeMember(roomId!, memberToRemove.id);
      toast.success(`${memberToRemove.fullName} removed from room`);
      setMembers(members.filter(m => m.id !== memberToRemove.id));
      setMemberToRemove(null);
    } catch (error: any) {
      console.error('Failed to remove member:', error);
      toast.error(error.response?.data?.error || 'Failed to remove member');
    } finally {
      setRemovingMemberId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center gap-3 p-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/rooms/${roomId}/chat`)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              <UsersIcon className="w-5 h-5" />
              Room Members
            </h1>
            {roomName && (
              <p className="text-sm text-muted-foreground">{roomName}</p>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 pt-6 pb-24">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : members.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <UsersIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No members yet</h3>
              <p className="text-muted-foreground">This room doesn't have any members yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {members.length} {members.length === 1 ? 'member' : 'members'}
              </p>
            </div>

            <div className="space-y-2">
              {members.map((member) => (
                <Card key={member.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={member.profilePhoto} />
                        <AvatarFallback>
                          <UserIcon className="w-5 h-5" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-foreground">{member.fullName}</p>
                          {member.role === 'POD_OWNER' && (
                            <Badge variant="secondary" className="text-xs">
                              <Shield className="w-3 h-3 mr-1" />
                              Owner
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">@{member.username}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Joined {formatDistanceToNow(new Date(member.joinedAt), { addSuffix: true })}
                        </p>
                      </div>
                      {member.id !== user?.id && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setMemberToRemove(member)}
                          disabled={removingMemberId === member.id}
                        >
                          {removingMemberId === member.id ? (
                            <div className="w-4 h-4 border-2 border-destructive/30 border-t-destructive rounded-full animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Remove Member Confirmation Dialog */}
      <AlertDialog open={!!memberToRemove} onOpenChange={(open) => !open && setMemberToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <strong>{memberToRemove?.fullName}</strong> from this room?
              They will no longer be able to access this room's messages.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveMember}
              className="bg-destructive hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default RoomMembers;
