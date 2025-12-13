import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Image, Video, Send, Plus, ArrowLeft } from 'lucide-react';
import { postsApi, uploadApi } from '@/services/api';
import { toast } from 'sonner';
import MentionInput from '@/components/MentionInput';

const CreatePost = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, joinedPods } = useAuth();
  const [postToPodId, setPostToPodId] = useState<string>('');
  const [newPostContent, setNewPostContent] = useState('');
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [uploadingMedia, setUploadingMedia] = useState(false);

  // If a podId is passed via navigation state, pre-select it
  useEffect(() => {
    const selectedPodId = location.state?.podId;
    if (selectedPodId) {
      setPostToPodId(selectedPodId);
    }
  }, [location.state]);

  const compressImage = async (file: File, maxSizeMB: number): Promise<File> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          const maxDimension = 1920;
          if (width > height && width > maxDimension) {
            height = (height * maxDimension) / width;
            width = maxDimension;
          } else if (height > maxDimension) {
            width = (width * maxDimension) / height;
            height = maxDimension;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          let quality = 0.9;
          const tryCompress = () => {
            canvas.toBlob(
              (blob) => {
                if (blob) {
                  const sizeMB = blob.size / (1024 * 1024);
                  if (sizeMB > maxSizeMB && quality > 0.1) {
                    quality -= 0.1;
                    tryCompress();
                  } else {
                    const compressedFile = new File([blob], file.name, {
                      type: 'image/jpeg',
                      lastModified: Date.now(),
                    });
                    resolve(compressedFile);
                  }
                }
              },
              'image/jpeg',
              quality
            );
          };
          tryCompress();
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleMediaSelect = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const validVideoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-m4v', 'video/hevc'];
    const validTypes = type === 'image' ? validImageTypes : validVideoTypes;

    const invalidFiles = files.filter(file => !validTypes.includes(file.type));
    if (invalidFiles.length > 0) {
      toast.error(`Invalid ${type} file type`);
      return;
    }

    const maxSize = type === 'image' ? 5 * 1024 * 1024 : 50 * 1024 * 1024;
    const processedFiles: File[] = [];

    for (const file of files) {
      if (file.size > maxSize) {
        if (type === 'image') {
          toast.info(`Compressing ${file.name}...`);
          const compressed = await compressImage(file, 5);
          processedFiles.push(compressed);
          toast.success(`${file.name} compressed successfully`);
        } else {
          toast.error(`${file.name} exceeds 50MB limit. Please use a video editing app to compress it first.`);
        }
      } else {
        processedFiles.push(file);
      }
    }

    if (processedFiles.length > 0) {
      setMediaFiles([...mediaFiles, ...processedFiles]);
    }
  };

  const removeMediaFile = (index: number) => {
    setMediaFiles(mediaFiles.filter((_, i) => i !== index));
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim() && mediaFiles.length === 0) return;
    
    if (!postToPodId) {
      toast.error('Please select a pod to post in');
      return;
    }
    
    try {
      let mediaUrls: string[] = [];

      if (mediaFiles.length > 0) {
        setUploadingMedia(true);
        try {
          mediaUrls = await Promise.all(
            mediaFiles.map(file => uploadApi.uploadFile(file, 'public'))
          );
          toast.success('Media uploaded successfully!');
        } catch (error) {
          console.error('Failed to upload media:', error);
          toast.error('Failed to upload media files');
          setUploadingMedia(false);
          return;
        }
        setUploadingMedia(false);
      }

      await postsApi.createPost({
        podId: postToPodId,
        content: newPostContent,
        mediaUrls,
      });

      toast.success('Post created successfully!');
      
      // Reset form
      setNewPostContent('');
      setMediaFiles([]);
      setPostToPodId('');
      
      // Navigate back to home
      navigate('/');
    } catch (error) {
      console.error('Failed to create post:', error);
      toast.error('Failed to create post');
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center gap-3 p-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-foreground">Create Post</h1>
        </div>
      </header>

      <main className="p-4 max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={user?.profilePhoto} />
                <AvatarFallback>{user?.fullName?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                {/* Pod Selector */}
                <div className="mb-3">
                  <Select value={postToPodId} onValueChange={setPostToPodId}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a pod to post in *" />
                    </SelectTrigger>
                    <SelectContent>
                      {joinedPods.map((pod) => (
                        <SelectItem key={pod.id} value={pod.id}>
                          {pod.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <MentionInput
                  value={newPostContent}
                  onChange={setNewPostContent}
                  placeholder="Share an update... (use @ to mention)"
                  className="min-h-[120px] resize-none border-0 p-0 focus-visible:ring-0"
                  rows={6}
                />
                {/* Media Preview */}
                {mediaFiles.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    {mediaFiles.map((file, index) => (
                      <div key={index} className="relative">
                        {file.type.startsWith('image/') ? (
                          <img
                            src={URL.createObjectURL(file)}
                            alt="Preview"
                            className="w-full h-32 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="relative w-full h-32 bg-muted rounded-lg overflow-hidden">
                            <video
                              src={URL.createObjectURL(file)}
                              className="w-full h-full object-cover"
                              preload="metadata"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                              <Video className="w-8 h-8 text-white" />
                            </div>
                            <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                              Video
                            </div>
                          </div>
                        )}
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="absolute top-1 right-1 bg-black/50 hover:bg-black/70"
                          onClick={() => removeMediaFile(index)}
                        >
                          <Plus className="w-4 h-4 text-white rotate-45" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon-sm" asChild>
                      <label className="cursor-pointer">
                        <Image className="w-5 h-5 text-muted-foreground" />
                        <input
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                          multiple
                          className="hidden"
                          onChange={(e) => handleMediaSelect(e, 'image')}
                        />
                      </label>
                    </Button>
                    <Button variant="ghost" size="icon-sm" asChild>
                      <label className="cursor-pointer">
                        <Video className="w-5 h-5 text-muted-foreground" />
                        <input
                          type="file"
                          accept="video/*"
                          multiple
                          className="hidden"
                          onChange={(e) => handleMediaSelect(e, 'video')}
                        />
                      </label>
                    </Button>
                  </div>
                  <Button
                    variant="hero"
                    size="sm"
                    onClick={handleCreatePost}
                    disabled={(!newPostContent.trim() && mediaFiles.length === 0) || uploadingMedia}
                  >
                    {uploadingMedia ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Post
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default CreatePost;
