import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Edit, MapPin, Building2, Globe, Linkedin, Instagram, Twitter, MessageCircle, Loader2, Facebook, Youtube, Github, Briefcase, GraduationCap, Calendar, Mail, Phone, User as UserIcon } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { POD_SUBCATEGORY_DISPLAY, UserProfile } from '@/types';
import { useEffect, useState } from 'react';
import { usersApi } from '@/services/api';
import { toast } from 'sonner';

const Profile = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const { user: currentUser, joinedPods } = useAuth();
  const [profileUser, setProfileUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isOwnProfile = !userId || userId === currentUser?.id;
  const user = isOwnProfile ? currentUser : profileUser;

  useEffect(() => {
    if (!isOwnProfile && userId) {
      setIsLoading(true);
      usersApi.getProfile(userId)
        .then(setProfileUser)
        .catch(() => toast.error('Failed to load profile'))
        .finally(() => setIsLoading(false));
    }
  }, [userId, isOwnProfile]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">User not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5" /></Button>
          <h1 className="font-semibold text-foreground">Profile</h1>
          {isOwnProfile && <Button variant="ghost" size="icon"><Edit className="w-5 h-5" /></Button>}
          {!isOwnProfile && <div className="w-10" />}
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl space-y-6">
        {/* Profile Header */}
        <div className="text-center">
          <Avatar className="w-32 h-32 mx-auto mb-4 border-4 border-background shadow-lg">
            <AvatarImage src={user?.profilePhoto} />
            <AvatarFallback className="text-3xl">{user?.fullName?.charAt(0)}</AvatarFallback>
          </Avatar>
          <h2 className="text-3xl font-bold text-foreground">{user?.fullName}</h2>
          <p className="text-muted-foreground text-lg">@{user?.username}</p>
          {user?.designation && (
            <Badge variant="secondary" className="mt-2">
              {user.designation}
            </Badge>
          )}
          {user?.role && (
            <Badge variant="outline" className="mt-2 ml-2">
              {user.role === 'POD_OWNER' || user.role === 'pod_owner' ? 'Pod Owner' : 'User'}
            </Badge>
          )}
        </div>

        {/* Contact Information (Own Profile Only) */}
        {isOwnProfile && (user?.email || user?.mobile) && (
          <Card>
            <CardContent className="p-5 space-y-3">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <UserIcon className="w-5 h-5" />
                Contact Information
              </h3>
              <Separator />
              {user.email && (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <span>{user.email}</span>
                </div>
              )}
              {user.mobile && (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  <span>{user.mobile}</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Professional Information */}
        {(user?.professionCategory || user?.organisationName || user?.brandName || user?.operatingCity || user?.website || user?.briefAboutOrganisation) && (
          <Card>
            <CardContent className="p-5 space-y-3">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Professional Details
              </h3>
              <Separator />
              {user.professionCategory && (
                <div className="flex items-start gap-3">
                  <UserIcon className="w-4 h-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Profession Category</p>
                    <p className="font-medium text-foreground">{user.professionCategory}</p>
                  </div>
                </div>
              )}
              {user.organisationName && (
                <div className="flex items-start gap-3">
                  <Building2 className="w-4 h-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Organisation</p>
                    <p className="font-medium text-foreground">{user.organisationName}</p>
                  </div>
                </div>
              )}
              {user.brandName && (
                <div className="flex items-start gap-3">
                  <Building2 className="w-4 h-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Brand Name</p>
                    <p className="font-medium text-foreground">{user.brandName}</p>
                  </div>
                </div>
              )}
              {user.operatingCity && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium text-foreground">{user.operatingCity}</p>
                  </div>
                </div>
              )}
              {user.website && (
                <div className="flex items-start gap-3">
                  <Globe className="w-4 h-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Website</p>
                    <a href={user.website} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">
                      {user.website}
                    </a>
                  </div>
                </div>
              )}
              {user.briefAboutOrganisation && (
                <div className="flex items-start gap-3">
                  <Building2 className="w-4 h-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">About Organisation</p>
                    <p className="text-foreground">{user.briefAboutOrganisation}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Working Professional Details */}
        {(user?.workingDomain || user?.workingExperienceFrom || user?.workingExperienceTo) && (
          <Card>
            <CardContent className="p-5 space-y-3">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Work Experience
              </h3>
              <Separator />
              {user.workingDomain && (
                <div className="flex items-start gap-3">
                  <Briefcase className="w-4 h-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Working Domain</p>
                    <p className="font-medium text-foreground">{user.workingDomain}</p>
                  </div>
                </div>
              )}
              {(user.workingExperienceFrom || user.workingExperienceTo) && (
                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Experience Period</p>
                    <p className="font-medium text-foreground">
                      {user.workingExperienceFrom && new Date(user.workingExperienceFrom).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      {user.workingExperienceFrom && user.workingExperienceTo && ' - '}
                      {user.workingExperienceTo ? new Date(user.workingExperienceTo).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Present'}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Student Details */}
        {(user?.collegeName || user?.currentCourse || user?.yearSemester || user?.interestDomain) && (
          <Card>
            <CardContent className="p-5 space-y-3">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                Education
              </h3>
              <Separator />
              {user.collegeName && (
                <div className="flex items-start gap-3">
                  <GraduationCap className="w-4 h-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">College/University</p>
                    <p className="font-medium text-foreground">{user.collegeName}</p>
                  </div>
                </div>
              )}
              {user.currentCourse && (
                <div className="flex items-start gap-3">
                  <GraduationCap className="w-4 h-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Course</p>
                    <p className="font-medium text-foreground">{user.currentCourse}</p>
                  </div>
                </div>
              )}
              {user.yearSemester && (
                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Year/Semester</p>
                    <p className="font-medium text-foreground">{user.yearSemester}</p>
                  </div>
                </div>
              )}
              {user.interestDomain && (
                <div className="flex items-start gap-3">
                  <Briefcase className="w-4 h-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Interest Domain</p>
                    <p className="font-medium text-foreground">{user.interestDomain}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Startup Details */}
        {(user?.startupSubcategory || user?.businessType || user?.startupFoundedYear) && (
          <Card>
            <CardContent className="p-5 space-y-3">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Startup Details
              </h3>
              <Separator />
              {user.startupSubcategory && (
                <div className="flex items-start gap-3">
                  <Building2 className="w-4 h-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Startup Category</p>
                    <p className="font-medium text-foreground">{user.startupSubcategory}</p>
                  </div>
                </div>
              )}
              {user.businessType && (
                <div className="flex items-start gap-3">
                  <Building2 className="w-4 h-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Business Type</p>
                    <p className="font-medium text-foreground">{user.businessType}</p>
                  </div>
                </div>
              )}
              {user.startupFoundedYear && (
                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Founded Year</p>
                    <p className="font-medium text-foreground">{user.startupFoundedYear}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Social Links */}
        {user?.socialLinks && Object.values(user.socialLinks).some(Boolean) && (
          <Card>
            <CardContent className="p-5 space-y-3">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Social Links
              </h3>
              <Separator />
              <div className="grid grid-cols-2 gap-3">
                {user.socialLinks.linkedin && (
                  <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                    <a href={user.socialLinks.linkedin} target="_blank" rel="noopener noreferrer">
                      <Linkedin className="w-4 h-4 mr-2" />
                      LinkedIn
                    </a>
                  </Button>
                )}
                {user.socialLinks.instagram && (
                  <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                    <a href={user.socialLinks.instagram} target="_blank" rel="noopener noreferrer">
                      <Instagram className="w-4 h-4 mr-2" />
                      Instagram
                    </a>
                  </Button>
                )}
                {user.socialLinks.twitter && (
                  <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                    <a href={user.socialLinks.twitter} target="_blank" rel="noopener noreferrer">
                      <Twitter className="w-4 h-4 mr-2" />
                      Twitter
                    </a>
                  </Button>
                )}
                {user.socialLinks.facebook && (
                  <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                    <a href={user.socialLinks.facebook} target="_blank" rel="noopener noreferrer">
                      <Facebook className="w-4 h-4 mr-2" />
                      Facebook
                    </a>
                  </Button>
                )}
                {user.socialLinks.youtube && (
                  <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                    <a href={user.socialLinks.youtube} target="_blank" rel="noopener noreferrer">
                      <Youtube className="w-4 h-4 mr-2" />
                      YouTube
                    </a>
                  </Button>
                )}
                {user.socialLinks.github && (
                  <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                    <a href={user.socialLinks.github} target="_blank" rel="noopener noreferrer">
                      <Github className="w-4 h-4 mr-2" />
                      GitHub
                    </a>
                  </Button>
                )}
                {user.socialLinks.portfolio && (
                  <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                    <a href={user.socialLinks.portfolio} target="_blank" rel="noopener noreferrer">
                      <Globe className="w-4 h-4 mr-2" />
                      Portfolio
                    </a>
                  </Button>
                )}
                {user.socialLinks.others && (
                  <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                    <a href={user.socialLinks.others} target="_blank" rel="noopener noreferrer">
                      <Globe className="w-4 h-4 mr-2" />
                      Other
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Joined Pods */}
        {isOwnProfile && (
          <Card>
            <CardContent className="p-5 space-y-3">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Joined Pods ({joinedPods.length})
              </h3>
              <Separator />
              <div className="space-y-3">
                {joinedPods.map((pod) => (
                  <div key={pod.id} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-secondary/50 transition-colors cursor-pointer" onClick={() => navigate(`/pods/${pod.id}`)}>
                    {pod.logo ? (
                      <Avatar className="w-12 h-12 shrink-0">
                        <AvatarImage src={pod.logo} />
                        <AvatarFallback><Building2 className="w-6 h-6" /></AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Building2 className="w-6 h-6 text-primary" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{pod.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {pod.subcategory ? POD_SUBCATEGORY_DISPLAY[pod.subcategory] : 'Pod'}
                      </p>
                      {pod.userRole && (
                        <Badge variant="secondary" className="mt-1 text-xs">
                          {pod.userRole === 'owner' ? 'Owner' : pod.userRole === 'co-owner' ? 'Co-Owner' : 'Member'}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
                {joinedPods.length === 0 && (
                  <p className="text-muted-foreground text-center py-8">No pods joined yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Member Since */}
        {user?.createdAt && (
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">
                  Member since {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Send Message Button */}
        {!isOwnProfile && (
          <Button variant="hero" size="lg" className="w-full" onClick={() => navigate('/chat')}>
            <MessageCircle className="w-5 h-5 mr-2" />
            Send Message
          </Button>
        )}
      </main>
    </div>
  );
};

export default Profile;
