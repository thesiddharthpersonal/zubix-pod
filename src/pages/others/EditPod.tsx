import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, Loader2, X, Plus } from 'lucide-react';
import { POD_SUBCATEGORIES, POD_SUBCATEGORY_DISPLAY, FOCUS_AREAS, PodSubcategory, Pod } from '@/types';
import { toast } from 'sonner';
import { podsApi, usersApi } from '@/services/api';
import { Separator } from '@/components/ui/separator';
import { getManagedPods } from '@/lib/utils';
import { UserProfile } from '@/types';

// Constants for advanced details
const DOMAINS = ['Fintech', 'Edtech', 'Healthtech', 'Deeptech', 'Cleantech', 'Consumer Tech', 'D2C', 'Enterprise', 'Consumer Product', 'SaaS', 'Hardware', 'Social Impact'];
const STAGES = ['Pre-Seed', 'Seed', 'Series A', 'Series B+'];
const COMMUNITY_TYPES = ['Tech', 'Finance', 'Entrepreneurs'];
const SERVICE_TYPES = ['Legal & Compliances', 'Website', 'App', 'Tech Development', 'Designing & Branding', 'Sales & Marketing', 'Trademark & Patent Expert', 'Others'];
const COLLABORATION_MODELS = ['POC', 'Pilot', 'Co-Building', 'Others'];
const EVENTS = ['Hackathons', 'Bootcamps', 'Expo', 'Events'];

