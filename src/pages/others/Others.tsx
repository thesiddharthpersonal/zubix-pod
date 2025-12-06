import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Rocket, Upload, Send, MessageCircle, ChevronRight, ArrowLeft, Settings, HelpCircle, FileText, Users, Eye, Reply, MailOpen, PhoneCall } from 'lucide-react';
import { Pitch, PitchReply, STARTUP_STAGES, PITCH_STATUSES, SECTORS, StartupStage, PitchStatus } from '@/types';
import TopNav from '@/components/layout/TopNav';
import BottomNav from '@/components/layout/BottomNav';
import { toast } from 'sonner';

// Feature list for Others section
const FEATURES = [
  { id: 'message-requests', name: 'Message Requests', description: 'View and manage message requests', icon: MailOpen, available: true, forAll: true, path: '/message-requests' },
  { id: 'book-call', name: 'Book a Call', description: 'Book a call with pod owners or co-owners', icon: PhoneCall, available: true, forAll: true, path: '/book-call' },
  { id: 'pitch', name: 'Pitch', description: 'Submit your startup pitch to investors', icon: Rocket, available: true, forAll: true },
  { id: 'view-pitches', name: 'View Pitches', description: 'Review pitches received from startups', icon: Eye, available: true, forPodOwner: true },
  { id: 'resources', name: 'Resources', description: 'Access helpful startup resources', icon: FileText, available: false, forAll: true },
  { id: 'mentors', name: 'Mentors', description: 'Connect with experienced mentors', icon: Users, available: false, forAll: true },
  { id: 'support', name: 'Support', description: 'Get help and support', icon: HelpCircle, available: false, forAll: true },
  { id: 'settings', name: 'Settings', description: 'Manage your preferences', icon: Settings, available: false, forAll: true },
];

const MOCK_PITCHES: Pitch[] = [
  { id: '1', podId: '1', podName: 'TechStars India', founderId: 'user1', founder: { id: 'user1', fullName: 'Rahul Sharma', username: 'rahul', email: 'r@e.com', mobile: '', role: 'user', createdAt: new Date() }, startupName: 'TechFlow AI', summary: 'AI-powered workflow automation for enterprises. Our platform reduces manual tasks by 70% and improves productivity across teams.', sector: 'Technology', stage: 'MVP', ask: '$500K', operatingCity: 'Bangalore', contactEmail: 'rahul@techflow.ai', contactPhone: '+91 98765 43210', status: 'New', replies: [], createdAt: new Date() },
  { id: '2', podId: '1', podName: 'TechStars India', founderId: 'user2', founder: { id: 'user2', fullName: 'Priya Patel', username: 'priya', email: 'p@e.com', mobile: '', role: 'user', createdAt: new Date() }, startupName: 'EduLearn', summary: 'Gamified learning platform for K-12 students. We make education fun and engaging with interactive content.', sector: 'Education', stage: 'Early Traction', ask: '$1M', operatingCity: 'Mumbai', contactEmail: 'priya@edulearn.com', contactPhone: '+91 87654 32109', status: 'Replied', replies: [{ id: 'r1', pitchId: '2', authorId: 'owner1', author: { id: 'owner1', fullName: 'Investor Team', username: 'investor', email: 'i@e.com', mobile: '', role: 'pod_owner', createdAt: new Date() }, content: 'Great pitch! We would like to schedule a call to discuss further. Please share your availability for next week.', createdAt: new Date() }], createdAt: new Date() },
  { id: '3', podId: '2', podName: 'Angel Network', founderId: 'user3', founder: { id: 'user3', fullName: 'Amit Kumar', username: 'amit', email: 'a@e.com', mobile: '', role: 'user', createdAt: new Date() }, startupName: 'GreenEnergy', summary: 'Renewable energy solutions for rural India. Solar-powered systems for agriculture and households.', sector: 'Energy', stage: 'Idea', ask: '$250K', operatingCity: 'Delhi', contactEmail: 'amit@greenenergy.in', contactPhone: '+91 76543 21098', status: 'Shortlisted', replies: [], createdAt: new Date() },
];

