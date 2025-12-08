import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Image, Video, Send, Heart, MessageCircle, Share2, MoreHorizontal, Plus, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Post, User, Pod } from '@/types';
import BottomNav from '@/components/layout/BottomNav';
import TopNav from '@/components/layout/TopNav';
import PodDetailsDialog from '@/components/PodDetailsDialog';
import UserProfileDialog from '@/components/UserProfileDialog';
import SendMessageDialog from '@/components/SendMessageDialog';
import { postsApi, reactionsApi, uploadApi, commentsApi, Comment } from '@/services/api';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';

const Home = () => {
  const navigate = useNavigate();
  const { user, joinedPods, joinPod, leavePod } = useAuth();
  const [selectedPod, setSelectedPod] = useState<string>('all');
  const [updateFilter, setUpdateFilter] = useState<'all' | 'owner' | 'members'>('all');
  const [newPostContent, setNewPostContent] = useState('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [selectedPodForDetails, setSelectedPodForDetails] = useState<Pod | null>(null);
  const [selectedUserForProfile, setSelectedUserForProfile] = useState<User | null>(null);
  const [showSendMessageDialog, setShowSendMessageDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch posts on mount and when pods change
  useEffect(() => {
    const fetchPosts = async () => {
      if (joinedPods.length === 0) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const podIds = joinedPods.map(pod => pod.id);
        const fetchedPosts = await postsApi.getFeedPosts(podIds, 'all');
        setPosts(fetchedPosts);
      } catch (error) {
        console.error('Failed to fetch posts:', error);
        toast.error('Failed to load posts');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [joinedPods]);

  const filteredPosts = posts.filter((post) => {
    const matchesPod = selectedPod === 'all' || post.podId === selectedPod;
    const matchesFilter =
      updateFilter === 'all' ||
      (updateFilter === 'owner' && post.isOwnerPost) ||
      (updateFilter === 'members' && !post.isOwnerPost);
    return matchesPod && matchesFilter;
  });

  const handleMediaSelect = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate file types
    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const validVideoTypes = ['video/mp4', 'video/webm', 'video/ogg'];
    const validTypes = type === 'image' ? validImageTypes : validVideoTypes;

    const invalidFiles = files.filter(file => !validTypes.includes(file.type));
    if (invalidFiles.length > 0) {
      toast.error(`Invalid ${type} file type`);
      return;
    }

    // Validate file size (5MB for images, 50MB for videos)
    const maxSize = type === 'image' ? 5 * 1024 * 1024 : 50 * 1024 * 1024;
    const oversizedFiles = files.filter(file => file.size > maxSize);
    if (oversizedFiles.length > 0) {
      toast.error(`File size exceeds ${type === 'image' ? '5MB' : '50MB'} limit`);
      return;
    }

    setMediaFiles([...mediaFiles, ...files]);
  };

  const removeMediaFile = (index: number) => {
    setMediaFiles(mediaFiles.filter((_, i) => i !== index));
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim() && mediaFiles.length === 0) return;
    
    try {
      const podId = selectedPod === 'all' ? joinedPods[0]?.id : selectedPod;
      
      if (!podId) {
        toast.error('Please select a pod to post in');
        return;
      }

      let mediaUrls: string[] = [];

      // Upload media files if any
      if (mediaFiles.length > 0) {
        setUploadingMedia(true);
        try {
          mediaUrls = await Promise.all(
            mediaFiles.map(file => uploadApi.uploadFile(file, 'public'))
          );
          toast.success('Media uploaded successfully!');
        } catch (error) {
          console.error('Failed to upload media:', error);
          toast.error('Failed to upload media files');
          setUploadingMedia(false);
          return;
        }
        setUploadingMedia(false);
      }

      const newPost = await postsApi.createPost({
        podId,
        content: newPostContent,
        mediaUrls,
      });
      
      // Check if post already exists before adding
      setPosts(prevPosts => {
        const postExists = prevPosts.some(p => p.id === newPost.id);
        return postExists ? prevPosts : [newPost, ...prevPosts];
      });
      setNewPostContent('');
      setMediaFiles([]);
      toast.success('Post created successfully!');
    } catch (error) {
      console.error('Failed to create post:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create post');
    }
  };

  const handleLike = async (postId: string) => {
    if (!user) return;

    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const likes = post.likes || [];
    const hasLiked = likes.includes(user.id);

    try {
      if (hasLiked) {
        // Unlike - remove reaction
        await reactionsApi.removeReaction(postId);
        
        // Update local state
        setPosts(posts.map((p) => {
          if (p.id === postId) {
            return {
              ...p,
              likes: likes.filter((id) => id !== user.id),
            };
          }
          return p;
        }));
      } else {
        // Like - add reaction
        await reactionsApi.addReaction({
          entityId: postId,
          entityType: 'post',
          type: 'like',
        });
        
        // Update local state
        setPosts(posts.map((p) => {
          if (p.id === postId) {
            return {
              ...p,
              likes: [...likes, user.id],
            };
          }
          return p;
        }));
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
      toast.error('Failed to update like');
    }
  };

  const handleShare = async (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const shareData = {
      title: `Post by ${post.author?.fullName || 'User'}`,
      text: post.content.substring(0, 100) + (post.content.length > 100 ? '...' : ''),
      url: `${window.location.origin}/post/${postId}`,
    };

    try {
      // Check if Web Share API is available
      if (navigator.share) {
        await navigator.share(shareData);
        toast.success('Shared successfully');
      } else {
        // Fallback: Copy link to clipboard
        await navigator.clipboard.writeText(shareData.url);
        toast.success('Link copied to clipboard');
      }
    } catch (error) {
      // User cancelled share or clipboard failed
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Failed to share:', error);
        toast.error('Failed to share post');
      }
    }
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
            <div key={pod.id} className="flex items-center gap-1">
              <Badge
                variant={selectedPod === pod.id ? 'default' : 'outline'}
                className="cursor-pointer whitespace-nowrap"
                onClick={() => setSelectedPod(pod.id)}
              >
                {pod.name}
              </Badge>
              <button
                onClick={() => setSelectedPodForDetails(pod)}
                className="p-1 rounded-full hover:bg-muted transition-colors"
              >
                <Info className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
              </button>
            </div>
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
                {/* Media Preview */}
                {mediaFiles.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    {mediaFiles.map((file, index) => (
                      <div key={index} className="relative">
                        {file.type.startsWith('image/') ? (
                          <img
                            src={URL.createObjectURL(file)}
                            alt="Preview"
                            className="w-full h-32 object-cover rounded-lg"
                          />
                        ) : (
                          <video
                            src={URL.createObjectURL(file)}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                        )}
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="absolute top-1 right-1 bg-black/50 hover:bg-black/70"
                          onClick={() => removeMediaFile(index)}
                        >
                          <Plus className="w-4 h-4 text-white rotate-45" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon-sm" asChild>
                      <label className="cursor-pointer">
                        <Image className="w-5 h-5 text-muted-foreground" />
                        <input
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                          multiple
                          className="hidden"
                          onChange={(e) => handleMediaSelect(e, 'image')}
                        />
                      </label>
                    </Button>
                    <Button variant="ghost" size="icon-sm" asChild>
                      <label className="cursor-pointer">
                        <Video className="w-5 h-5 text-muted-foreground" />
                        <input
                          type="file"
                          accept="video/mp4,video/webm,video/ogg"
                          multiple
                          className="hidden"
                          onChange={(e) => handleMediaSelect(e, 'video')}
                        />
                      </label>
                    </Button>
                  </div>
                  <Button
                    variant="hero"
                    size="sm"
                    onClick={handleCreatePost}
                    disabled={(!newPostContent.trim() && mediaFiles.length === 0) || uploadingMedia}
                  >
                    {uploadingMedia ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Post
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feed */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading posts...</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {filteredPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUser={user}
                  joinedPods={joinedPods}
                  onLike={() => handleLike(post.id)}
                  isLiked={post.likes?.includes(user?.id || '') || false}
                  onUserClick={(user) => setSelectedUserForProfile(user)}
                  onShare={() => handleShare(post.id)}
                />
              ))}
            </div>

            {filteredPosts.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No posts yet. Be the first to share!</p>
              </div>
            )}
          </>
        )}
      </main>

      <BottomNav />

      {/* Pod Details Dialog */}
      <PodDetailsDialog
        pod={selectedPodForDetails}
        isOpen={!!selectedPodForDetails}
        onClose={() => setSelectedPodForDetails(null)}
        isJoined={selectedPodForDetails ? joinedPods.some(p => p.id === selectedPodForDetails.id) : false}
        onJoin={() => selectedPodForDetails && joinPod(selectedPodForDetails)}
        onLeave={() => selectedPodForDetails && leavePod(selectedPodForDetails.id)}
        currentUserId={user?.id}
        onUserClick={(user) => {
          setSelectedPodForDetails(null);
          setSelectedUserForProfile(user);
        }}
      />

      {/* User Profile Dialog */}
      <UserProfileDialog
        user={selectedUserForProfile}
        currentUserId={user?.id}
        isOpen={!!selectedUserForProfile}
        onClose={() => setSelectedUserForProfile(null)}
        onMessage={() => {
          if (selectedUserForProfile) {
            setShowSendMessageDialog(true);
          }
        }}
      />

      {/* Send Message Dialog */}
      <SendMessageDialog
        user={selectedUserForProfile}
        currentUserId={user?.id}
        isOpen={showSendMessageDialog}
        onClose={() => {
          setShowSendMessageDialog(false);
          setSelectedUserForProfile(null);
        }}
      />
    </div>
  );
};

const PostCard = ({
  post,
  currentUser,
  joinedPods,
  onLike,
  isLiked,
  onUserClick,
  onShare,
}: {
  post: Post;
  currentUser: User | null;
  joinedPods: Pod[];
  onLike: () => void;
  isLiked: boolean;
  onUserClick: (user: User) => void;
  onShare: () => void;
}) => {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const timeAgo = getTimeAgo(post.createdAt);

  // Get pod owner ID
  const pod = joinedPods.find(p => p.id === post.podId);
  const podOwnerId = pod?.ownerId;

  const handleToggleComments = async () => {
    if (!showComments && comments.length === 0) {
      setLoadingComments(true);
      try {
        const fetchedComments = await commentsApi.getComments(post.id);
        setComments(fetchedComments);
      } catch (error) {
        console.error('Failed to load comments:', error);
        toast.error('Failed to load comments');
      } finally {
        setLoadingComments(false);
      }
    }
    setShowComments(!showComments);
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    setSubmittingComment(true);
    try {
      const comment = await commentsApi.addComment(post.id, { content: newComment });
      console.log('Added comment:', comment);
      setComments([...comments, comment]);
      console.log('Updated comments:', [...comments, comment]);
      setNewComment('');
      toast.success('Comment added!');
    } catch (error) {
      console.error('Failed to add comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar 
            className="w-10 h-10 cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
            onClick={() => onUserClick(post.author)}
          >
            <AvatarImage src={post.author.profilePhoto} />
            <AvatarFallback>{post.author.fullName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div>
                <span 
                  className="font-medium text-foreground cursor-pointer hover:text-primary hover:underline transition-colors"
                  onClick={() => onUserClick(post.author)}
                >
                  {post.author.fullName}
                </span>
                {post.isOwnerPost && (
                  <Badge variant="secondary" className="ml-2 text-xs">Owner</Badge>
                )}
                <p className="text-sm text-muted-foreground">
                  <span 
                    className="cursor-pointer hover:text-primary transition-colors"
                    onClick={() => onUserClick(post.author)}
                  >
                    @{post.author.username}
                  </span>
                  {' '}· {timeAgo}
                </p>
              </div>
              <Button variant="ghost" size="icon-sm">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
            <p className="mt-2 text-foreground whitespace-pre-wrap">{post.content}</p>
            
            {/* Media Display */}
            {post.mediaUrls && post.mediaUrls.length > 0 && (
              <div className={`mt-3 grid gap-2 ${post.mediaUrls.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                {post.mediaUrls.map((url, index) => (
                  <div key={`${post.id}-media-${index}`} className="rounded-lg overflow-hidden bg-secondary">
                    {url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                      <img 
                        src={url} 
                        alt={`Media ${index + 1}`} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <video 
                        src={url} 
                        controls 
                        className="w-full h-full"
                      />
                    )}
                  </div>
                ))}
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
                {post.likes && post.likes.length > 0 && post.likes.length}
              </button>
              <button 
                onClick={handleToggleComments}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                {comments.length || post.comments?.length || 0}
              </button>
              <button 
                onClick={onShare} 
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            {/* Comments Section */}
            {showComments && (
              <div className="mt-4 pt-4 border-t border-border">
                {loadingComments ? (
                  <p className="text-sm text-muted-foreground">Loading comments...</p>
                ) : (
                  <>
                    {/* Comments List */}
                    <div className="space-y-3 mb-4">
                      {comments.map((comment) => (
                        <div key={comment.id} className="flex gap-2">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={comment.author?.profilePhoto} />
                            <AvatarFallback>{comment.author?.fullName?.charAt(0) || 'U'}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="bg-secondary rounded-lg px-3 py-2">
                              <div className="flex items-center gap-1.5">
                                <span className="font-medium text-sm">{comment.author?.fullName || 'Unknown'}</span>
                                {comment.authorId === podOwnerId && (
                                  <Badge variant="secondary" className="text-xs py-0 px-1.5">Owner</Badge>
                                )}
                              </div>
                              <p className="text-sm text-foreground mt-0.5">{comment.content}</p>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {getTimeAgo(comment.createdAt)}
                            </p>
                          </div>
                        </div>
                      ))}
                      {comments.length === 0 && (
                        <p className="text-sm text-muted-foreground">No comments yet. Be the first to comment!</p>
                      )}
                    </div>

                    {/* Add Comment */}
                    <div className="flex gap-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={currentUser?.profilePhoto} />
                        <AvatarFallback>{currentUser?.fullName?.charAt(0) || 'U'}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 flex gap-2">
                        <Input
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Write a comment..."
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleAddComment();
                            }
                          }}
                          disabled={submittingComment}
                        />
                        <Button 
                          size="sm" 
                          onClick={handleAddComment}
                          disabled={!newComment.trim() || submittingComment}
                        >
                          {submittingComment ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <Send className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const getTimeAgo = (date: Date | string | undefined): string => {
  if (!date) return 'just now';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return 'just now';
  const seconds = Math.floor((new Date().getTime() - dateObj.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
};

export default Home;
