import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { canManagePod } from '@/lib/utils';
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
import { ArrowLeft, Send, MoreVertical, Loader2, Pencil, Trash2, Reply, X, Users, Paperclip } from 'lucide-react';
import { Message, Room } from '@/types';
import { roomsApi } from '@/services/api/rooms';
import { usersApi, uploadApi } from '@/services/api';
import socket from '@/services/socket';
import { useToast } from '@/hooks/use-toast';
import EditRoomDialog from '@/components/EditRoomDialog';
import MentionInput from '@/components/MentionInput';
import MentionText from '@/components/MentionText';
import UserProfileDialog from '@/components/UserProfileDialog';
import { useSwipe } from '@/hooks/use-swipe';

// SwipeableMessage component for individual messages
const SwipeableMessage = ({ message, onReply, children }: { message: Message; onReply: () => void; children: React.ReactNode }) => {
  const { swipeOffset, handlers } = useSwipe({
    onSwipeLeft: onReply,
    onSwipeRight: onReply,
    threshold: 50,
  });

  return (
    <div
      {...handlers}
      style={{
        transform: `translateX(${swipeOffset}px)`,
        transition: swipeOffset === 0 ? 'transform 0.2s ease-out' : 'none',
      }}
      className="relative"
    >
      {children}
      {swipeOffset !== 0 && (
        <div className="absolute top-1/2 -translate-y-1/2 pointer-events-none">
          <Reply className={`w-5 h-5 text-primary ${swipeOffset > 0 ? 'left-2' : 'right-2'}`} style={{
            position: 'absolute',
            [swipeOffset > 0 ? 'left' : 'right']: '8px',
            opacity: Math.min(Math.abs(swipeOffset) / 50, 1),
          }} />
        </div>
      )}
    </div>
  );
};

