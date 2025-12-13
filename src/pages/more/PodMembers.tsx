import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { ArrowLeft, Crown, ShieldCheck, Briefcase, Users, UserPlus, UserMinus } from 'lucide-react';
import { User, Pod } from '@/types';
import { toast } from 'sonner';
import { podsApi } from '@/services/api/pods';
import { getManagedPods } from '@/lib/utils';

const PodMembers = () => {
  const navigate = useNavigate();
  const { user, joinedPods } = useAuth();
  const [selectedPodId, setSelectedPodId] = useState('');
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [actionMember, setActionMember] = useState<User | null>(null);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'team' | 'coowner'>('team');

  // Get pods managed by current user (owner or co-owner)
  const managedPods = useMemo(() => getManagedPods(joinedPods, user?.id), [joinedPods, user?.id]);

  // Auto-select first pod
  useEffect(() => {
    if (managedPods.length > 0 && !selectedPodId) {
      setSelectedPodId(managedPods[0].id);
    }
  }, [managedPods, selectedPodId]);

  // Fetch members when pod changes
  useEffect(() => {
    const fetchMembers = async () => {
      if (!selectedPodId) return;

      try {
        setLoading(true);
        const membersData = await podsApi.getPodMembers(selectedPodId);
        setMembers(membersData);
      } catch (error) {
        console.error('Failed to fetch members:', error);
        toast.error('Failed to load members');
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [selectedPodId]);

  const selectedPod = managedPods.find(p => p.id === selectedPodId);
  const isOwner = selectedPod?.ownerId === user?.id;

  // Filter members by role
  const owner = members.find(m => m.id === selectedPod?.ownerId);
  const coOwners = members.filter(m => m.isCoOwner && m.id !== selectedPod?.ownerId);
  const teamMembers = members.filter(m => m.isTeamMember && !m.isCoOwner && m.id !== selectedPod?.ownerId);
  const regularMembers = members.filter(m => !m.isCoOwner && !m.isTeamMember && m.id !== selectedPod?.ownerId);

  // Available members for team assignment (regular members only)
  const availableForTeam = regularMembers;

  const handleAssignTeamMember = async () => {
    if (!selectedMemberId || !selectedPodId) return;

    try {
      setLoading(true);
      await podsApi.assignTeamMember(selectedPodId, selectedMemberId);
      toast.success('Team member assigned successfully');
      
      // Refresh members
      const membersData = await podsApi.getPodMembers(selectedPodId);
      setMembers(membersData);
      
      setAssignDialogOpen(false);
      setSelectedMemberId('');
    } catch (error: any) {
      console.error('Failed to assign team member:', error);
      toast.error(error.message || 'Failed to assign team member');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveTeamMember = async () => {
    if (!actionMember || !selectedPodId) return;

    try {
      setLoading(true);
      await podsApi.removeTeamMember(selectedPodId, actionMember.id);
      toast.success('Team member removed successfully');
      
      // Refresh members
      const membersData = await podsApi.getPodMembers(selectedPodId);
      setMembers(membersData);
      
      setRemoveDialogOpen(false);
      setActionMember(null);
    } catch (error: any) {
      console.error('Failed to remove team member:', error);
      toast.error(error.message || 'Failed to remove team member');
    } finally {
      setLoading(false);
    }
  };

  if (managedPods.length === 0) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
          <div className="flex items-center gap-3 p-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/more')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold text-foreground">Manage Members</h1>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 max-w-2xl">
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Pods to Manage</h3>
              <p className="text-muted-foreground">You need to be a pod owner or co-owner to manage members.</p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center gap-3 p-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/more')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-foreground">Manage Members</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 max-w-2xl space-y-4">
        {/* Pod Selector */}
        {managedPods.length > 1 && (
          <Card>
            <CardContent className="p-4">
              <Select value={selectedPodId} onValueChange={setSelectedPodId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a pod" />
                </SelectTrigger>
                <SelectContent>
                  {managedPods.map(pod => (
                    <SelectItem key={pod.id} value={pod.id}>
                      {pod.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        )}

        {/* Owner Only Actions */}
        {isOwner && availableForTeam.length > 0 && (
          <Card className="bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">Assign Team Members</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Team members can post content on behalf of the pod
                  </p>
                </div>
                <Button onClick={() => setAssignDialogOpen(true)} size="sm">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Assign
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {loading && !members.length ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">Loading members...</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Owner */}
            {owner && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Crown className="w-4 h-4 text-amber-500" />
                    <span className="text-sm font-medium">Pod Owner</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={owner.profilePhoto} />
                      <AvatarFallback className="bg-amber-100 text-amber-700 font-semibold">
                        {owner.fullName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{owner.fullName}</p>
                      <p className="text-sm text-muted-foreground truncate">@{owner.username}</p>
                    </div>
                    <Badge className="bg-amber-100 text-amber-700">Owner</Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Co-Owners */}
            {coOwners.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <ShieldCheck className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium">Co-Owners ({coOwners.length})</span>
                  </div>
                  <div className="space-y-3">
                    {coOwners.map(member => (
                      <div key={member.id} className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={member.profilePhoto} />
                          <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
                            {member.fullName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate text-sm">{member.fullName}</p>
                          <p className="text-xs text-muted-foreground truncate">@{member.username}</p>
                        </div>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700">Co-Owner</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Team Members */}
            {teamMembers.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Briefcase className="w-4 h-4 text-purple-500" />
                    <span className="text-sm font-medium">Team Members ({teamMembers.length})</span>
                  </div>
                  <div className="space-y-3">
                    {teamMembers.map(member => (
                      <div key={member.id} className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={member.profilePhoto} />
                          <AvatarFallback className="bg-purple-100 text-purple-700 font-semibold">
                            {member.fullName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate text-sm">{member.fullName}</p>
                          <p className="text-xs text-muted-foreground truncate">@{member.username}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="bg-purple-100 text-purple-700">Team Member</Badge>
                          {isOwner && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setActionMember(member);
                                setActionType('team');
                                setRemoveDialogOpen(true);
                              }}
                            >
                              <UserMinus className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Regular Members */}
            {regularMembers.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Members ({regularMembers.length})</span>
                  </div>
                  <div className="space-y-3">
                    {regularMembers.map(member => (
                      <div key={member.id} className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={member.profilePhoto} />
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {member.fullName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate text-sm">{member.fullName}</p>
                          <p className="text-xs text-muted-foreground truncate">@{member.username}</p>
                        </div>
                        <Badge variant="outline">Member</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </main>

      {/* Assign Team Member Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Team Member</DialogTitle>
            <DialogDescription>
              Team members can post content on behalf of the pod. Posts will display the pod name as the author.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Member</label>
              <Select value={selectedMemberId} onValueChange={setSelectedMemberId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a member" />
                </SelectTrigger>
                <SelectContent>
                  {availableForTeam.map(member => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.fullName} (@{member.username})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssignTeamMember} disabled={!selectedMemberId || loading}>
              {loading ? 'Assigning...' : 'Assign Team Member'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Team Member Dialog */}
      <AlertDialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <strong>{actionMember?.fullName}</strong> as a team member? 
              They will become a regular member and won't be able to post on behalf of the pod.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveTeamMember} disabled={loading}>
              {loading ? 'Removing...' : 'Remove'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PodMembers;
