import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Rocket, Loader2, Camera, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { uploadApi } from '@/services/api/upload';
import { usersApi } from '@/services/api/users';

const ProfileSetup = () => {
  const navigate = useNavigate();
  const { user, updateUserProfile } = useAuth();
  const [profilePicture, setProfilePicture] = useState(user?.profilePicture || user?.profilePhoto || '');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setUploading(true);

    try {
      const fileUrl = await uploadApi.uploadFile(file);
      setProfilePicture(fileUrl);
      toast.success('Profile picture uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload profile picture');
    } finally {
      setUploading(false);
    }
  };

  const handleContinue = async () => {
    if (!profilePicture) {
      // Skip if no profile picture
      navigate('/role-selection');
      return;
    }

    setSaving(true);
    try {
      if (user?.id) {
        await usersApi.updateProfile(user.id, { profilePhoto: profilePicture });
        updateUserProfile({ profilePhoto: profilePicture });
        toast.success('Profile updated!');
      }
      navigate('/role-selection');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to save profile picture');
      // Still navigate even if save fails
      navigate('/role-selection');
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = () => {
    navigate('/role-selection');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />

      {/* Main Content */}
      <main className="relative flex-1 flex items-center justify-center p-4 py-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
              <Rocket className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">StartupPod</span>
          </div>

          <Card className="border-border/50 shadow-lg">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl">Setup Your Profile</CardTitle>
              <CardDescription>Add a profile picture to personalize your account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Picture Upload */}
              <div className="flex flex-col items-center gap-4">
                <Avatar className="w-32 h-32 border-4 border-border">
                  <AvatarImage src={profilePicture || undefined} alt="Profile" />
                  <AvatarFallback className="text-3xl">
                    {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                  </AvatarFallback>
                </Avatar>
                
                <Label htmlFor="profilePicture" className="cursor-pointer">
                  <div className="flex items-center gap-2 px-6 py-3 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors">
                    {uploading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Camera className="w-5 h-5" />
                        <span>{profilePicture ? 'Change Photo' : 'Upload Photo'}</span>
                      </>
                    )}
                  </div>
                  <input
                    id="profilePicture"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    className="hidden"
                    onChange={handleFileSelect}
                    disabled={uploading}
                  />
                </Label>

                <p className="text-xs text-muted-foreground text-center">
                  Recommended: Square image, at least 400x400px<br />
                  Maximum size: 5MB
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-4">
                <Button
                  onClick={handleContinue}
                  variant="hero"
                  className="w-full"
                  disabled={uploading || saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>

                <Button
                  onClick={handleSkip}
                  variant="ghost"
                  className="w-full"
                  disabled={uploading || saving}
                >
                  Skip for now
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ProfileSetup;
