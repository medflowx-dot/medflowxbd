import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Image, FolderOpen, X } from 'lucide-react';
import MediaLibrary from './MediaLibrary';

interface ImagePickerProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
}

export default function ImagePicker({ label, value, onChange, placeholder }: ImagePickerProps) {
  const [showLibrary, setShowLibrary] = useState(false);

  const handleClear = () => {
    onChange('');
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      
      {/* Preview */}
      {value && (
        <div className="relative w-full max-w-xs rounded-lg overflow-hidden border bg-muted">
          <img 
            src={value} 
            alt="Preview" 
            className="w-full h-32 object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder.svg';
            }}
          />
          <Button
            type="button"
            size="icon"
            variant="destructive"
            className="absolute top-2 right-2 h-6 w-6"
            onClick={handleClear}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Input with browse button */}
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || 'Enter image URL or browse...'}
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowLibrary(true)}
        >
          <FolderOpen className="h-4 w-4 mr-2" />
          Browse
        </Button>
      </div>

      {/* Media Library Dialog */}
      <MediaLibrary
        open={showLibrary}
        onOpenChange={setShowLibrary}
        onSelect={onChange}
        currentImage={value}
      />
    </div>
  );
}
