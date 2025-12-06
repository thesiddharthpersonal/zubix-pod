import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Check, X, Clock, Send } from 'lucide-react';
import { MessageRequest, User } from '@/types';
import { toast } from 'sonner';

// Mock data for UI demonstration
const MOCK_RECEIVED_REQUESTS: MessageRequest[] = [
  {
    id: '1',
    senderId: 'user3',
    sender: { id: 'user3', fullName: 'Rahul Sharma', username: 'rahul', email: '', mobile: '', role: 'user', createdAt: new Date() },
    receiverId: 'user1',
    receiver: {} as User,
    initialMessage: 'Hi! I saw your startup pitch and would love to connect and discuss potential collaboration.',
    status: 'pending',
    createdAt: new Date(Date.now() - 3600000),
  },
  {
    id: '2',
    senderId: 'user4',
    sender: { id: 'user4', fullName: 'Neha Gupta', username: 'neha', email: '', mobile: '', role: 'pod_owner', createdAt: new Date() },
    receiverId: 'user1',
    receiver: {} as User,
    initialMessage: 'Hello! I am the founder of InnovateTech incubator. Would like to know more about your project.',
    status: 'pending',
    createdAt: new Date(Date.now() - 86400000),
  },
];

const MOCK_SENT_REQUESTS: MessageRequest[] = [
  {
    id: '3',
    senderId: 'user1',
    sender: {} as User,
    receiverId: 'user5',
    receiver: { id: 'user5', fullName: 'Vikram Singh', username: 'vikram', email: '', mobile: '', role: 'pod_owner', createdAt: new Date() },
    initialMessage: 'Hi Vikram! I am interested in your accelerator program. Can we discuss?',
    status: 'pending',
    createdAt: new Date(Date.now() - 7200000),
  },
];

const MessageRequests = () => {
  const navigate = useNavigate();
  const [receivedRequests, setReceivedRequests] = useState<MessageRequest[]>(MOCK_RECEIVED_REQUESTS);
  const [sentRequests, setSentRequests] = useState<MessageRequest[]>(MOCK_SENT_REQUESTS);

  const handleAccept = (requestId: string) => {
    setReceivedRequests(prev => prev.filter(r => r.id !== requestId));
    toast.success('Message request accepted! You can now chat.');
    // TODO: Navigate to chat with this user
  };

  const handleReject = (requestId: string) => {
    setReceivedRequests(prev => prev.filter(r => r.id !== requestId));
    toast.success('Message request rejected');
  };

  const RequestCard = ({ request, type }: { request: MessageRequest; type: 'received' | 'sent' }) => {
    const user = type === 'received' ? request.sender : request.receiver;
    const timeAgo = getTimeAgo(request.createdAt);

    return (
      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src={user.profilePhoto} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {user.fullName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-foreground">{user.fullName}</p>
                <span className="text-xs text-muted-foreground">@{user.username}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {request.initialMessage}
              </p>
              <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>{timeAgo}</span>
              </div>
            </div>
          </div>
          
          {type === 'received' && request.status === 'pending' && (
            <div className="flex gap-2 mt-4">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => handleReject(request.id)}
              >
                <X className="w-4 h-4 mr-1" />
                Decline
              </Button>
              <Button 
                variant="hero" 
                size="sm" 
                className="flex-1"
                onClick={() => handleAccept(request.id)}
              >
                <Check className="w-4 h-4 mr-1" />
                Accept
              </Button>
            </div>
          )}
          
          {type === 'sent' && request.status === 'pending' && (
            <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>Waiting for response...</span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center gap-3 p-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-foreground">Message Requests</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 max-w-2xl">
        <Tabs defaultValue="received" className="w-full">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="received" className="flex-1">
              Received
              {receivedRequests.length > 0 && (
                <span className="ml-2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                  {receivedRequests.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="sent" className="flex-1">
              Sent
              {sentRequests.length > 0 && (
                <span className="ml-2 bg-muted text-muted-foreground text-xs px-2 py-0.5 rounded-full">
                  {sentRequests.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="received" className="space-y-3">
            {receivedRequests.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">No message requests</p>
                <p className="text-sm text-muted-foreground mt-1">
                  When someone wants to message you, their request will appear here
                </p>
              </div>
            ) : (
              receivedRequests.map(request => (
                <RequestCard key={request.id} request={request} type="received" />
              ))
            )}
          </TabsContent>

          <TabsContent value="sent" className="space-y-3">
            {sentRequests.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">No sent requests</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Your message requests to others will appear here
                </p>
              </div>
            ) : (
              sentRequests.map(request => (
                <RequestCard key={request.id} request={request} type="sent" />
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

const getTimeAgo = (date: Date): string => {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

export default MessageRequests;
