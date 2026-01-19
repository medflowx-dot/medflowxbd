import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, Loader2, Plus, Trash2 } from 'lucide-react';
import ImagePicker from './ImagePicker';

interface HeroContent {
  title: string;
  subtitle: string;
  primary_cta: string;
  secondary_cta: string;
  badge_text: string;
  trust_items: string[];
  hero_image?: string;
}

interface HeroEditorProps {
  content: HeroContent;
  onSave: (content: HeroContent) => Promise<void>;
  isSaving: boolean;
}

export default function HeroEditor({ content, onSave, isSaving }: HeroEditorProps) {
  const [formData, setFormData] = useState<HeroContent>({
    title: '',
    subtitle: '',
    primary_cta: '',
    secondary_cta: '',
    badge_text: '',
    trust_items: [],
    hero_image: '',
  });

  useEffect(() => {
    if (content) {
      setFormData({
        title: content.title || '',
        subtitle: content.subtitle || '',
        primary_cta: content.primary_cta || '',
        secondary_cta: content.secondary_cta || '',
        badge_text: content.badge_text || '',
        trust_items: content.trust_items || [],
        hero_image: content.hero_image || '',
      });
    }
  }, [content]);

  const handleChange = (field: keyof HeroContent, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTrustItemChange = (index: number, value: string) => {
    const newItems = [...formData.trust_items];
    newItems[index] = value;
    setFormData(prev => ({ ...prev, trust_items: newItems }));
  };

  const addTrustItem = () => {
    setFormData(prev => ({ ...prev, trust_items: [...prev.trust_items, ''] }));
  };

  const removeTrustItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      trust_items: prev.trust_items.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Main Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Enter hero title..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subtitle">Subtitle</Label>
            <Textarea
              id="subtitle"
              value={formData.subtitle}
              onChange={(e) => handleChange('subtitle', e.target.value)}
              placeholder="Enter hero subtitle..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="badge_text">Badge Text</Label>
            <Input
              id="badge_text"
              value={formData.badge_text}
              onChange={(e) => handleChange('badge_text', e.target.value)}
              placeholder="e.g., #1 Pharmacy Software"
            />
          </div>

          <ImagePicker
            label="Hero Image (Optional)"
            value={formData.hero_image || ''}
            onChange={(url) => handleChange('hero_image', url)}
            placeholder="Select or enter hero image URL"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Call to Action Buttons</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="primary_cta">Primary CTA</Label>
              <Input
                id="primary_cta"
                value={formData.primary_cta}
                onChange={(e) => handleChange('primary_cta', e.target.value)}
                placeholder="e.g., Start Free Trial"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="secondary_cta">Secondary CTA</Label>
              <Input
                id="secondary_cta"
                value={formData.secondary_cta}
                onChange={(e) => handleChange('secondary_cta', e.target.value)}
                placeholder="e.g., Watch Demo"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            Trust Items
            <Button type="button" size="sm" variant="outline" onClick={addTrustItem}>
              <Plus className="h-4 w-4 mr-1" />
              Add Item
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {formData.trust_items.map((item, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={item}
                onChange={(e) => handleTrustItemChange(index, e.target.value)}
                placeholder="e.g., No credit card required"
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => removeTrustItem(index)}
                className="shrink-0 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {formData.trust_items.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No trust items added. Click "Add Item" to add one.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSaving}>
          {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>
    </form>
  );
}
