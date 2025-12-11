import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, UserProfile } from '@/types';
import { Mail, Phone, Building2, MapPin, Briefcase, Calendar, Linkedin, Instagram, Facebook, Twitter, Youtube, MessageCircle, Clock, Globe, Tag, TrendingUp, Github, Folder, Crown, ShieldMinus } from 'lucide-react';
import { messageRequestApi, chatApi, podsApi } from '@/services/api';
import { toast } from 'sonner';

interface UserProfileDialogProps {
  user: User | UserProfile | null;
  currentUserId?: string;
  podOwnerId?: string;
  podId?: string;
  isOpen: boolean;
  onClose: () => void;
  onMessage?: () => void;
  onCoOwnerChange?: () => void;
}

const UserProfileDialog = ({ user, currentUserId, podOwnerId, podId, isOpen, onClose, onMessage, onCoOwnerChange }: UserProfileDialogProps) => {
  const navigate = useNavigate();
  const [hasExistingRequest, setHasExistingRequest] = useState(false);
  const [isCheckingRequest, setIsCheckingRequest] = useState(false);
  const [existingChatId, setExistingChatId] = useState<string | null>(null);
  const [isUpdatingCoOwner, setIsUpdatingCoOwner] = useState(false);

  useEffect(() => {
    const checkExistingRequest = async () => {
      if (!user || !currentUserId || currentUserId === user.id) {
        setHasExistingRequest(false);
        setExistingChatId(null);
        return;
      }

      setIsCheckingRequest(true);
      try {
        // First check if there's an existing chat
        const chat = await chatApi.getChatByParticipants([currentUserId, user.id]);
        if (chat) {
          setExistingChatId(chat.id);
          setHasExistingRequest(false);
          return;
        }

        // If no chat, check for pending message request
        const requests = await messageRequestApi.getSentRequests(currentUserId);
        const existingRequest = requests.find(
          req => req.receiverId === user.id && req.status === 'PENDING'
        );
        setHasExistingRequest(!!existingRequest);
        setExistingChatId(null);
      } catch (error) {
        console.error('Failed to check existing request:', error);
        setHasExistingRequest(false);
        setExistingChatId(null);
      } finally {
        setIsCheckingRequest(false);
      }
    };

    if (isOpen) {
      checkExistingRequest();
    }
  }, [user, currentUserId, isOpen]);

  if (!user) return null;

  const userProfile = user as UserProfile;
  
  // Handle both nested socialLinks and flat URL fields from backend
  const socialLinks = userProfile.socialLinks || {
    linkedin: (user as any).linkedinUrl,
    instagram: (user as any).instagramUrl,
    facebook: (user as any).facebookUrl,
    twitter: (user as any).twitterUrl,
    youtube: (user as any).youtubeUrl,
    github: (user as any).githubUrl,
    portfolio: (user as any).portfolioUrl,
    others: (user as any).othersUrl,
  };
  
  const hasSocialLinks = socialLinks && Object.values(socialLinks).some(Boolean);

  const handleMessageClick = () => {
    if (existingChatId) {
      // If chat exists, navigate to chat page
      onClose();
      navigate('/chat', { state: { chatId: existingChatId } });
    } else {
      // If no chat, show send message dialog
      onMessage?.();
    }
  };

  const handlePromoteToCoOwner = async () => {
    if (!podId || !user) return;
    
    setIsUpdatingCoOwner(true);
    try {
      await podsApi.promoteToCoOwner(podId, user.id);
      toast.success(`${user.fullName} has been promoted to co-owner`);
      onCoOwnerChange?.();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to promote to co-owner');
    } finally {
      setIsUpdatingCoOwner(false);
    }
  };

  const handleDemoteCoOwner = async () => {
    if (!podId || !user) return;
    
    setIsUpdatingCoOwner(true);
    try {
      await podsApi.demoteCoOwner(podId, user.id);
      toast.success(`${user.fullName} has been demoted to regular member`);
      onCoOwnerChange?.();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to demote co-owner');
    } finally {
      setIsUpdatingCoOwner(false);
    }
  };

  const isCurrentUserPodOwner = podOwnerId && currentUserId === podOwnerId;
  const canManageCoOwners = isCurrentUserPodOwner && user && user.id !== podOwnerId;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">User Profile</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Profile Header */}
          <div className="flex flex-col items-center text-center">
            <Avatar className="w-20 h-20 mb-3">
              <AvatarImage src={user.profilePhoto} />
              <AvatarFallback className="bg-primary/10 text-primary text-2xl font-semibold">
                {user.fullName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-bold text-foreground">{user.fullName}</h2>
            <p className="text-sm text-muted-foreground">@{user.username}</p>
            <div className="flex gap-2 mt-2">
              {podOwnerId && user.id === podOwnerId && (
                <Badge variant="default">Pod Owner</Badge>
              )}
              {user.isCoOwner && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
                  Co-Owner
                </Badge>
              )}
              {podOwnerId && user.id !== podOwnerId && !user.isCoOwner && (
                <Badge variant="secondary">Member</Badge>
              )}
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
              <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="text-sm text-foreground truncate">{user.email}</span>
            </div>
            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
              <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="text-sm text-foreground">{user.mobile}</span>
            </div>
          </div>

          {/* Professional Info (if available) */}
          {(userProfile.organisationName || userProfile.designation || userProfile.operatingCity || userProfile.brandName || userProfile.startupSubcategory || userProfile.businessType || userProfile.website) && (
            <div className="space-y-2 pt-2 border-t border-border">
              {userProfile.organisationName && (
                <div className="flex items-center gap-3 p-2">
                  <Building2 className="w-4 h-4 text-muted-foreground shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{userProfile.organisationName}</p>
                    {userProfile.brandName && (
                      <p className="text-xs text-muted-foreground truncate">Brand: {userProfile.brandName}</p>
                    )}
                  </div>
                </div>
              )}
              {userProfile.designation && (
                <div className="flex items-center gap-3 p-2">
                  <Briefcase className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="text-sm text-foreground">{userProfile.designation}</span>
                </div>
              )}
              {(userProfile.workingExperienceFrom || userProfile.workingExperienceTo) && (
                <div className="flex items-center gap-3 p-2">
                  <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="text-sm text-foreground">
                    {userProfile.workingExperienceFrom && new Date(userProfile.workingExperienceFrom).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    {userProfile.workingExperienceFrom && userProfile.workingExperienceTo && ' - '}
                    {userProfile.workingExperienceTo ? new Date(userProfile.workingExperienceTo).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : (userProfile.workingExperienceFrom ? 'Present' : '')}
                  </span>
                </div>
              )}
              {userProfile.startupSubcategory && (
                <div className="flex items-center gap-3 p-2">
                  <Tag className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="text-sm text-foreground">{userProfile.startupSubcategory}</span>
                </div>
              )}
              {userProfile.businessType && (
                <div className="flex items-center gap-3 p-2">
                  <TrendingUp className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="text-sm text-foreground">{userProfile.businessType}</span>
                </div>
              )}
              {userProfile.operatingCity && (
                <div className="flex items-center gap-3 p-2">
                  <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="text-sm text-foreground">{userProfile.operatingCity}</span>
                </div>
              )}
              {userProfile.website && (
                <div className="flex items-center gap-3 p-2">
                  <Globe className="w-4 h-4 text-muted-foreground shrink-0" />
                  <a href={userProfile.website} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline truncate">
                    {userProfile.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
            </div>
          )}

          {/* About */}
          {userProfile.briefAboutOrganisation && (
            <div className="pt-2 border-t border-border">
              <h4 className="text-sm font-medium text-foreground mb-2">About</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {userProfile.briefAboutOrganisation}
              </p>
            </div>
          )}

          {/* Social Links */}
          {hasSocialLinks && (
            <div className="pt-2 border-t border-border">
              <h4 className="text-sm font-medium text-foreground mb-2">Connect</h4>
              <div className="flex gap-3">
                {socialLinks.linkedin && (
                  <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                    <Linkedin className="w-5 h-5" />
                  </a>
                )}
                {socialLinks.instagram && (
                  <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
                {socialLinks.facebook && (
                  <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                    <Facebook className="w-5 h-5" />
                  </a>
                )}
                {socialLinks.twitter && (
                  <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                    <Twitter className="w-5 h-5" />
                  </a>
                )}
                {socialLinks.youtube && (
                  <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                    <Youtube className="w-5 h-5" />
                  </a>
                )}
                {socialLinks.github && (
                  <a href={socialLinks.github} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                    <Github className="w-5 h-5" />
                  </a>
                )}
                {socialLinks.portfolio && (
                  <a href={socialLinks.portfolio} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                    <Folder className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Member Since */}
          {user.createdAt && (
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2">
              <Calendar className="w-3 h-3" />
              <span>Member since {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
            </div>
          )}

          {/* Co-Owner Management (Pod Owner Only) */}
          {canManageCoOwners && podId && (
            <div className="space-y-2">
              {user.isCoOwner ? (
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={handleDemoteCoOwner}
                  disabled={isUpdatingCoOwner}
                >
                  {isUpdatingCoOwner ? (
                    <>
                      <div className="w-4 h-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin mr-2" />
                      Demoting...
                    </>
                  ) : (
                    <>
                      <ShieldMinus className="w-4 h-4 mr-2" />
                      Remove Co-Owner Status
                    </>
                  )}
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  className="w-full border-blue-200 hover:bg-blue-50" 
                  onClick={handlePromoteToCoOwner}
                  disabled={isUpdatingCoOwner}
                >
                  {isUpdatingCoOwner ? (
                    <>
                      <div className="w-4 h-4 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin mr-2" />
                      Promoting...
                    </>
                  ) : (
                    <>
                      <Crown className="w-4 h-4 mr-2 text-blue-600" />
                      Make Co-Owner
                    </>
                  )}
                </Button>
              )}
            </div>
          )}

          {/* Action */}
          {onMessage && currentUserId && currentUserId !== user.id && (
            <>
              {isCheckingRequest ? (
                <Button variant="hero" className="w-full" disabled>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Checking...
                </Button>
              ) : existingChatId ? (
                <Button variant="hero" className="w-full" onClick={handleMessageClick}>
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Open Chat
                </Button>
              ) : hasExistingRequest ? (
                <div className="p-3 bg-primary/5 border border-primary/10 rounded-lg text-center">
                  <Clock className="w-5 h-5 text-primary mx-auto mb-2" />
                  <p className="text-sm font-medium text-foreground mb-1">Request Pending</p>
                  <p className="text-xs text-muted-foreground">
                    You've already sent a message request to this user. Please wait for them to accept.
                  </p>
                </div>
              ) : (
                <Button variant="hero" className="w-full" onClick={handleMessageClick}>
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserProfileDialog;
