import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import SectionPreview from './SectionPreview';

interface ProblemSolutionItem {
  icon: string;
  problem: string;
  solution: string;
}

interface WhyChooseUsContent {
  title: string;
  subtitle: string;
  items: ProblemSolutionItem[];
}

interface WhyChooseUsEditorProps {
  content: any;
  onSave: (content: WhyChooseUsContent) => Promise<void>;
  isSaving: boolean;
}

const iconOptions = [
  { value: 'AlertTriangle', label: 'Alert Triangle' },
  { value: 'Calculator', label: 'Calculator' },
  { value: 'Users', label: 'Users' },
  { value: 'Truck', label: 'Truck' },
  { value: 'Clock', label: 'Clock' },
  { value: 'DollarSign', label: 'Dollar Sign' },
  { value: 'Package', label: 'Package' },
  { value: 'Shield', label: 'Shield' },
];

export function WhyChooseUsEditor({ content, onSave, isSaving }: WhyChooseUsEditorProps) {
  const [formData, setFormData] = useState<WhyChooseUsContent>({
    title: '',
    subtitle: '',
    items: [],
  });
  const [activeTab, setActiveTab] = useState('edit');

  useEffect(() => {
    if (content) {
      setFormData({
        title: content.title || 'আপনার সমস্যার সমাধান আমাদের কাছে',
        subtitle: content.subtitle || 'ফার্মেসি চালাতে গিয়ে যে সমস্যাগুলোর মুখে পড়েন, তার সবকিছুর সমাধান এক জায়গায়।',
        items: content.items || [],
      });
    }
  }, [content]);

  const handleChange = (field: keyof WhyChooseUsContent, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (index: number, field: keyof ProblemSolutionItem, value: string) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { icon: 'AlertTriangle', problem: '', solution: '' }],
    }));
  };

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
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
        <SectionPreview sectionKey="why_choose_us" content={formData} />
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

        {/* Problem-Solution Items */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Problem-Solution Items</h3>
            <Button size="sm" variant="outline" onClick={addItem}>
              <Plus className="h-4 w-4 mr-1" />
              Add Item
            </Button>
          </div>

          {formData.items.map((item, index) => (
            <div key={index} className="p-4 border rounded-lg space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Item {index + 1}</span>
                <Button size="sm" variant="ghost" onClick={() => removeItem(index)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Icon</Label>
                  <select
                    value={item.icon}
                    onChange={(e) => handleItemChange(index, 'icon', e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    {iconOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Problem (সমস্যা)</Label>
                <Textarea
                  value={item.problem}
                  onChange={(e) => handleItemChange(index, 'problem', e.target.value)}
                  placeholder="Describe the problem"
                />
              </div>
              <div className="space-y-2">
                <Label>Solution (সমাধান)</Label>
                <Textarea
                  value={item.solution}
                  onChange={(e) => handleItemChange(index, 'solution', e.target.value)}
                  placeholder="Describe the solution"
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
