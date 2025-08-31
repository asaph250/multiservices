
import { Button } from '@/components/ui/button';
import { Trash2, Users, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface BulkActionsBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkDelete: () => void;
  onBulkAddToGroup: () => void;
  onBulkMessage: () => void;
}

export const BulkActionsBar = ({
  selectedCount,
  onClearSelection,
  onBulkDelete,
  onBulkAddToGroup,
  onBulkMessage
}: BulkActionsBarProps) => {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {selectedCount} selected
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
              className="text-gray-500 hover:text-gray-700"
            >
              Clear
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onBulkAddToGroup}
              className="flex items-center gap-2"
            >
              <Tag className="h-4 w-4" />
              Add to Group
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onBulkMessage}
              className="flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              Send Message
            </Button>
            
            <Button
              variant="destructive"
              size="sm"
              onClick={onBulkDelete}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
