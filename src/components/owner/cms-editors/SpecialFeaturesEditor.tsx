import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import SectionPreview from './SectionPreview';

interface FeatureItem {
  icon: string;
  title: string;
  description: string;
}

interface SpecialFeaturesContent {
  badge: string;
  title: string;
  subtitle: string;
  features: FeatureItem[];
}

interface SpecialFeaturesEditorProps {
  content: any;
  onSave: (content: SpecialFeaturesContent) => Promise<void>;
  isSaving: boolean;
}

const iconOptions = [
  { value: 'Database', label: 'Database' },
  { value: 'Smartphone', label: 'Smartphone' },
  { value: 'Users', label: 'Users' },
  { value: 'FileOutput', label: 'File Output' },
  { value: 'MessageSquare', label: 'Message Square' },
  { value: 'Cloud', label: 'Cloud' },
  { value: 'Shield', label: 'Shield' },
  { value: 'Zap', label: 'Zap' },
  { value: 'Bell', label: 'Bell' },
  { value: 'Settings', label: 'Settings' },
];

export function SpecialFeaturesEditor({ content, onSave, isSaving }: SpecialFeaturesEditorProps) {
  const [formData, setFormData] = useState<SpecialFeaturesContent>({
    badge: '',
    title: '',
    subtitle: '',
    features: [],
  });
  const [activeTab, setActiveTab] = useState('edit');

  useEffect(() => {
    if (content) {
      setFormData({
        badge: content.badge || 'বিশেষ সুবিধা',
        title: content.title || 'যা আমাদের আলাদা করে',
        subtitle: content.subtitle || 'শুধু ফিচার নয়, আপনার ফার্মেসির প্রতিটি দিক সহজ করতে আমরা এক্সট্রা মাইল যাই।',
        features: content.features || [],
      });
    }
  }, [content]);

  const handleChange = (field: keyof SpecialFeaturesContent, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFeatureChange = (index: number, field: keyof FeatureItem, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = { ...newFeatures[index], [field]: value };
    setFormData(prev => ({ ...prev, features: newFeatures }));
  };

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, { icon: 'Database', title: '', description: '' }],
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
        <SectionPreview sectionKey="special_features" content={formData} />
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
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Section title"
            />
          </div>
          <div className="space-y-2">
            <Label>Subtitle</Label>
            <Textarea
              value={formData.subtitle}
              onChange={(e) => handleChange('subtitle', e.target.value)}
              placeholder="Section subtitle"
            />
          </div>
        </div>

        {/* Features */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Features</h3>
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
                <Textarea
                  value={feature.description}
                  onChange={(e) => handleFeatureChange(index, 'description', e.target.value)}
                  placeholder="Feature description"
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
