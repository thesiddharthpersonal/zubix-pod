import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Image, Video, Send, Heart, MessageCircle, Share2, MoreHorizontal, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Post, User } from '@/types';
import BottomNav from '@/components/layout/BottomNav';
import TopNav from '@/components/layout/TopNav';

// Mock data
const MOCK_POSTS: Post[] = [
  {
    id: '1',
    authorId: 'user1',
    author: {
      id: 'user1',
      fullName: 'Rahul Sharma',
      email: 'rahul@example.com',
      mobile: '+91 9876543210',
      username: 'rahulsharma',
      role: 'pod_owner',
      createdAt: new Date(),
    },
    podId: '1',
    content: '🚀 Exciting news! We just closed our Series A funding round. Thank you to all our investors and supporters who believed in our vision. This is just the beginning!',
    mediaUrls: [],
    likes: ['user2', 'user3'],
    comments: [],
    isOwnerPost: true,
    createdAt: new Date(Date.now() - 3600000),
  },
  {
    id: '2',
    authorId: 'user2',
    author: {
      id: 'user2',
      fullName: 'Priya Patel',
      email: 'priya@example.com',
      mobile: '+91 9876543211',
      username: 'priyapatel',
      role: 'user',
      createdAt: new Date(),
    },
    podId: '1',
    content: 'Looking for co-founders for my EdTech startup. We\'re building a platform to make quality education accessible to everyone. DM if interested! #startup #edtech #cofounder',
    mediaUrls: [],
    likes: ['user1'],
    comments: [],
    isOwnerPost: false,
    createdAt: new Date(Date.now() - 7200000),
  },
  {
    id: '3',
    authorId: 'user3',
    author: {
      id: 'user3',
      fullName: 'Amit Kumar',
      email: 'amit@example.com',
      mobile: '+91 9876543212',
      username: 'amitkumar',
      role: 'pod_owner',
      createdAt: new Date(),
    },
    podId: '2',
    content: '📢 Announcing our next Demo Day on January 15th! 10 startups will pitch to a panel of top VCs. Applications are now open. Don\'t miss this opportunity!',
    mediaUrls: [],
    likes: ['user1', 'user2', 'user4'],
    comments: [],
    isOwnerPost: true,
    createdAt: new Date(Date.now() - 86400000),
  },
];

const Home = () => {
  const navigate = useNavigate();
  const { user, joinedPods } = useAuth();
  const [selectedPod, setSelectedPod] = useState<string>('all');
  const [updateFilter, setUpdateFilter] = useState<'all' | 'owner' | 'members'>('all');
  const [newPostContent, setNewPostContent] = useState('');
  const [posts, setPosts] = useState(MOCK_POSTS);

  const filteredPosts = posts.filter((post) => {
    const matchesPod = selectedPod === 'all' || post.podId === selectedPod;
    const matchesFilter =
      updateFilter === 'all' ||
      (updateFilter === 'owner' && post.isOwnerPost) ||
      (updateFilter === 'members' && !post.isOwnerPost);
    return matchesPod && matchesFilter;
  });

  const handleCreatePost = () => {
    if (!newPostContent.trim()) return;
    
    const newPost: Post = {
      id: crypto.randomUUID(),
      authorId: user?.id || '',
      author: user as User,
      podId: selectedPod === 'all' ? joinedPods[0]?.id || '' : selectedPod,
      content: newPostContent,
      mediaUrls: [],
      likes: [],
      comments: [],
      isOwnerPost: user?.role === 'pod_owner',
      createdAt: new Date(),
    };
    
    setPosts([newPost, ...posts]);
    setNewPostContent('');
  };

  const handleLike = (postId: string) => {
    setPosts(posts.map((post) => {
      if (post.id === postId) {
        const userId = user?.id || '';
        const hasLiked = post.likes.includes(userId);
        return {
          ...post,
          likes: hasLiked
            ? post.likes.filter((id) => id !== userId)
            : [...post.likes, userId],
        };
      }
      return post;
    }));
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopNav />

      <main className="container mx-auto px-4 py-4 max-w-2xl">
        {/* Pod Filter Tabs */}
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
          <Badge
            variant="outline"
            className="cursor-pointer whitespace-nowrap text-primary border-primary hover:bg-primary/10"
            onClick={() => navigate('/discover')}
          >
            <Plus className="w-3 h-3 mr-1" />
            Explore More
          </Badge>
        </div>

        {/* Update Type Tabs */}
        <Tabs value={updateFilter} onValueChange={(v) => setUpdateFilter(v as typeof updateFilter)} className="mb-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All Updates</TabsTrigger>
            <TabsTrigger value="owner">Owner</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Create Post */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={user?.profilePhoto} />
                <AvatarFallback>{user?.fullName?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="Share an update..."
                  className="min-h-[80px] resize-none border-0 p-0 focus-visible:ring-0"
                />
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon-sm">
                      <Image className="w-5 h-5 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon-sm">
                      <Video className="w-5 h-5 text-muted-foreground" />
                    </Button>
                  </div>
                  <Button
                    variant="hero"
                    size="sm"
                    onClick={handleCreatePost}
                    disabled={!newPostContent.trim()}
                  >
                    <Send className="w-4 h-4" />
                    Post
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feed */}
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onLike={() => handleLike(post.id)}
              isLiked={post.likes.includes(user?.id || '')}
            />
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No posts yet. Be the first to share!</p>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

const PostCard = ({
  post,
  onLike,
  isLiked,
}: {
  post: Post;
  onLike: () => void;
  isLiked: boolean;
}) => {
  const timeAgo = getTimeAgo(post.createdAt);

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={post.author.profilePhoto} />
            <AvatarFallback>{post.author.fullName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium text-foreground">{post.author.fullName}</span>
                {post.isOwnerPost && (
                  <Badge variant="secondary" className="ml-2 text-xs">Owner</Badge>
                )}
                <p className="text-sm text-muted-foreground">@{post.author.username} · {timeAgo}</p>
              </div>
              <Button variant="ghost" size="icon-sm">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
            <p className="mt-2 text-foreground whitespace-pre-wrap">{post.content}</p>
            
            {post.mediaUrls.length > 0 && (
              <div className="mt-3 rounded-xl overflow-hidden bg-secondary">
                <img src={post.mediaUrls[0]} alt="" className="w-full" />
              </div>
            )}

            <div className="flex items-center gap-6 mt-4">
              <button
                onClick={onLike}
                className={`flex items-center gap-1.5 text-sm transition-colors ${
                  isLiked ? 'text-destructive' : 'text-muted-foreground hover:text-destructive'
                }`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                {post.likes.length > 0 && post.likes.length}
              </button>
              <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
                <MessageCircle className="w-5 h-5" />
                {post.comments.length > 0 && post.comments.length}
              </button>
              <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const getTimeAgo = (date: Date): string => {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
};

export default Home;
