import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { User } from '@/types';
import { Send } from 'lucide-react';
import { messageRequestApi } from '@/services/api';
import { toast } from 'sonner';

interface SendMessageDialogProps {
  user: User | null;
  currentUserId: string | undefined;
  isOpen: boolean;
  onClose: () => void;
}

const SendMessageDialog = ({ user, currentUserId, isOpen, onClose }: SendMessageDialogProps) => {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSendRequest = async () => {
    if (!message.trim() || !user || !currentUserId) return;

    setIsSending(true);
    try {
      await messageRequestApi.sendRequest(currentUserId, {
        receiverId: user.id,
        initialMessage: message.trim(),
      });

      toast.success('Message request sent successfully!');
      setMessage('');
      onClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message request';
      
      // Handle specific error messages
      if (errorMessage.includes('already sent')) {
        toast.error('You already sent a message request to this user');
      } else if (errorMessage.includes('already exists')) {
        toast.error('You already have a chat with this user');
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsSending(false);
    }
  };

  const handleClose = () => {
    setMessage('');
    onClose();
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Send Message Request</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* User Info */}
          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <Avatar className="w-12 h-12">
              <AvatarImage src={user.profilePhoto} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {user.fullName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">{user.fullName}</p>
              <p className="text-sm text-muted-foreground truncate">@{user.username}</p>
            </div>
          </div>

          {/* Message Input */}
          <div className="space-y-2">
            <label htmlFor="message" className="text-sm font-medium text-foreground">
              Your Message
            </label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write a message to introduce yourself..."
              className="min-h-[120px] resize-none"
              disabled={isSending}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">
              {message.length}/500
            </p>
          </div>

          {/* Info Message */}
          <div className="p-3 bg-primary/5 border border-primary/10 rounded-lg">
            <p className="text-xs text-muted-foreground">
              {user.fullName} will receive your message request and can choose to accept or decline it. 
              You'll be able to chat once they accept.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isSending}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="hero"
              onClick={handleSendRequest}
              disabled={!message.trim() || isSending}
              className="flex-1"
            >
              {isSending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Request
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SendMessageDialog;
