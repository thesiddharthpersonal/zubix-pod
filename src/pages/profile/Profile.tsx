import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, MapPin, Building2, Globe, Linkedin, Instagram, Twitter, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { POD_SUBCATEGORY_DISPLAY } from '@/types';

const Profile = () => {
  const navigate = useNavigate();
  const { user, joinedPods } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5" /></Button>
          <h1 className="font-semibold text-foreground">Profile</h1>
          <Button variant="ghost" size="icon"><Edit className="w-5 h-5" /></Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="text-center mb-6">
          <Avatar className="w-24 h-24 mx-auto mb-4"><AvatarImage src={user?.profilePhoto} /><AvatarFallback className="text-2xl">{user?.fullName?.charAt(0)}</AvatarFallback></Avatar>
          <h2 className="text-2xl font-bold text-foreground">{user?.fullName}</h2>
          <p className="text-muted-foreground">@{user?.username}</p>
          {user?.designation && <p className="text-muted-foreground mt-1">{user.designation}</p>}
        </div>

        <Card className="mb-6">
          <CardContent className="p-5 space-y-4">
            <h3 className="font-semibold text-foreground">About</h3>
            {user?.organisationName && <div className="flex items-center gap-2 text-muted-foreground"><Building2 className="w-4 h-4" />{user.organisationName}</div>}
            {user?.operatingCity && <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="w-4 h-4" />{user.operatingCity}</div>}
            {user?.website && <div className="flex items-center gap-2 text-muted-foreground"><Globe className="w-4 h-4" /><a href={user.website} className="text-primary hover:underline">{user.website}</a></div>}
            {user?.briefAboutOrganisation && <p className="text-muted-foreground">{user.briefAboutOrganisation}</p>}
          </CardContent>
        </Card>

        {user?.socialLinks && Object.values(user.socialLinks).some(Boolean) && (
          <Card className="mb-6">
            <CardContent className="p-5">
              <h3 className="font-semibold text-foreground mb-4">Social Links</h3>
              <div className="flex flex-wrap gap-3">
                {user.socialLinks.linkedin && <Button variant="outline" size="sm" asChild><a href={user.socialLinks.linkedin} target="_blank"><Linkedin className="w-4 h-4 mr-2" />LinkedIn</a></Button>}
                {user.socialLinks.instagram && <Button variant="outline" size="sm" asChild><a href={user.socialLinks.instagram} target="_blank"><Instagram className="w-4 h-4 mr-2" />Instagram</a></Button>}
                {user.socialLinks.twitter && <Button variant="outline" size="sm" asChild><a href={user.socialLinks.twitter} target="_blank"><Twitter className="w-4 h-4 mr-2" />Twitter</a></Button>}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-5">
            <h3 className="font-semibold text-foreground mb-4">Joined Pods ({joinedPods.length})</h3>
            <div className="space-y-3">
              {joinedPods.map((pod) => (
                <div key={pod.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Building2 className="w-5 h-5 text-primary" /></div>
                  <div className="flex-1"><p className="font-medium text-foreground">{pod.name}</p><p className="text-sm text-muted-foreground">{pod.subcategory ? POD_SUBCATEGORY_DISPLAY[pod.subcategory] : ''}</p></div>
                </div>
              ))}
              {joinedPods.length === 0 && <p className="text-muted-foreground text-center py-4">No pods joined yet</p>}
            </div>
          </CardContent>
        </Card>

        <div className="mt-6">
          <Button variant="hero" className="w-full" onClick={() => navigate('/chat')}><MessageCircle className="w-4 h-4" />Send Message</Button>
        </div>
      </main>
    </div>
  );
};

export default Profile;
