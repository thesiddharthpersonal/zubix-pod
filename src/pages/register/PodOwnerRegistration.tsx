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
import { ArrowLeft, ArrowRight, Check, Loader2, X, Plus } from 'lucide-react';
import { POD_SUBCATEGORIES, POD_SUBCATEGORY_DISPLAY, FOCUS_AREAS, PodSubcategory } from '@/types';
import { toast } from 'sonner';
import { podsApi, usersApi, CreatePodRequest, authApi } from '@/services/api';
import { UserProfile } from '@/types';

// Constants for advanced details
const DOMAINS = ['Fintech', 'Edtech', 'Healthtech', 'Deeptech', 'Cleantech', 'Consumer Tech', 'D2C', 'Enterprise', 'Consumer Product', 'SaaS', 'Hardware', 'Social Impact'];
const STAGES = ['Pre-Seed', 'Seed', 'Series A', 'Series B+'];
const COMMUNITY_TYPES = ['Tech', 'Finance', 'Entrepreneurs'];
const SERVICE_TYPES = ['Legal & Compliances', 'Website', 'App', 'Tech Development', 'Designing & Branding', 'Sales & Marketing', 'Trademark & Patent Expert', 'Others'];
const COLLABORATION_MODELS = ['POC', 'Pilot', 'Co-Building', 'Others'];
const EVENTS = ['Hackathons', 'Bootcamps', 'Expo', 'Events'];

