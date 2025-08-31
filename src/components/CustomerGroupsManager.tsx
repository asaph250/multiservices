
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Users } from 'lucide-react';
import { useCustomerGroups } from '@/hooks/useCustomerGroups';
import { CustomerGroupDialog } from './CustomerGroupDialog';

export const CustomerGroupsManager = () => {
  const { groups, loading, createGroup, updateGroup, deleteGroup } = useCustomerGroups();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);

  const handleCreateGroup = async (groupData) => {
    await createGroup(groupData);
  };

  const handleEditGroup = (group) => {
    setEditingGroup(group);
    setDialogOpen(true);
  };

  const handleUpdateGroup = async (groupData) => {
    if (editingGroup) {
      await updateGroup(editingGroup.id, groupData);
      setEditingGroup(null);
    }
  };

  const handleDeleteGroup = async (id: string) => {
    if (confirm('Are you sure you want to delete this group? This will remove all customers from the group.')) {
      await deleteGroup(id);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading groups...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-600" />
                <span>Customer Groups</span>
              </CardTitle>
              <CardDescription>Organize your customers into groups for targeted messaging</CardDescription>
            </div>
            <Button onClick={() => setDialogOpen(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Group
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {groups.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No groups yet</h3>
              <p className="text-gray-600 mb-4">Create your first customer group to organize your contacts.</p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Group
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groups.map((group) => (
                <div key={group.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: group.color }}
                      />
                      <h3 className="font-semibold text-gray-900">{group.name}</h3>
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditGroup(group)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteGroup(group.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {group.description && (
                    <p className="text-sm text-gray-600 mb-3">{group.description}</p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">
                      {group.customer_count || 0} customers
                    </Badge>
                    <span className="text-xs text-gray-500">
                      Created {new Date(group.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <CustomerGroupDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingGroup(null);
        }}
        onSave={editingGroup ? handleUpdateGroup : handleCreateGroup}
        group={editingGroup}
      />
    </>
  );
};
