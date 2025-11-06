import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UserCog, UserCheck, UserX } from 'lucide-react';

type Role = 'admin' | 'teacher' | 'student' | 'inspector' | 'auditor';

interface UserRoleManagerProps {
  userId?: string;
  currentRole?: Role;
  onSuccess?: () => void;
}

export function UserRoleManager({ userId: initialUserId, currentRole, onSuccess }: UserRoleManagerProps) {
  const [userId, setUserId] = useState(initialUserId || '');
  const [selectedRole, setSelectedRole] = useState<Role | ''>('');
  const [action, setAction] = useState<'assign' | 'remove'>('assign');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleRoleChange = async () => {
    if (!userId) {
      toast({
        title: 'Error',
        description: 'User ID is required',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedRole) {
      toast({
        title: 'Error',
        description: 'Please select a role',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      console.log(`Calling assign-user-role function with action: ${action}, role: ${selectedRole}, userId: ${userId}`);

      const { data, error } = await supabase.functions.invoke('assign-user-role', {
        body: {
          user_id: userId,
          role: selectedRole,
          action,
        },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Failed to update role');

      console.log('Role update successful:', data);

      toast({
        title: 'Success',
        description: data.message || `Role ${action === 'assign' ? 'assigned' : 'removed'} successfully`,
      });

      // Reset form if not in edit mode
      if (!initialUserId) {
        setUserId('');
        setSelectedRole('');
      }

      onSuccess?.();
    } catch (error: any) {
      console.error('Error updating role:', error);
      
      let errorMessage = 'Failed to update user role';
      if (error.message?.includes('Unauthorized') || error.message?.includes('Admin role required')) {
        errorMessage = 'You do not have permission to assign roles. Admin access required.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <UserCog className="h-5 w-5 text-primary" />
          <CardTitle>Manage User Role</CardTitle>
        </div>
        <CardDescription>
          Assign or remove user roles. Only admins can perform this action.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="action">Action</Label>
          <Select value={action} onValueChange={(value: 'assign' | 'remove') => setAction(value)}>
            <SelectTrigger id="action">
              <SelectValue placeholder="Select action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="assign">
                <div className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4" />
                  Assign Role
                </div>
              </SelectItem>
              <SelectItem value="remove">
                <div className="flex items-center gap-2">
                  <UserX className="h-4 w-4" />
                  Remove Role
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {!initialUserId && (
          <div className="space-y-2">
            <Label htmlFor="userId">User ID</Label>
            <Input
              id="userId"
              type="text"
              placeholder="Enter user UUID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              disabled={loading}
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <Select value={selectedRole} onValueChange={(value: Role) => setSelectedRole(value)}>
            <SelectTrigger id="role">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="student">Student</SelectItem>
              <SelectItem value="teacher">Teacher</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="inspector">Inspector</SelectItem>
              <SelectItem value="auditor">Auditor</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {currentRole && (
          <div className="rounded-md bg-muted p-3 text-sm">
            <p className="text-muted-foreground">
              Current Role: <span className="font-semibold text-foreground">{currentRole}</span>
            </p>
          </div>
        )}

        <Button 
          onClick={handleRoleChange} 
          disabled={loading || !selectedRole || !userId}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              {action === 'assign' ? 'Assign Role' : 'Remove Role'}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
