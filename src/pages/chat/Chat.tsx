import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Search, Send } from 'lucide-react';
import { Chat as ChatType, Message, User } from '@/types';

const MOCK_CHATS: ChatType[] = [
  { id: '1', participantIds: ['user1', 'user2'], participants: [{ id: 'user2', fullName: 'Priya Patel', username: 'priya', email: '', mobile: '', role: 'user', createdAt: new Date() }] as User[], lastMessage: { id: 'm1', chatId: '1', senderId: 'user2', sender: {} as User, content: 'Thanks for connecting!', createdAt: new Date(Date.now() - 3600000) }, updatedAt: new Date() },
  { id: '2', participantIds: ['user1', 'user3'], participants: [{ id: 'user3', fullName: 'Amit Kumar', username: 'amit', email: '', mobile: '', role: 'pod_owner', createdAt: new Date() }] as User[], lastMessage: { id: 'm2', chatId: '2', senderId: 'user1', sender: {} as User, content: 'Let me know if you need more info', createdAt: new Date(Date.now() - 86400000) }, updatedAt: new Date() },
];

const Chat = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [selectedChat, setSelectedChat] = useState<ChatType | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', chatId: '1', senderId: 'user2', sender: { fullName: 'Priya Patel' } as User, content: 'Hi! I saw your profile and wanted to connect.', createdAt: new Date(Date.now() - 7200000) },
    { id: '2', chatId: '1', senderId: 'user1', sender: { fullName: 'You' } as User, content: 'Hey! Great to connect with you.', createdAt: new Date(Date.now() - 3700000) },
    { id: '3', chatId: '1', senderId: 'user2', sender: { fullName: 'Priya Patel' } as User, content: 'Thanks for connecting!', createdAt: new Date(Date.now() - 3600000) },
  ]);
  const [newMessage, setNewMessage] = useState('');

  // Handle direct message from user profile
  useEffect(() => {
    const targetUser = location.state?.targetUser as User | undefined;
    if (targetUser) {
      // Create or find existing chat with this user
      const existingChat = MOCK_CHATS.find(chat => 
        chat.participants.some(p => p.id === targetUser.id)
      );
      
      if (existingChat) {
        setSelectedChat(existingChat);
      } else {
        // Create new chat
        const newChat: ChatType = {
          id: crypto.randomUUID(),
          participantIds: [user?.id || '', targetUser.id],
          participants: [targetUser],
          updatedAt: new Date(),
        };
        setSelectedChat(newChat);
        setMessages([]);
      }
    }
  }, [location.state, user?.id]);

  const handleSend = () => {
    if (!newMessage.trim()) return;
    setMessages([...messages, { id: crypto.randomUUID(), chatId: selectedChat?.id || '', senderId: user?.id || '', sender: user as User, content: newMessage, createdAt: new Date() }]);
    setNewMessage('');
  };

  if (selectedChat) {
    const otherUser = selectedChat.participants[0];
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
          <div className="flex items-center gap-3 p-4">
            <Button variant="ghost" size="icon" onClick={() => setSelectedChat(null)}><ArrowLeft className="w-5 h-5" /></Button>
            <Avatar className="w-10 h-10"><AvatarFallback>{otherUser.fullName.charAt(0)}</AvatarFallback></Avatar>
            <div><p className="font-semibold text-foreground">{otherUser.fullName}</p><p className="text-xs text-muted-foreground">@{otherUser.username}</p></div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => {
            const isOwn = msg.senderId === user?.id;
            return (
              <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${isOwn ? 'bg-primary text-primary-foreground rounded-br-md' : 'bg-secondary text-secondary-foreground rounded-bl-md'}`}>
                  <p className="text-sm">{msg.content}</p>
                </div>
              </div>
            );
          })}
        </main>
        <div className="sticky bottom-0 bg-background border-t border-border p-4">
          <div className="flex gap-2">
            <Input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." onKeyDown={(e) => e.key === 'Enter' && handleSend()} />
            <Button variant="hero" size="icon" onClick={handleSend}><Send className="w-5 h-5" /></Button>
          </div>
        </div>
      </div>
    );
  }

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
        {MOCK_CHATS.map((chat) => {
          const other = chat.participants[0];
          return (
            <Card key={chat.id} className="cursor-pointer card-hover" onClick={() => setSelectedChat(chat)}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12"><AvatarFallback>{other.fullName.charAt(0)}</AvatarFallback></Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{other.fullName}</p>
                    <p className="text-sm text-muted-foreground truncate">{chat.lastMessage?.content}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{chat.lastMessage?.createdAt.toLocaleDateString()}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </main>
    </div>
  );
};

export default Chat;
