import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import TopNav from '@/components/layout/TopNav';
import BottomNav from '@/components/layout/BottomNav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Eye, FileText, MessageCircle, ChevronRight, Send } from 'lucide-react';
import { toast } from 'sonner';
import { pitchesApi } from '@/services/api/pitches';
import { Pitch, STARTUP_STAGE_DISPLAY, PITCH_STATUS_DISPLAY, PITCH_STATUSES, PitchStatus } from '@/types';
import { getManagedPods } from '@/lib/utils';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'PENDING': return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400';
    case 'UNDER_REVIEW': return 'bg-blue-500/10 text-blue-700 dark:text-blue-400';
    case 'ACCEPTED': return 'bg-green-500/10 text-green-700 dark:text-green-400';
    case 'REJECTED': return 'bg-red-500/10 text-red-700 dark:text-red-400';
    case 'SHORTLISTED': return 'bg-purple-500/10 text-purple-700 dark:text-purple-400';
    case 'REPLIED': return 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400';
    default: return '';
  }
};

const ReceivedPitches = () => {
  const navigate = useNavigate();
  const { user, joinedPods } = useAuth();
  const [pitches, setPitches] = useState<Pitch[]>([]);
  const [selectedPitch, setSelectedPitch] = useState<Pitch | null>(null);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const managedPods = getManagedPods(joinedPods, user?.id);
  const canManage = managedPods.length > 0;

  useEffect(() => {
    loadPitches();
  }, [canManage, managedPods]);

  const loadPitches = async () => {
    if (!user || !canManage) return;
    
    try {
      setLoading(true);
      // Fetch pitches for managed pods
      const allPitches = await Promise.all(
        managedPods.map(pod => pitchesApi.getPodPitches(pod.id))
      );
      setPitches(allPitches.flat());
    } catch (error) {
      console.error('Failed to fetch pod pitches:', error);
      toast.error('Failed to load pitches');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (pitchId: string, status: PitchStatus) => {
    try {
      await pitchesApi.updatePitchStatus({ pitchId, status });
      setPitches(pitches.map((p) => p.id === pitchId ? { ...p, status } : p));
      if (selectedPitch && selectedPitch.id === pitchId) {
        setSelectedPitch({ ...selectedPitch, status });
      }
      toast.success(`Status updated to ${PITCH_STATUS_DISPLAY[status]}`);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleReply = async () => {
    if (!selectedPitch) return;
    if (!replyText.trim()) {
      toast.error('Please enter a reply');
      return;
    }

    try {
      setSubmitting(true);
      const newReply = await pitchesApi.addPitchReply(selectedPitch.id, replyText);

      if (!newReply || !newReply.id) {
        throw new Error('Invalid reply response from server');
      }

      // Update local state
      const updatedPitch = {
        ...selectedPitch,
        replies: [...(selectedPitch.replies || []), newReply],
        status: 'REPLIED' as PitchStatus
      };

      setPitches(pitches.map((p) => p.id === selectedPitch.id ? updatedPitch : p));
      setSelectedPitch(updatedPitch);
      setReplyText('');
      toast.success('Reply sent successfully!');

      // Refresh pitch to get latest data
      try {
        const refreshedPitch = await pitchesApi.getPitchById(selectedPitch.id);
        setSelectedPitch(refreshedPitch);
      } catch (refreshError) {
        console.warn('Failed to refresh pitch:', refreshError);
      }
    } catch (error: any) {
      console.error('Failed to send reply:', error);
      const errorMsg = error.message || error.response?.data?.error || 'Failed to send reply';
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!canManage) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <TopNav />
        <main className="container mx-auto px-4 pt-20 pb-24">
          <Button
            variant="ghost"
            size="sm"
            className="mb-4 -ml-2"
            onClick={() => navigate('/pitch')}
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <Card>
            <CardContent className="py-12 text-center">
              <Eye className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Access Restricted</h3>
              <p className="text-muted-foreground">
                This feature is only available for Pod Owners and Co-Owners
              </p>
            </CardContent>
          </Card>
        </main>
        <BottomNav />
      </div>
    );
  }

  // Pitch Detail View
  if (selectedPitch) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <TopNav />
        <main className="container mx-auto px-4 pt-20 pb-24 max-w-2xl">
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
                <Badge className={getStatusColor(selectedPitch.status)}>
                  {PITCH_STATUS_DISPLAY[selectedPitch.status]}
                </Badge>
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

                <div className="flex gap-2">
                  <Select
                    value={selectedPitch.status}
                    onValueChange={(v) => updateStatus(selectedPitch.id, v as PitchStatus)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PITCH_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>{PITCH_STATUS_DISPLAY[s]}</SelectItem>
                      ))}
                    </SelectContent>
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
                Replies ({selectedPitch.replies?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedPitch.replies && selectedPitch.replies.length > 0 && (
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
              )}

              {/* Reply Input */}
              <div className="border-t border-border pt-4">
                <Label className="text-sm font-medium mb-2">Send a Reply</Label>
                <Textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your reply here..."
                  rows={3}
                  className="mb-3"
                />
                <Button onClick={handleReply} disabled={submitting || !replyText.trim()}>
                  <Send className="w-4 h-4 mr-2" />
                  {submitting ? 'Sending...' : 'Send Reply'}
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
      
      <main className="container mx-auto px-4 pt-20 pb-24">
        <Button
          variant="ghost"
          size="sm"
          className="mb-4 -ml-2"
          onClick={() => navigate('/pitch')}
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </Button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Eye className="w-6 h-6 text-primary" />
            Received Pitches
          </h1>
          <p className="text-muted-foreground mt-1">
            Review pitches received from startups
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading pitches...</p>
          </div>
        ) : pitches.length > 0 ? (
          <div className="space-y-4">
            {pitches.map((pitch) => (
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
                    <Badge className={getStatusColor(pitch.status)}>
                      {PITCH_STATUS_DISPLAY[pitch.status]}
                    </Badge>
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
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Eye className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No pitches received yet</h3>
              <p className="text-muted-foreground">
                When users submit pitches to your pods, they'll appear here
              </p>
            </CardContent>
          </Card>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default ReceivedPitches;
