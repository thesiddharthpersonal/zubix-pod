import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ArrowLeft, Search as SearchIcon, Building2, Loader2 } from 'lucide-react';
import { usersApi, podsApi } from '@/services/api';
import { UserProfile, Pod } from '@/types';
import { toast } from 'sonner';
import PodDetailsDialog from '@/components/PodDetailsDialog';

const Search = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState('all');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [pods, setPods] = useState<Pod[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPod, setSelectedPod] = useState<Pod | null>(null);

  useEffect(() => {
    const searchData = async () => {
      if (!query.trim()) {
        setUsers([]);
        setPods([]);
        return;
      }

      setIsLoading(true);
      try {
        const [usersData, podsData] = await Promise.all([
          usersApi.searchUsers(query),
          podsApi.searchPods(query)
        ]);
        setUsers(usersData);
        setPods(podsData);
      } catch (error) {
        console.error('Search error:', error);
        toast.error('Failed to search');
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(searchData, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border p-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5" /></Button>
          <div className="relative flex-1"><SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search users, pods..." className="pl-9" autoFocus /></div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-4 max-w-2xl">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="all">All ({users.length + pods.length})</TabsTrigger>
              <TabsTrigger value="users">Users ({users.length})</TabsTrigger>
              <TabsTrigger value="pods">Pods ({pods.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="space-y-3">
              {users.map((u) => <UserCard key={u.id} user={u} onClick={() => navigate(`/profile/${u.id}`)} />)}
              {pods.map((p) => <PodCard key={p.id} pod={p} onClick={() => setSelectedPod(p)} />)}
              {query && users.length === 0 && pods.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No results found</p>
              )}
            </TabsContent>
            <TabsContent value="users" className="space-y-3">
              {users.map((u) => <UserCard key={u.id} user={u} onClick={() => navigate(`/profile/${u.id}`)} />)}
              {query && users.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No users found</p>
              )}
            </TabsContent>
            <TabsContent value="pods" className="space-y-3">
              {pods.map((p) => <PodCard key={p.id} pod={p} onClick={() => setSelectedPod(p)} />)}
              {query && pods.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No pods found</p>
              )}
            </TabsContent>
          </Tabs>
        )}
      </main>
      {selectedPod && (
        <PodDetailsDialog
          pod={selectedPod}
          isOpen={!!selectedPod}
          onClose={() => setSelectedPod(null)}
          isJoined={false}
          onJoin={() => {
            toast.success('Join pod functionality coming soon');
            setSelectedPod(null);
          }}
        />
      )}
    </div>
  );
};

const UserCard = ({ user, onClick }: { user: UserProfile; onClick: () => void }) => (
  <Card className="cursor-pointer card-hover" onClick={onClick}>
    <CardContent className="p-4 flex items-center gap-3">
      <Avatar>
        {user.profilePhoto && <AvatarImage src={user.profilePhoto} />}
        <AvatarFallback>{user.fullName?.charAt(0) || user.username.charAt(0).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <p className="font-medium text-foreground">{user.fullName || user.username}</p>
        <p className="text-sm text-muted-foreground">
          @{user.username}
          {user.role && ` · ${user.role === 'POD_OWNER' ? 'Pod Owner' : 'User'}`}
        </p>
      </div>
    </CardContent>
  </Card>
);

const PodCard = ({ pod, onClick }: { pod: Pod; onClick: () => void }) => (
  <Card className="cursor-pointer card-hover" onClick={onClick}>
    <CardContent className="p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
        {pod.logo ? (
          <img src={pod.logo} alt={pod.name} className="w-full h-full object-cover rounded-lg" />
        ) : (
          <Building2 className="w-5 h-5 text-primary" />
        )}
      </div>
      <div className="flex-1">
        <p className="font-medium text-foreground">{pod.name}</p>
        <p className="text-sm text-muted-foreground">
          {pod.subcategory?.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()) || 'Pod'}
        </p>
      </div>
    </CardContent>
  </Card>
);

export default Search;
