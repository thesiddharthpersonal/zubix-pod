import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, Loader2, Plus, X } from 'lucide-react';
import { STARTUP_SUBCATEGORIES, BUSINESS_TYPES } from '@/types';
import { toast } from 'sonner';
import { usersApi } from '@/services/api';
import { Separator } from '@/components/ui/separator';

const EditProfile = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [additionalLinks, setAdditionalLinks] = useState<{ id: number; url: string }[]>([]);
  const [nextLinkId, setNextLinkId] = useState(1);
  
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    username: user?.username || '',
    mobile: user?.mobile || '',
    email: user?.email || '',
    professionCategory: user?.professionCategory || '',
    organisationName: user?.organisationName || '',
    brandName: user?.brandName || '',
    designation: user?.designation || '',
    workingExperienceFrom: user?.workingExperienceFrom ? new Date(user.workingExperienceFrom).toISOString().split('T')[0] : '',
    workingExperienceTo: user?.workingExperienceTo ? new Date(user.workingExperienceTo).toISOString().split('T')[0] : '',
    startupSubcategory: user?.startupSubcategory || '',
    businessType: user?.businessType || '',
    briefAboutOrganisation: user?.briefAboutOrganisation || '',
    operatingCity: user?.operatingCity || '',
    website: user?.website || '',
    collegeName: user?.collegeName || '',
    currentCourse: user?.currentCourse || '',
    yearSemester: user?.yearSemester || '',
    interestDomain: user?.interestDomain || '',
    startupFoundedYear: user?.startupFoundedYear || '',
    workingDomain: user?.workingDomain || '',
    linkedin: user?.socialLinks?.linkedin || '',
    instagram: user?.socialLinks?.instagram || '',
    facebook: user?.socialLinks?.facebook || '',
    twitter: user?.socialLinks?.twitter || '',
    youtube: user?.socialLinks?.youtube || '',
    github: user?.socialLinks?.github || '',
    portfolio: user?.socialLinks?.portfolio || '',
    others: user?.socialLinks?.others || '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        username: user.username || '',
        mobile: user.mobile || '',
        email: user.email || '',
        professionCategory: user.professionCategory || '',
        organisationName: user.organisationName || '',
        brandName: user.brandName || '',
        designation: user.designation || '',
        workingExperienceFrom: user.workingExperienceFrom ? new Date(user.workingExperienceFrom).toISOString().split('T')[0] : '',
        workingExperienceTo: user.workingExperienceTo ? new Date(user.workingExperienceTo).toISOString().split('T')[0] : '',
        startupSubcategory: user.startupSubcategory || '',
        businessType: user.businessType || '',
        briefAboutOrganisation: user.briefAboutOrganisation || '',
        operatingCity: user.operatingCity || '',
        website: user.website || '',
        collegeName: user.collegeName || '',
        currentCourse: user.currentCourse || '',
        yearSemester: user.yearSemester || '',
        interestDomain: user.interestDomain || '',
        startupFoundedYear: user.startupFoundedYear || '',
        workingDomain: user.workingDomain || '',
        linkedin: user.socialLinks?.linkedin || '',
        instagram: user.socialLinks?.instagram || '',
        facebook: user.socialLinks?.facebook || '',
        twitter: user.socialLinks?.twitter || '',
        youtube: user.socialLinks?.youtube || '',
        github: user.socialLinks?.github || '',
        portfolio: user.socialLinks?.portfolio || '',
        others: user.socialLinks?.others || '',
      });
      
      // Load additional links
      if (user.socialLinks?.additionalLinks && user.socialLinks.additionalLinks.length > 0) {
        setAdditionalLinks(user.socialLinks.additionalLinks.map((url, index) => ({ id: index + 1, url })));
        setNextLinkId(user.socialLinks.additionalLinks.length + 1);
      }
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast.error('User not found. Please log in again.');
      return;
    }

    if (!formData.fullName || !formData.mobile || !formData.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await usersApi.updateProfile(user.id, {
        fullName: formData.fullName,
        username: formData.username,
        professionCategory: formData.professionCategory,
        organisationName: formData.organisationName,
        brandName: formData.brandName,
        designation: formData.designation,
        workingExperienceFrom: formData.workingExperienceFrom ? new Date(formData.workingExperienceFrom) : undefined,
        workingExperienceTo: formData.workingExperienceTo ? new Date(formData.workingExperienceTo) : undefined,
        startupSubcategory: formData.startupSubcategory,
        businessType: formData.businessType,
        briefAboutOrganisation: formData.briefAboutOrganisation,
        operatingCity: formData.operatingCity,
        website: formData.website,
        collegeName: formData.collegeName,
        currentCourse: formData.currentCourse,
        yearSemester: formData.yearSemester,
        interestDomain: formData.interestDomain,
        startupFoundedYear: formData.startupFoundedYear,
        workingDomain: formData.workingDomain,
        socialLinks: {
          linkedin: formData.linkedin,
          instagram: formData.instagram,
          facebook: formData.facebook,
          twitter: formData.twitter,
          youtube: formData.youtube,
          github: formData.github,
          portfolio: formData.portfolio,
          others: formData.others,
          additionalLinks: additionalLinks.filter(link => link.url.trim()).map(link => link.url),
        },
      });
      
      await refreshUser();
      
      toast.success('Profile updated successfully!');
      navigate('/profile');
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-lg font-semibold">Edit Profile</h1>
            <div className="w-16" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Update your basic details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="@username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile Number *</Label>
                <Input
                  id="mobile"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  placeholder="+91 9876543210"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your.email@example.com"
                  required
                  disabled
                />
              </div>
            </CardContent>
          </Card>

          {/* Professional Category */}
          <Card>
            <CardHeader>
              <CardTitle>Professional Information</CardTitle>
              <CardDescription>Tell us about your profession</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="professionCategory">Profession Category</Label>
                <Select value={formData.professionCategory} onValueChange={(value) => setFormData({ ...formData, professionCategory: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Startup Founder/Co-founder">Startup Founder/Co-founder</SelectItem>
                    <SelectItem value="Working Professional">Working Professional</SelectItem>
                    <SelectItem value="Student">Student</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="designation">Designation</Label>
                <Input
                  id="designation"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  placeholder="Your designation"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="operatingCity">Location</Label>
                <Input
                  id="operatingCity"
                  value={formData.operatingCity}
                  onChange={(e) => setFormData({ ...formData, operatingCity: e.target.value })}
                  placeholder="City, Country"
                />
              </div>
            </CardContent>
          </Card>

          {/* Startup/Organization Details */}
          {(formData.professionCategory === 'Startup Founder/Co-founder' || formData.professionCategory === 'Working Professional') && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {formData.professionCategory === 'Startup Founder/Co-founder' ? 'Startup Details' : 'Organization Details'}
                </CardTitle>
                <CardDescription>Information about your {formData.professionCategory === 'Startup Founder/Co-founder' ? 'startup' : 'organization'}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="organisationName">
                    {formData.professionCategory === 'Startup Founder/Co-founder' ? 'Startup Name' : 'Organization Name'}
                  </Label>
                  <Input
                    id="organisationName"
                    value={formData.organisationName}
                    onChange={(e) => setFormData({ ...formData, organisationName: e.target.value })}
                    placeholder="Enter name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brandName">Brand Name</Label>
                  <Input
                    id="brandName"
                    value={formData.brandName}
                    onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                    placeholder="Your brand name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="briefAboutOrganisation">About</Label>
                  <Textarea
                    id="briefAboutOrganisation"
                    value={formData.briefAboutOrganisation}
                    onChange={(e) => setFormData({ ...formData, briefAboutOrganisation: e.target.value })}
                    placeholder="Brief description"
                    rows={3}
                  />
                </div>

                {formData.professionCategory === 'Startup Founder/Co-founder' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="startupSubcategory">Startup Category</Label>
                      <Select value={formData.startupSubcategory} onValueChange={(value) => setFormData({ ...formData, startupSubcategory: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {STARTUP_SUBCATEGORIES.map((category) => (
                            <SelectItem key={category} value={category}>{category}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="businessType">Business Type</Label>
                      <Select value={formData.businessType} onValueChange={(value) => setFormData({ ...formData, businessType: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select business type" />
                        </SelectTrigger>
                        <SelectContent>
                          {BUSINESS_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="startupFoundedYear">Founded Year</Label>
                      <Input
                        id="startupFoundedYear"
                        value={formData.startupFoundedYear}
                        onChange={(e) => setFormData({ ...formData, startupFoundedYear: e.target.value })}
                        placeholder="2024"
                      />
                    </div>
                  </>
                )}

                {formData.professionCategory === 'Working Professional' && (
                  <div className="space-y-2">
                    <Label htmlFor="workingDomain">Working Domain</Label>
                    <Input
                      id="workingDomain"
                      value={formData.workingDomain}
                      onChange={(e) => setFormData({ ...formData, workingDomain: e.target.value })}
                      placeholder="e.g., Software Development"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Work Experience */}
          {(formData.professionCategory === 'Startup Founder/Co-founder' || formData.professionCategory === 'Working Professional') && (
            <Card>
              <CardHeader>
                <CardTitle>Work Experience</CardTitle>
                <CardDescription>Your professional experience timeline</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="workingExperienceFrom">From</Label>
                    <Input
                      id="workingExperienceFrom"
                      type="date"
                      value={formData.workingExperienceFrom}
                      onChange={(e) => setFormData({ ...formData, workingExperienceFrom: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="workingExperienceTo">To</Label>
                    <Input
                      id="workingExperienceTo"
                      type="date"
                      value={formData.workingExperienceTo}
                      onChange={(e) => setFormData({ ...formData, workingExperienceTo: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Education Details */}
          {formData.professionCategory === 'Student' && (
            <Card>
              <CardHeader>
                <CardTitle>Education Details</CardTitle>
                <CardDescription>Your academic information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="collegeName">College/University Name</Label>
                  <Input
                    id="collegeName"
                    value={formData.collegeName}
                    onChange={(e) => setFormData({ ...formData, collegeName: e.target.value })}
                    placeholder="Enter college name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentCourse">Current Course</Label>
                  <Input
                    id="currentCourse"
                    value={formData.currentCourse}
                    onChange={(e) => setFormData({ ...formData, currentCourse: e.target.value })}
                    placeholder="e.g., B.Tech in Computer Science"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="yearSemester">Year/Semester</Label>
                  <Input
                    id="yearSemester"
                    value={formData.yearSemester}
                    onChange={(e) => setFormData({ ...formData, yearSemester: e.target.value })}
                    placeholder="e.g., 3rd Year, 5th Semester"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="interestDomain">Interest Domain</Label>
                  <Input
                    id="interestDomain"
                    value={formData.interestDomain}
                    onChange={(e) => setFormData({ ...formData, interestDomain: e.target.value })}
                    placeholder="e.g., Web Development, AI/ML"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Social Links */}
          <Card>
            <CardHeader>
              <CardTitle>Social Links</CardTitle>
              <CardDescription>Connect your social profiles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn {formData.professionCategory !== 'Student' && '*'}</Label>
                <Input
                  id="linkedin"
                  value={formData.linkedin}
                  onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                  placeholder="https://linkedin.com/in/username"
                  required={formData.professionCategory !== 'Student'}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  id="instagram"
                  value={formData.instagram}
                  onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                  placeholder="https://instagram.com/username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="twitter">Twitter</Label>
                <Input
                  id="twitter"
                  value={formData.twitter}
                  onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                  placeholder="https://twitter.com/username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="facebook">Facebook</Label>
                <Input
                  id="facebook"
                  value={formData.facebook}
                  onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                  placeholder="https://facebook.com/username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="youtube">YouTube</Label>
                <Input
                  id="youtube"
                  value={formData.youtube}
                  onChange={(e) => setFormData({ ...formData, youtube: e.target.value })}
                  placeholder="https://youtube.com/@username"
                />
              </div>

              {formData.professionCategory === 'Student' && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <Label htmlFor="github">GitHub</Label>
                    <Input
                      id="github"
                      value={formData.github}
                      onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                      placeholder="https://github.com/username"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="portfolio">Portfolio</Label>
                    <Input
                      id="portfolio"
                      value={formData.portfolio}
                      onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
                      placeholder="https://yourportfolio.com"
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="others">Other Links</Label>
                <Input
                  id="others"
                  value={formData.others}
                  onChange={(e) => setFormData({ ...formData, others: e.target.value })}
                  placeholder="Any other link"
                />
              </div>

              <Separator />

              {/* Additional dynamic links */}
              {additionalLinks.map((link) => (
                <div key={link.id} className="flex gap-2">
                  <Input
                    value={link.url}
                    onChange={(e) => {
                      setAdditionalLinks(additionalLinks.map(l => 
                        l.id === link.id ? { ...l, url: e.target.value } : l
                      ));
                    }}
                    placeholder="Enter additional link"
                  />
                  <Button 
                    type="button"
                    variant="outline" 
                    size="icon"
                    onClick={() => setAdditionalLinks(additionalLinks.filter(l => l.id !== link.id))}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {
                  setAdditionalLinks([...additionalLinks, { id: nextLinkId, url: '' }]);
                  setNextLinkId(nextLinkId + 1);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add More Links
              </Button>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => navigate('/profile')} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default EditProfile;
