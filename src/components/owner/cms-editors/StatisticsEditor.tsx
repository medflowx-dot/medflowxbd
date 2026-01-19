import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, Loader2, Plus, Trash2, GripVertical, Eye, Edit3 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import SectionPreview from './SectionPreview';

interface StatItem {
  icon: string;
  value: string;
  label: string;
  description: string;
  color: string;
}

interface StatisticsContent {
  title: string;
  subtitle: string;
  stats: StatItem[];
  cta_text: string;
  cta_link: string;
}

interface StatisticsEditorProps {
  content: StatisticsContent;
  onSave: (content: StatisticsContent) => Promise<void>;
  isSaving: boolean;
}

const iconOptions = [
  { value: 'Store', label: 'Store' },
  { value: 'Users', label: 'Users' },
  { value: 'Package', label: 'Package' },
  { value: 'TrendingUp', label: 'Trending Up' },
  { value: 'Award', label: 'Award' },
  { value: 'Shield', label: 'Shield' },
  { value: 'Clock', label: 'Clock' },
  { value: 'Star', label: 'Star' },
];

const colorOptions = [
  { value: 'primary', label: 'Primary' },
  { value: 'blue', label: 'Blue' },
  { value: 'green', label: 'Green' },
  { value: 'yellow', label: 'Yellow' },
  { value: 'purple', label: 'Purple' },
  { value: 'red', label: 'Red' },
];

export default function StatisticsEditor({ content, onSave, isSaving }: StatisticsEditorProps) {
  const [formData, setFormData] = useState<StatisticsContent>({
    title: '',
    subtitle: '',
    stats: [],
    cta_text: '',
    cta_link: '',
  });
  const [activeTab, setActiveTab] = useState<string>('edit');

  useEffect(() => {
    if (content) {
      setFormData({
        title: content.title || '',
        subtitle: content.subtitle || '',
        stats: content.stats || [],
        cta_text: content.cta_text || '',
        cta_link: content.cta_link || '',
      });
    }
  }, [content]);

  const handleChange = (field: keyof StatisticsContent, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleStatChange = (index: number, field: keyof StatItem, value: string) => {
    const newStats = [...formData.stats];
    newStats[index] = { ...newStats[index], [field]: value };
    setFormData(prev => ({ ...prev, stats: newStats }));
  };

  const addStat = () => {
    setFormData(prev => ({
      ...prev,
      stats: [...prev.stats, { icon: 'Star', value: '', label: '', description: '', color: 'primary' }],
    }));
  };

  const removeStat = (index: number) => {
    setFormData(prev => ({
      ...prev,
      stats: prev.stats.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-4">
        <TabsTrigger value="edit">
          <Edit3 className="h-4 w-4 mr-2" />
          Edit
        </TabsTrigger>
        <TabsTrigger value="preview">
          <Eye className="h-4 w-4 mr-2" />
          Preview
        </TabsTrigger>
      </TabsList>

      <TabsContent value="preview" className="mt-0">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Live Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <SectionPreview sectionKey="statistics" content={formData} />
          </CardContent>
        </Card>
        <div className="flex justify-end mt-4">
          <Button onClick={() => onSave(formData)} disabled={isSaving}>
            {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </TabsContent>

      <TabsContent value="edit" className="mt-0">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Header</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="Enter section title..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subtitle">Subtitle</Label>
                <Input
                  id="subtitle"
                  value={formData.subtitle}
                  onChange={(e) => handleChange('subtitle', e.target.value)}
                  placeholder="Enter section subtitle..."
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                Statistics
                <Button type="button" size="sm" variant="outline" onClick={addStat}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Stat
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.stats.map((stat, index) => (
                <Card key={index} className="bg-muted/50">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <div className="pt-2 text-muted-foreground cursor-move">
                        <GripVertical className="h-5 w-5" />
                      </div>
                      <div className="flex-1 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Value</Label>
                            <Input
                              value={stat.value}
                              onChange={(e) => handleStatChange(index, 'value', e.target.value)}
                              placeholder="e.g., 500+"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Label</Label>
                            <Input
                              value={stat.label}
                              onChange={(e) => handleStatChange(index, 'label', e.target.value)}
                              placeholder="e.g., Active Users"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Input
                            value={stat.description}
                            onChange={(e) => handleStatChange(index, 'description', e.target.value)}
                            placeholder="Short description..."
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Icon</Label>
                            <Select
                              value={stat.icon}
                              onValueChange={(value) => handleStatChange(index, 'icon', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select icon" />
                              </SelectTrigger>
                              <SelectContent>
                                {iconOptions.map(opt => (
                                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Color</Label>
                            <Select
                              value={stat.color}
                              onValueChange={(value) => handleStatChange(index, 'color', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select color" />
                              </SelectTrigger>
                              <SelectContent>
                                {colorOptions.map(opt => (
                                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => removeStat(index)}
                        className="shrink-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {formData.stats.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No statistics added. Click "Add Stat" to add one.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Call to Action</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cta_text">CTA Text</Label>
                  <Input
                    id="cta_text"
                    value={formData.cta_text}
                    onChange={(e) => handleChange('cta_text', e.target.value)}
                    placeholder="e.g., Get Started Today"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cta_link">CTA Link</Label>
                  <Input
                    id="cta_link"
                    value={formData.cta_link}
                    onChange={(e) => handleChange('cta_link', e.target.value)}
                    placeholder="e.g., /signup"
                  />
                </div>
              </div>
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
      </TabsContent>
    </Tabs>
  );
}
