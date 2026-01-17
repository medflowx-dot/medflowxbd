import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUpdateProfile } from '@/hooks/useProfile';
import { toast } from 'sonner';
import { Upload, X, Loader2, Store } from 'lucide-react';

interface PharmacyLogoUploadProps {
  currentLogo: string | null;
  pharmacyName: string | null;
}

export function PharmacyLogoUpload({ currentLogo, pharmacyName }: PharmacyLogoUploadProps) {
  const { user } = useAuth();
  const updateProfile = useUpdateProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentLogo);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user?.id) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size must be less than 2MB');
      return;
    }

    setUploading(true);

    try {
      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('pharmacy-logos')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('pharmacy-logos')
        .getPublicUrl(fileName);

      // Update profile with new logo URL
      await updateProfile.mutateAsync({ pharmacy_logo: publicUrl } as any);

      setPreviewUrl(publicUrl);
      toast.success('Logo uploaded successfully');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error('Failed to upload logo: ' + error.message);
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveLogo = async () => {
    if (!user?.id) return;

    setUploading(true);

    try {
      // Update profile to remove logo
      await updateProfile.mutateAsync({ pharmacy_logo: null } as any);
      setPreviewUrl(null);
      toast.success('Logo removed successfully');
    } catch (error: any) {
      toast.error('Failed to remove logo: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const initials = pharmacyName?.slice(0, 2).toUpperCase() || 'PH';

  return (
    <div className="space-y-4">
      <Label>Pharmacy Logo</Label>
      <div className="flex items-center gap-4">
        <Avatar className="h-20 w-20 rounded-lg">
          <AvatarImage src={previewUrl || undefined} alt="Pharmacy logo" className="object-cover" />
          <AvatarFallback className="rounded-lg bg-primary/10 text-primary text-xl">
            {previewUrl ? <Store className="h-8 w-8" /> : initials}
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-col gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Upload className="h-4 w-4 mr-2" />
            )}
            {previewUrl ? 'Change Logo' : 'Upload Logo'}
          </Button>

          {previewUrl && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemoveLogo}
              disabled={uploading}
              className="text-destructive hover:text-destructive"
            >
              <X className="h-4 w-4 mr-2" />
              Remove Logo
            </Button>
          )}

          <p className="text-xs text-muted-foreground">
            PNG, JPG up to 2MB. Recommended: 200x200px
          </p>
        </div>
      </div>
    </div>
  );
}
