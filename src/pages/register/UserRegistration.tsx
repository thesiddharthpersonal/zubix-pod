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
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react';
import { STARTUP_SUBCATEGORIES, BUSINESS_TYPES } from '@/types';
import { toast } from 'sonner';

const UserRegistration = () => {
  const navigate = useNavigate();
  const { user, updateUserProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    // Step A
    fullName: user?.fullName || '',
    mobile: user?.mobile || '',
    email: user?.email || '',
    // Step B - Profession Category
    professionCategory: '',
    // Step C - Professional/Student Details
    organisationName: '',
    brandName: '',
    designation: '',
    workingExperienceFrom: '',
    workingExperienceTo: '',
    startupSubcategory: '',
    businessType: '',
    briefAboutOrganisation: '',
    operatingCity: '',
    website: '',
    // Student specific fields
    collegeName: '',
    currentCourse: '',
    yearSemester: '',
    interestDomain: '',
    // Startup specific field
    startupFoundedYear: '',
    // Step D - Social Links
    linkedin: '',
    instagram: '',
    facebook: '',
    twitter: '',
    youtube: '',
    // Student social links
    github: '',
    portfolio: '',
    others: '',
  });

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const handleNext = () => {
    if (step === 1) {
      if (!formData.fullName || !formData.mobile || !formData.email) {
        toast.error('Please fill in all required fields');
        return;
      }
    }
    if (step === 2) {
      if (!formData.professionCategory) {
        toast.error('Please select a profession category');
        return;
      }
    }
    if (step === 4) {
      if (formData.professionCategory !== 'Student' && !formData.linkedin) {
        toast.error('LinkedIn profile is required');
        return;
      }
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

  const handleSubmit = async () => {
    if (formData.professionCategory !== 'Student' && !formData.linkedin) {
      toast.error('LinkedIn profile is required');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    updateUserProfile({
      fullName: formData.fullName,
      mobile: formData.mobile,
      email: formData.email,
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
      socialLinks: {
        linkedin: formData.linkedin,
        instagram: formData.instagram,
        facebook: formData.facebook,
        twitter: formData.twitter,
        youtube: formData.youtube,
        github: formData.github,
        portfolio: formData.portfolio,
        others: formData.others,
      },
    });
    
    toast.success('Profile created successfully!');
    navigate('/discover');
    setIsSubmitting(false);
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
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mobile">Mobile Number *</Label>
                  <Input
                    id="mobile"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    placeholder="+91 9876543210"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="you@example.com"
                  />
                </div>
              </CardContent>
            </>
          )}

          {step === 2 && (
            <>
              <CardHeader>
                <CardTitle>Profession Category</CardTitle>
                <CardDescription>Select your professional category</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Profession Category *</Label>
                  <Select value={formData.professionCategory} onValueChange={(v) => setFormData({ ...formData, professionCategory: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your profession category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Startup">Startup</SelectItem>
                      <SelectItem value="Working Professional">Working Professional</SelectItem>
                      <SelectItem value="Student">Student</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </>
          )}

          {step === 3 && formData.professionCategory === 'Student' && (
            <>
              <CardHeader>
                <CardTitle>Student Details</CardTitle>
                <CardDescription>Tell us about your education</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="collegeName">College/University Name</Label>
                  <Input
                    id="collegeName"
                    value={formData.collegeName}
                    onChange={(e) => setFormData({ ...formData, collegeName: e.target.value })}
                    placeholder="Enter your college/university name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentCourse">Current Course/Program</Label>
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
                    placeholder="e.g., AI/ML, Web Development, Data Science"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="briefStudent">Brief about yourself</Label>
                  <Textarea
                    id="briefStudent"
                    value={formData.briefAboutOrganisation}
                    onChange={(e) => setFormData({ ...formData, briefAboutOrganisation: e.target.value })}
                    placeholder="Tell us about yourself, your interests, and goals..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </>
          )}

          {step === 3 && formData.professionCategory === 'Startup' && (
            <>
              <CardHeader>
                <CardTitle>Startup Details</CardTitle>
                <CardDescription>Tell us about your startup</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="organisationName">Startup/Organisation Name</Label>
                  <Input
                    id="organisationName"
                    value={formData.organisationName}
                    onChange={(e) => setFormData({ ...formData, organisationName: e.target.value })}
                    placeholder="Enter startup name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brandName">Brand Name</Label>
                  <Input
                    id="brandName"
                    value={formData.brandName}
                    onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                    placeholder="Enter brand name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="designation">Designation</Label>
                  <Input
                    id="designation"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    placeholder="e.g., Founder & CEO"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Startup Category</Label>
                  <Select value={formData.startupSubcategory} onValueChange={(v) => setFormData({ ...formData, startupSubcategory: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {STARTUP_SUBCATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Business Type</Label>
                  <Select value={formData.businessType} onValueChange={(v) => setFormData({ ...formData, businessType: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {BUSINESS_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">Location</Label>
                  <Input
                    id="city"
                    value={formData.operatingCity}
                    onChange={(e) => setFormData({ ...formData, operatingCity: e.target.value })}
                    placeholder="e.g., Bangalore"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://yourwebsite.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="foundedYear">Startup Founded Year</Label>
                  <Input
                    id="foundedYear"
                    type="number"
                    value={formData.startupFoundedYear}
                    onChange={(e) => setFormData({ ...formData, startupFoundedYear: e.target.value })}
                    placeholder="e.g., 2020"
                    min="1900"
                    max={new Date().getFullYear()}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brief">Brief about startup</Label>
                  <Textarea
                    id="brief"
                    value={formData.briefAboutOrganisation}
                    onChange={(e) => setFormData({ ...formData, briefAboutOrganisation: e.target.value })}
                    placeholder="Tell us about your startup..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </>
          )}

          {step === 3 && formData.professionCategory === 'Working Professional' && (
            <>
              <CardHeader>
                <CardTitle>Professional Details</CardTitle>
                <CardDescription>Tell us about your work</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="organisationName">Organisation Name</Label>
                  <Input
                    id="organisationName"
                    value={formData.organisationName}
                    onChange={(e) => setFormData({ ...formData, organisationName: e.target.value })}
                    placeholder="Enter organisation name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brandName">Brand Name</Label>
                  <Input
                    id="brandName"
                    value={formData.brandName}
                    onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                    placeholder="Enter brand name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="designation">Designation</Label>
                  <Input
                    id="designation"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    placeholder="e.g., Founder & CEO"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="workFrom">Experience From</Label>
                    <Input
                      id="workFrom"
                      type="date"
                      value={formData.workingExperienceFrom}
                      onChange={(e) => setFormData({ ...formData, workingExperienceFrom: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="workTo">Experience To</Label>
                    <Input
                      id="workTo"
                      type="date"
                      value={formData.workingExperienceTo}
                      onChange={(e) => setFormData({ ...formData, workingExperienceTo: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Startup Subcategory</Label>
                  <Select value={formData.startupSubcategory} onValueChange={(v) => setFormData({ ...formData, startupSubcategory: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {STARTUP_SUBCATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Business Type</Label>
                  <Select value={formData.businessType} onValueChange={(v) => setFormData({ ...formData, businessType: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {BUSINESS_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brief">Brief About Organisation</Label>
                  <Textarea
                    id="brief"
                    value={formData.briefAboutOrganisation}
                    onChange={(e) => setFormData({ ...formData, briefAboutOrganisation: e.target.value })}
                    placeholder="Tell us about your organisation..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">Operating City</Label>
                  <Input
                    id="city"
                    value={formData.operatingCity}
                    onChange={(e) => setFormData({ ...formData, operatingCity: e.target.value })}
                    placeholder="e.g., Bangalore"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://yourwebsite.com"
                  />
                </div>
              </CardContent>
            </>
          )}

          {step === 4 && formData.professionCategory === 'Student' && (
            <>
              <CardHeader>
                <CardTitle>Social Links</CardTitle>
                <CardDescription>Share your professional profiles (optional)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    value={formData.linkedin}
                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="github">GitHub</Label>
                  <Input
                    id="github"
                    value={formData.github}
                    onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                    placeholder="https://github.com/yourusername"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Personal Website</Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://yourwebsite.com"
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
              </CardContent>
            </>
          )}

          {step === 4 && formData.professionCategory === 'Startup' && (
            <>
              <CardHeader>
                <CardTitle>Social Links</CardTitle>
                <CardDescription>Connect your startup profiles</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn *</Label>
                  <Input
                    id="linkedin"
                    value={formData.linkedin}
                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                    placeholder="https://linkedin.com/company/yourcompany"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Personal Website</Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://yourwebsite.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="others">Others</Label>
                  <Input
                    id="others"
                    value={formData.others}
                    onChange={(e) => setFormData({ ...formData, others: e.target.value })}
                    placeholder="Any other social link"
                  />
                </div>
              </CardContent>
            </>
          )}

          {step === 4 && formData.professionCategory === 'Working Professional' && (
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
                    placeholder="https://instagram.com/yourprofile"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="facebook">Facebook</Label>
                  <Input
                    id="facebook"
                    value={formData.facebook}
                    onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                    placeholder="https://facebook.com/yourprofile"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="twitter">Twitter</Label>
                  <Input
                    id="twitter"
                    value={formData.twitter}
                    onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                    placeholder="https://twitter.com/yourprofile"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="youtube">YouTube</Label>
                  <Input
                    id="youtube"
                    value={formData.youtube}
                    onChange={(e) => setFormData({ ...formData, youtube: e.target.value })}
                    placeholder="https://youtube.com/yourchannel"
                  />
                </div>
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
                    Completing...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Complete Registration
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

export default UserRegistration;
