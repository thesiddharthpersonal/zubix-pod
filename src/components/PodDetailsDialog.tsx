import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Pod, User } from '@/types';
import { Building2, MapPin, Target, Users, Linkedin, Instagram, Facebook, Twitter, Youtube, DollarSign, Briefcase, Crown, BadgeCheck } from 'lucide-react';

interface PodDetailsDialogProps {
  pod: Pod | null;
  isOpen: boolean;
  onClose: () => void;
  isJoined: boolean;
  onJoin: () => void;
  onLeave?: () => void;
  onUserClick?: (user: User) => void;
}

const PodDetailsDialog = ({ pod, isOpen, onClose, isJoined, onJoin, onLeave, onUserClick }: PodDetailsDialogProps) => {
  if (!pod) return null;

  const handleJoin = () => {
    onJoin();
    onClose();
  };

  const handleLeave = () => {
    onLeave?.();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">Pod Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Building2 className="w-8 h-8 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-foreground">{pod.name}</h2>
                {pod.isVerified && (
                  <BadgeCheck className="w-5 h-5 text-blue-500 shrink-0" />
                )}
              </div>
              <p className="text-sm text-muted-foreground">{pod.organisationName}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="secondary">{pod.subcategory}</Badge>
                <Badge variant="outline">{pod.organisationType}</Badge>
              </div>
            </div>
          </div>

          {/* Key Info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <MapPin className="w-4 h-4" />
                <span className="text-xs">Location</span>
              </div>
              <p className="font-medium text-foreground text-sm">{pod.operatingCity}</p>
            </div>
            {pod.totalInvestmentSize && (
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-xs">Total Investment</span>
                </div>
                <p className="font-medium text-foreground text-sm">{pod.totalInvestmentSize}</p>
              </div>
            )}
            {pod.numberOfInvestments && (
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Briefcase className="w-4 h-4" />
                  <span className="text-xs">Investments</span>
                </div>
                <p className="font-medium text-foreground text-sm">{pod.numberOfInvestments}</p>
              </div>
            )}
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Users className="w-4 h-4" />
                <span className="text-xs">Members</span>
              </div>
              <p className="font-medium text-foreground text-sm">{pod.memberIds?.length || 0}</p>
            </div>
          </div>

          {/* Focus Areas */}
          {pod.focusAreas && pod.focusAreas.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Focus Areas</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {pod.focusAreas.map((area) => (
                  <Badge key={area} variant="outline" className="text-xs">
                    {area}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* About */}
          {pod.briefAboutOrganisation && (
            <div>
              <h4 className="text-sm font-medium text-foreground mb-2">About</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {pod.briefAboutOrganisation}
              </p>
            </div>
          )}

          {/* Pod Owner */}
          {pod.owner && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Crown className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-medium text-foreground">Pod Owner</span>
              </div>
              <div 
                className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted transition-colors"
                onClick={() => pod.owner && onUserClick?.(pod.owner)}
              >
                <Avatar className="w-12 h-12">
                  <AvatarImage src={pod.owner.profilePhoto} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {pod.owner.fullName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground truncate hover:text-primary transition-colors">{pod.owner.fullName}</p>
                  <p className="text-sm text-muted-foreground truncate">@{pod.owner.username}</p>
                </div>
              </div>
            </div>
          )}

          {/* Social Links */}
          {pod.socialLinks && Object.values(pod.socialLinks).some(Boolean) && (
            <div>
              <h4 className="text-sm font-medium text-foreground mb-2">Connect</h4>
              <div className="flex gap-3">
                {pod.socialLinks.linkedin && (
                  <a href={pod.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                    <Linkedin className="w-5 h-5" />
                  </a>
                )}
                {pod.socialLinks.instagram && (
                  <a href={pod.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
                {pod.socialLinks.facebook && (
                  <a href={pod.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                    <Facebook className="w-5 h-5" />
                  </a>
                )}
                {pod.socialLinks.twitter && (
                  <a href={pod.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                    <Twitter className="w-5 h-5" />
                  </a>
                )}
                {pod.socialLinks.youtube && (
                  <a href={pod.socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                    <Youtube className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Action */}
          <div className="pt-2 space-y-2">
            {isJoined ? (
              <Button variant="destructive" className="w-full" onClick={handleLeave}>
                Leave Pod
              </Button>
            ) : (
              <Button variant="hero" className="w-full" onClick={handleJoin}>
                Join Pod
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PodDetailsDialog;
