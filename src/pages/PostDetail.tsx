import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Heart, MessageCircle, Share2, MoreHorizontal, Send, ArrowLeft } from 'lucide-react';
import { Post, User } from '@/types';
import { postsApi, reactionsApi, commentsApi, Comment } from '@/services/api';
import { toast } from 'sonner';
import TopNav from '@/components/layout/TopNav';
import BottomNav from '@/components/layout/BottomNav';
import UserProfileDialog from '@/components/UserProfileDialog';
import SendMessageDialog from '@/components/SendMessageDialog';

const PostDetail = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { user, joinedPods } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [selectedUserForProfile, setSelectedUserForProfile] = useState<User | null>(null);
  const [showSendMessageDialog, setShowSendMessageDialog] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      if (!postId) {
        navigate('/home');
        return;
      }

      try {
        setIsLoading(true);
        const fetchedPost = await postsApi.getPostById(postId);
        setPost(fetchedPost);
        
        // Fetch comments
        const fetchedComments = await commentsApi.getComments(postId);
        setComments(fetchedComments);
      } catch (error) {
        console.error('Failed to fetch post:', error);
        toast.error('Post not found');
        navigate('/home');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [postId, navigate]);

  const handleLike = async () => {
    if (!user || !post) return;

    const likes = post.likes || [];
    const hasLiked = likes.includes(user.id);

    try {
      if (hasLiked) {
        await reactionsApi.removeReaction(post.id);
        setPost({
          ...post,
          likes: likes.filter((id) => id !== user.id),
        });
      } else {
        await reactionsApi.addReaction({
          entityId: post.id,
          entityType: 'post',
          type: 'like',
        });
        setPost({
          ...post,
          likes: [...likes, user.id],
        });
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
      toast.error('Failed to update like');
    }
  };

  const handleShare = async () => {
    if (!post) return;

    const shareData = {
      title: `Post by ${post.author?.fullName || 'User'}`,
      text: post.content.substring(0, 100) + (post.content.length > 100 ? '...' : ''),
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        toast.success('Shared successfully');
      } else {
        await navigator.clipboard.writeText(shareData.url);
        toast.success('Link copied to clipboard');
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Failed to share:', error);
        toast.error('Failed to share post');
      }
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !post) return;

    setSubmittingComment(true);
    try {
      const comment = await commentsApi.addComment(post.id, { content: newComment });
      setComments([...comments, comment]);
      setNewComment('');
      toast.success('Comment added!');
    } catch (error) {
      console.error('Failed to add comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <TopNav />
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading post...</p>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (!post) {
    return null;
  }

  const timeAgo = getTimeAgo(post.createdAt);
  const isLiked = post.likes?.includes(user?.id || '') || false;
  
  // Get pod owner ID
  const pod = joinedPods.find(p => p.id === post.podId);
  const podOwnerId = pod?.ownerId;

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopNav />

      <main className="container mx-auto px-4 py-4 max-w-2xl">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            // Check if there's a previous page in history
            if (window.history.length > 2) {
              navigate(-1);
            } else {
              navigate('/home');
            }
          }}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Avatar 
                className="w-10 h-10 cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
                onClick={() => setSelectedUserForProfile(post.author)}
              >
                <AvatarImage src={post.author.profilePhoto} />
                <AvatarFallback>{post.author.fullName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div>
                    <span 
                      className="font-medium text-foreground cursor-pointer hover:text-primary hover:underline transition-colors"
                      onClick={() => setSelectedUserForProfile(post.author)}
                    >
                      {post.author.fullName}
                    </span>
                    {post.isOwnerPost && (
                      <Badge variant="secondary" className="ml-2 text-xs">Owner</Badge>
                    )}
                    <p className="text-sm text-muted-foreground">
                      <span 
                        className="cursor-pointer hover:text-primary transition-colors"
                        onClick={() => setSelectedUserForProfile(post.author)}
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
                    onClick={handleLike}
                    className={`flex items-center gap-1.5 text-sm transition-colors ${
                      isLiked ? 'text-destructive' : 'text-muted-foreground hover:text-destructive'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                    {post.likes && post.likes.length > 0 && post.likes.length}
                  </button>
                  <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
                    <MessageCircle className="w-5 h-5" />
                    {comments.length}
                  </button>
                  <button 
                    onClick={handleShare} 
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>

                {/* Comments Section */}
                <div className="mt-4 pt-4 border-t border-border">
                  <h3 className="font-semibold text-foreground mb-4">Comments</h3>
                  
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
                  {user && (
                    <div className="flex gap-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={user.profilePhoto} />
                        <AvatarFallback>{user.fullName?.charAt(0) || 'U'}</AvatarFallback>
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
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <BottomNav />

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

export default PostDetail;
