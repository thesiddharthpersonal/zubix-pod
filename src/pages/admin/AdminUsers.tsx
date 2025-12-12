import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { adminApi, AdminUser } from '@/services/api/admin';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { ArrowLeft, Search, Trash2, ChevronLeft, ChevronRight, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AdminUsers = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const limit = 20;

  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'ADMIN')) {
      navigate('/');
      return;
    }
    fetchUsers();
  }, [user, page, search, roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getUsers({ page, limit, search, role: roleFilter });
      setUsers(data.users);
      setTotal(data.total);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({ title: 'Error', description: 'Failed to load users', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await adminApi.updateUserRole(userId, newRole);
      toast({ title: 'Success', description: 'User role updated' });
      fetchUsers();
    } catch (error) {
      console.error('Error updating role:', error);
      toast({ title: 'Error', description: 'Failed to update role', variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    if (!deleteUserId) return;
    
    try {
      await adminApi.deleteUser(deleteUserId);
      toast({ title: 'Success', description: 'User deleted' });
      setDeleteUserId(null);
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({ title: 'Error', description: 'Failed to delete user', variant: 'destructive' });
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'pod_owner': return 'default';
      default: return 'secondary';
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center gap-3 p-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">User Management</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="pod_owner">Pod Owner</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Users List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {users.map((u) => (
                <Card key={u.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={u.avatar || undefined} />
                        <AvatarFallback>{u.fullName[0]}</AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium truncate">{u.fullName}</p>
                          <Badge variant={getRoleBadgeVariant(u.role)}>{u.role}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">@{u.username}</p>
                        <p className="text-sm text-muted-foreground">{u.email}</p>
                        <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                          <span>{u._count.posts} posts</span>
                          <span>{u._count.ownedPods} pods owned</span>
                          <span>Joined {new Date(u.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Select value={u.role} onValueChange={(role) => handleRoleChange(u.id, role)}>
                          <SelectTrigger className="w-[140px]">
                            <Shield className="w-4 h-4 mr-2" />
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="pod_owner">Pod Owner</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteUserId(u.id)}
                          disabled={u.id === user?.id}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-muted-foreground">
                Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} users
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPage(p => p + 1)}
                  disabled={page * limit >= total}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
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

export default AdminUsers;
