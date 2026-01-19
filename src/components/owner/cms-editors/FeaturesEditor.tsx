import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, GripVertical, Eye, Pencil, Save, Loader2 } from 'lucide-react';
import SectionPreview from './SectionPreview';

interface FeatureItem {
  icon: string;
  title: string;
  description: string;
  color: string;
  gradient: string;
}

interface HighlightItem {
  icon: string;
  title: string;
  desc: string;
  color: string;
}

interface FeaturesContent {
  badge: string;
  title: string;
  subtitle: string;
  items: FeatureItem[];
  highlights: HighlightItem[];
}

interface FeaturesEditorProps {
  content: Record<string, any>;
  onSave: (content: FeaturesContent) => Promise<void>;
  isSaving: boolean;
}

const iconOptions = [
  { value: 'Package', label: 'Package' },
  { value: 'ShoppingCart', label: 'Shopping Cart' },
  { value: 'Users', label: 'Users' },
  { value: 'Truck', label: 'Truck' },
  { value: 'Wallet', label: 'Wallet' },
  { value: 'FileText', label: 'File Text' },
  { value: 'AlertTriangle', label: 'Alert' },
  { value: 'TrendingUp', label: 'Trending Up' },
  { value: 'Clock', label: 'Clock' },
  { value: 'Shield', label: 'Shield' },
  { value: 'BarChart', label: 'Bar Chart' },
  { value: 'Settings', label: 'Settings' },
];

const colorOptions = [
  { value: 'primary', label: 'Primary (Blue)' },
  { value: 'secondary', label: 'Secondary (Orange)' },
  { value: 'warning', label: 'Warning (Yellow)' },
  { value: 'success', label: 'Success (Green)' },
];

const gradientOptions = [
  { value: 'from-teal-500/20 to-cyan-500/10', label: 'Teal to Cyan' },
  { value: 'from-amber-500/20 to-orange-500/10', label: 'Amber to Orange' },
  { value: 'from-emerald-500/20 to-teal-500/10', label: 'Emerald to Teal' },
  { value: 'from-yellow-500/20 to-amber-500/10', label: 'Yellow to Amber' },
  { value: 'from-cyan-500/20 to-blue-500/10', label: 'Cyan to Blue' },
  { value: 'from-rose-500/20 to-pink-500/10', label: 'Rose to Pink' },
  { value: 'from-purple-500/20 to-indigo-500/10', label: 'Purple to Indigo' },
];

const defaultFeature: FeatureItem = {
  icon: 'Package',
  title: 'নতুন ফিচার',
  description: 'ফিচারের বিবরণ লিখুন',
  color: 'primary',
  gradient: 'from-teal-500/20 to-cyan-500/10',
};

const defaultHighlight: HighlightItem = {
  icon: 'AlertTriangle',
  title: 'নতুন হাইলাইট',
  desc: 'হাইলাইটের বিবরণ',
  color: 'primary',
};

export default function FeaturesEditor({ content, onSave, isSaving }: FeaturesEditorProps) {
  const [formData, setFormData] = useState<FeaturesContent>({
    badge: content.badge || 'শক্তিশালী ফিচার',
    title: content.title || 'সম্পূর্ণ মেয়াদ ও আর্থিক ট্র্যাকিং',
    subtitle: content.subtitle || 'বাংলাদেশি ফার্মেসির জন্য বিশেষভাবে তৈরি সম্পূর্ণ সমাধান।',
    items: content.items || [],
    highlights: content.highlights || [],
  });

  useEffect(() => {
    if (content) {
      setFormData({
        badge: content.badge || 'শক্তিশালী ফিচার',
        title: content.title || 'সম্পূর্ণ মেয়াদ ও আর্থিক ট্র্যাকিং',
        subtitle: content.subtitle || 'বাংলাদেশি ফার্মেসির জন্য বিশেষভাবে তৈরি সম্পূর্ণ সমাধান।',
        items: content.items || [],
        highlights: content.highlights || [],
      });
    }
  }, [content]);

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Feature items methods
  const updateFeature = (index: number, field: keyof FeatureItem, value: string) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    updateField('items', newItems);
  };

  const addFeature = () => {
    updateField('items', [...formData.items, { ...defaultFeature }]);
  };

  const removeFeature = (index: number) => {
    updateField('items', formData.items.filter((_, i) => i !== index));
  };

  // Highlight items methods
  const updateHighlight = (index: number, field: keyof HighlightItem, value: string) => {
    const newHighlights = [...formData.highlights];
    newHighlights[index] = { ...newHighlights[index], [field]: value };
    updateField('highlights', newHighlights);
  };

  const addHighlight = () => {
    updateField('highlights', [...formData.highlights, { ...defaultHighlight }]);
  };

  const removeHighlight = (index: number) => {
    updateField('highlights', formData.highlights.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <Tabs defaultValue="edit" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-4">
        <TabsTrigger value="edit" className="flex items-center gap-2">
          <Pencil className="h-4 w-4" />
          Edit
        </TabsTrigger>
        <TabsTrigger value="preview" className="flex items-center gap-2">
          <Eye className="h-4 w-4" />
          Preview
        </TabsTrigger>
      </TabsList>

      <TabsContent value="edit" className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
        {/* Section Header */}
        <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
          <h4 className="font-semibold text-sm">Section Header</h4>
          
          <div className="space-y-2">
            <Label>Badge Text</Label>
            <Input
              value={formData.badge}
              onChange={(e) => updateField('badge', e.target.value)}
              placeholder="শক্তিশালী ফিচার"
            />
          </div>

          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              value={formData.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="Section title"
            />
          </div>

          <div className="space-y-2">
            <Label>Subtitle</Label>
            <Textarea
              value={formData.subtitle}
              onChange={(e) => updateField('subtitle', e.target.value)}
              placeholder="Section subtitle"
              rows={2}
            />
          </div>
        </div>

        {/* Feature Items */}
        <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm">Features ({formData.items.length})</h4>
            <Button type="button" variant="outline" size="sm" onClick={addFeature}>
              <Plus className="h-4 w-4 mr-1" />
              Add Feature
            </Button>
          </div>

          {formData.items.map((feature, index) => (
            <div key={index} className="p-4 border rounded-lg bg-background space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-sm">Feature {index + 1}</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFeature(index)}
                  className="text-destructive hover:text-destructive h-7 w-7 p-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Icon</Label>
                  <Select
                    value={feature.icon}
                    onValueChange={(value) => updateFeature(index, 'icon', value)}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {iconOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Color</Label>
                  <Select
                    value={feature.color}
                    onValueChange={(value) => updateFeature(index, 'color', value)}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {colorOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Gradient</Label>
                <Select
                  value={feature.gradient}
                  onValueChange={(value) => updateFeature(index, 'gradient', value)}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {gradientOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Title</Label>
                <Input
                  value={feature.title}
                  onChange={(e) => updateFeature(index, 'title', e.target.value)}
                  className="h-8"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Description</Label>
                <Textarea
                  value={feature.description}
                  onChange={(e) => updateFeature(index, 'description', e.target.value)}
                  rows={2}
                  className="text-sm"
                />
              </div>
            </div>
          ))}

          {formData.items.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No features added. Click "Add Feature" to add one.
            </p>
          )}
        </div>

        {/* Highlights */}
        <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm">Highlights ({formData.highlights.length})</h4>
            <Button type="button" variant="outline" size="sm" onClick={addHighlight}>
              <Plus className="h-4 w-4 mr-1" />
              Add Highlight
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {formData.highlights.map((highlight, index) => (
              <div key={index} className="p-3 border rounded-lg bg-background space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-xs">#{index + 1}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeHighlight(index)}
                    className="text-destructive hover:text-destructive h-6 w-6 p-0"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Icon</Label>
                    <Select
                      value={highlight.icon}
                      onValueChange={(value) => updateHighlight(index, 'icon', value)}
                    >
                      <SelectTrigger className="h-7 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {iconOptions.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Color</Label>
                    <Select
                      value={highlight.color}
                      onValueChange={(value) => updateHighlight(index, 'color', value)}
                    >
                      <SelectTrigger className="h-7 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {colorOptions.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Title</Label>
                  <Input
                    value={highlight.title}
                    onChange={(e) => updateHighlight(index, 'title', e.target.value)}
                    className="h-7 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Description</Label>
                  <Input
                    value={highlight.desc}
                    onChange={(e) => updateHighlight(index, 'desc', e.target.value)}
                    className="h-7 text-xs"
                  />
                </div>
              </div>
            ))}
          </div>

          {formData.highlights.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No highlights added. Click "Add Highlight" to add one.
            </p>
          )}
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </TabsContent>

      <TabsContent value="preview">
        <SectionPreview sectionKey="features" content={formData} />
      </TabsContent>
    </Tabs>
  );
}
