import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { useEffect, useState } from 'react';
import { adminApi } from '@/services/api/admin';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { ArrowLeft, Search, Trash2, ChevronLeft, ChevronRight, Users, FileText, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AdminPods = () => {
  const navigate = useNavigate();
  const { admin } = useAdminAuth();
  const { toast } = useToast();
  const [pods, setPods] = useState<any[]>([]);
  const [pendingPods, setPendingPods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [deletePodId, setDeletePodId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'pending'>('pending');
  const limit = 20;

  useEffect(() => {
    if (!admin) {
      navigate('/admin/login');
      return;
    }
    if (activeTab === 'pending') {
      fetchPendingPods();
    } else {
      fetchPods();
    }
  }, [admin, page, search, activeTab]);

  const fetchPods = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getPods({ page, limit, search });
      setPods(data.pods);
      setTotal(data.total);
    } catch (error) {
      console.error('Error fetching pods:', error);
      toast({ title: 'Error', description: 'Failed to load pods', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingPods = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getPendingPods({ page, limit });
      setPendingPods(data.pods);
      setTotal(data.total);
    } catch (error) {
      console.error('Error fetching pending pods:', error);
      toast({ title: 'Error', description: 'Failed to load pending pods', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (podId: string) => {
    try {
      await adminApi.approvePod(podId);
      toast({ title: 'Success', description: 'Pod approved successfully' });
      fetchPendingPods();
    } catch (error) {
      console.error('Error approving pod:', error);
      toast({ title: 'Error', description: 'Failed to approve pod', variant: 'destructive' });
    }
  };

  const handleReject = async (podId: string) => {
    try {
      await adminApi.rejectPod(podId, 'Pod does not meet our guidelines');
      toast({ title: 'Success', description: 'Pod rejected and removed' });
      fetchPendingPods();
    } catch (error) {
      console.error('Error rejecting pod:', error);
      toast({ title: 'Error', description: 'Failed to reject pod', variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    if (!deletePodId) return;
    
    try {
      await adminApi.deletePod(deletePodId);
      toast({ title: 'Success', description: 'Pod deleted' });
      setDeletePodId(null);
      fetchPods();
    } catch (error) {
      console.error('Error deleting pod:', error);
      toast({ title: 'Error', description: 'Failed to delete pod', variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center gap-3 p-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">Pod Management</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === 'pending' ? 'default' : 'outline'}
            onClick={() => { setActiveTab('pending'); setPage(1); }}
          >
            Pending Approval ({total})
          </Button>
          <Button
            variant={activeTab === 'all' ? 'default' : 'outline'}
            onClick={() => { setActiveTab('all'); setPage(1); }}
          >
            All Pods
          </Button>
        </div>

        {activeTab === 'all' && (
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search pods..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {(activeTab === 'pending' ? pendingPods : pods).map((pod) => (
                <Card key={pod.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={pod.logo || undefined} />
                        <AvatarFallback>{pod.name[0]}</AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{pod.name}</p>
                        <p className="text-sm text-muted-foreground line-clamp-2">{pod.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Avatar className="w-5 h-5">
                            <AvatarImage src={pod.owner.avatar || undefined} />
                            <AvatarFallback>{pod.owner.fullName[0]}</AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-muted-foreground">by {pod.owner.fullName}</span>
                        </div>
                        <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Users className="w-3 h-3" />{pod._count.members}</span>
                          <span className="flex items-center gap-1"><FileText className="w-3 h-3" />{pod._count.posts}</span>
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{pod._count.events}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {activeTab === 'pending' ? (
                          <>
                            <Button 
                              variant="default" 
                              size="sm" 
                              onClick={() => handleApprove(pod.id)}
                            >
                              Approve
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              onClick={() => handleReject(pod.id)}
                            >
                              Reject
                            </Button>
                          </>
                        ) : (
                          <Button variant="ghost" size="icon" onClick={() => setDeletePodId(pod.id)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-muted-foreground">
                Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} pods
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => setPage(p => p + 1)} disabled={page * limit >= total}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </main>

      <AlertDialog open={!!deletePodId} onOpenChange={() => setDeletePodId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Pod</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this pod? This will also delete all associated posts, events, and rooms.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminPods;