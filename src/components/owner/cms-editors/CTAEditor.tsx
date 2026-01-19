import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import SectionPreview from './SectionPreview';

interface CTAButton {
  text: string;
  link: string;
}

interface CTAContent {
  badge: string;
  title: string;
  subtitle: string;
  cta_primary: CTAButton;
  cta_secondary: CTAButton;
  trust_items: string[];
}

interface CTAEditorProps {
  content: any;
  onSave: (content: CTAContent) => Promise<void>;
  isSaving: boolean;
}

export function CTAEditor({ content, onSave, isSaving }: CTAEditorProps) {
  const [formData, setFormData] = useState<CTAContent>({
    badge: '',
    title: '',
    subtitle: '',
    cta_primary: { text: '', link: '' },
    cta_secondary: { text: '', link: '' },
    trust_items: [],
  });
  const [activeTab, setActiveTab] = useState('edit');

  useEffect(() => {
    if (content) {
      setFormData({
        badge: content.badge || 'আজই শুরু করুন',
        title: content.title || 'আপনার ফার্মেসি ব্যবসা বদলে দিতে প্রস্তুত?',
        subtitle: content.subtitle || 'বাংলাদেশের শত শত ফার্মেসি ইতিমধ্যে MedFlowx দিয়ে সময় বাঁচাচ্ছে, ভুল কমাচ্ছে এবং ব্যবসা বাড়াচ্ছে।',
        cta_primary: content.cta_primary || { text: 'ফ্রি ট্রায়াল শুরু করুন', link: '/signup' },
        cta_secondary: content.cta_secondary || { text: 'যোগাযোগ করুন', link: '#contact' },
        trust_items: content.trust_items || ['ক্রেডিট কার্ড লাগবে না', '৭ দিন ফ্রি', 'যেকোনো সময় বাতিল করুন'],
      });
    }
  }, [content]);

  const handleChange = (field: keyof CTAContent, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCTAChange = (field: 'cta_primary' | 'cta_secondary', key: keyof CTAButton, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: { ...prev[field], [key]: value },
    }));
  };

  const handleTrustItemChange = (index: number, value: string) => {
    const newItems = [...formData.trust_items];
    newItems[index] = value;
    setFormData(prev => ({ ...prev, trust_items: newItems }));
  };

  const addTrustItem = () => {
    setFormData(prev => ({
      ...prev,
      trust_items: [...prev.trust_items, ''],
    }));
  };

  const removeTrustItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      trust_items: prev.trust_items.filter((_, i) => i !== index),
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
        <SectionPreview sectionKey="cta" content={formData} />
        <Button onClick={handleSubmit} disabled={isSaving} className="w-full">
          {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Save Changes
        </Button>
      </TabsContent>

      <TabsContent value="edit" className="space-y-6">
        {/* Header Content */}
        <div className="space-y-4">
          <h3 className="font-semibold">Section Content</h3>
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
              placeholder="Main title"
            />
          </div>
          <div className="space-y-2">
            <Label>Subtitle</Label>
            <Textarea
              value={formData.subtitle}
              onChange={(e) => handleChange('subtitle', e.target.value)}
              placeholder="Description"
            />
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-4">
          <h3 className="font-semibold">Call to Action Buttons</h3>
          <div className="p-4 border rounded-lg space-y-3">
            <span className="text-sm font-medium">Primary Button</span>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Button Text</Label>
                <Input
                  value={formData.cta_primary.text}
                  onChange={(e) => handleCTAChange('cta_primary', 'text', e.target.value)}
                  placeholder="Button text"
                />
              </div>
              <div className="space-y-2">
                <Label>Link</Label>
                <Input
                  value={formData.cta_primary.link}
                  onChange={(e) => handleCTAChange('cta_primary', 'link', e.target.value)}
                  placeholder="/signup"
                />
              </div>
            </div>
          </div>
          <div className="p-4 border rounded-lg space-y-3">
            <span className="text-sm font-medium">Secondary Button</span>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Button Text</Label>
                <Input
                  value={formData.cta_secondary.text}
                  onChange={(e) => handleCTAChange('cta_secondary', 'text', e.target.value)}
                  placeholder="Button text"
                />
              </div>
              <div className="space-y-2">
                <Label>Link</Label>
                <Input
                  value={formData.cta_secondary.link}
                  onChange={(e) => handleCTAChange('cta_secondary', 'link', e.target.value)}
                  placeholder="#contact"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Trust Items */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Trust Items</h3>
            <Button size="sm" variant="outline" onClick={addTrustItem}>
              <Plus className="h-4 w-4 mr-1" />
              Add Item
            </Button>
          </div>
          {formData.trust_items.map((item, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={item}
                onChange={(e) => handleTrustItemChange(index, e.target.value)}
                placeholder="Trust item text"
              />
              <Button size="icon" variant="ghost" onClick={() => removeTrustItem(index)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
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
