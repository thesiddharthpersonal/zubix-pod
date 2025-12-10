import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Send, MoreVertical, Loader2 } from 'lucide-react';
import { Message, Room } from '@/types';
import { roomsApi } from '@/services/api/rooms';
import socket from '@/services/socket';
import { useToast } from '@/hooks/use-toast';

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!roomId) return;

    // Ensure socket is connected
    if (!socket.isConnected()) {
      socket.connect();
    }

    fetchRoomData();
    fetchMessages();

    // Small delay to ensure socket is ready
    const joinTimeout = setTimeout(() => {
      socket.joinRoom(roomId);
    }, 100);

    // Listen for new messages
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

    return () => {
      clearTimeout(joinTimeout);
      socket.leaveRoom(roomId);
      socket.offRoomMessage(handleNewMessage);
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
      // Ensure socket is connected
      if (!socket.isConnected()) {
        socket.connect();
        // Wait a bit for connection
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Send message via Socket.IO
      socket.sendRoomMessage(roomId, tempMessage);
    } catch (error: any) {
      console.error('Error sending message:', error);
      // Remove optimistic message on error
      setMessages((prev) => prev.filter(m => m.id !== optimisticMessage.id));
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
      setNewMessage(tempMessage); // Restore message on error
    } finally {
      setSending(false);
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
          <Button variant="ghost" size="icon">
            <MoreVertical className="w-5 h-5" />
          </Button>
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
    </div>
  );
};

export default RoomChat;