const EditPod = () => {
  const navigate = useNavigate();
  const { podId } = useParams();
  const { user, joinedPods } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [pod, setPod] = useState<Pod | null>(null);
  const [coOwnerUsername, setCoOwnerUsername] = useState('');
  const [coOwners, setCoOwners] = useState<string[]>([]);
  const [additionalLinks, setAdditionalLinks] = useState<Array<{ id: number; url: string }>>([]);
  const [nextLinkId, setNextLinkId] = useState(1);
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const [formData, setFormData] = useState({
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
    // Advanced Details
    supportedDomains: [] as string[],
    supportedStages: [] as string[],
    communityType: '',
    customCommunityType: '',
    investmentAreas: [] as string[],
    investmentStages: [] as string[],
    chequeSize: '',
    investmentThesis: '',
    serviceType: '',
    programmeDuration: '',
    numberOfStartups: '',
    focusedSectors: [] as string[],
    benefits: '',
    innovationFocusArea: '',
    collaborationModel: '',
    fundingGrantSupport: '',
    schemeName: '',
    programmeObjectives: '',
    benefitsOffered: '',
    eligibilityCriteria: '',
    eventsConducted: [] as string[],
    linkedin: '',
    instagram: '',
    facebook: '',
    twitter: '',
    youtube: '',
    others: '',
  });

  useEffect(() => {
    const loadPod = async () => {
      if (!podId) {
        toast.error('Pod ID is required');
        navigate('/others');
        return;
      }

      if (!user) {
        return; // Wait for user to load
      }

      try {
        setIsLoading(true);
        const podData = await podsApi.getPodById(podId);
        
        // Check if user is owner or co-owner
        const isOwner = podData.ownerId === user.id;
        const isCoOwner = podData.coOwners?.some(co => co.id === user.id) || false;
        
        if (!isOwner && !isCoOwner) {
          toast.error('You do not have permission to edit this pod');
          navigate('/others');
          return;
        }
        setPod(podData);

        // Populate form with existing data
        setFormData({
          podName: podData.name || '',
          organisationName: podData.organisationName || '',
          organisationType: (podData.organisationType as 'Government' | 'Private') || '',
          organisationEmail: podData.organisationEmail || '',
          operatingCity: podData.operatingCity || '',
          website: podData.website || '',
          focusAreas: podData.focusAreas || [],
          totalInvestmentSize: podData.totalInvestmentSize || '',
          numberOfInvestments: podData.numberOfInvestments?.toString() || '',
          briefAboutOrganisation: podData.briefAboutOrganisation || '',
          supportedDomains: podData.supportedDomains || [],
          supportedStages: podData.supportedStages || [],
          communityType: podData.communityType || '',
          customCommunityType: '',
          investmentAreas: podData.investmentAreas || [],
          investmentStages: podData.investmentStages || [],
          chequeSize: podData.chequeSize || '',
          investmentThesis: podData.investmentThesis || '',
          serviceType: podData.serviceType || '',
          programmeDuration: podData.programmeDuration || '',
          numberOfStartups: podData.numberOfStartups?.toString() || '',
          focusedSectors: podData.focusedSectors || [],
          benefits: podData.benefits || '',
          innovationFocusArea: podData.innovationFocusArea || '',
          collaborationModel: podData.collaborationModel || '',
          fundingGrantSupport: podData.fundingGrantSupport || '',
          schemeName: podData.schemeName || '',
          programmeObjectives: podData.programmeObjectives || '',
          benefitsOffered: podData.benefitsOffered || '',
          eligibilityCriteria: podData.eligibilityCriteria || '',
          eventsConducted: podData.eventsConducted || [],
          linkedin: podData.socialLinks?.linkedin || '',
          instagram: podData.socialLinks?.instagram || '',
          facebook: podData.socialLinks?.facebook || '',
          twitter: podData.socialLinks?.twitter || '',
          youtube: podData.socialLinks?.youtube || '',
          others: podData.socialLinks?.others || '',
        });

        // Set co-owners
        if (podData.coOwners) {
          setCoOwners(podData.coOwners.map(co => co.username));
        }

        // Load additional links
        if (podData.socialLinks?.additionalLinks && podData.socialLinks.additionalLinks.length > 0) {
          setAdditionalLinks(podData.socialLinks.additionalLinks.map((url, index) => ({ id: index + 1, url })));
          setNextLinkId(podData.socialLinks.additionalLinks.length + 1);
        }
      } catch (error) {
        console.error('Failed to load pod:', error);
        toast.error('Failed to load pod details');
        navigate('/others');
      } finally {
        setIsLoading(false);
      }
    };

    loadPod();
  }, [podId, user, navigate]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!podId) {
      toast.error('Pod ID is required');
      return;
    }

    if (!formData.podName || !formData.organisationName) {
      toast.error('Pod name and organisation name are required');
      return;
    }

    if (!formData.linkedin) {
      toast.error('LinkedIn profile is required');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const updateData: any = {
        name: formData.podName,
        organisationName: formData.organisationName,
        organisationEmail: formData.organisationEmail || undefined,
        operatingCity: formData.operatingCity || undefined,
        website: formData.website || undefined,
        focusAreas: formData.focusAreas,
        totalInvestmentSize: formData.totalInvestmentSize || undefined,
        numberOfInvestments: formData.numberOfInvestments ? parseInt(formData.numberOfInvestments) : undefined,
        briefAboutOrganisation: formData.briefAboutOrganisation || undefined,
        socialLinks: {
          linkedin: formData.linkedin,
          instagram: formData.instagram || undefined,
          facebook: formData.facebook || undefined,
          twitter: formData.twitter || undefined,
          youtube: formData.youtube || undefined,
          others: formData.others || undefined,
          additionalLinks: additionalLinks.filter(link => link.url.trim()).map(link => link.url),
        },
        coOwnerUsernames: coOwners,
      };

      // Only add organisationType if it's set
      if (formData.organisationType) {
        updateData.organisationType = formData.organisationType.toUpperCase() as 'GOVERNMENT' | 'PRIVATE';
      }

      const finalUpdateData = {
        ...updateData,
        // Advanced fields based on subcategory
        supportedDomains: formData.supportedDomains.length > 0 ? formData.supportedDomains : undefined,
        supportedStages: formData.supportedStages.length > 0 ? formData.supportedStages : undefined,
        communityType: formData.communityType || formData.customCommunityType || undefined,
        investmentAreas: formData.investmentAreas.length > 0 ? formData.investmentAreas : undefined,
        investmentStages: formData.investmentStages.length > 0 ? formData.investmentStages : undefined,
        chequeSize: formData.chequeSize || undefined,
        investmentThesis: formData.investmentThesis || undefined,
        serviceType: formData.serviceType || undefined,
        programmeDuration: formData.programmeDuration || undefined,
        numberOfStartups: formData.numberOfStartups ? parseInt(formData.numberOfStartups) : undefined,
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

      console.log('Sending pod update:', finalUpdateData);

      await podsApi.updatePod(podId, finalUpdateData);
      
      toast.success('Pod updated successfully!');
      navigate('/others');
    } catch (error) {
      console.error('Pod update error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update pod');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!pod) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Pod not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => navigate('/others')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-lg font-semibold">Edit Pod</h1>
            <div className="w-16" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Pod Category Badge */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Label>Pod Category:</Label>
                <Badge variant="secondary">{POD_SUBCATEGORY_DISPLAY[pod.subcategory]}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Category cannot be changed after pod creation
              </p>
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Update your pod's basic details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="podName">Pod Name *</Label>
                <Input
                  id="podName"
                  value={formData.podName}
                  onChange={(e) => setFormData({ ...formData, podName: e.target.value })}
                  placeholder="Enter pod name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="organisationName">Organisation Name *</Label>
                <Input
                  id="organisationName"
                  value={formData.organisationName}
                  onChange={(e) => setFormData({ ...formData, organisationName: e.target.value })}
                  placeholder="Enter organisation name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="organisationType">Organisation Type</Label>
                <Select value={formData.organisationType} onValueChange={(value) => setFormData({ ...formData, organisationType: value as 'Government' | 'Private' })}>
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
                <Label htmlFor="organisationEmail">Organisation Email</Label>
                <Input
                  id="organisationEmail"
                  type="email"
                  value={formData.organisationEmail}
                  onChange={(e) => setFormData({ ...formData, organisationEmail: e.target.value })}
                  placeholder="contact@organisation.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="operatingCity">Operating City</Label>
                <Input
                  id="operatingCity"
                  value={formData.operatingCity}
                  onChange={(e) => setFormData({ ...formData, operatingCity: e.target.value })}
                  placeholder="City, Country"
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
                <Label htmlFor="briefAboutOrganisation">About Organisation</Label>
                <Textarea
                  id="briefAboutOrganisation"
                  value={formData.briefAboutOrganisation}
                  onChange={(e) => setFormData({ ...formData, briefAboutOrganisation: e.target.value })}
                  placeholder="Brief description about your organisation"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Focus Areas */}
          <Card>
            <CardHeader>
              <CardTitle>Focus Areas</CardTitle>
              <CardDescription>Select areas of focus for your pod</CardDescription>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>

          {/* Investment Details */}
          {(pod.subcategory === 'VENTURE_CAPITAL' || pod.subcategory === 'ANGEL_INVESTOR' || pod.subcategory === 'ANGEL_NETWORK') && (
            <Card>
              <CardHeader>
                <CardTitle>Investment Details</CardTitle>
                <CardDescription>Provide your investment information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="totalInvestmentSize">Total Investment Size</Label>
                  <Input
                    id="totalInvestmentSize"
                    value={formData.totalInvestmentSize}
                    onChange={(e) => setFormData({ ...formData, totalInvestmentSize: e.target.value })}
                    placeholder="e.g., $10M"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="numberOfInvestments">Number of Investments</Label>
                  <Input
                    id="numberOfInvestments"
                    type="number"
                    value={formData.numberOfInvestments}
                    onChange={(e) => setFormData({ ...formData, numberOfInvestments: e.target.value })}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="chequeSize">Cheque Size</Label>
                  <Input
                    id="chequeSize"
                    value={formData.chequeSize}
                    onChange={(e) => setFormData({ ...formData, chequeSize: e.target.value })}
                    placeholder="e.g., $100K - $500K"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="investmentThesis">Investment Thesis</Label>
                  <Textarea
                    id="investmentThesis"
                    value={formData.investmentThesis}
                    onChange={(e) => setFormData({ ...formData, investmentThesis: e.target.value })}
                    placeholder="Describe your investment thesis"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Investment Areas</Label>
                  <div className="flex flex-wrap gap-2">
                    {DOMAINS.map((domain) => (
                      <Badge
                        key={domain}
                        variant={formData.investmentAreas.includes(domain) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => toggleInvestmentArea(domain)}
                      >
                        {domain}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Investment Stages</Label>
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
              </CardContent>
            </Card>
          )}

          {/* Incubation Details */}
          {pod.subcategory === 'INCUBATION' && (
            <Card>
              <CardHeader>
                <CardTitle>Incubation Details</CardTitle>
                <CardDescription>Specify supported domains and stages</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Supported Domains</Label>
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
                  <Label>Supported Stages</Label>
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
              </CardContent>
            </Card>
          )}

          {/* Accelerator Details */}
          {pod.subcategory === 'ACCELERATOR' && (
            <Card>
              <CardHeader>
                <CardTitle>Accelerator Details</CardTitle>
                <CardDescription>Program information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="programmeDuration">Programme Duration</Label>
                  <Input
                    id="programmeDuration"
                    value={formData.programmeDuration}
                    onChange={(e) => setFormData({ ...formData, programmeDuration: e.target.value })}
                    placeholder="e.g., 3 months"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="numberOfStartups">Number of Startups per Cohort</Label>
                  <Input
                    id="numberOfStartups"
                    type="number"
                    value={formData.numberOfStartups}
                    onChange={(e) => setFormData({ ...formData, numberOfStartups: e.target.value })}
                    placeholder="0"
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
                  <Label htmlFor="benefits">Benefits Offered</Label>
                  <Textarea
                    id="benefits"
                    value={formData.benefits}
                    onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                    placeholder="Describe benefits offered to startups"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Community Details */}
          {pod.subcategory === 'COMMUNITY' && (
            <Card>
              <CardHeader>
                <CardTitle>Community Details</CardTitle>
                <CardDescription>Specify your community type</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="communityType">Community Type</Label>
                  <Select value={formData.communityType} onValueChange={(value) => setFormData({ ...formData, communityType: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select community type" />
                    </SelectTrigger>
                    <SelectContent>
                      {COMMUNITY_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.communityType === 'Other' && (
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
              </CardContent>
            </Card>
          )}

          {/* Service Provider Details */}
          {pod.subcategory === 'SERVICE_PROVIDER' && (
            <Card>
              <CardHeader>
                <CardTitle>Service Provider Details</CardTitle>
                <CardDescription>Specify the services you provide</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="serviceType">Service Type</Label>
                  <Select value={formData.serviceType} onValueChange={(value) => setFormData({ ...formData, serviceType: value })}>
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
              </CardContent>
            </Card>
          )}

          {/* Corporate Innovation Details */}
          {pod.subcategory === 'CORPORATE_INNOVATION' && (
            <Card>
              <CardHeader>
                <CardTitle>Corporate Innovation Details</CardTitle>
                <CardDescription>Innovation and collaboration information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="innovationFocusArea">Innovation Focus Area</Label>
                  <Input
                    id="innovationFocusArea"
                    value={formData.innovationFocusArea}
                    onChange={(e) => setFormData({ ...formData, innovationFocusArea: e.target.value })}
                    placeholder="Enter focus area"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="collaborationModel">Collaboration Model</Label>
                  <Select value={formData.collaborationModel} onValueChange={(value) => setFormData({ ...formData, collaborationModel: value })}>
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
                  <Label htmlFor="fundingGrantSupport">Funding/Grant Support</Label>
                  <Textarea
                    id="fundingGrantSupport"
                    value={formData.fundingGrantSupport}
                    onChange={(e) => setFormData({ ...formData, fundingGrantSupport: e.target.value })}
                    placeholder="Describe funding or grant support available"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Government Programme Details */}
          {pod.subcategory === 'GOVERNMENT_PROGRAMME' && (
            <Card>
              <CardHeader>
                <CardTitle>Government Programme Details</CardTitle>
                <CardDescription>Programme information and benefits</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
                    placeholder="Describe programme objectives"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="benefitsOffered">Benefits Offered</Label>
                  <Textarea
                    id="benefitsOffered"
                    value={formData.benefitsOffered}
                    onChange={(e) => setFormData({ ...formData, benefitsOffered: e.target.value })}
                    placeholder="Describe benefits offered"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="eligibilityCriteria">Eligibility Criteria</Label>
                  <Textarea
                    id="eligibilityCriteria"
                    value={formData.eligibilityCriteria}
                    onChange={(e) => setFormData({ ...formData, eligibilityCriteria: e.target.value })}
                    placeholder="Describe eligibility criteria"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* University E Cell Details */}
          {pod.subcategory === 'UNIVERSITY_E_CELL' && (
            <Card>
              <CardHeader>
                <CardTitle>University E-Cell Details</CardTitle>
                <CardDescription>Events and activities information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
              </CardContent>
            </Card>
          )}

          {/* Co-Owners */}
          <Card>
            <CardHeader>
              <CardTitle>Co-Owners</CardTitle>
              <CardDescription>Add co-owners by username</CardDescription>
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
                  <Button type="button" onClick={addCoOwner}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add
                  </Button>
                </div>
                
                {/* Search Results Dropdown */}
                {showDropdown && searchResults.length > 0 && (
                  <Card className="absolute z-50 w-full mt-1 max-h-60 overflow-y-auto shadow-lg">
                    <CardContent className="p-2">
                      {searchResults.map((userResult) => (
                        <div
                          key={userResult.id}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors"
                          onClick={() => selectCoOwner(userResult.username)}
                        >
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                            {userResult.profilePhoto ? (
                              <img src={userResult.profilePhoto} alt={userResult.fullName} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-primary font-medium">
                                {userResult.fullName?.charAt(0) || userResult.username.charAt(0)}
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground truncate">{userResult.fullName}</p>
                            <p className="text-sm text-muted-foreground truncate">@{userResult.username}</p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>
              {coOwners.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {coOwners.map((username) => (
                    <Badge key={username} variant="secondary" className="pl-3 pr-1">
                      {username}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 p-0 ml-2"
                        onClick={() => removeCoOwner(username)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Social Links */}
          <Card>
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
                  placeholder="https://linkedin.com/company/name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  id="instagram"
                  value={formData.instagram}
                  onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                  placeholder="https://instagram.com/company"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="facebook">Facebook</Label>
                <Input
                  id="facebook"
                  value={formData.facebook}
                  onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                  placeholder="https://facebook.com/company"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="twitter">Twitter</Label>
                <Input
                  id="twitter"
                  value={formData.twitter}
                  onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                  placeholder="https://twitter.com/company"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="youtube">YouTube</Label>
                <Input
                  id="youtube"
                  value={formData.youtube}
                  onChange={(e) => setFormData({ ...formData, youtube: e.target.value })}
                  placeholder="https://youtube.com/@company"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="others">Other Links</Label>
                <Input
                  id="others"
                  value={formData.others}
                  onChange={(e) => setFormData({ ...formData, others: e.target.value })}
                  placeholder="Any other relevant link"
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
            <Button type="button" variant="outline" onClick={() => navigate('/others')} disabled={isSubmitting}>
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

export default EditPod;