const PodOwnerRegistration = () => {
  const navigate = useNavigate();
  const { user, updateUserProfile, setPendingPodOwner } = useAuth();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coOwnerUsername, setCoOwnerUsername] = useState('');
  const [coOwners, setCoOwners] = useState<string[]>([]);
  const [additionalLinks, setAdditionalLinks] = useState<Array<{ id: number; url: string }>>([]);
  const [nextLinkId, setNextLinkId] = useState(1);
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const [formData, setFormData] = useState({
    // Step A
    fullName: user?.fullName || '',
    email: user?.email || '',
    mobile: user?.mobile || '',
    // Step B
    podSubcategory: '' as PodSubcategory | '',
    // Step C
    podName: '',
    organisationName: '',
    organisationType: '' as 'Government' | 'Private' | '',
    organisationEmail: '',
    operatingCity: '',
    website: '',
    focusAreas: [] as string[],
    totalInvestmentSize: '',
    numberOfInvestments: '',
    briefAboutOrganisation: '',
    // Step D - Advanced Details (subcategory-specific)
    // Incubation
    supportedDomains: [] as string[],
    supportedStages: [] as string[],
    // Community
    communityType: '',
    customCommunityType: '',
    // Venture Capital, Angel Investor, Angel Network
    investmentAreas: [] as string[],
    investmentStages: [] as string[],
    chequeSize: '',
    investmentThesis: '',
    // Service Provider
    serviceType: '',
    // Accelerator
    programmeDuration: '',
    numberOfStartups: '',
    focusedSectors: [] as string[],
    benefits: '',
    // Corporate Innovation
    innovationFocusArea: '',
    collaborationModel: '',
    fundingGrantSupport: '',
    // Government Programme
    schemeName: '',
    programmeObjectives: '',
    benefitsOffered: '',
    eligibilityCriteria: '',
    // University E Cell
    eventsConducted: [] as string[],
    // Step E - Social Links
    linkedin: '',
    others: '',
  });

  const totalSteps = 6;
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
    if (step === 3 && (!formData.podName || !formData.organisationName)) {
      toast.error('Pod name and organisation name are required');
      return;
    }
    if (step === 5 && !formData.linkedin) {
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

  const handleSearchCoOwners = async (query: string) => {
    setCoOwnerUsername(query);
    
    if (query.length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    try {
      setIsSearching(true);
      const results = await usersApi.searchUsers(query);
      // Filter out current user and already added co-owners
      const filtered = results.filter(
        u => u.id !== user?.id && !coOwners.includes(u.username)
      );
      setSearchResults(filtered);
      setShowDropdown(filtered.length > 0);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const selectCoOwner = (username: string) => {
    if (coOwners.includes(username)) {
      toast.error('This user is already added');
      return;
    }
    setCoOwners([...coOwners, username]);
    setCoOwnerUsername('');
    setSearchResults([]);
    setShowDropdown(false);
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
    setSearchResults([]);
    setShowDropdown(false);
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

  const toggleDomain = (domain: string) => {
    setFormData((prev) => ({
      ...prev,
      supportedDomains: prev.supportedDomains.includes(domain)
        ? prev.supportedDomains.filter((d) => d !== domain)
        : [...prev.supportedDomains, domain],
    }));
  };

  const toggleStage = (stage: string) => {
    setFormData((prev) => ({
      ...prev,
      supportedStages: prev.supportedStages.includes(stage)
        ? prev.supportedStages.filter((s) => s !== stage)
        : [...prev.supportedStages, stage],
    }));
  };

  const toggleInvestmentArea = (area: string) => {
    setFormData((prev) => ({
      ...prev,
      investmentAreas: prev.investmentAreas.includes(area)
        ? prev.investmentAreas.filter((a) => a !== area)
        : [...prev.investmentAreas, area],
    }));
  };

  const toggleInvestmentStage = (stage: string) => {
    setFormData((prev) => ({
      ...prev,
      investmentStages: prev.investmentStages.includes(stage)
        ? prev.investmentStages.filter((s) => s !== stage)
        : [...prev.investmentStages, stage],
    }));
  };

  const toggleFocusedSector = (sector: string) => {
    setFormData((prev) => ({
      ...prev,
      focusedSectors: prev.focusedSectors.includes(sector)
        ? prev.focusedSectors.filter((s) => s !== sector)
        : [...prev.focusedSectors, sector],
    }));
  };

  const toggleEvent = (event: string) => {
    setFormData((prev) => ({
      ...prev,
      eventsConducted: prev.eventsConducted.includes(event)
        ? prev.eventsConducted.filter((e) => e !== event)
        : [...prev.eventsConducted, event],
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
            others: formData.others,
          },
        });
      }

      // Create the pod
      // Convert subcategory to match backend enum format (e.g., "Venture Capitalist" -> "VENTURE_CAPITALIST")
      const subcategoryEnum = formData.podSubcategory.toUpperCase().replace(/ /g, '_') as PodSubcategory;
      
      const podData: CreatePodRequest = {
        name: formData.podName,
        subcategory: subcategoryEnum,
        focusAreas: formData.focusAreas,
        organisationName: formData.organisationName,
        organisationType: formData.organisationType ? (formData.organisationType === 'Government' ? 'GOVERNMENT' : 'PRIVATE') : undefined,
        organisationEmail: formData.organisationEmail || undefined,
        operatingCity: formData.operatingCity,
        website: formData.website,
        totalInvestmentSize: formData.totalInvestmentSize,
        numberOfInvestments: parseInt(formData.numberOfInvestments) || undefined,
        briefAboutOrganisation: formData.briefAboutOrganisation,
        socialLinks: {
          linkedin: formData.linkedin,
          others: formData.others,
          additionalLinks: additionalLinks.filter(link => link.url.trim()).map(link => link.url),
        },
        coOwnerUsernames: coOwners,
        // Advanced fields
        supportedDomains: formData.supportedDomains.length > 0 ? formData.supportedDomains : undefined,
        supportedStages: formData.supportedStages.length > 0 ? formData.supportedStages : undefined,
        communityType: formData.communityType === 'Others' ? formData.customCommunityType : formData.communityType || undefined,
        investmentAreas: formData.investmentAreas.length > 0 ? formData.investmentAreas : undefined,
        investmentStages: formData.investmentStages.length > 0 ? formData.investmentStages : undefined,
        chequeSize: formData.chequeSize || undefined,
        investmentThesis: formData.investmentThesis || undefined,
        serviceType: formData.serviceType || undefined,
        programmeDuration: formData.programmeDuration || undefined,
        numberOfStartups: parseInt(formData.numberOfStartups) || undefined,
        focusedSectors: formData.focusedSectors.length > 0 ? formData.focusedSectors : undefined,
        benefits: formData.benefits || undefined,
        innovationFocusArea: formData.innovationFocusArea || undefined,
        collaborationModel: formData.collaborationModel || undefined,
        fundingGrantSupport: formData.fundingGrantSupport || undefined,
        schemeName: formData.schemeName || undefined,
        programmeObjectives: formData.programmeObjectives || undefined,
        benefitsOffered: formData.benefitsOffered || undefined,
        eligibilityCriteria: formData.eligibilityCriteria || undefined,
        eventsConducted: formData.eventsConducted.length > 0 ? formData.eventsConducted : undefined,
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
                      <SelectItem key={cat} value={cat}>{POD_SUBCATEGORY_DISPLAY[cat]}</SelectItem>
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
                  <Label htmlFor="podName">Pod Name *</Label>
                  <Input
                    id="podName"
                    value={formData.podName}
                    onChange={(e) => setFormData({ ...formData, podName: e.target.value })}
                    placeholder="Enter your pod name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="orgName">Organisation Name *</Label>
                  <Input
                    id="orgName"
                    value={formData.organisationName}
                    onChange={(e) => setFormData({ ...formData, organisationName: e.target.value })}
                    placeholder="Enter organisation name"
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
                  <Label htmlFor="orgEmail">Organisation Email</Label>
                  <Input
                    id="orgEmail"
                    type="email"
                    value={formData.organisationEmail}
                    onChange={(e) => setFormData({ ...formData, organisationEmail: e.target.value })}
                    placeholder="contact@organisation.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">Location</Label>
                  <Input
                    id="city"
                    value={formData.operatingCity}
                    onChange={(e) => setFormData({ ...formData, operatingCity: e.target.value })}
                    placeholder="e.g., Bangalore, India"
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
                  <Label htmlFor="brief">Pod Description</Label>
                  <Textarea
                    id="brief"
                    value={formData.briefAboutOrganisation}
                    onChange={(e) => setFormData({ ...formData, briefAboutOrganisation: e.target.value })}
                    placeholder="Describe your pod and what it offers..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </>
          )}

          {step === 4 && (
            <>
              <CardHeader>
                <CardTitle>Advanced Details</CardTitle>
                <CardDescription>
                  {formData.podSubcategory === 'INCUBATION' && 'Share your incubation program details'}
                  {formData.podSubcategory === 'COMMUNITY' && 'Tell us about your community'}
                  {(formData.podSubcategory === 'VENTURE_CAPITALIST' || formData.podSubcategory === 'ANGEL_INVESTOR' || formData.podSubcategory === 'ANGEL_NETWORK') && 'Share your investment criteria'}
                  {formData.podSubcategory === 'SERVICE_PROVIDER' && 'Tell us about your services'}
                  {formData.podSubcategory === 'ACCELERATOR' && 'Share your accelerator program details'}
                  {formData.podSubcategory === 'CORPORATE_INNOVATION' && 'Share your innovation details'}
                  {formData.podSubcategory === 'GOVERNMENT_PROGRAM' && 'Share your program details'}
                  {formData.podSubcategory === 'UNIVERSITY_ENTREPRENEURSHIP_CELL' && 'Share your E-Cell activities'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                
                {/* Incubation */}
                {formData.podSubcategory === 'INCUBATION' && (
                  <>
                    <div className="space-y-2">
                      <Label>Supported Domains *</Label>
                      <div className="flex flex-wrap gap-2">
                        {DOMAINS.map((domain) => (
                          <Badge
                            key={domain}
                            variant={formData.supportedDomains.includes(domain) ? 'default' : 'outline'}
                            className="cursor-pointer"
                            onClick={() => toggleDomain(domain)}
                          >
                            {domain}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Supported Stages *</Label>
                      <div className="flex flex-wrap gap-2">
                        {STAGES.map((stage) => (
                          <Badge
                            key={stage}
                            variant={formData.supportedStages.includes(stage) ? 'default' : 'outline'}
                            className="cursor-pointer"
                            onClick={() => toggleStage(stage)}
                          >
                            {stage}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Community */}
                {formData.podSubcategory === 'COMMUNITY' && (
                  <>
                    <div className="space-y-2">
                      <Label>Community Type *</Label>
                      <Select
                        value={formData.communityType}
                        onValueChange={(v) => setFormData({ ...formData, communityType: v, customCommunityType: v === 'Others' ? formData.customCommunityType : '' })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {COMMUNITY_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                          <SelectItem value="Others">Others</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {formData.communityType === 'Others' && (
                      <div className="space-y-2">
                        <Label htmlFor="customCommunityType">Specify Community Type</Label>
                        <Input
                          id="customCommunityType"
                          value={formData.customCommunityType}
                          onChange={(e) => setFormData({ ...formData, customCommunityType: e.target.value })}
                          placeholder="Enter community type"
                        />
                      </div>
                    )}
                  </>
                )}

                {/* Venture Capital, Angel Investor, Angel Network */}
                {(formData.podSubcategory === 'VENTURE_CAPITALIST' || formData.podSubcategory === 'ANGEL_INVESTOR' || formData.podSubcategory === 'ANGEL_NETWORK') && (
                  <>
                    <div className="space-y-2">
                      <Label>Investment Areas *</Label>
                      <div className="flex flex-wrap gap-2">
                        {DOMAINS.map((area) => (
                          <Badge
                            key={area}
                            variant={formData.investmentAreas.includes(area) ? 'default' : 'outline'}
                            className="cursor-pointer"
                            onClick={() => toggleInvestmentArea(area)}
                          >
                            {area}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Investment Stages *</Label>
                      <div className="flex flex-wrap gap-2">
                        {STAGES.map((stage) => (
                          <Badge
                            key={stage}
                            variant={formData.investmentStages.includes(stage) ? 'default' : 'outline'}
                            className="cursor-pointer"
                            onClick={() => toggleInvestmentStage(stage)}
                          >
                            {stage}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="chequeSize">Cheque Size</Label>
                      <Input
                        id="chequeSize"
                        value={formData.chequeSize}
                        onChange={(e) => setFormData({ ...formData, chequeSize: e.target.value })}
                        placeholder="e.g., $100K - $1M"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="investmentThesis">Investment Thesis</Label>
                      <Textarea
                        id="investmentThesis"
                        value={formData.investmentThesis}
                        onChange={(e) => setFormData({ ...formData, investmentThesis: e.target.value })}
                        placeholder="Describe your investment philosophy..."
                        rows={3}
                      />
                    </div>
                  </>
                )}

                {/* Service Provider */}
                {formData.podSubcategory === 'SERVICE_PROVIDER' && (
                  <div className="space-y-2">
                    <Label>Type of Services *</Label>
                    <Select
                      value={formData.serviceType}
                      onValueChange={(v) => setFormData({ ...formData, serviceType: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select service type" />
                      </SelectTrigger>
                      <SelectContent>
                        {SERVICE_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Accelerator */}
                {formData.podSubcategory === 'ACCELERATOR' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="programmeDuration">Programme Duration</Label>
                      <Input
                        id="programmeDuration"
                        value={formData.programmeDuration}
                        onChange={(e) => setFormData({ ...formData, programmeDuration: e.target.value })}
                        placeholder="e.g., 3 months, 6 months"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="numberOfStartups">Number of Startups</Label>
                      <Input
                        id="numberOfStartups"
                        type="number"
                        value={formData.numberOfStartups}
                        onChange={(e) => setFormData({ ...formData, numberOfStartups: e.target.value })}
                        placeholder="e.g., 10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Focused Sectors</Label>
                      <div className="flex flex-wrap gap-2">
                        {DOMAINS.map((sector) => (
                          <Badge
                            key={sector}
                            variant={formData.focusedSectors.includes(sector) ? 'default' : 'outline'}
                            className="cursor-pointer"
                            onClick={() => toggleFocusedSector(sector)}
                          >
                            {sector}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="benefits">Benefits</Label>
                      <Textarea
                        id="benefits"
                        value={formData.benefits}
                        onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                        placeholder="List the benefits provided to startups..."
                        rows={3}
                      />
                    </div>
                  </>
                )}

                {/* Corporate Innovation */}
                {formData.podSubcategory === 'CORPORATE_INNOVATION' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="innovationFocusArea">Innovation Focus Area</Label>
                      <Input
                        id="innovationFocusArea"
                        value={formData.innovationFocusArea}
                        onChange={(e) => setFormData({ ...formData, innovationFocusArea: e.target.value })}
                        placeholder="e.g., AI, IoT, Blockchain"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Collaboration Model</Label>
                      <Select
                        value={formData.collaborationModel}
                        onValueChange={(v) => setFormData({ ...formData, collaborationModel: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select model" />
                        </SelectTrigger>
                        <SelectContent>
                          {COLLABORATION_MODELS.map((model) => (
                            <SelectItem key={model} value={model}>{model}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fundingGrantSupport">Funding/Grant Support Amount</Label>
                      <Input
                        id="fundingGrantSupport"
                        value={formData.fundingGrantSupport}
                        onChange={(e) => setFormData({ ...formData, fundingGrantSupport: e.target.value })}
                        placeholder="e.g., Up to $50K"
                      />
                    </div>
                  </>
                )}

                {/* Government Programme */}
                {formData.podSubcategory === 'GOVERNMENT_PROGRAM' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="schemeName">Scheme Name</Label>
                      <Input
                        id="schemeName"
                        value={formData.schemeName}
                        onChange={(e) => setFormData({ ...formData, schemeName: e.target.value })}
                        placeholder="Enter scheme name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="programmeObjectives">Programme Objectives</Label>
                      <Textarea
                        id="programmeObjectives"
                        value={formData.programmeObjectives}
                        onChange={(e) => setFormData({ ...formData, programmeObjectives: e.target.value })}
                        placeholder="Describe the objectives..."
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="benefitsOffered">Benefits Offered</Label>
                      <Textarea
                        id="benefitsOffered"
                        value={formData.benefitsOffered}
                        onChange={(e) => setFormData({ ...formData, benefitsOffered: e.target.value })}
                        placeholder="List the benefits..."
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="eligibilityCriteria">Eligibility Criteria</Label>
                      <Textarea
                        id="eligibilityCriteria"
                        value={formData.eligibilityCriteria}
                        onChange={(e) => setFormData({ ...formData, eligibilityCriteria: e.target.value })}
                        placeholder="Describe eligibility requirements..."
                        rows={3}
                      />
                    </div>
                  </>
                )}

                {/* University E Cell */}
                {formData.podSubcategory === 'UNIVERSITY_ENTREPRENEURSHIP_CELL' && (
                  <div className="space-y-2">
                    <Label>Events Conducted</Label>
                    <div className="flex flex-wrap gap-2">
                      {EVENTS.map((event) => (
                        <Badge
                          key={event}
                          variant={formData.eventsConducted.includes(event) ? 'default' : 'outline'}
                          className="cursor-pointer"
                          onClick={() => toggleEvent(event)}
                        >
                          {event}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </>
          )}

          {step === 5 && (
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
                  <Label htmlFor="others">Others</Label>
                  <Input
                    id="others"
                    value={formData.others}
                    onChange={(e) => setFormData({ ...formData, others: e.target.value })}
                    placeholder="Any other social link or website"
                  />
                </div>
                
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
                  Add Link
                </Button>
              </CardContent>
            </>
          )}

          {step === 6 && (
            <>
              <CardHeader>
                <CardTitle>Add Co-Owners</CardTitle>
                <CardDescription>Invite team members to manage your pod</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        value={coOwnerUsername}
                        onChange={(e) => handleSearchCoOwners(e.target.value)}
                        placeholder="Search by username or name..."
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addCoOwner();
                          }
                          if (e.key === 'Escape') {
                            setShowDropdown(false);
                          }
                        }}
                        onFocus={() => {
                          if (searchResults.length > 0) {
                            setShowDropdown(true);
                          }
                        }}
                      />
                      {isSearching && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <Button variant="outline" onClick={addCoOwner}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {/* Search Results Dropdown */}
                  {showDropdown && searchResults.length > 0 && (
                    <Card className="absolute z-50 w-full mt-1 max-h-60 overflow-y-auto shadow-lg">
                      <CardContent className="p-2">
                        {searchResults.map((user) => (
                          <div
                            key={user.id}
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors"
                            onClick={() => selectCoOwner(user.username)}
                          >
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                              {user.profilePhoto ? (
                                <img src={user.profilePhoto} alt={user.fullName} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-primary font-medium">
                                  {user.fullName?.charAt(0) || user.username.charAt(0)}
                                </span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground truncate">{user.fullName}</p>
                              <p className="text-sm text-muted-foreground truncate">@{user.username}</p>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}
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
