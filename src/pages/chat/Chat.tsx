import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Search, Send, MailPlus, Loader2, X, Reply } from 'lucide-react';
import { Chat as ChatType, Message, User } from '@/types';
import { chatApi, usersApi } from '@/services/api';
import { socketClient } from '@/services/socket';
import { toast } from 'sonner';
import MentionInput from '@/components/MentionInput';
import MentionText from '@/components/MentionText';
import UserProfileDialog from '@/components/UserProfileDialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const Chat = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [chats, setChats] = useState<ChatType[]>([]);
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [selectedChat, setSelectedChat] = useState<ChatType | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [targetUser, setTargetUser] = useState<User | null>(null);
  const [requestMessage, setRequestMessage] = useState('');
  const [selectedUserForProfile, setSelectedUserForProfile] = useState<User | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize socket connection
  useEffect(() => {
    if (!socketClient.isConnected()) {
      console.log('Socket not connected, connecting...');
      socketClient.connect();
    }
  }, []);

  // Auto-focus input when replying
  useEffect(() => {
    if (replyingTo && inputRef.current) {
      inputRef.current.focus();
    }
  }, [replyingTo]);

  // Handle incoming messages via socket
  useEffect(() => {
    const handleNewMessage = (message: Message) => {
      console.log('Received new DM:', message);
      if (selectedChat?.id === message.chatId) {
        setMessages(prev => {
          // Check if message already exists
          const exists = prev.some(m => m.id === message.id);
          return exists ? prev : [...prev, message];
        });
        // Scroll to bottom
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      }
      
      // Update chat list to reflect latest message
      setChats(prevChats => 
        prevChats.map(chat => 
          chat.id === message.chatId 
            ? { ...chat, lastMessage: message, updatedAt: new Date() }
            : chat
        ).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      );
    };

    socketClient.onDirectMessage(handleNewMessage);

    return () => {
      socketClient.offDirectMessage(handleNewMessage);
    };
  }, [selectedChat?.id]);

  // Join chat room when chat is selected
  useEffect(() => {
    if (selectedChat?.id) {
      if (!socketClient.isConnected()) {
        console.log('Socket not connected, connecting...');
        socketClient.connect();
        setTimeout(() => {
          if (socketClient.isConnected()) {
            socketClient.joinChat(selectedChat.id);
          }
        }, 500);
      } else {
        socketClient.joinChat(selectedChat.id);
      }
      
      // Scroll to bottom when messages load
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'auto' }), 100);

      // Set up reconnection handler
      const socketInstance = socketClient.getSocket();
      const handleReconnect = () => {
        console.log('Socket reconnected, rejoining chat');
        socketClient.joinChat(selectedChat.id);
      };

      if (socketInstance) {
        socketInstance.on('connect', handleReconnect);
      }

      return () => {
        socketClient.leaveChat(selectedChat.id);
        if (socketInstance) {
          socketInstance.off('connect', handleReconnect);
        }
      };
    }
  }, [selectedChat?.id]);

  // Fetch user's chats
  useEffect(() => {
    const fetchChats = async () => {
      if (!user?.id) return;

      try {
        setIsLoadingChats(true);
        const userChats = await chatApi.getUserChats(user.id);
        setChats(userChats);
      } catch (error) {
        console.error('Failed to fetch chats:', error);
        toast.error('Failed to load chats');
      } finally {
        setIsLoadingChats(false);
      }
    };

    fetchChats();
  }, [user?.id]);

  // Handle navigation from message request acceptance or direct chat link
  useEffect(() => {
    const chatId = location.state?.chatId as string | undefined;
    const incomingTargetUser = location.state?.targetUser as User | undefined;

    if (chatId && user?.id) {
      // Load specific chat by ID (from accepted message request)
      const loadChat = async () => {
        try {
          const chat = await chatApi.getChatById(chatId);
          setSelectedChat(chat);
          
          // Also refresh the chats list to include the new chat
          const userChats = await chatApi.getUserChats(user.id);
          setChats(userChats);
        } catch (error) {
          console.error('Failed to load chat:', error);
          toast.error('Failed to load chat');
        }
      };
      loadChat();
      
      // Clear the navigation state
      window.history.replaceState({}, document.title);
    } else if (incomingTargetUser && user?.id) {
      // Check if already have an accepted chat with this user
      const checkAndLoadChat = async () => {
        try {
          const userChats = await chatApi.getUserChats(user.id);
          const existingChat = userChats.find(chat => 
            chat.participants.some(p => p.id === incomingTargetUser.id)
          );
          
          if (existingChat) {
            // Already have a chat, open it directly
            setSelectedChat(existingChat);
            setChats(userChats);
          } else {
            // No existing chat - show message request dialog
            setTargetUser(incomingTargetUser);
            setShowRequestDialog(true);
          }
        } catch (error) {
          console.error('Failed to check for existing chat:', error);
        }
      };
      checkAndLoadChat();
      
      // Clear the navigation state
      window.history.replaceState({}, document.title);
    }
  }, [location.state, user?.id]);

  // Load messages when a chat is selected
  useEffect(() => {
    const loadMessages = async () => {
      if (!selectedChat?.id) return;

      try {
        setIsLoadingMessages(true);
        const chatMessages = await chatApi.getChatMessages(selectedChat.id);
        setMessages(chatMessages);
      } catch (error) {
        console.error('Failed to load messages:', error);
        toast.error('Failed to load messages');
      } finally {
        setIsLoadingMessages(false);
      }
    };

    loadMessages();
  }, [selectedChat?.id]);

  const handleSendRequest = () => {
    if (!requestMessage.trim()) {
      toast.error('Please enter a message');
      return;
    }
    // TODO: Call messageRequestApi.sendRequest()
    toast.success('Message request sent! You\'ll be notified when they respond.');
    setShowRequestDialog(false);
    setRequestMessage('');
    setTargetUser(null);
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedChat?.id) return;

    const content = newMessage.trim();
    const replyId = replyingTo?.id;
    setNewMessage('');
    setReplyingTo(null);

    // Optimistic update
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      content: content,
      chatId: selectedChat.id,
      senderId: user!.id,
      sender: user!,
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

    setMessages(prev => [...prev, optimisticMessage]);

    try {
      // Ensure socket is connected before sending
      if (!socketClient.isConnected()) {
        console.log('Socket disconnected, reconnecting...');
        socketClient.connect();
        // Wait for connection with timeout
        let attempts = 0;
        while (!socketClient.isConnected() && attempts < 10) {
          await new Promise(resolve => setTimeout(resolve, 200));
          attempts++;
        }
        
        if (!socketClient.isConnected()) {
          throw new Error('Failed to connect to server');
        }
        
        // Rejoin chat after reconnection
        socketClient.joinChat(selectedChat.id);
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      console.log('Sending DM via socket');
      // Send via socket for real-time delivery
      socketClient.sendDirectMessage(selectedChat.id, content, replyId);
      
      // Set a timeout to remove optimistic message if real one doesn't arrive
      setTimeout(() => {
        setMessages((prev) => {
          const hasReal = prev.some(m => m.content === content && !m.id.toString().startsWith('temp-'));
          if (!hasReal) {
            console.warn('Real message not received, keeping optimistic message');
          }
          return prev;
        });
      }, 3000);
    } catch (error) {
      console.error('Failed to send message:', error);
      // Remove optimistic message on error
      setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id));
      toast.error('Failed to send message. Please try again.');
      // Restore message on error
      setNewMessage(content);
      if (replyId && replyingTo) {
        setReplyingTo(replyingTo);
      }
    }
  };

  // Chat conversation view
  if (selectedChat) {
    const otherUser = selectedChat.participants.find(p => p.id !== user?.id);
    if (!otherUser) {
      setSelectedChat(null);
      return null;
    }
    
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
          <div className="flex items-center gap-3 p-4">
            <Button variant="ghost" size="icon" onClick={() => {
              setSelectedChat(null);
              setSelectedUserForProfile(null);
            }}><ArrowLeft className="w-5 h-5" /></Button>
            <Avatar 
              className="w-10 h-10 cursor-pointer" 
              onClick={(e) => {
                e.stopPropagation();
                setSelectedUserForProfile(otherUser);
              }}
            >
              <AvatarImage src={otherUser.profilePhoto} />
              <AvatarFallback>{otherUser.fullName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div 
              className="cursor-pointer hover:opacity-80 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedUserForProfile(otherUser);
              }}
            >
              <p className="font-semibold text-foreground">{otherUser.fullName}</p>
              <p className="text-xs text-muted-foreground">@{otherUser.username}</p>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoadingMessages ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No messages yet</p>
              <p className="text-sm text-muted-foreground mt-1">Start the conversation!</p>
            </div>
          ) : (
            <>
              {messages.map((msg) => {
                const isOwn = msg.senderId === user?.id;
                const messageDate = new Date(msg.createdAt);
                return (
                  <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group`}>
                    <div className={`max-w-[75%]`}>
                      <div className={`rounded-2xl px-4 py-2 ${isOwn ? 'bg-primary text-primary-foreground rounded-br-md' : 'bg-secondary text-secondary-foreground rounded-bl-md'}`}>
                        {msg.replyTo && (
                          <div className={`mb-2 pl-2 border-l-2 ${isOwn ? 'border-primary-foreground/30' : 'border-secondary-foreground/30'} text-xs opacity-70`}>
                            <p className="font-medium">{msg.replyTo.sender.fullName}</p>
                            <MentionText 
                              content={msg.replyTo.content} 
                              onMentionClick={(username) => {
                                // Find user and show profile
                                usersApi.getUserByUsername(username).then(user => {
                                  if (user) setSelectedUserForProfile(user);
                                }).catch(() => toast.error('User not found'));
                              }}
                              className="truncate block"
                            />
                          </div>
                        )}
                        <MentionText 
                          content={msg.content} 
                          onMentionClick={async (username) => {
                            console.log('Mention clicked:', username);
                            console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL);
                            console.log('Auth token exists:', !!localStorage.getItem('zubix_auth_token'));
                            try {
                              const user = await usersApi.getUserByUsername(username);
                              console.log('User found:', user);
                              console.log('Setting selectedUserForProfile to:', user);
                              setSelectedUserForProfile(user);
                              console.log('User profile dialog should open now');
                            } catch (error: any) {
                              console.error('Error fetching user:', error);
                              console.error('Error message:', error.message);
                              console.error('Error response:', error.response?.data);
                              toast.error(error.message || 'User not found');
                            }
                          }}
                          className="text-sm"
                        />
                      </div>
                      <div className={`flex items-center gap-2 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                        <p className="text-xs text-muted-foreground">
                          {messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity ${isOwn ? 'text-primary-foreground hover:bg-primary/20' : 'text-secondary-foreground hover:bg-secondary/20'}`}
                          onClick={() => setReplyingTo(msg)}
                        >
                          <Reply className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </>
          )}
        </main>
        <div className="sticky bottom-0 bg-background border-t border-border p-4">
          {replyingTo && (
            <div className="mb-2 bg-secondary/50 rounded-lg p-2 flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Reply className="w-3 h-3 text-muted-foreground" />
                  <p className="text-xs font-medium text-muted-foreground">Replying to {replyingTo.sender.fullName}</p>
                </div>
                <MentionText 
                  content={replyingTo.content}
                  onMentionClick={(username) => {
                    usersApi.getUserByUsername(username).then(user => {
                      if (user) setSelectedUserForProfile(user);
                    }).catch(() => toast.error('User not found'));
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
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <MentionInput
                value={newMessage}
                onChange={setNewMessage}
                placeholder="Type a message... (use @ to mention)"
                rows={1}
                className="min-h-[40px]"
              />
            </div>
            <Button variant="hero" size="icon" onClick={handleSend} className="h-10 w-10">
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* User Profile Dialog for Chat Conversation */}
        <UserProfileDialog
          user={selectedUserForProfile}
          currentUserId={user?.id}
          isOpen={!!selectedUserForProfile}
          onClose={() => setSelectedUserForProfile(null)}
        />
      </div>
    );
  }

  // Chat list view
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center gap-3 p-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5" /></Button>
          <h1 className="text-xl font-bold text-foreground">Messages</h1>
        </div>
        <div className="px-4 pb-4"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Search conversations..." className="pl-9" /></div></div>
      </header>
      
      <main className="p-4 space-y-2">
        {/* Link to Message Requests */}
        <Card 
          className="cursor-pointer card-hover border-primary/20 bg-primary/5"
          onClick={() => navigate('/message-requests')}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <MailPlus className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">Message Requests</p>
                <p className="text-sm text-muted-foreground">View pending requests</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Accepted chats */}
        {isLoadingChats ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : chats.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No conversations yet</p>
            <p className="text-sm text-muted-foreground mt-1">Start by sending a message request to someone</p>
          </div>
        ) : (
          chats.map((chat) => {
            const other = chat.participants.find(p => p.id !== user?.id);
            if (!other) return null;
            
            return (
              <Card key={chat.id} className="cursor-pointer card-hover" onClick={() => setSelectedChat(chat)}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={other.profilePhoto} />
                      <AvatarFallback>{other.fullName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground">{other.fullName}</p>
                      {chat.lastMessage && (
                        <MentionText 
                          content={chat.lastMessage.content}
                          className="text-sm text-muted-foreground truncate block"
                        />
                      )}
                    </div>
                    {chat.lastMessage && (
                      <p className="text-xs text-muted-foreground">
                        {new Date(chat.lastMessage.createdAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </main>

      {/* Message Request Dialog */}
      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send Message Request</DialogTitle>
            <DialogDescription>
              {targetUser?.fullName} will need to accept your request before you can chat.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-3 py-4">
            <Avatar className="w-12 h-12">
              <AvatarImage src={targetUser?.profilePhoto} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {targetUser?.fullName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{targetUser?.fullName}</p>
              <p className="text-sm text-muted-foreground">@{targetUser?.username}</p>
            </div>
          </div>
          <Textarea
            placeholder="Write your message... (e.g., Hi! I'd love to connect and discuss...)"
            value={requestMessage}
            onChange={(e) => setRequestMessage(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRequestDialog(false)}>
              Cancel
            </Button>
            <Button variant="hero" onClick={handleSendRequest}>
              <Send className="w-4 h-4 mr-2" />
              Send Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

export default Chat;
