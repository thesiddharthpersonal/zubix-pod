import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, Upload, Check, Loader2, X, Plus } from 'lucide-react';
import { POD_SUBCATEGORIES, FOCUS_AREAS, PodSubcategory } from '@/types';
import { toast } from 'sonner';
import { podsApi, usersApi, CreatePodRequest, authApi } from '@/services/api';

const PodOwnerRegistration = () => {
  const navigate = useNavigate();
  const { user, updateUserProfile, setPendingPodOwner } = useAuth();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coOwnerUsername, setCoOwnerUsername] = useState('');
  const [coOwners, setCoOwners] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    // Step A
    fullName: user?.fullName || '',
    email: user?.email || '',
    mobile: user?.mobile || '',
    profilePhoto: '',
    // Step B
    podSubcategory: '' as PodSubcategory | '',
    // Step C
    organisationName: '',
    organisationType: '' as 'Government' | 'Private' | '',
    operatingCity: '',
    focusAreas: [] as string[],
    totalInvestmentSize: '',
    numberOfInvestments: '',
    briefAboutOrganisation: '',
    // Step D
    linkedin: '',
    instagram: '',
    facebook: '',
    twitter: '',
    youtube: '',
  });

  const totalSteps = 5;
  const progress = (step / totalSteps) * 100;

  const handleNext = () => {
    if (step === 1 && (!formData.fullName || !formData.email || !formData.mobile)) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (step === 2 && !formData.podSubcategory) {
      toast.error('Please select a pod subcategory');
      return;
    }
    if (step === 3 && !formData.organisationName) {
      toast.error('Organisation name is required');
      return;
    }
    if (step === 4 && !formData.linkedin) {
      toast.error('LinkedIn profile is required');
      return;
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    if (step === 1) {
      navigate('/role-selection');
    } else {
      setStep(step - 1);
    }
  };

  const addCoOwner = () => {
    if (!coOwnerUsername.trim()) {
      toast.error('Please enter a username');
      return;
    }
    if (coOwners.includes(coOwnerUsername)) {
      toast.error('This user is already added');
      return;
    }
    setCoOwners([...coOwners, coOwnerUsername]);
    setCoOwnerUsername('');
  };

  const removeCoOwner = (username: string) => {
    setCoOwners(coOwners.filter((u) => u !== username));
  };

  const toggleFocusArea = (area: string) => {
    setFormData((prev) => ({
      ...prev,
      focusAreas: prev.focusAreas.includes(area)
        ? prev.focusAreas.filter((a) => a !== area)
        : [...prev.focusAreas, area],
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // First update user role to POD_OWNER
      const { user: updatedUser, token } = await authApi.updateRoleToPodOwner();
      
      // Update user profile with form data
      if (updatedUser) {
        await usersApi.updateProfile(updatedUser.id, {
          ...formData,
          socialLinks: {
            linkedin: formData.linkedin,
            instagram: formData.instagram,
            facebook: formData.facebook,
            twitter: formData.twitter,
            youtube: formData.youtube,
          },
        });
      }

      // Create the pod
      // Convert subcategory to match backend enum format (e.g., "Venture Capitalist" -> "VENTURE_CAPITALIST")
      const subcategoryEnum = formData.podSubcategory.toUpperCase().replace(/ /g, '_') as PodSubcategory;
      
      const podData: CreatePodRequest = {
        name: formData.organisationName,
        subcategory: subcategoryEnum,
        focusAreas: formData.focusAreas,
        organisationName: formData.organisationName,
        organisationType: formData.organisationType === 'Government' ? 'GOVERNMENT' : 'PRIVATE',
        operatingCity: formData.operatingCity,
        totalInvestmentSize: formData.totalInvestmentSize,
        numberOfInvestments: parseInt(formData.numberOfInvestments) || undefined,
        briefAboutOrganisation: formData.briefAboutOrganisation,
        socialLinks: {
          linkedin: formData.linkedin,
          instagram: formData.instagram,
          facebook: formData.facebook,
          twitter: formData.twitter,
          youtube: formData.youtube,
        },
        coOwnerUsernames: coOwners,
      };

      const pod = await podsApi.createPod(podData);
      
      // Update local state
      updateUserProfile({
        role: 'pod_owner',
      });

      setPendingPodOwner({
        ...pod,
        coOwnerIds: coOwners,
      });
      
      toast.success('Pod created successfully!');
      navigate('/pending-approval');
    } catch (error) {
      console.error('Failed to create pod:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create pod');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={handleBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="text-sm text-muted-foreground">
              Step {step} of {totalSteps}
            </div>
          </div>
          <Progress value={progress} className="mt-4 h-1" />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-xl">
        <Card className="border-border/50 shadow-lg">
          {step === 1 && (
            <>
              <CardHeader>
                <CardTitle>Basic Details</CardTitle>
                <CardDescription>Tell us about yourself</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Profile Photo</Label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center border-2 border-dashed border-border">
                      <Upload className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <Button variant="outline" size="sm">Upload Photo</Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mobile">Mobile Number *</Label>
                  <Input
                    id="mobile"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  />
                </div>
              </CardContent>
            </>
          )}

          {step === 2 && (
            <>
              <CardHeader>
                <CardTitle>Pod Subcategory</CardTitle>
                <CardDescription>What type of pod are you creating?</CardDescription>
              </CardHeader>
              <CardContent>
                <Select
                  value={formData.podSubcategory}
                  onValueChange={(v) => setFormData({ ...formData, podSubcategory: v as PodSubcategory })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select pod type" />
                  </SelectTrigger>
                  <SelectContent>
                    {POD_SUBCATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </>
          )}

          {step === 3 && (
            <>
              <CardHeader>
                <CardTitle>Organisation Details</CardTitle>
                <CardDescription>Tell us about your organisation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="orgName">Organisation Name *</Label>
                  <Input
                    id="orgName"
                    value={formData.organisationName}
                    onChange={(e) => setFormData({ ...formData, organisationName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Organisation Type</Label>
                  <Select
                    value={formData.organisationType}
                    onValueChange={(v) => setFormData({ ...formData, organisationType: v as 'Government' | 'Private' })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Government">Government</SelectItem>
                      <SelectItem value="Private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Operating City</Label>
                  <Input
                    id="city"
                    value={formData.operatingCity}
                    onChange={(e) => setFormData({ ...formData, operatingCity: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Focus Areas</Label>
                  <div className="flex flex-wrap gap-2">
                    {FOCUS_AREAS.map((area) => (
                      <Badge
                        key={area}
                        variant={formData.focusAreas.includes(area) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => toggleFocusArea(area)}
                      >
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="investmentSize">Total Investment Size</Label>
                  <Input
                    id="investmentSize"
                    value={formData.totalInvestmentSize}
                    onChange={(e) => setFormData({ ...formData, totalInvestmentSize: e.target.value })}
                    placeholder="e.g., $10M"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="numInvestments">Number of Investments</Label>
                  <Input
                    id="numInvestments"
                    type="number"
                    value={formData.numberOfInvestments}
                    onChange={(e) => setFormData({ ...formData, numberOfInvestments: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="brief">Brief About Organisation</Label>
                  <Textarea
                    id="brief"
                    value={formData.briefAboutOrganisation}
                    onChange={(e) => setFormData({ ...formData, briefAboutOrganisation: e.target.value })}
                    rows={3}
                  />
                </div>
              </CardContent>
            </>
          )}

          {step === 4 && (
            <>
              <CardHeader>
                <CardTitle>Social Links</CardTitle>
                <CardDescription>Connect your social profiles</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn *</Label>
                  <Input
                    id="linkedin"
                    value={formData.linkedin}
                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    value={formData.instagram}
                    onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="facebook">Facebook</Label>
                  <Input
                    id="facebook"
                    value={formData.facebook}
                    onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="twitter">Twitter</Label>
                  <Input
                    id="twitter"
                    value={formData.twitter}
                    onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="youtube">YouTube</Label>
                  <Input
                    id="youtube"
                    value={formData.youtube}
                    onChange={(e) => setFormData({ ...formData, youtube: e.target.value })}
                  />
                </div>
              </CardContent>
            </>
          )}

          {step === 5 && (
            <>
              <CardHeader>
                <CardTitle>Add Co-Owners</CardTitle>
                <CardDescription>Invite team members to manage your pod</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={coOwnerUsername}
                    onChange={(e) => setCoOwnerUsername(e.target.value)}
                    placeholder="Enter username"
                    onKeyDown={(e) => e.key === 'Enter' && addCoOwner()}
                  />
                  <Button variant="outline" onClick={addCoOwner}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {coOwners.length > 0 && (
                  <div className="space-y-2">
                    <Label>Added Co-Owners</Label>
                    <div className="flex flex-wrap gap-2">
                      {coOwners.map((username) => (
                        <Badge key={username} variant="secondary" className="gap-1">
                          @{username}
                          <X
                            className="w-3 h-3 cursor-pointer"
                            onClick={() => removeCoOwner(username)}
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                <p className="text-sm text-muted-foreground">
                  Co-owners will be able to manage the pod, review pitches, and host events.
                </p>
              </CardContent>
            </>
          )}

          <div className="p-6 pt-0 flex gap-4">
            {step < totalSteps ? (
              <Button variant="hero" className="flex-1" onClick={handleNext}>
                Continue
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button variant="hero" className="flex-1" onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Submit Application
                  </>
                )}
              </Button>
            )}
          </div>
        </Card>
      </main>
    </div>
  );
};

export default PodOwnerRegistration;
