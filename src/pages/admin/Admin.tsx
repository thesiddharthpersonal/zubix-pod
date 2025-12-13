import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { useEffect, useState } from 'react';
import { adminApi, AdminStats } from '@/services/api/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, FolderKanban, FileText, Calendar, MessageSquare, TrendingUp, ArrowLeft, LogOut, Bell } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Admin = () => {
  const navigate = useNavigate();
  const { admin, logout } = useAdminAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!admin) {
      navigate('/admin/login');
      return;
    }

    fetchStats();
  }, [admin, navigate]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast({ title: 'Error', description: 'Failed to load statistics', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, onClick, alert }: any) => (
    <Card className={`cursor-pointer hover:shadow-lg transition-shadow ${alert ? 'border-orange-500 border-2' : ''}`} onClick={onClick}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`w-4 h-4 ${alert ? 'text-orange-500' : 'text-muted-foreground'}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && <p className={`text-xs ${alert ? 'text-orange-600 font-semibold' : 'text-muted-foreground'}`}>{subtitle}</p>}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-foreground">Admin Dashboard</h1>
          </div>
          <Button variant="outline" size="sm" onClick={logout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Welcome Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Welcome, {admin?.name || 'Admin'}</h2>
          <p className="text-muted-foreground">Manage your platform from here</p>
        </div>

        {/* Active Users Metrics - Highlighted Section */}
        <Card className="mb-6 border-primary/50 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Active Users Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-background rounded-lg p-4 border border-border">
                <div className="text-sm text-muted-foreground mb-1">Daily Active Users (DAU)</div>
                <div className="text-3xl font-bold text-primary">{stats?.users.dau || 0}</div>
                <div className="text-xs text-muted-foreground mt-1">Last 24 hours</div>
              </div>
              <div className="bg-background rounded-lg p-4 border border-border">
                <div className="text-sm text-muted-foreground mb-1">Weekly Active Users (WAU)</div>
                <div className="text-3xl font-bold text-primary">{stats?.users.wau || 0}</div>
                <div className="text-xs text-muted-foreground mt-1">Last 7 days</div>
              </div>
              <div className="bg-background rounded-lg p-4 border border-border">
                <div className="text-sm text-muted-foreground mb-1">Monthly Active Users (MAU)</div>
                <div className="text-3xl font-bold text-primary">{stats?.users.mau || 0}</div>
                <div className="text-xs text-muted-foreground mt-1">Last 30 days</div>
              </div>
            </div>
            {stats?.users.total && stats?.users.mau ? (
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Engagement Rate: <span className="font-semibold text-foreground">{((stats.users.mau / stats.users.total) * 100).toFixed(1)}%</span>
                    <span className="text-xs ml-2">(MAU / Total Users)</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => navigate('/admin/metrics')}>
                    <TrendingUp className="w-4 h-4 mr-2" />
                    View Detailed Metrics
                  </Button>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <StatCard
            icon={Users}
            title="Total Users"
            value={stats?.users.total || 0}
            subtitle={`${stats?.users.recent || 0} new this week`}
            onClick={() => navigate('/admin/users')}
          />
          <StatCard
            icon={FolderKanban}
            title="Total Pods"
            value={stats?.pods.total || 0}
            subtitle={`${stats?.pods.pending || 0} pending approval`}
            onClick={() => navigate('/admin/pods')}
            alert={stats?.pods.pending ? stats.pods.pending > 0 : false}
          />
          <StatCard
            icon={FileText}
            title="Total Posts"
            value={stats?.posts.total || 0}
            subtitle={`${stats?.posts.today || 0} today • ${stats?.posts.thisWeek || 0} this week`}
            onClick={() => navigate('/admin/posts')}
          />
          <StatCard
            icon={Calendar}
            title="Total Events"
            value={stats?.events.total || 0}
            subtitle={`${stats?.events.thisWeek || 0} this week • ${stats?.events.thisMonth || 0} this month`}
            onClick={() => navigate('/admin/events')}
          />
          <StatCard
            icon={MessageSquare}
            title="Total Rooms"
            value={stats?.rooms.total || 0}
            onClick={() => navigate('/admin/rooms')}
          />
          <StatCard
            icon={TrendingUp}
            title="Total Chats"
            value={stats?.chats.total || 0}
          />
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <Button variant="outline" onClick={() => navigate('/admin/users')} className="justify-start">
              <Users className="w-4 h-4 mr-2" />
              Manage Users
            </Button>
            <Button variant="outline" onClick={() => navigate('/admin/pods')} className="justify-start">
              <FolderKanban className="w-4 h-4 mr-2" />
              Manage Pods
            </Button>
            <Button variant="outline" onClick={() => navigate('/admin/posts')} className="justify-start">
              <FileText className="w-4 h-4 mr-2" />
              Manage Posts
            </Button>
            <Button variant="outline" onClick={() => navigate('/admin/events')} className="justify-start">
              <Calendar className="w-4 h-4 mr-2" />
              Manage Events
            </Button>
            <Button variant="outline" onClick={() => navigate('/admin/rooms')} className="justify-start">
              <MessageSquare className="w-4 h-4 mr-2" />
              Manage Rooms
            </Button>
            <Button variant="default" onClick={() => navigate('/admin/notifications')} className="justify-start">
              <Bell className="w-4 h-4 mr-2" />
              Send Notifications
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Admin;
