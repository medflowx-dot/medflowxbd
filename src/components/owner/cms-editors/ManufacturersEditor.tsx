import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, GripVertical, Eye, Pencil, Save, Loader2 } from 'lucide-react';
import SectionPreview from './SectionPreview';
import ImagePicker from './ImagePicker';

interface ManufacturerItem {
  name: string;
  namebn: string;
  logo: string;
}

interface ManufacturersContent {
  badge: string;
  title: string;
  bottomText: string;
  highlightNumber: string;
  manufacturers: ManufacturerItem[];
}

interface ManufacturersEditorProps {
  content: Record<string, any>;
  onSave: (content: ManufacturersContent) => Promise<void>;
  isSaving: boolean;
}

const defaultManufacturer: ManufacturerItem = {
  name: 'New Company',
  namebn: 'নতুন কোম্পানি',
  logo: '',
};

export default function ManufacturersEditor({ content, onSave, isSaving }: ManufacturersEditorProps) {
  const [formData, setFormData] = useState<ManufacturersContent>({
    badge: content.badge || 'আমাদের ডাটাবেসে আছে',
    title: content.title || 'বাংলাদেশের শীর্ষ ২৮+ ফার্মাসিউটিক্যাল কোম্পানি',
    bottomText: content.bottomText || 'ওষুধ আগে থেকেই লোড করা — ম্যানুয়াল এন্ট্রি ছাড়াই শুরু করুন',
    highlightNumber: content.highlightNumber || '৪৭০+',
    manufacturers: content.manufacturers || [],
  });

  useEffect(() => {
    if (content) {
      setFormData({
        badge: content.badge || 'আমাদের ডাটাবেসে আছে',
        title: content.title || 'বাংলাদেশের শীর্ষ ২৮+ ফার্মাসিউটিক্যাল কোম্পানি',
        bottomText: content.bottomText || 'ওষুধ আগে থেকেই লোড করা — ম্যানুয়াল এন্ট্রি ছাড়াই শুরু করুন',
        highlightNumber: content.highlightNumber || '৪৭০+',
        manufacturers: content.manufacturers || [],
      });
    }
  }, [content]);

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateManufacturer = (index: number, field: keyof ManufacturerItem, value: string) => {
    const newManufacturers = [...formData.manufacturers];
    newManufacturers[index] = { ...newManufacturers[index], [field]: value };
    updateField('manufacturers', newManufacturers);
  };

  const addManufacturer = () => {
    updateField('manufacturers', [...formData.manufacturers, { ...defaultManufacturer }]);
  };

  const removeManufacturer = (index: number) => {
    const newManufacturers = formData.manufacturers.filter((_, i) => i !== index);
    updateField('manufacturers', newManufacturers);
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
              placeholder="আমাদের ডাটাবেসে আছে"
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

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Highlight Number</Label>
              <Input
                value={formData.highlightNumber}
                onChange={(e) => updateField('highlightNumber', e.target.value)}
                placeholder="৪৭০+"
              />
            </div>
            <div className="space-y-2">
              <Label>Bottom Text</Label>
              <Input
                value={formData.bottomText}
                onChange={(e) => updateField('bottomText', e.target.value)}
                placeholder="Bottom description text"
              />
            </div>
          </div>
        </div>

        {/* Manufacturers List */}
        <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm">Manufacturers ({formData.manufacturers.length})</h4>
            <Button type="button" variant="outline" size="sm" onClick={addManufacturer}>
              <Plus className="h-4 w-4 mr-1" />
              Add Manufacturer
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {formData.manufacturers.map((manufacturer, index) => (
              <div key={index} className="p-3 border rounded-lg bg-background space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-sm">#{index + 1}</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeManufacturer(index)}
                    className="text-destructive hover:text-destructive h-7 w-7 p-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex gap-3">
                  {/* Logo Preview */}
                  <div className="shrink-0">
                    {manufacturer.logo ? (
                      <img 
                        src={manufacturer.logo} 
                        alt={manufacturer.name}
                        className="w-12 h-12 rounded-lg object-contain bg-white border"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-xs text-muted-foreground">
                        No Logo
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-xs">Name (English)</Label>
                        <Input
                          value={manufacturer.name}
                          onChange={(e) => updateManufacturer(index, 'name', e.target.value)}
                          placeholder="Square"
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Name (Bengali)</Label>
                        <Input
                          value={manufacturer.namebn}
                          onChange={(e) => updateManufacturer(index, 'namebn', e.target.value)}
                          placeholder="স্কয়ার"
                          className="h-8 text-sm"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <Label className="text-xs">Logo</Label>
                      <ImagePicker
                        value={manufacturer.logo}
                        onChange={(url) => updateManufacturer(index, 'logo', url)}
                        label="Select Logo"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {formData.manufacturers.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No manufacturers added. Click "Add Manufacturer" to add one.
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
        <SectionPreview sectionKey="manufacturers" content={formData} />
      </TabsContent>
    </Tabs>
  );
}
