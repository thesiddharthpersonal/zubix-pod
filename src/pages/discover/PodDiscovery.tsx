import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { POD_SUBCATEGORIES, Pod, PodSubcategory } from '@/types';
import { Search, Building2, MapPin, Target, Users, ArrowRight } from 'lucide-react';
import PodDetailsDialog from '@/components/PodDetailsDialog';

// Mock data for pods
const MOCK_PODS: Pod[] = [
  {
    id: '1',
    name: 'TechStars Bangalore',
    logo: '',
    subcategory: 'Accelerator',
    focusAreas: ['Seed', 'FinTech', 'SaaS'],
    organisationName: 'TechStars',
    organisationType: 'Private',
    operatingCity: 'Bangalore',
    totalInvestmentSize: '$50M',
    numberOfInvestments: 120,
    briefAboutOrganisation: 'A leading startup accelerator program',
    socialLinks: { linkedin: 'https://linkedin.com' },
    ownerId: 'owner1',
    owner: {
      id: 'owner1',
      fullName: 'Rajesh Mehta',
      email: 'rajesh@techstars.com',
      mobile: '+91 9876543210',
      username: 'rajeshmehta',
      role: 'pod_owner',
      createdAt: new Date(),
    },
    coOwnerIds: [],
    memberIds: [],
    isApproved: true,
    createdAt: new Date(),
  },
  {
    id: '2',
    name: 'Indian Angel Network',
    logo: '',
    subcategory: 'Angel Network',
    focusAreas: ['Pre-Seed', 'Seed', 'DeepTech'],
    organisationName: 'IAN',
    organisationType: 'Private',
    operatingCity: 'Delhi',
    totalInvestmentSize: '$100M',
    numberOfInvestments: 200,
    briefAboutOrganisation: 'India\'s largest angel investor network',
    socialLinks: { linkedin: 'https://linkedin.com' },
    ownerId: 'owner2',
    owner: {
      id: 'owner2',
      fullName: 'Saurabh Srivastava',
      email: 'saurabh@ian.com',
      mobile: '+91 9876543211',
      username: 'saurabhsri',
      role: 'pod_owner',
      createdAt: new Date(),
    },
    coOwnerIds: [],
    memberIds: [],
    isApproved: true,
    createdAt: new Date(),
  },
  {
    id: '3',
    name: 'NASSCOM 10000 Startups',
    logo: '',
    subcategory: 'Incubation',
    focusAreas: ['Pre-Seed', 'HealthTech', 'CleanTech'],
    organisationName: 'NASSCOM',
    organisationType: 'Private',
    operatingCity: 'Multiple Cities',
    briefAboutOrganisation: 'India\'s biggest startup incubation program',
    socialLinks: { linkedin: 'https://linkedin.com' },
    ownerId: 'owner3',
    owner: {
      id: 'owner3',
      fullName: 'Debjani Ghosh',
      email: 'debjani@nasscom.com',
      mobile: '+91 9876543212',
      username: 'debjanighosh',
      role: 'pod_owner',
      createdAt: new Date(),
    },
    coOwnerIds: [],
    memberIds: [],
    isApproved: true,
    createdAt: new Date(),
  },
  {
    id: '4',
    name: 'Startup India Hub',
    logo: '',
    subcategory: 'Government Program',
    focusAreas: ['Pre-Seed', 'Seed', 'Social Impact'],
    organisationName: 'Startup India',
    organisationType: 'Government',
    operatingCity: 'Pan India',
    briefAboutOrganisation: 'Government initiative to support startups',
    socialLinks: { linkedin: 'https://linkedin.com' },
    ownerId: 'owner4',
    owner: {
      id: 'owner4',
      fullName: 'Ramesh Abhishek',
      email: 'ramesh@startupindia.gov.in',
      mobile: '+91 9876543213',
      username: 'rameshabhishek',
      role: 'pod_owner',
      createdAt: new Date(),
    },
    coOwnerIds: [],
    memberIds: [],
    isApproved: true,
    createdAt: new Date(),
  },
  {
    id: '5',
    name: 'Sequoia Surge',
    logo: '',
    subcategory: 'Venture Capitalist',
    focusAreas: ['Seed', 'Series A', 'Consumer', 'Enterprise'],
    organisationName: 'Sequoia Capital',
    organisationType: 'Private',
    operatingCity: 'Bangalore',
    totalInvestmentSize: '$500M',
    numberOfInvestments: 50,
    briefAboutOrganisation: 'Rapid scale-up program for early-stage startups',
    socialLinks: { linkedin: 'https://linkedin.com' },
    ownerId: 'owner5',
    owner: {
      id: 'owner5',
      fullName: 'Rajan Anandan',
      email: 'rajan@sequoiacap.com',
      mobile: '+91 9876543214',
      username: 'rajananandan',
      role: 'pod_owner',
      createdAt: new Date(),
    },
    coOwnerIds: [],
    memberIds: [],
    isApproved: true,
    createdAt: new Date(),
  },
  {
    id: '6',
    name: 'Founder Collective',
    logo: '',
    subcategory: 'Community',
    focusAreas: ['Pre-Seed', 'Seed'],
    organisationName: 'Founder Collective',
    organisationType: 'Private',
    operatingCity: 'Mumbai',
    briefAboutOrganisation: 'A community of founders helping founders',
    socialLinks: { linkedin: 'https://linkedin.com' },
    ownerId: 'owner6',
    owner: {
      id: 'owner6',
      fullName: 'Neha Sharma',
      email: 'neha@foundercollective.com',
      mobile: '+91 9876543215',
      username: 'nehasharma',
      role: 'pod_owner',
      createdAt: new Date(),
    },
    coOwnerIds: [],
    memberIds: [],
    isApproved: true,
    createdAt: new Date(),
  },
];

