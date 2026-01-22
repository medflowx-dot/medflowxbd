import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useUpdatePlatformSetting } from '@/hooks/useOwnerData';
import { toast } from 'sonner';
import { Upload, X, Loader2, ImageIcon, Globe, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface AssetUploadProps {
  label: string;
  description: string;
  currentUrl: string | null;
  settingKey: string;
  folder: string;
  icon?: React.ReactNode;
  recommended?: string;
}

function AssetUpload({ label, description, currentUrl, settingKey, folder, icon, recommended }: AssetUploadProps) {
  const updateSetting = useUpdatePlatformSetting();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentUrl);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

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
      const fileName = `${folder}/${Date.now()}.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('platform-assets')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('platform-assets')
        .getPublicUrl(fileName);

      // Update platform setting with new URL
      await updateSetting.mutateAsync({
        settingKey,
        value: `"${publicUrl}"`,
      });

      setPreviewUrl(publicUrl);
      toast.success(`${label} uploaded successfully`);
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error('Failed to upload: ' + error.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = async () => {
    setUploading(true);

    try {
      await updateSetting.mutateAsync({
        settingKey,
        value: null,
      });
      setPreviewUrl(null);
      toast.success(`${label} removed successfully`);
    } catch (error: any) {
      toast.error('Failed to remove: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-start gap-4 p-4 rounded-lg border bg-card">
      <Avatar className="h-16 w-16 rounded-lg shrink-0">
        <AvatarImage src={previewUrl || undefined} alt={label} className="object-contain" />
        <AvatarFallback className="rounded-lg bg-muted">
          {icon || <ImageIcon className="h-6 w-6 text-muted-foreground" />}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 space-y-2">
        <div>
          <Label className="font-medium">{label}</Label>
          <p className="text-xs text-muted-foreground">{description}</p>
          {recommended && (
            <p className="text-xs text-primary">{recommended}</p>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />

        <div className="flex gap-2">
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
            {previewUrl ? 'Change' : 'Upload'}
          </Button>

          {previewUrl && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              disabled={uploading}
              className="text-destructive hover:text-destructive"
            >
              <X className="h-4 w-4 mr-2" />
              Remove
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

interface PlatformBrandingUploadProps {
  settings: Record<string, any>;
}

export function PlatformBrandingUpload({ settings }: PlatformBrandingUploadProps) {
  const getSettingUrl = (key: string): string | null => {
    const value = settings[key];
    if (!value) return null;
    return String(value).replace(/"/g, '');
  };

  return (
    <Card className="border-0 shadow-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" />
          <div>
            <CardTitle>Platform Branding Assets</CardTitle>
            <CardDescription>
              Upload logos and favicon that will be used across the entire platform
            </CardDescription>
          </div>
        </div>
        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Auto Save
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <AssetUpload
          label="Primary Logo (Light Mode)"
          description="Main logo displayed on light backgrounds (Navbar, Landing page)"
          currentUrl={getSettingUrl('platform_logo_light')}
          settingKey="platform_logo_light"
          folder="logos"
          recommended="Recommended: 200x60px, transparent PNG"
        />

        <AssetUpload
          label="Primary Logo (Dark Mode)"
          description="Logo displayed on dark backgrounds and dark theme"
          currentUrl={getSettingUrl('platform_logo_dark')}
          settingKey="platform_logo_dark"
          folder="logos"
          recommended="Recommended: 200x60px, transparent PNG"
        />

        <AssetUpload
          label="Auth Logo / Square Logo"
          description="Used on Login, Signup, Dashboard fallback, and system pages"
          currentUrl={getSettingUrl('platform_logo_auth')}
          settingKey="platform_logo_auth"
          folder="logos"
          recommended="Recommended: 200x200px, square with padding"
        />

        <AssetUpload
          label="Favicon"
          description="Browser tab icon (will update after site refresh)"
          currentUrl={getSettingUrl('platform_favicon')}
          settingKey="platform_favicon"
          folder="favicon"
          recommended="Recommended: 32x32px or 64x64px, PNG or ICO"
        />

        <AssetUpload
          label="OG Image (Social Share)"
          description="Image shown when sharing links on social media"
          currentUrl={getSettingUrl('platform_og_image')}
          settingKey="platform_og_image"
          folder="og"
          recommended="Recommended: 1200x630px, JPG or PNG"
        />

        <AssetUpload
          label="PWA Icon (192x192)"
          description="App icon for mobile home screen (small)"
          currentUrl={getSettingUrl('platform_pwa_192')}
          settingKey="platform_pwa_192"
          folder="pwa"
          recommended="Required: 192x192px, PNG"
        />

        <AssetUpload
          label="PWA Icon (512x512)"
          description="App icon for mobile home screen (large/splash)"
          currentUrl={getSettingUrl('platform_pwa_512')}
          settingKey="platform_pwa_512"
          folder="pwa"
          recommended="Required: 512x512px, PNG"
        />
      </CardContent>
    </Card>
  );
}
