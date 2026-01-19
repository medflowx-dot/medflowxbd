import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import SectionPreview from './SectionPreview';

interface FeatureHighlight {
  icon: string;
  title: string;
  description: string;
}

interface MobileAppContent {
  badge: string;
  title: string;
  titleHighlight: string;
  description: string;
  ctaText: string;
  waitingCount: string;
  features: FeatureHighlight[];
}

interface MobileAppEditorProps {
  content: any;
  onSave: (content: MobileAppContent) => Promise<void>;
  isSaving: boolean;
}

const iconOptions = [
  { value: 'Bell', label: 'Bell' },
  { value: 'Zap', label: 'Zap' },
  { value: 'Download', label: 'Download' },
  { value: 'Smartphone', label: 'Smartphone' },
  { value: 'Cloud', label: 'Cloud' },
  { value: 'Shield', label: 'Shield' },
];

export function MobileAppEditor({ content, onSave, isSaving }: MobileAppEditorProps) {
  const [formData, setFormData] = useState<MobileAppContent>({
    badge: '',
    title: '',
    titleHighlight: '',
    description: '',
    ctaText: '',
    waitingCount: '',
    features: [],
  });
  const [activeTab, setActiveTab] = useState('edit');

  useEffect(() => {
    if (content) {
      setFormData({
        badge: content.badge || 'শীঘ্রই আসছে',
        title: content.title || 'মোবাইল অ্যাপ',
        titleHighlight: content.titleHighlight || 'আসছে শীঘ্রই!',
        description: content.description || 'আপনার পকেটে থাকবে আপনার পুরো ফার্মেসি। বিক্রয়, স্টক, রিপোর্ট — সব কিছু এক ট্যাপেই। Android ও iOS উভয় প্ল্যাটফর্মে।',
        ctaText: content.ctaText || 'লঞ্চে জানতে চাই',
        waitingCount: content.waitingCount || '+২৩০ জন অপেক্ষায়',
        features: content.features || [],
      });
    }
  }, [content]);

  const handleChange = (field: keyof MobileAppContent, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFeatureChange = (index: number, field: keyof FeatureHighlight, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = { ...newFeatures[index], [field]: value };
    setFormData(prev => ({ ...prev, features: newFeatures }));
  };

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, { icon: 'Bell', title: '', description: '' }],
    }));
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    await onSave(formData);
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="edit">Edit</TabsTrigger>
        <TabsTrigger value="preview">Preview</TabsTrigger>
      </TabsList>

      <TabsContent value="preview" className="space-y-4">
        <SectionPreview sectionKey="mobile_app" content={formData} />
        <Button onClick={handleSubmit} disabled={isSaving} className="w-full">
          {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Save Changes
        </Button>
      </TabsContent>

      <TabsContent value="edit" className="space-y-6">
        {/* Header Content */}
        <div className="space-y-4">
          <h3 className="font-semibold">Section Header</h3>
          <div className="space-y-2">
            <Label>Badge Text</Label>
            <Input
              value={formData.badge}
              onChange={(e) => handleChange('badge', e.target.value)}
              placeholder="Badge text"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Main title"
              />
            </div>
            <div className="space-y-2">
              <Label>Title Highlight</Label>
              <Input
                value={formData.titleHighlight}
                onChange={(e) => handleChange('titleHighlight', e.target.value)}
                placeholder="Highlighted part"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Section description"
            />
          </div>
        </div>

        {/* CTA & Stats */}
        <div className="space-y-4">
          <h3 className="font-semibold">Call to Action</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>CTA Button Text</Label>
              <Input
                value={formData.ctaText}
                onChange={(e) => handleChange('ctaText', e.target.value)}
                placeholder="Button text"
              />
            </div>
            <div className="space-y-2">
              <Label>Waiting Count Text</Label>
              <Input
                value={formData.waitingCount}
                onChange={(e) => handleChange('waitingCount', e.target.value)}
                placeholder="+২৩০ জন অপেক্ষায়"
              />
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Feature Highlights</h3>
            <Button size="sm" variant="outline" onClick={addFeature}>
              <Plus className="h-4 w-4 mr-1" />
              Add Feature
            </Button>
          </div>

          {formData.features.map((feature, index) => (
            <div key={index} className="p-4 border rounded-lg space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Feature {index + 1}</span>
                <Button size="sm" variant="ghost" onClick={() => removeFeature(index)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
              <div className="space-y-2">
                <Label>Icon</Label>
                <select
                  value={feature.icon}
                  onChange={(e) => handleFeatureChange(index, 'icon', e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  {iconOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={feature.title}
                  onChange={(e) => handleFeatureChange(index, 'title', e.target.value)}
                  placeholder="Feature title"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={feature.description}
                  onChange={(e) => handleFeatureChange(index, 'description', e.target.value)}
                  placeholder="Short description"
                />
              </div>
            </div>
          ))}
        </div>

        <Button onClick={handleSubmit} disabled={isSaving} className="w-full">
          {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Save Changes
        </Button>
      </TabsContent>
    </Tabs>
  );
}
