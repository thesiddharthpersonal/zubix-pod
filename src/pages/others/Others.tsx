import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Rocket, Upload, Send, MessageCircle, ChevronRight, ArrowLeft, Settings, HelpCircle, FileText, Users } from 'lucide-react';
import { Pitch, STARTUP_STAGES, PITCH_STATUSES, SECTORS, StartupStage, PitchStatus } from '@/types';
import TopNav from '@/components/layout/TopNav';
import BottomNav from '@/components/layout/BottomNav';
import { toast } from 'sonner';

// Feature list for Others section
const FEATURES = [
  { id: 'pitch', name: 'Pitch', description: 'Submit your startup pitch to investors', icon: Rocket, available: true },
  { id: 'resources', name: 'Resources', description: 'Access helpful startup resources', icon: FileText, available: false },
  { id: 'mentors', name: 'Mentors', description: 'Connect with experienced mentors', icon: Users, available: false },
  { id: 'support', name: 'Support', description: 'Get help and support', icon: HelpCircle, available: false },
  { id: 'settings', name: 'Settings', description: 'Manage your preferences', icon: Settings, available: false },
];

const MOCK_PITCHES: Pitch[] = [
  { id: '1', podId: '1', founderId: 'user1', founder: { id: 'user1', fullName: 'Rahul Sharma', username: 'rahul', email: 'r@e.com', mobile: '', role: 'user', createdAt: new Date() }, startupName: 'TechFlow AI', summary: 'AI-powered workflow automation', sector: 'Technology', stage: 'MVP', ask: '$500K', operatingCity: 'Bangalore', contactEmail: 'r@e.com', contactPhone: '', status: 'New', createdAt: new Date() },
  { id: '2', podId: '1', founderId: 'user2', founder: { id: 'user2', fullName: 'Priya Patel', username: 'priya', email: 'p@e.com', mobile: '', role: 'user', createdAt: new Date() }, startupName: 'EduLearn', summary: 'Gamified learning platform', sector: 'Education', stage: 'Early Traction', ask: '$1M', operatingCity: 'Mumbai', contactEmail: 'p@e.com', contactPhone: '', status: 'Viewed', createdAt: new Date() },
];

const Others = () => {
  const { user, joinedPods } = useAuth();
  const [pitches, setPitches] = useState(MOCK_PITCHES);
  const [activeTab, setActiveTab] = useState('submit');
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const [formData, setFormData] = useState({ startupName: '', summary: '', sector: '', stage: '' as StartupStage | '', ask: '', operatingCity: '', website: '', contactEmail: user?.email || '', contactPhone: user?.mobile || '', podId: '' });

  const isPodOwner = user?.role === 'pod_owner';

  const handleSubmit = () => {
    if (!formData.startupName || !formData.summary || !formData.podId) { toast.error('Fill required fields'); return; }
    toast.success('Pitch submitted!');
    setFormData({ startupName: '', summary: '', sector: '', stage: '', ask: '', operatingCity: '', website: '', contactEmail: '', contactPhone: '', podId: '' });
  };

  const updateStatus = (pitchId: string, status: PitchStatus) => {
    setPitches(pitches.map((p) => p.id === pitchId ? { ...p, status } : p));
    toast.success(`Status updated to ${status}`);
  };

  const getStatusColor = (status: PitchStatus) => {
    switch (status) {
      case 'Accepted': return 'bg-success/10 text-success';
      case 'Rejected': return 'bg-destructive/10 text-destructive';
      case 'Shortlisted': return 'bg-primary/10 text-primary';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  // Feature List View
  if (!selectedFeature) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <TopNav />
        <main className="container mx-auto px-4 py-4 max-w-2xl">
          <h1 className="text-2xl font-bold text-foreground mb-6">More</h1>
          <div className="space-y-3">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card 
                  key={feature.id} 
                  className={`cursor-pointer transition-all ${feature.available ? 'card-hover' : 'opacity-50'}`}
                  onClick={() => feature.available && setSelectedFeature(feature.id)}
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

  // Pitch Module View
  if (selectedFeature === 'pitch') {
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
          <h1 className="text-2xl font-bold text-foreground mb-6">Pitch Module</h1>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="submit">Submit Pitch</TabsTrigger>
            <TabsTrigger value="inbox">{isPodOwner ? 'Pitch Inbox' : 'My Pitches'}</TabsTrigger>
          </TabsList>

          <TabsContent value="submit">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Rocket className="w-5 h-5" />Submit Your Pitch</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2"><Label>Select Pod *</Label><Select value={formData.podId} onValueChange={(v) => setFormData({ ...formData, podId: v })}><SelectTrigger><SelectValue placeholder="Choose pod" /></SelectTrigger><SelectContent>{joinedPods.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent></Select></div>
                <div className="space-y-2"><Label>Startup Name *</Label><Input value={formData.startupName} onChange={(e) => setFormData({ ...formData, startupName: e.target.value })} /></div>
                <div className="space-y-2"><Label>Pitch Deck (PDF)</Label><div className="border-2 border-dashed border-border rounded-lg p-6 text-center"><Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" /><p className="text-sm text-muted-foreground">Click to upload PDF</p></div></div>
                <div className="space-y-2"><Label>Summary *</Label><Textarea value={formData.summary} onChange={(e) => setFormData({ ...formData, summary: e.target.value })} rows={3} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Sector</Label><Select value={formData.sector} onValueChange={(v) => setFormData({ ...formData, sector: v })}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{SECTORS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
                  <div className="space-y-2"><Label>Stage</Label><Select value={formData.stage} onValueChange={(v) => setFormData({ ...formData, stage: v as StartupStage })}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{STARTUP_STAGES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
                </div>
                <div className="space-y-2"><Label>Ask</Label><Input value={formData.ask} onChange={(e) => setFormData({ ...formData, ask: e.target.value })} placeholder="e.g., $500K" /></div>
                <div className="space-y-2"><Label>Operating City</Label><Input value={formData.operatingCity} onChange={(e) => setFormData({ ...formData, operatingCity: e.target.value })} /></div>
                <div className="space-y-2"><Label>Website</Label><Input value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Contact Email</Label><Input value={formData.contactEmail} onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Contact Phone</Label><Input value={formData.contactPhone} onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })} /></div>
                </div>
                <Button variant="hero" className="w-full" onClick={handleSubmit}><Send className="w-4 h-4" />Submit Pitch</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inbox">
            <div className="space-y-4">
              {pitches.map((pitch) => (
                <Card key={pitch.id}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground">{pitch.startupName}</h3>
                        <p className="text-sm text-muted-foreground">by {pitch.founder.fullName}</p>
                      </div>
                      <Badge className={getStatusColor(pitch.status)}>{pitch.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">{pitch.summary}</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Badge variant="outline">{pitch.sector}</Badge>
                      <Badge variant="outline">{pitch.stage}</Badge>
                      <Badge variant="outline">{pitch.ask}</Badge>
                    </div>
                    {isPodOwner && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        <Select value={pitch.status} onValueChange={(v) => updateStatus(pitch.id, v as PitchStatus)}>
                          <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                          <SelectContent>{PITCH_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                        </Select>
                        <Button variant="outline" size="sm"><MessageCircle className="w-4 h-4 mr-1" />Message</Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
        </main>
        <BottomNav />
      </div>
    );
  }

  return null;
};

export default Others;
