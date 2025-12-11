import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { roomsApi } from '@/services/api/rooms';
import { useToast } from '@/hooks/use-toast';
import { Room } from '@/types';

interface EditRoomDialogProps {
  room: Room;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (updatedRoom: Room) => void;
}

export default function EditRoomDialog({
  room,
  open,
  onOpenChange,
  onUpdate,
}: EditRoomDialogProps) {
  const [name, setName] = useState(room.name);
  const [description, setDescription] = useState(room.description || '');
  const [privacy, setPrivacy] = useState<'PUBLIC' | 'PRIVATE'>(room.privacy || 'PUBLIC');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Update form when room changes
  useEffect(() => {
    setName(room.name);
    setDescription(room.description || '');
    setPrivacy(room.privacy || 'PUBLIC');
  }, [room]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast({
        title: 'Error',
        description: 'Room name is required',
        variant: 'destructive',
      });
      return;
    }

    if (name.trim().length < 3) {
      toast({
        title: 'Error',
        description: 'Room name must be at least 3 characters',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const updatedRoom = await roomsApi.updateRoom(room.id, {
        name: name.trim(),
        description: description.trim() || undefined,
        privacy,
      });

      toast({
        title: 'Success',
        description: 'Room updated successfully',
      });

      onUpdate(updatedRoom);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to update room:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update room',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Room</DialogTitle>
          <DialogDescription>
            Update room details. Changes will be visible to all members.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Room Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter room name"
              disabled={isLoading}
              required
              minLength={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this room is for (optional)"
              disabled={isLoading}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="privacy">Privacy</Label>
            <Select value={privacy} onValueChange={(value) => setPrivacy(value as 'PUBLIC' | 'PRIVATE')} disabled={isLoading}>
              <SelectTrigger id="privacy">
                <SelectValue placeholder="Select privacy" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PUBLIC">Public - Anyone in the pod can join</SelectItem>
                <SelectItem value="PRIVATE">Private - Requires approval to join</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update Room'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
