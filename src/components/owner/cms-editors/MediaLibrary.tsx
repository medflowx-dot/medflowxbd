import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';
import { Loader2, Upload, Image, Trash2, Check, X, Search, FolderOpen } from 'lucide-react';

interface MediaLibraryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (url: string) => void;
  currentImage?: string;
}

interface MediaFile {
  name: string;
  id: string;
  created_at: string;
  metadata: Record<string, any> | null;
}

export default function MediaLibrary({ open, onOpenChange, onSelect, currentImage }: MediaLibraryProps) {
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState<string | null>(currentImage || null);
  const queryClient = useQueryClient();

  const { data: files, isLoading } = useQuery({
    queryKey: ['cms-media-files'],
    queryFn: async () => {
      const { data, error } = await supabase.storage
        .from('cms-media')
        .list('', {
          limit: 100,
          sortBy: { column: 'created_at', order: 'desc' },
        });

      if (error) throw error;
      return data as MediaFile[];
    },
    enabled: open,
  });

  const deleteMutation = useMutation({
    mutationFn: async (fileName: string) => {
      const { error } = await supabase.storage
        .from('cms-media')
        .remove([fileName]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-media-files'] });
      toast({ title: 'File deleted successfully' });
    },
    onError: (error: Error) => {
      toast({ 
        title: 'Error deleting file', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });

  const handleUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an image file (JPEG, PNG, GIF, WebP)',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Maximum file size is 5MB',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    try {
      // Create unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('cms-media')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      queryClient.invalidateQueries({ queryKey: ['cms-media-files'] });
      toast({ title: 'Image uploaded successfully' });
    } catch (error: any) {
      toast({
        title: 'Upload failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      // Reset input
      event.target.value = '';
    }
  }, [queryClient]);

  const getPublicUrl = (fileName: string) => {
    const { data } = supabase.storage.from('cms-media').getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleSelect = () => {
    if (selectedFile) {
      onSelect(selectedFile);
      onOpenChange(false);
    }
  };

  const handleDelete = (fileName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this image?')) {
      deleteMutation.mutate(fileName);
      if (selectedFile === getPublicUrl(fileName)) {
        setSelectedFile(null);
      }
    }
  };

  const filteredFiles = files?.filter(file => 
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Image className="h-5 w-5" />
            Media Library
          </DialogTitle>
          <DialogDescription>
            Upload, manage, and select images for your CMS content
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="library" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="library">
              <FolderOpen className="h-4 w-4 mr-2" />
              Library
            </TabsTrigger>
            <TabsTrigger value="upload">
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </TabsTrigger>
          </TabsList>

          <TabsContent value="library" className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search images..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <ScrollArea className="h-[400px] rounded-md border p-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredFiles?.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <Image className="h-12 w-12 mb-2 opacity-50" />
                  <p>No images found</p>
                  <p className="text-sm">Upload an image to get started</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                  {filteredFiles?.map((file) => {
                    const publicUrl = getPublicUrl(file.name);
                    const isSelected = selectedFile === publicUrl;

                    return (
                      <Card
                        key={file.id}
                        className={`relative cursor-pointer transition-all hover:ring-2 hover:ring-primary/50 ${
                          isSelected ? 'ring-2 ring-primary' : ''
                        }`}
                        onClick={() => setSelectedFile(publicUrl)}
                      >
                        <CardContent className="p-2">
                          <div className="aspect-square relative overflow-hidden rounded-md bg-muted">
                            <img
                              src={publicUrl}
                              alt={file.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                            {isSelected && (
                              <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                                <div className="bg-primary text-primary-foreground rounded-full p-1">
                                  <Check className="h-4 w-4" />
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="mt-2 space-y-1">
                            <p className="text-xs font-medium truncate" title={file.name}>
                              {file.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(file.metadata?.size || 0)}
                            </p>
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="absolute top-1 right-1 h-6 w-6 bg-background/80 hover:bg-destructive hover:text-destructive-foreground"
                            onClick={(e) => handleDelete(file.name, e)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </ScrollArea>

            <div className="flex justify-between items-center pt-2 border-t">
              <p className="text-sm text-muted-foreground">
                {filteredFiles?.length || 0} image(s)
              </p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSelect} disabled={!selectedFile}>
                  <Check className="h-4 w-4 mr-2" />
                  Select Image
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="upload" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="p-4 rounded-full bg-primary/10">
                      <Upload className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Upload an image</p>
                      <p className="text-sm text-muted-foreground">
                        Supports: JPEG, PNG, GIF, WebP (max 5MB)
                      </p>
                    </div>
                    <Label htmlFor="file-upload" className="cursor-pointer">
                      <Button asChild disabled={uploading}>
                        <span>
                          {uploading ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4 mr-2" />
                              Choose File
                            </>
                          )}
                        </span>
                      </Button>
                    </Label>
                    <Input
                      id="file-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="text-sm text-muted-foreground space-y-1">
              <p>• Images will be stored in the CMS media library</p>
              <p>• Files are publicly accessible once uploaded</p>
              <p>• Use descriptive file names for better organization</p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
