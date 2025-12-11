import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ArrowLeft, Plus, MessageSquare, ChevronRight, Send, Loader2, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { Question, Answer, Room } from '@/types';
import { roomsApi } from '@/services/api/rooms';
import { useToast } from '@/hooks/use-toast';
import EditRoomDialog from '@/components/EditRoomDialog';

const RoomQA = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [room, setRoom] = useState<Room | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [isAddQuestionOpen, setIsAddQuestionOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [answering, setAnswering] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!roomId) return;
    fetchRoomData();
    fetchQuestions();
  }, [roomId]);

  const fetchRoomData = async () => {
    if (!roomId) return;

    try {
      const roomData = await roomsApi.getRoomById(roomId);
      setRoom(roomData);
    } catch (error: any) {
      console.error('Error fetching room:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load room',
        variant: 'destructive',
      });
      navigate('/rooms');
    }
  };

  const fetchQuestions = async () => {
    if (!roomId) return;

    try {
      setLoading(true);
      const fetchedQuestions = await roomsApi.getRoomQuestions(roomId);
      setQuestions(fetchedQuestions);
    } catch (error: any) {
      console.error('Error fetching questions:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load questions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = async () => {
    if (!newQuestion.trim() || !roomId) {
      toast({
        title: 'Error',
        description: 'Please enter a question',
        variant: 'destructive',
      });
      return;
    }

    try {
      setPosting(true);
      const createdQuestion = await roomsApi.createQuestion(roomId, newQuestion);
      setQuestions([createdQuestion, ...questions]);
      setNewQuestion('');
      setIsAddQuestionOpen(false);
      toast({
        title: 'Success',
        description: 'Question posted successfully',
      });
    } catch (error: any) {
      console.error('Error posting question:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to post question',
        variant: 'destructive',
      });
    } finally {
      setPosting(false);
    }
  };

  const handleAddAnswer = async () => {
    if (!newAnswer.trim() || !selectedQuestion || !roomId) {
      toast({
        title: 'Error',
        description: 'Please enter an answer',
        variant: 'destructive',
      });
      return;
    }

    try {
      setAnswering(true);
      const createdAnswer = await roomsApi.createAnswer(roomId, selectedQuestion.id, newAnswer);
      
      // Update questions list
      setQuestions(questions.map((q) =>
        q.id === selectedQuestion.id
          ? { ...q, answers: [...q.answers, createdAnswer] }
          : q
      ));
      
      // Update selected question
      setSelectedQuestion({ 
        ...selectedQuestion, 
        answers: [...selectedQuestion.answers, createdAnswer] 
      });
      
      setNewAnswer('');
      toast({
        title: 'Success',
        description: 'Answer posted successfully',
      });
    } catch (error: any) {
      console.error('Error posting answer:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to post answer',
        variant: 'destructive',
      });
    } finally {
      setAnswering(false);
    }
  };

  const handleUpdateRoom = (updatedRoom: Room) => {
    setRoom(updatedRoom);
  };

  const handleDeleteRoom = async () => {
    if (!roomId) return;

    setIsDeleting(true);
    try {
      await roomsApi.deleteRoom(roomId);
      toast({
        title: 'Success',
        description: 'Room deleted successfully',
      });
      navigate(`/pods/${room?.podId}`);
    } catch (error: any) {
      console.error('Error deleting room:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete room',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const isPodOwner = room?.pod?.ownerId === user?.id;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (selectedQuestion) {
    const questionDate = new Date(selectedQuestion.createdAt);
    
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
          <div className="flex items-center gap-3 p-4">
            <Button variant="ghost" size="icon" onClick={() => setSelectedQuestion(null)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="font-semibold text-foreground">Question Thread</h1>
          </div>
        </header>

        {/* Question */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 border-b border-border">
            <div className="flex items-start gap-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={selectedQuestion.author.profilePhoto} />
                <AvatarFallback>{selectedQuestion.author.fullName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-foreground">{selectedQuestion.author.fullName}</p>
                <p className="text-sm text-muted-foreground">
                  {questionDate.toLocaleDateString()}
                </p>
                <p className="mt-2 text-foreground">{selectedQuestion.content}</p>
              </div>
            </div>
          </div>

          {/* Answers */}
          <div className="p-4">
            <h3 className="font-semibold text-foreground mb-4">
              {selectedQuestion.answers.length} {selectedQuestion.answers.length === 1 ? 'Answer' : 'Answers'}
            </h3>
            <div className="space-y-4">
              {selectedQuestion.answers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No answers yet. Be the first to answer!</p>
                </div>
              ) : (
                selectedQuestion.answers.map((answer) => {
                  const answerDate = new Date(answer.createdAt);
                  return (
                    <Card key={answer.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={answer.author.profilePhoto} />
                            <AvatarFallback>{answer.author.fullName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-foreground text-sm">{answer.author.fullName}</p>
                              <p className="text-xs text-muted-foreground">
                                {answerDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                            <p className="mt-1 text-foreground text-sm whitespace-pre-wrap">{answer.content}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        </main>

        {/* Answer Input */}
        <div className="sticky bottom-0 bg-background border-t border-border p-4">
          <div className="flex gap-2 max-w-2xl mx-auto">
            <Textarea
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
              placeholder="Write your answer..."
              className="flex-1 resize-none"
              rows={2}
              disabled={answering}
            />
            <Button 
              variant="hero" 
              size="icon" 
              onClick={handleAddAnswer} 
              disabled={!newAnswer.trim() || answering}
              className="self-end"
            >
              {answering ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/rooms')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-semibold text-foreground">{room?.name || 'Q&A Room'}</h1>
              {room?.pod && (
                <p className="text-sm text-muted-foreground">{room.pod.name}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {room?.privacy === 'PRIVATE' && isPodOwner && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate(`/rooms/${roomId}/join-requests`)}
              >
                Requests
              </Button>
            )}
            <Dialog open={isAddQuestionOpen} onOpenChange={setIsAddQuestionOpen}>
              <DialogTrigger asChild>
                <Button variant="hero" size="sm">
                  <Plus className="w-4 h-4" />
                  Ask
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Ask a Question</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <Textarea
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    placeholder="What would you like to know?"
                    rows={4}
                    disabled={posting}
                  />
                  <Button 
                    variant="hero" 
                    className="w-full" 
                    onClick={handleAddQuestion}
                    disabled={posting}
                  >
                    {posting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Posting...
                      </>
                    ) : (
                      'Post Question'
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            {isPodOwner && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit Room
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => setIsDeleteDialogOpen(true)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Room
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </header>

      {/* Questions List */}
      <main className="flex-1 overflow-y-auto p-4 space-y-3">
        {questions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No questions yet. Be the first to ask!</p>
          </div>
        ) : (
          questions.map((question) => {
            const questionDate = new Date(question.createdAt);
            return (
              <Card
                key={question.id}
                className="cursor-pointer card-hover"
                onClick={() => setSelectedQuestion(question)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="w-10 h-10 shrink-0">
                      <AvatarImage src={question.author.profilePhoto} />
                      <AvatarFallback>{question.author.fullName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground text-sm">{question.author.fullName}</p>
                        <p className="text-xs text-muted-foreground">
                          {questionDate.toLocaleDateString()}
                        </p>
                      </div>
                      <p className="mt-1 text-foreground line-clamp-2">{question.content}</p>
                      <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                        <MessageSquare className="w-4 h-4" />
                        {question.answers.length} {question.answers.length === 1 ? 'answer' : 'answers'}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </main>

      {/* Edit Room Dialog */}
      {room && (
        <EditRoomDialog
          room={room}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onUpdate={handleUpdateRoom}
        />
      )}

      {/* Delete Room Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Room?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{room?.name}"? This action cannot be undone.
              All questions, answers, and data in this room will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRoom}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete Room'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default RoomQA;
