import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, UserProfile } from '@/types';
import { Mail, Phone, Building2, MapPin, Briefcase, Calendar, Linkedin, Instagram, Facebook, Twitter, Youtube, MessageCircle } from 'lucide-react';

interface UserProfileDialogProps {
  user: User | UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onMessage?: () => void;
}

const UserProfileDialog = ({ user, isOpen, onClose, onMessage }: UserProfileDialogProps) => {
  if (!user) return null;

  const userProfile = user as UserProfile;
  const hasSocialLinks = userProfile.socialLinks && Object.values(userProfile.socialLinks).some(Boolean);

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
            <Badge variant={user.role === 'pod_owner' ? 'default' : 'secondary'} className="mt-2">
              {user.role === 'pod_owner' ? 'Pod Owner' : 'Member'}
            </Badge>
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
          {(userProfile.organisationName || userProfile.designation || userProfile.operatingCity) && (
            <div className="space-y-2 pt-2 border-t border-border">
              {userProfile.organisationName && (
                <div className="flex items-center gap-3 p-2">
                  <Building2 className="w-4 h-4 text-muted-foreground shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{userProfile.organisationName}</p>
                    {userProfile.brandName && (
                      <p className="text-xs text-muted-foreground truncate">{userProfile.brandName}</p>
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
              {userProfile.operatingCity && (
                <div className="flex items-center gap-3 p-2">
                  <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="text-sm text-foreground">{userProfile.operatingCity}</span>
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
                {userProfile.socialLinks?.linkedin && (
                  <a href={userProfile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                    <Linkedin className="w-5 h-5" />
                  </a>
                )}
                {userProfile.socialLinks?.instagram && (
                  <a href={userProfile.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
                {userProfile.socialLinks?.facebook && (
                  <a href={userProfile.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                    <Facebook className="w-5 h-5" />
                  </a>
                )}
                {userProfile.socialLinks?.twitter && (
                  <a href={userProfile.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                    <Twitter className="w-5 h-5" />
                  </a>
                )}
                {userProfile.socialLinks?.youtube && (
                  <a href={userProfile.socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                    <Youtube className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Member Since */}
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2">
            <Calendar className="w-3 h-3" />
            <span>Member since {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
          </div>

          {/* Action */}
          {onMessage && (
            <Button variant="hero" className="w-full" onClick={onMessage}>
              <MessageCircle className="w-4 h-4 mr-2" />
              Send Message
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserProfileDialog;
