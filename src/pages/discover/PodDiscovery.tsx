import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { POD_SUBCATEGORIES, POD_SUBCATEGORY_DISPLAY, Pod, PodSubcategory, User } from '@/types';
import { Search, Building2, MapPin, Target, Users, ArrowRight, BadgeCheck } from 'lucide-react';
import PodDetailsDialog from '@/components/PodDetailsDialog';
import UserProfileDialog from '@/components/UserProfileDialog';
import SendMessageDialog from '@/components/SendMessageDialog';
import { podsApi } from '@/services/api';
import { toast } from 'sonner';

const PodDiscovery = () => {
  const navigate = useNavigate();
  const { joinPod, leavePod, joinedPods, user } = useAuth();
  const [selectedSubcategory, setSelectedSubcategory] = useState<PodSubcategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPodForDetails, setSelectedPodForDetails] = useState<Pod | null>(null);
  const [selectedUserForProfile, setSelectedUserForProfile] = useState<User | null>(null);
  const [podOwnerIdForProfile, setPodOwnerIdForProfile] = useState<string | undefined>(undefined);
  const [showSendMessageDialog, setShowSendMessageDialog] = useState(false);
  const [pods, setPods] = useState<Pod[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all pods on mount
  useEffect(() => {
    const fetchPods = async () => {
      try {
        setIsLoading(true);
        const fetchedPods = await podsApi.getAllPods();
        setPods(fetchedPods);
      } catch (error) {
        console.error('Failed to fetch pods:', error);
        toast.error('Failed to load pods');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPods();
  }, []);

  const filteredPods = pods.filter((pod) => {
    const matchesSubcategory = selectedSubcategory === 'all' || pod.subcategory === selectedSubcategory;
    const matchesSearch = pod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pod.organisationName?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubcategory && matchesSearch;
  });

  const filteredJoinedPods = joinedPods.filter((pod) => {
    const matchesSubcategory = selectedSubcategory === 'all' || pod.subcategory === selectedSubcategory;
    return matchesSubcategory;
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
                {POD_SUBCATEGORY_DISPLAY[cat]}
              </Badge>
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-6">
        {filteredJoinedPods.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4">Your Pods</h2>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {filteredJoinedPods.map((pod) => (
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
                    <p className="text-xs text-muted-foreground">{pod.subcategory ? POD_SUBCATEGORY_DISPLAY[pod.subcategory] : ''}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        <h2 className="text-lg font-semibold text-foreground mb-4">
          {selectedSubcategory === 'all' ? 'All Pods' : POD_SUBCATEGORY_DISPLAY[selectedSubcategory]}
          <span className="text-muted-foreground font-normal ml-2">({filteredPods.length})</span>
        </h2>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading pods...</p>
          </div>
        ) : (
          <>
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

            {filteredPods.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No pods found matching your criteria</p>
              </div>
            )}
          </>
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
        currentUserId={user?.id}
        onUserClick={(user) => {
          setPodOwnerIdForProfile(selectedPodForDetails?.ownerId);
          setSelectedPodForDetails(null);
          setSelectedUserForProfile(user);
        }}
      />

      {/* User Profile Dialog */}
      <UserProfileDialog
        user={selectedUserForProfile}
        isOpen={!!selectedUserForProfile}
        onClose={() => {
          setSelectedUserForProfile(null);
          setPodOwnerIdForProfile(undefined);
        }}
        currentUserId={user?.id}
        podOwnerId={podOwnerIdForProfile}
        onMessage={() => {
          setShowSendMessageDialog(true);
        }}
      />

      {/* Send Message Dialog */}
      <SendMessageDialog
        isOpen={showSendMessageDialog}
        onClose={() => {
          setShowSendMessageDialog(false);
          setSelectedUserForProfile(null);
          setPodOwnerIdForProfile(undefined);
        }}
        user={selectedUserForProfile}
        currentUserId={user?.id}
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
          <div className="flex items-center gap-1.5">
            <h3 className="font-semibold text-foreground truncate">{pod.name}</h3>
            {pod.isVerified && (
              <BadgeCheck className="w-4 h-4 text-blue-500 shrink-0" />
            )}
          </div>
          <Badge variant="secondary" className="mt-1">{pod.subcategory ? POD_SUBCATEGORY_DISPLAY[pod.subcategory] : ''}</Badge>
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
