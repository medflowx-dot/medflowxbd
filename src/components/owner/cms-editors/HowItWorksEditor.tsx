import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import SectionPreview from './SectionPreview';

interface StepItem {
  number: string;
  icon: string;
  title: string;
  description: string;
}

interface HowItWorksContent {
  badge: string;
  title: string;
  subtitle: string;
  steps: StepItem[];
}

interface HowItWorksEditorProps {
  content: any;
  onSave: (content: HowItWorksContent) => Promise<void>;
  isSaving: boolean;
}

const iconOptions = [
  { value: 'UserPlus', label: 'User Plus' },
  { value: 'Settings', label: 'Settings' },
  { value: 'Rocket', label: 'Rocket' },
  { value: 'Package', label: 'Package' },
  { value: 'TrendingUp', label: 'Trending Up' },
  { value: 'CheckCircle', label: 'Check Circle' },
  { value: 'Play', label: 'Play' },
  { value: 'Zap', label: 'Zap' },
];

export function HowItWorksEditor({ content, onSave, isSaving }: HowItWorksEditorProps) {
  const [formData, setFormData] = useState<HowItWorksContent>({
    badge: '',
    title: '',
    subtitle: '',
    steps: [],
  });
  const [activeTab, setActiveTab] = useState('edit');

  useEffect(() => {
    if (content) {
      setFormData({
        badge: content.badge || 'সহজ প্রক্রিয়া',
        title: content.title || 'মাত্র ৩টি ধাপে শুরু করুন',
        subtitle: content.subtitle || 'সাইনআপ থেকে পূর্ণ কার্যক্ষম — মাত্র কয়েক মিনিটে।',
        steps: content.steps || [],
      });
    }
  }, [content]);

  const handleChange = (field: keyof HowItWorksContent, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleStepChange = (index: number, field: keyof StepItem, value: string) => {
    const newSteps = [...formData.steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setFormData(prev => ({ ...prev, steps: newSteps }));
  };

  const addStep = () => {
    const stepNum = formData.steps.length + 1;
    setFormData(prev => ({
      ...prev,
      steps: [...prev.steps, { number: `০${stepNum}`, icon: 'UserPlus', title: '', description: '' }],
    }));
  };

  const removeStep = (index: number) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index),
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
        <SectionPreview sectionKey="how_it_works" content={formData} />
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

        {/* Steps */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Steps</h3>
            <Button size="sm" variant="outline" onClick={addStep}>
              <Plus className="h-4 w-4 mr-1" />
              Add Step
            </Button>
          </div>

          {formData.steps.map((step, index) => (
            <div key={index} className="p-4 border rounded-lg space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Step {index + 1}</span>
                <Button size="sm" variant="ghost" onClick={() => removeStep(index)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Step Number</Label>
                  <Input
                    value={step.number}
                    onChange={(e) => handleStepChange(index, 'number', e.target.value)}
                    placeholder="০১"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Icon</Label>
                  <select
                    value={step.icon}
                    onChange={(e) => handleStepChange(index, 'icon', e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    {iconOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={step.title}
                  onChange={(e) => handleStepChange(index, 'title', e.target.value)}
                  placeholder="Step title"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={step.description}
                  onChange={(e) => handleStepChange(index, 'description', e.target.value)}
                  placeholder="Step description"
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
