import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { ArrowLeft, Send, MoreVertical, Loader2, Pencil, Trash2 } from 'lucide-react';
import { Message, Room } from '@/types';
import { roomsApi } from '@/services/api/rooms';
import socket from '@/services/socket';
import { useToast } from '@/hooks/use-toast';
import EditRoomDialog from '@/components/EditRoomDialog';

const RoomChat = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [room, setRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!roomId) return;

    // Ensure socket is connected
    if (!socket.isConnected()) {
      console.log('Socket not connected, connecting...');
      socket.connect();
    }

    fetchRoomData();
    fetchMessages();

    // Listen for new messages - set up listener first
    const handleNewMessage = (message: Message) => {
      console.log('Received new message:', message);
      if (message.roomId === roomId) {
        setMessages((prev) => {
          // Remove temporary optimistic message and add real one
          const filteredMessages = prev.filter(m => !m.id.toString().startsWith('temp-'));
          // Check if real message already exists
          const exists = filteredMessages.some(m => m.id === message.id);
          return exists ? prev : [...filteredMessages, message];
        });
      }
    };

    socket.onRoomMessage(handleNewMessage);

    // Join room after setting up listener
    const joinTimeout = setTimeout(() => {
      if (socket.isConnected()) {
        socket.joinRoom(roomId);
      } else {
        console.log('Socket still not connected, retrying...');
        socket.connect();
        setTimeout(() => socket.joinRoom(roomId), 500);
      }
    }, 100);

    // Set up reconnection handler
    const socketInstance = socket.getSocket();
    const handleReconnect = () => {
      console.log('Socket reconnected, rejoining room');
      socket.joinRoom(roomId);
    };

    if (socketInstance) {
      socketInstance.on('connect', handleReconnect);
    }

    return () => {
      clearTimeout(joinTimeout);
      socket.leaveRoom(roomId);
      socket.offRoomMessage(handleNewMessage);
      if (socketInstance) {
        socketInstance.off('connect', handleReconnect);
      }
    };
  }, [roomId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchRoomData = async () => {
    if (!roomId) return;

    try {
      const roomData = await roomsApi.getRoomById(roomId);
      setRoom(roomData);
    } catch (error: any) {
      console.error('Error fetching room:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load room',
        variant: 'destructive',
      });
      navigate('/rooms');
    }
  };

  const fetchMessages = async () => {
    if (!roomId) return;

    try {
      setLoading(true);
      const fetchedMessages = await roomsApi.getRoomMessages(roomId);
      setMessages(fetchedMessages);
    } catch (error: any) {
      console.error('Error fetching messages:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load messages',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !roomId || !user) return;

    const tempMessage = newMessage;
    setNewMessage('');
    setSending(true);

    // Optimistic update - add message immediately
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      content: tempMessage,
      roomId: roomId,
      senderId: user.id,
      sender: user,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setMessages((prev) => [...prev, optimisticMessage]);

    try {
      // Ensure socket is connected before sending
      if (!socket.isConnected()) {
        console.log('Socket disconnected, reconnecting...');
        socket.connect();
        // Wait for connection with timeout
        let attempts = 0;
        while (!socket.isConnected() && attempts < 10) {
          await new Promise(resolve => setTimeout(resolve, 200));
          attempts++;
        }
        
        if (!socket.isConnected()) {
          throw new Error('Failed to connect to server');
        }
        
        // Rejoin room after reconnection
        socket.joinRoom(roomId);
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      console.log('Sending message via socket');
      // Send message via Socket.IO
      socket.sendRoomMessage(roomId, tempMessage);
      
      // Set a timeout to remove optimistic message if real one doesn't arrive
      setTimeout(() => {
        setMessages((prev) => {
          const hasReal = prev.some(m => m.content === tempMessage && !m.id.toString().startsWith('temp-'));
          if (!hasReal) {
            console.warn('Real message not received, keeping optimistic message');
          }
          return prev;
        });
      }, 3000);
    } catch (error: any) {
      console.error('Error sending message:', error);
      // Remove optimistic message on error
      setMessages((prev) => prev.filter(m => m.id !== optimisticMessage.id));
      toast({
        title: 'Error',
        description: error.message || 'Failed to send message. Please try again.',
        variant: 'destructive',
      });
      setNewMessage(tempMessage); // Restore message on error
    } finally {
      setSending(false);
    }
  };

  const handleUpdateRoom = (updatedRoom: Room) => {
    setRoom(updatedRoom);
  };

  const handleDeleteRoom = async () => {
    if (!roomId) return;

    setIsDeleting(true);
    try {
      await roomsApi.deleteRoom(roomId);
      toast({
        title: 'Success',
        description: 'Room deleted successfully',
      });
      navigate('/rooms');
    } catch (error: any) {
      console.error('Error deleting room:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete room',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  // Check if user can manage the room (is owner or co-owner of the pod)
  const podFromContext = room?.pod;
  const isPodOwnerOrCoOwner = podFromContext && user?.id && (
    podFromContext.ownerId === user.id || 
    joinedPods.find(p => p.id === podFromContext.id)?.isCoOwner === true ||
    joinedPods.find(p => p.id === podFromContext.id)?.userRole === 'co-owner'
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/rooms')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-semibold text-foreground">{room?.name || 'Room'}</h1>
              {room?.pod && (
                <p className="text-sm text-muted-foreground">{room.pod.name}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {room?.privacy === 'PRIVATE' && isPodOwnerOrCoOwner && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate(`/rooms/${roomId}/join-requests`)}
              >
                Requests
              </Button>
            )}
            {isPodOwnerOrCoOwner && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit Room
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => setIsDeleteDialogOpen(true)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Room
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No messages yet. Be the first to say something!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = message.senderId === user?.id;
            const messageDate = new Date(message.createdAt);
            
            return (
              <div key={message.id} className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}>
                {!isOwn && (
                  <Avatar className="w-8 h-8 shrink-0">
                    <AvatarImage src={message.sender.profilePhoto} />
                    <AvatarFallback>{message.sender.fullName.charAt(0)}</AvatarFallback>
                  </Avatar>
                )}
                <div className={`max-w-[75%] ${isOwn ? 'items-end' : ''}`}>
                  {!isOwn && (
                    <p className="text-xs text-muted-foreground mb-1">{message.sender.fullName}</p>
                  )}
                  <div className={`rounded-2xl px-4 py-2 ${
                    isOwn 
                      ? 'bg-primary text-primary-foreground rounded-br-md' 
                      : 'bg-secondary text-secondary-foreground rounded-bl-md'
                  }`}>
                    <p className="text-sm">{message.content}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* Input */}
      <div className="sticky bottom-0 bg-background border-t border-border p-4">
        <div className="flex gap-2 max-w-2xl mx-auto">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
            onKeyDown={(e) => e.key === 'Enter' && !sending && handleSend()}
            disabled={sending}
          />
          <Button 
            variant="hero" 
            size="icon" 
            onClick={handleSend} 
            disabled={!newMessage.trim() || sending}
          >
            {sending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Edit Room Dialog */}
      {room && (
        <EditRoomDialog
          room={room}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onUpdate={handleUpdateRoom}
        />
      )}

      {/* Delete Room Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Room?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{room?.name}"? This action cannot be undone.
              All messages and data in this room will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRoom}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete Room'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default RoomChat;