const RoomChat = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user, joinedPods } = useAuth();
  const { toast } = useToast();
  const [room, setRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedUserForProfile, setSelectedUserForProfile] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Auto-focus input when replying
  useEffect(() => {
    if (replyingTo && inputRef.current) {
      inputRef.current.focus();
    }
  }, [replyingTo]);

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

  const scrollToMessage = (messageId: string) => {
    const messageElement = document.getElementById(`message-${messageId}`);
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Highlight the message briefly
      messageElement.classList.add('bg-primary/10');
      setTimeout(() => {
        messageElement.classList.remove('bg-primary/10');
      }, 2000);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({ title: 'Error', description: 'File size must be less than 10MB', variant: 'destructive' });
        return;
      }
      // Check file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm'];
      if (!allowedTypes.includes(file.type)) {
        toast({ title: 'Error', description: 'Only images (JPEG, PNG, GIF, WebP) and videos (MP4, WebM) are allowed', variant: 'destructive' });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSend = async () => {
    if ((!newMessage.trim() && !selectedFile) || !roomId || !user) return;

    const tempMessage = newMessage;
    const replyId = replyingTo?.id;
    const fileToUpload = selectedFile;
    
    setNewMessage('');
    setReplyingTo(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setSending(true);

    // Upload file if present
    let mediaUrl: string | undefined;
    let mediaType: string | undefined;
    
    if (fileToUpload) {
      try {
        setIsUploading(true);
        mediaUrl = await uploadApi.uploadFile(fileToUpload, 'room-media');
        mediaType = fileToUpload.type;
        toast({ title: 'Success', description: 'File uploaded successfully' });
      } catch (error) {
        console.error('Failed to upload file:', error);
        toast({ title: 'Error', description: 'Failed to upload file', variant: 'destructive' });
        setIsUploading(false);
        setSending(false);
        setNewMessage(tempMessage);
        setSelectedFile(fileToUpload);
        if (replyId && replyingTo) {
          setReplyingTo(replyingTo);
        }
        return;
      } finally {
        setIsUploading(false);
      }
    }

    // Optimistic update - add message immediately
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      content: tempMessage || (mediaUrl ? 'Sent a file' : ''),
      mediaUrl,
      mediaType,
      roomId: roomId,
      senderId: user.id,
      sender: user,
      replyToId: replyId,
      replyTo: replyingTo ? {
        id: replyingTo.id,
        content: replyingTo.content,
        senderId: replyingTo.senderId,
        sender: replyingTo.sender
      } : undefined,
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
      socket.sendRoomMessage(roomId, tempMessage || 'Sent a file', replyId, mediaUrl, mediaType);
      
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
      if (replyId && replyingTo) {
        setReplyingTo(replyingTo);
      }
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
  const podForRoom = joinedPods.find(p => p.id === room?.podId);
  const isPodOwnerOrCoOwner = podForRoom && user?.id ? canManagePod(podForRoom, user.id) : false;

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
            {isPodOwnerOrCoOwner && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate(`/rooms/${roomId}/members`)}
              >
                <Users className="w-4 h-4 mr-1" />
                Members
              </Button>
            )}
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
              <SwipeableMessage 
                key={message.id} 
                message={message} 
                onReply={() => setReplyingTo(message)}
              >
                <div id={`message-${message.id}`} className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''} group transition-colors duration-500`}>
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
                    {message.replyTo && (
                      <div 
                        onTouchStart={(e) => {
                          e.stopPropagation();
                          scrollToMessage(message.replyTo!.id);
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          scrollToMessage(message.replyTo!.id);
                        }}
                        className={`mb-2 pl-2 border-l-2 ${isOwn ? 'border-primary-foreground/30' : 'border-secondary-foreground/30'} text-xs cursor-pointer active:opacity-90 transition-opacity`}
                      >
                        <p className="font-medium">{message.replyTo.sender.fullName}</p>
                        <MentionText 
                          content={message.replyTo.content}
                          onMentionClick={async (username) => {
                            try {
                              const user = await usersApi.getUserByUsername(username);
                              console.log('RoomChat reply: User found:', user);
                              setSelectedUserForProfile(user);
                            } catch (error: any) {
                              console.error('RoomChat reply: Error fetching user:', error);
                              toast({ title: 'Error', description: 'User not found', variant: 'destructive' });
                            }
                          }}
                          className="truncate block"
                        />
                      </div>
                    )}
                    {message.mediaUrl && (
                      <div className="mb-2">
                        {message.mediaType?.startsWith('image/') ? (
                          <img 
                            src={message.mediaUrl} 
                            alt="Shared image" 
                            className="max-w-full max-h-80 rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => window.open(message.mediaUrl, '_blank')}
                          />
                        ) : message.mediaType?.startsWith('video/') ? (
                          <video 
                            src={message.mediaUrl} 
                            controls 
                            className="max-w-full max-h-80 rounded-lg"
                          />
                        ) : null}
                      </div>
                    )}
                    <MentionText 
                      content={message.content}
                      onMentionClick={async (username) => {
                        try {
                          const user = await usersApi.getUserByUsername(username);
                          console.log('RoomChat: User found:', user);
                          setSelectedUserForProfile(user);
                        } catch (error: any) {
                          console.error('RoomChat: Error fetching user:', error);
                          toast({ title: 'Error', description: 'User not found', variant: 'destructive' });
                        }
                      }}
                      className="text-sm"
                    />
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-muted-foreground">
                      {messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => setReplyingTo(message)}
                    >
                      <Reply className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
              </SwipeableMessage>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* Input */}
      <div className="sticky bottom-0 bg-background border-t border-border p-3 sm:p-4">
        <div className="max-w-2xl mx-auto w-full">
          {replyingTo && (
            <div className="mb-2 bg-secondary/50 rounded-lg p-2 flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Reply className="w-3 h-3 text-muted-foreground shrink-0" />
                  <p className="text-xs font-medium text-muted-foreground truncate">Replying to {replyingTo.sender.fullName}</p>
                </div>
                <MentionText 
                  content={replyingTo.content}
                  onMentionClick={async (username) => {
                    try {
                      const user = await usersApi.getUserByUsername(username);
                      console.log('RoomChat replying: User found:', user);
                      setSelectedUserForProfile(user);
                    } catch (error: any) {
                      console.error('RoomChat replying: Error fetching user:', error);
                      toast({ title: 'Error', description: 'User not found', variant: 'destructive' });
                    }
                  }}
                  className="text-sm truncate text-foreground block"
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0"
                onClick={() => setReplyingTo(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
          
          {/* File Preview */}
          {selectedFile && (
            <div className="flex items-center gap-2 p-2 bg-muted rounded-lg mb-2">
              {selectedFile.type.startsWith('image/') ? (
                <img 
                  src={URL.createObjectURL(selectedFile)} 
                  alt="Preview" 
                  className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded shrink-0"
                />
              ) : (
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded flex items-center justify-center shrink-0">
                  <Paperclip className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium truncate">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={() => {
                  setSelectedFile(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
          
          <div className="flex gap-2 items-start w-full">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 shrink-0 mt-0"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || sending}
            >
              <Paperclip className="w-5 h-5" />
            </Button>
            <div className="flex-1 min-w-0">
              <MentionInput
                ref={inputRef}
                value={newMessage}
                onChange={setNewMessage}
                placeholder="Type a message..."
                rows={1}
                className="min-h-[40px] h-[40px] w-full resize-none"
                disabled={sending}
              />
            </div>
            <Button 
              variant="hero" 
              size="icon" 
              onClick={handleSend} 
              disabled={isUploading || (!newMessage.trim() && !selectedFile) || sending}
              className="h-10 w-10 shrink-0 mt-0"
            >
              {isUploading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : sending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
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

      {/* User Profile Dialog */}
      <UserProfileDialog
        user={selectedUserForProfile}
        currentUserId={user?.id}
        isOpen={!!selectedUserForProfile}
        onClose={() => setSelectedUserForProfile(null)}
      />
    </div>
  );
};

export default RoomChat;
