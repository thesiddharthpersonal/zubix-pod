import { useState, useEffect } from 'react';
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
import { Pitch, PitchReply, STARTUP_STAGES, PITCH_STATUSES, STARTUP_STAGE_DISPLAY, PITCH_STATUS_DISPLAY, SECTORS, StartupStage, PitchStatus } from '@/types';
import TopNav from '@/components/layout/TopNav';
import BottomNav from '@/components/layout/BottomNav';
import { toast } from 'sonner';
import { pitchesApi } from '@/services/api/pitches';

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

const Others = () => {
  const navigate = useNavigate();
  const { user, joinedPods } = useAuth();
  const [pitches, setPitches] = useState<Pitch[]>([]);
  const [userPitches, setUserPitches] = useState<Pitch[]>([]);
  const [activeTab, setActiveTab] = useState('submit');
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const [selectedPitch, setSelectedPitch] = useState<Pitch | null>(null);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(false);
  const [pitchDeckFile, setPitchDeckFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({ 
    startupName: '', 
    summary: '', 
    sector: '', 
    stage: '' as StartupStage | '', 
    ask: '', 
    operatingCity: '', 
    website: '', 
    contactEmail: user?.email || '', 
    contactPhone: user?.mobile || '', 
    podId: '' 
  });

  const isPodOwner = user?.role === 'pod_owner' || user?.role === 'POD_OWNER';

  // Fetch user's pitches
  useEffect(() => {
    const fetchUserPitches = async () => {
      if (!user) return;
      try {
        const data = await pitchesApi.getUserPitches(user.id);
        setUserPitches(data);
      } catch (error) {
        console.error('Failed to fetch user pitches:', error);
      }
    };

    if (selectedFeature === 'pitch') {
      fetchUserPitches();
    }
  }, [user, selectedFeature]);

  // Fetch pitches for pod owner
  useEffect(() => {
    const fetchPodPitches = async () => {
      if (!user || !isPodOwner || !joinedPods.length) return;
      try {
        // Fetch pitches for all pods the user owns
        const allPitches = await Promise.all(
          joinedPods.map(pod => pitchesApi.getPodPitches(pod.id))
        );
        setPitches(allPitches.flat());
      } catch (error) {
        console.error('Failed to fetch pod pitches:', error);
      }
    };

    if ((selectedFeature === 'view-pitches' || selectedFeature === 'pitch') && isPodOwner) {
      fetchPodPitches();
    }
  }, [user, isPodOwner, joinedPods, selectedFeature]);

  const handleSubmit = async () => {
    if (!formData.startupName || !formData.summary || !formData.podId) { 
      toast.error('Please fill in all required fields'); 
      return; 
    }

    if (!formData.stage || !formData.sector) {
      toast.error('Please select sector and stage');
      return;
    }

    try {
      setLoading(true);
      const pitch = await pitchesApi.createPitch({
        ...formData,
        stage: formData.stage as StartupStage,
      });

      // Upload pitch deck if provided
      if (pitchDeckFile) {
        try {
          await pitchesApi.uploadPitchDeck(pitch.id, pitchDeckFile);
          toast.success('Pitch submitted with deck!');
        } catch (error) {
          console.error('Pitch deck upload error:', error);
          toast.warning('Pitch submitted but deck upload failed');
        }
      } else {
        toast.success('Pitch submitted successfully!');
      }

      // Reset form
      setFormData({ 
        startupName: '', 
        summary: '', 
        sector: '', 
        stage: '', 
        ask: '', 
        operatingCity: '', 
        website: '', 
        contactEmail: user?.email || '', 
        contactPhone: user?.mobile || '', 
        podId: '' 
      });
      setPitchDeckFile(null);

      // Refresh user pitches
      const data = await pitchesApi.getUserPitches(user!.id);
      setUserPitches(data);
      setActiveTab('inbox');
    } catch (error: any) {
      console.error('Failed to create pitch:', error);
      toast.error(error.message || 'Failed to submit pitch');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (pitchId: string, status: PitchStatus) => {
    try {
      await pitchesApi.updatePitchStatus({ pitchId, status });
      setPitches(pitches.map((p) => p.id === pitchId ? { ...p, status } : p));
      toast.success(`Status updated to ${status}`);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleReply = async (pitchId: string) => {
    if (!replyText.trim()) { toast.error('Please enter a reply'); return; }
    
    try {
      setLoading(true);
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
          ? { ...p, replies: [...(p.replies || []), newReply], status: 'Replied' as PitchStatus } 
          : p
      ));
      
      if (selectedPitch && selectedPitch.id === pitchId) {
        setSelectedPitch({
          ...selectedPitch,
          replies: [...(selectedPitch.replies || []), newReply],
          status: 'Replied' as PitchStatus
        });
      }

      setReplyText('');
      toast.success('Reply sent!');
    } catch (error) {
      toast.error('Failed to send reply');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: PitchStatus) => {
    switch (status) {
      case 'ACCEPTED': return 'bg-success/10 text-success';
      case 'REJECTED': return 'bg-destructive/10 text-destructive';
      case 'SHORTLISTED': return 'bg-primary/10 text-primary';
      case 'REPLIED': return 'bg-accent/20 text-accent-foreground';
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
                  <Badge className={getStatusColor(selectedPitch.status)}>{PITCH_STATUS_DISPLAY[selectedPitch.status]}</Badge>
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
                      <p className="text-sm text-foreground">{STARTUP_STAGE_DISPLAY[selectedPitch.stage]}</p>
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

                  {selectedPitch.pitchDeckUrl && (
                    <div className="border-t border-border pt-4">
                      <Label className="text-xs text-muted-foreground">Pitch Deck</Label>
                      <a
                        href={selectedPitch.pitchDeckUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 mt-2 text-sm text-primary hover:underline"
                      >
                        <FileText className="w-4 h-4" />
                        View Pitch Deck (PDF)
                      </a>
                    </div>
                  )}

                  <div className="flex gap-2">{
                    <Select value={selectedPitch.status} onValueChange={(v) => {
                      updateStatus(selectedPitch.id, v as PitchStatus);
                      setSelectedPitch({ ...selectedPitch, status: v as PitchStatus });
                    }}>
                      <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                      <SelectContent>{PITCH_STATUSES.map((s) => <SelectItem key={s} value={s}>{PITCH_STATUS_DISPLAY[s]}</SelectItem>)}</SelectContent>
                    </Select>}
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
                {selectedPitch.replies && selectedPitch.replies.length > 0 ? (
                  <div className="space-y-3">
                    {selectedPitch.replies.map((reply) => {
                      const replyDate = typeof reply.createdAt === 'string' ? new Date(reply.createdAt) : reply.createdAt;
                      return (
                        <div key={reply.id} className="bg-secondary/50 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
                              {reply.author.fullName.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">{reply.author.fullName}</p>
                              <p className="text-xs text-muted-foreground">{replyDate.toLocaleDateString()}</p>
                            </div>
                          </div>
                          <p className="text-sm text-foreground">{reply.content}</p>
                        </div>
                      );
                    })}
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
                    disabled={loading || !replyText.trim()}
                    onClick={() => {
                      handleReply(selectedPitch.id);
                    }}
                  >
                    <Reply className="w-4 h-4 mr-2" />
                    {loading ? 'Sending...' : 'Send Reply'}
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
                    <Badge className={getStatusColor(pitch.status)}>{PITCH_STATUS_DISPLAY[pitch.status]}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{pitch.summary}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Badge variant="outline">{pitch.sector}</Badge>
                    <Badge variant="outline">{STARTUP_STAGE_DISPLAY[pitch.stage]}</Badge>
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
          <TabsList className={`grid w-full mb-6 ${isPodOwner ? 'grid-cols-3' : 'grid-cols-2'}`}>
            <TabsTrigger value="submit">Submit Pitch</TabsTrigger>
            <TabsTrigger value="inbox">My Pitches</TabsTrigger>
            {isPodOwner ? <TabsTrigger value="received">Received</TabsTrigger> : null}
          </TabsList>

          <TabsContent value="submit">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Rocket className="w-5 h-5" />Submit Your Pitch</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2"><Label>Select Pod *</Label><Select value={formData.podId} onValueChange={(v) => setFormData({ ...formData, podId: v })}><SelectTrigger><SelectValue placeholder="Choose pod" /></SelectTrigger><SelectContent>{joinedPods.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent></Select></div>
                <div className="space-y-2"><Label>Startup Name *</Label><Input value={formData.startupName} onChange={(e) => setFormData({ ...formData, startupName: e.target.value })} /></div>
                <div className="space-y-2">
                  <Label>Pitch Deck (PDF)</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
                    onClick={() => document.getElementById('pitch-deck-upload')?.click()}
                  >
                    <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {pitchDeckFile ? pitchDeckFile.name : 'Click to upload PDF (Max 10MB)'}
                    </p>
                    <input
                      id="pitch-deck-upload"
                      type="file"
                      accept=".pdf,application/pdf"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.type !== 'application/pdf') {
                            toast.error('Please select a PDF file');
                            return;
                          }
                          if (file.size > 10 * 1024 * 1024) {
                            toast.error('File size must be less than 10MB');
                            return;
                          }
                          setPitchDeckFile(file);
                          toast.success('PDF selected');
                        }
                      }}
                    />
                  </div>
                  {pitchDeckFile && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{(pitchDeckFile.size / 1024 / 1024).toFixed(2)} MB</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setPitchDeckFile(null);
                          const input = document.getElementById('pitch-deck-upload') as HTMLInputElement;
                          if (input) input.value = '';
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                </div>
                <div className="space-y-2"><Label>Summary *</Label><Textarea value={formData.summary} onChange={(e) => setFormData({ ...formData, summary: e.target.value })} rows={3} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Sector</Label><Select value={formData.sector} onValueChange={(v) => setFormData({ ...formData, sector: v })}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{SECTORS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
                  <div className="space-y-2"><Label>Stage</Label><Select value={formData.stage} onValueChange={(v) => setFormData({ ...formData, stage: v as StartupStage })}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{STARTUP_STAGES.map((s) => <SelectItem key={s} value={s}>{STARTUP_STAGE_DISPLAY[s]}</SelectItem>)}</SelectContent></Select></div>
                </div>
                <div className="space-y-2"><Label>Ask</Label><Input value={formData.ask} onChange={(e) => setFormData({ ...formData, ask: e.target.value })} placeholder="e.g., $500K" /></div>
                <div className="space-y-2"><Label>Operating City</Label><Input value={formData.operatingCity} onChange={(e) => setFormData({ ...formData, operatingCity: e.target.value })} /></div>
                <div className="space-y-2"><Label>Website</Label><Input value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Contact Email</Label><Input value={formData.contactEmail} onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Contact Phone</Label><Input value={formData.contactPhone} onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })} /></div>
                </div>
                <Button variant="hero" className="w-full" onClick={handleSubmit} disabled={loading}>
                  <Send className="w-4 h-4 mr-2" />
                  {loading ? 'Submitting...' : 'Submit Pitch'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inbox">
            <div className="space-y-4">
              {userPitches.length > 0 ? userPitches.map((pitch) => (
                <Card key={pitch.id}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground">{pitch.startupName}</h3>
                        <p className="text-sm text-muted-foreground">Sent to {pitch.podName}</p>
                      </div>
                      <Badge className={getStatusColor(pitch.status)}>{PITCH_STATUS_DISPLAY[pitch.status]}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">{pitch.summary}</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Badge variant="outline">{pitch.sector}</Badge>
                      <Badge variant="outline">{STARTUP_STAGE_DISPLAY[pitch.stage]}</Badge>
                      <Badge variant="outline">{pitch.ask}</Badge>
                      {pitch.pitchDeckUrl && (
                        <a
                          href={pitch.pitchDeckUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                          <FileText className="w-3 h-3" />
                          Pitch Deck
                        </a>
                      )}
                    </div>

                    {/* Show replies from pod owner */}
                    {pitch.replies && pitch.replies.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <p className="text-sm font-medium text-foreground mb-2 flex items-center gap-1">
                          <MessageCircle className="w-4 h-4" />
                          Replies ({pitch.replies.length})
                        </p>
                        <div className="space-y-2">
                          {pitch.replies.map((reply) => {
                            const replyDate = typeof reply.createdAt === 'string' ? new Date(reply.createdAt) : reply.createdAt;
                            return (
                              <div key={reply.id} className="bg-secondary/50 rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs font-medium text-foreground">{reply.author.fullName}</span>
                                  <span className="text-xs text-muted-foreground">• {replyDate.toLocaleDateString()}</span>
                                </div>
                                <p className="text-sm text-foreground">{reply.content}</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )) : (
                <div className="text-center py-12">
                  <Rocket className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No pitches submitted yet</p>
                  <p className="text-sm text-muted-foreground mt-1">Submit your first pitch to get started</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Received Pitches Tab (for pod owners) */}
          {isPodOwner && (
            <TabsContent value="received">
              <div className="space-y-4">
                {pitches.length > 0 ? pitches.map((pitch) => (
                  <Card 
                    key={pitch.id}
                    className="cursor-pointer card-hover"
                    onClick={() => {
                      setSelectedPitch(pitch);
                      setSelectedFeature('view-pitches');
                    }}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">{pitch.startupName}</h3>
                          <p className="text-sm text-muted-foreground">by {pitch.founder.fullName}</p>
                        </div>
                        <Badge className={getStatusColor(pitch.status)}>{PITCH_STATUS_DISPLAY[pitch.status]}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{pitch.summary}</p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <Badge variant="outline">{pitch.sector}</Badge>
                        <Badge variant="outline">{STARTUP_STAGE_DISPLAY[pitch.stage]}</Badge>
                        <Badge variant="outline">{pitch.ask}</Badge>
                        {pitch.pitchDeckUrl && (
                          <Badge variant="outline" className="text-primary">
                            <FileText className="w-3 h-3 mr-1" />
                            Has Deck
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                        <span className="text-xs text-muted-foreground">
                          {pitch.replies && pitch.replies.length > 0 ? `${pitch.replies.length} replies` : 'No replies yet'}
                        </span>
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
                    <p className="text-sm text-muted-foreground mt-1">
                      When users submit pitches to your pods, they'll appear here
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          )}
        </Tabs>
        </main>
        <BottomNav />
      </div>
    );
  }

  return null;
};

export default Others;