const Others = () => {
  const navigate = useNavigate();
  const { user, joinedPods } = useAuth();
  const [pitches, setPitches] = useState(MOCK_PITCHES);
  const [activeTab, setActiveTab] = useState('submit');
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const [selectedPitch, setSelectedPitch] = useState<Pitch | null>(null);
  const [replyText, setReplyText] = useState('');
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

  const handleReply = (pitchId: string) => {
    if (!replyText.trim()) { toast.error('Please enter a reply'); return; }
    
    const newReply: PitchReply = {
      id: `r${Date.now()}`,
      pitchId,
      authorId: user?.id || '',
      author: user!,
      content: replyText,
      createdAt: new Date(),
    };

    setPitches(pitches.map((p) => 
      p.id === pitchId 
        ? { ...p, replies: [...p.replies, newReply], status: 'Replied' as PitchStatus } 
        : p
    ));
    setReplyText('');
    toast.success('Reply sent!');
  };

  const getStatusColor = (status: PitchStatus) => {
    switch (status) {
      case 'Accepted': return 'bg-success/10 text-success';
      case 'Rejected': return 'bg-destructive/10 text-destructive';
      case 'Shortlisted': return 'bg-primary/10 text-primary';
      case 'Replied': return 'bg-accent/20 text-accent-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  // Filter features based on user role
  const visibleFeatures = FEATURES.filter(f => f.forAll || (f.forPodOwner && isPodOwner));

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

  // View Pitches (Pod Owner Only)
  if (selectedFeature === 'view-pitches' && isPodOwner) {
    // Pitch Detail View
    if (selectedPitch) {
      return (
        <div className="min-h-screen bg-background pb-20">
          <TopNav />
          <main className="container mx-auto px-4 py-4 max-w-2xl">
            <Button 
              variant="ghost" 
              size="sm" 
              className="mb-4 -ml-2"
              onClick={() => setSelectedPitch(null)}
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Pitches
            </Button>

            <Card className="mb-6">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-foreground">{selectedPitch.startupName}</h2>
                    <p className="text-sm text-muted-foreground">by {selectedPitch.founder.fullName}</p>
                  </div>
                  <Badge className={getStatusColor(selectedPitch.status)}>{selectedPitch.status}</Badge>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Summary</Label>
                    <p className="text-sm text-foreground mt-1">{selectedPitch.summary}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Sector</Label>
                      <p className="text-sm text-foreground">{selectedPitch.sector}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Stage</Label>
                      <p className="text-sm text-foreground">{selectedPitch.stage}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Ask</Label>
                      <p className="text-sm text-foreground font-semibold">{selectedPitch.ask}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Operating City</Label>
                      <p className="text-sm text-foreground">{selectedPitch.operatingCity}</p>
                    </div>
                  </div>

                  <div className="border-t border-border pt-4">
                    <Label className="text-xs text-muted-foreground">Contact Information</Label>
                    <p className="text-sm text-foreground">{selectedPitch.contactEmail}</p>
                    <p className="text-sm text-foreground">{selectedPitch.contactPhone}</p>
                  </div>

                  <div className="flex gap-2">
                    <Select value={selectedPitch.status} onValueChange={(v) => {
                      updateStatus(selectedPitch.id, v as PitchStatus);
                      setSelectedPitch({ ...selectedPitch, status: v as PitchStatus });
                    }}>
                      <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                      <SelectContent>{PITCH_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Replies Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MessageCircle className="w-5 h-5" />
                  Replies ({selectedPitch.replies.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedPitch.replies.length > 0 ? (
                  <div className="space-y-3">
                    {selectedPitch.replies.map((reply) => (
                      <div key={reply.id} className="bg-secondary/50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
                            {reply.author.fullName.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{reply.author.fullName}</p>
                            <p className="text-xs text-muted-foreground">{reply.createdAt.toLocaleDateString()}</p>
                          </div>
                        </div>
                        <p className="text-sm text-foreground">{reply.content}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No replies yet</p>
                )}

                <div className="border-t border-border pt-4">
                  <Label className="text-sm font-medium mb-2 block">Send Reply</Label>
                  <Textarea 
                    placeholder="Write your reply to this pitch..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows={3}
                    className="mb-3"
                  />
                  <Button 
                    variant="hero" 
                    className="w-full"
                    onClick={() => {
                      handleReply(selectedPitch.id);
                      const updatedPitch = pitches.find(p => p.id === selectedPitch.id);
                      if (updatedPitch) setSelectedPitch(updatedPitch);
                    }}
                  >
                    <Reply className="w-4 h-4" />
                    Send Reply
                  </Button>
                </div>
              </CardContent>
            </Card>
          </main>
          <BottomNav />
        </div>
      );
    }

    // Pitches List View
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
          <h1 className="text-2xl font-bold text-foreground mb-2">Received Pitches</h1>
          <p className="text-muted-foreground mb-6">Review and respond to startup pitches</p>

          <div className="space-y-4">
            {pitches.length > 0 ? pitches.map((pitch) => (
              <Card 
                key={pitch.id} 
                className="cursor-pointer card-hover"
                onClick={() => setSelectedPitch(pitch)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{pitch.startupName}</h3>
                      <p className="text-sm text-muted-foreground">by {pitch.founder.fullName}</p>
                    </div>
                    <Badge className={getStatusColor(pitch.status)}>{pitch.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{pitch.summary}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Badge variant="outline">{pitch.sector}</Badge>
                    <Badge variant="outline">{pitch.stage}</Badge>
                    <Badge variant="outline">{pitch.ask}</Badge>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                    <span className="text-xs text-muted-foreground">{pitch.replies.length} replies</span>
                    <span className="text-xs text-primary flex items-center gap-1">
                      View Details <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            )) : (
              <div className="text-center py-12">
                <Eye className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No pitches received yet</p>
              </div>
            )}
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  // Pitch Module View (for users to submit and track their pitches)
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
            <TabsTrigger value="inbox">My Pitches</TabsTrigger>
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
              {pitches.filter(p => p.founderId === user?.id || true).map((pitch) => (
                <Card key={pitch.id}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground">{pitch.startupName}</h3>
                        <p className="text-sm text-muted-foreground">Sent to {pitch.podName}</p>
                      </div>
                      <Badge className={getStatusColor(pitch.status)}>{pitch.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">{pitch.summary}</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Badge variant="outline">{pitch.sector}</Badge>
                      <Badge variant="outline">{pitch.stage}</Badge>
                      <Badge variant="outline">{pitch.ask}</Badge>
                    </div>

                    {/* Show replies from pod owner */}
                    {pitch.replies.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <p className="text-sm font-medium text-foreground mb-2 flex items-center gap-1">
                          <MessageCircle className="w-4 h-4" />
                          Replies ({pitch.replies.length})
                        </p>
                        <div className="space-y-2">
                          {pitch.replies.map((reply) => (
                            <div key={reply.id} className="bg-secondary/50 rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-medium text-foreground">{reply.author.fullName}</span>
                                <span className="text-xs text-muted-foreground">• {reply.createdAt.toLocaleDateString()}</span>
                              </div>
                              <p className="text-sm text-foreground">{reply.content}</p>
                            </div>
                          ))}
                        </div>
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