const PodDiscovery = () => {
  const navigate = useNavigate();
  const { joinPod, leavePod, joinedPods } = useAuth();
  const [selectedSubcategory, setSelectedSubcategory] = useState<PodSubcategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPodForDetails, setSelectedPodForDetails] = useState<Pod | null>(null);

  const filteredPods = MOCK_PODS.filter((pod) => {
    const matchesSubcategory = selectedSubcategory === 'all' || pod.subcategory === selectedSubcategory;
    const matchesSearch = pod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pod.organisationName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubcategory && matchesSearch;
  });

  const isJoined = (podId: string) => joinedPods.some((p) => p.id === podId);

  const handleJoinPod = (pod: Pod) => {
    joinPod(pod);
  };

  const handleViewPod = (pod: Pod) => {
    setSelectedPodForDetails(pod);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-foreground">Discover Pods</h1>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/home')}
              className="text-muted-foreground hover:text-foreground"
            >
              Skip
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search pods..."
              className="pl-10"
            />
          </div>

          {/* Subcategory Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <Badge
              variant={selectedSubcategory === 'all' ? 'default' : 'outline'}
              className="cursor-pointer whitespace-nowrap"
              onClick={() => setSelectedSubcategory('all')}
            >
              All
            </Badge>
            {POD_SUBCATEGORIES.map((cat) => (
              <Badge
                key={cat}
                variant={selectedSubcategory === cat ? 'default' : 'outline'}
                className="cursor-pointer whitespace-nowrap"
                onClick={() => setSelectedSubcategory(cat)}
              >
                {cat}
              </Badge>
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-6">
        {joinedPods.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4">Your Pods</h2>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {joinedPods.map((pod) => (
                <Card
                  key={pod.id}
                  className="min-w-[200px] cursor-pointer card-hover"
                  onClick={() => handleViewPod(pod)}
                >
                  <CardContent className="p-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                      <Building2 className="w-5 h-5 text-primary" />
                    </div>
                    <p className="font-medium text-foreground truncate">{pod.name}</p>
                    <p className="text-xs text-muted-foreground">{pod.subcategory}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        <h2 className="text-lg font-semibold text-foreground mb-4">
          {selectedSubcategory === 'all' ? 'All Pods' : selectedSubcategory}
          <span className="text-muted-foreground font-normal ml-2">({filteredPods.length})</span>
        </h2>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredPods.map((pod) => (
            <PodCard
              key={pod.id}
              pod={pod}
              isJoined={isJoined(pod.id)}
              onJoin={() => handleJoinPod(pod)}
              onView={() => handleViewPod(pod)}
            />
          ))}
        </div>

        {filteredPods.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No pods found matching your criteria</p>
          </div>
        )}
      </main>

      {/* Fixed CTA Button at Bottom */}
      {joinedPods.length > 0 && (
        <div className="fixed bottom-20 left-0 right-0 z-50 px-4">
          <div className="container mx-auto max-w-lg">
            <Button 
              variant="hero" 
              size="lg" 
              className="w-full shadow-lg"
              onClick={() => navigate('/home')}
            >
              Go to Feed
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* Pod Details Dialog */}
      <PodDetailsDialog
        pod={selectedPodForDetails}
        isOpen={!!selectedPodForDetails}
        onClose={() => setSelectedPodForDetails(null)}
        isJoined={selectedPodForDetails ? isJoined(selectedPodForDetails.id) : false}
        onJoin={() => selectedPodForDetails && handleJoinPod(selectedPodForDetails)}
        onLeave={() => selectedPodForDetails && leavePod(selectedPodForDetails.id)}
      />
    </div>
  );
};

const PodCard = ({
  pod,
  isJoined,
  onJoin,
  onView,
}: {
  pod: Pod;
  isJoined: boolean;
  onJoin: () => void;
  onView: () => void;
}) => (
  <Card className="overflow-hidden card-hover">
    <CardContent className="p-6">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Building2 className="w-7 h-7 text-primary" />
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold text-foreground truncate">{pod.name}</h3>
          <Badge variant="secondary" className="mt-1">{pod.subcategory}</Badge>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4 shrink-0" />
          <span className="truncate">{pod.operatingCity}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Target className="w-4 h-4 shrink-0" />
          <span className="truncate">{pod.focusAreas.slice(0, 3).join(', ')}</span>
        </div>
        {pod.numberOfInvestments && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4 shrink-0" />
            <span>{pod.numberOfInvestments} investments</span>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        {isJoined ? (
          <Button variant="secondary" className="flex-1" onClick={onView}>
            View Pod
          </Button>
        ) : (
          <>
            <Button variant="outline" className="flex-1" onClick={onView}>
              Details
            </Button>
            <Button variant="hero" className="flex-1" onClick={onJoin}>
              Join Pod
            </Button>
          </>
        )}
      </div>
    </CardContent>
  </Card>
);

export default PodDiscovery;
