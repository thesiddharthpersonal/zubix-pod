import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Rocket, ChevronRight, ArrowLeft, Settings, HelpCircle, FileText, Users, PhoneCall, Lightbulb, Briefcase } from 'lucide-react';
import TopNav from '@/components/layout/TopNav';
import BottomNav from '@/components/layout/BottomNav';
import { getManagedPods } from '@/lib/utils';

// Feature list for More section
const FEATURES = [
  { id: 'book-call', name: 'Book a Call', description: 'Book a call with pod owners or co-owners', icon: PhoneCall, available: true, forAll: true, path: '/book-call' },
  { id: 'startup-ideas', name: 'Startup Ideas', description: 'Share and discover innovative startup ideas', icon: Lightbulb, available: true, forAll: true, path: '/startup-ideas' },
  { id: 'jobs-internships', name: 'Jobs & Internships', description: 'Post availability and discover opportunities', icon: Briefcase, available: true, forAll: true, path: '/jobs-internships' },
  { id: 'idol-pitch-decks', name: 'Idol Pitch Decks', description: 'Learn from successful pitch decks', icon: FileText, available: true, forAll: true, path: '/idol-pitch-decks' },
  { id: 'pitch', name: 'Pitch', description: 'Submit your startup pitch to investors', icon: Rocket, available: true, forAll: true, path: '/pitch' },
  { id: 'edit-pod', name: 'Edit Pod Details', description: 'Update your pod information and settings', icon: Settings, available: true, forPodOwner: true },
  { id: 'mentors', name: 'Mentors', description: 'Connect with experienced mentors', icon: Users, available: false, forAll: true },
  { id: 'support', name: 'Support', description: 'Get help and support', icon: HelpCircle, available: false, forAll: true },
  { id: 'settings', name: 'Settings', description: 'Manage your preferences', icon: Settings, available: false, forAll: true },
];

const More = () => {
  const navigate = useNavigate();
  const { user, joinedPods } = useAuth();
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);

  const managedPods = getManagedPods(joinedPods, user?.id);
  const canManagePods = managedPods.length > 0;

  // Filter features based on user role
  const visibleFeatures = FEATURES.filter(f => f.forAll || (f.forPodOwner && canManagePods) || (f.forAdmin && (user?.role === 'admin' || user?.role === 'ADMIN')));

  // Feature List View
  if (!selectedFeature) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <TopNav />
        <main className="container mx-auto px-4 py-4 max-w-2xl">
          <h1 className="text-2xl font-bold text-foreground mb-6">More</h1>
          <div className="space-y-3">
            {visibleFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card 
                  key={feature.id} 
                  className={`cursor-pointer transition-all ${feature.available ? 'card-hover' : 'opacity-50'}`}
                  onClick={() => {
                    if (!feature.available) return;
                    if (feature.path) {
                      navigate(feature.path);
                    } else {
                      setSelectedFeature(feature.id);
                    }
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground">{feature.name}</h3>
                          {!feature.available && <Badge variant="secondary" className="text-xs">Coming Soon</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </div>
                      {feature.available && <ChevronRight className="w-5 h-5 text-muted-foreground" />}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  // Edit Pod (Pod Owner/Co-Owner Only)
  if (selectedFeature === 'edit-pod' && canManagePods) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <TopNav />
        <main className="container mx-auto px-4 py-4 max-w-2xl">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mb-4 -ml-2"
            onClick={() => setSelectedFeature(null)}
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-foreground mb-2">Edit Pod Details</h1>
          <p className="text-muted-foreground mb-6">Select a pod to edit its information</p>

          <div className="space-y-3">
            {managedPods.map((pod) => (
              <Card 
                key={pod.id} 
                className="cursor-pointer card-hover"
                onClick={() => navigate(`/pods/${pod.id}/edit`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-muted flex items-center justify-center">
                      {pod.logo ? (
                        <img src={pod.logo} alt={pod.name} className="w-full h-full object-cover" />
                      ) : (
                        <Settings className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{pod.name}</h3>
                      <p className="text-sm text-muted-foreground">{pod.organisationName}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  return null;
};

export default More;