import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import SectionPreview from './SectionPreview';

interface FooterLink {
  text: string;
  link: string;
}

interface FooterContent {
  brand: {
    name: string;
    description: string;
  };
  contact: {
    email: string;
    phone: string;
    address: string;
  };
  links: {
    product: FooterLink[];
    company: FooterLink[];
    legal: FooterLink[];
  };
  social: {
    facebook: string;
    whatsapp: string;
  };
  copyright: string;
}

interface FooterEditorProps {
  content: any;
  onSave: (content: FooterContent) => Promise<void>;
  isSaving: boolean;
}

export function FooterEditor({ content, onSave, isSaving }: FooterEditorProps) {
  const [formData, setFormData] = useState<FooterContent>({
    brand: { name: '', description: '' },
    contact: { email: '', phone: '', address: '' },
    links: { product: [], company: [], legal: [] },
    social: { facebook: '', whatsapp: '' },
    copyright: '',
  });
  const [activeTab, setActiveTab] = useState('edit');

  useEffect(() => {
    if (content) {
      setFormData({
        brand: content.brand || { name: 'MedFlowx', description: '' },
        contact: content.contact || { email: '', phone: '', address: '' },
        links: content.links || { product: [], company: [], legal: [] },
        social: content.social || { facebook: '', whatsapp: '' },
        copyright: content.copyright || '© {year} MedFlowx। সর্বস্বত্ব সংরক্ষিত।',
      });
    }
  }, [content]);

  const handleBrandChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      brand: { ...prev.brand, [field]: value },
    }));
  };

  const handleContactChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      contact: { ...prev.contact, [field]: value },
    }));
  };

  const handleSocialChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      social: { ...prev.social, [field]: value },
    }));
  };

  const handleLinkChange = (category: 'product' | 'company' | 'legal', index: number, field: keyof FooterLink, value: string) => {
    const newLinks = { ...formData.links };
    newLinks[category][index] = { ...newLinks[category][index], [field]: value };
    setFormData(prev => ({ ...prev, links: newLinks }));
  };

  const addLink = (category: 'product' | 'company' | 'legal') => {
    const newLinks = { ...formData.links };
    newLinks[category] = [...newLinks[category], { text: '', link: '' }];
    setFormData(prev => ({ ...prev, links: newLinks }));
  };

  const removeLink = (category: 'product' | 'company' | 'legal', index: number) => {
    const newLinks = { ...formData.links };
    newLinks[category] = newLinks[category].filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, links: newLinks }));
  };

  const handleSubmit = async () => {
    await onSave(formData);
  };

  const renderLinkEditor = (category: 'product' | 'company' | 'legal', title: string) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{title}</span>
        <Button size="sm" variant="ghost" onClick={() => addLink(category)}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      {formData.links[category].map((link, index) => (
        <div key={index} className="flex gap-2">
          <Input
            value={link.text}
            onChange={(e) => handleLinkChange(category, index, 'text', e.target.value)}
            placeholder="Link text"
            className="flex-1"
          />
          <Input
            value={link.link}
            onChange={(e) => handleLinkChange(category, index, 'link', e.target.value)}
            placeholder="#link"
            className="flex-1"
          />
          <Button size="icon" variant="ghost" onClick={() => removeLink(category, index)}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ))}
    </div>
  );

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="edit">Edit</TabsTrigger>
        <TabsTrigger value="preview">Preview</TabsTrigger>
      </TabsList>

      <TabsContent value="preview" className="space-y-4">
        <SectionPreview sectionKey="footer" content={formData} />
        <Button onClick={handleSubmit} disabled={isSaving} className="w-full">
          {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Save Changes
        </Button>
      </TabsContent>

      <TabsContent value="edit" className="space-y-6">
        {/* Brand */}
        <div className="space-y-4">
          <h3 className="font-semibold">Brand Information</h3>
          <div className="space-y-2">
            <Label>Brand Name</Label>
            <Input
              value={formData.brand.name}
              onChange={(e) => handleBrandChange('name', e.target.value)}
              placeholder="Brand name"
            />
          </div>
          <div className="space-y-2">
            <Label>Brand Description</Label>
            <Textarea
              value={formData.brand.description}
              onChange={(e) => handleBrandChange('description', e.target.value)}
              placeholder="Brand description"
            />
          </div>
        </div>

        {/* Contact */}
        <div className="space-y-4">
          <h3 className="font-semibold">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                value={formData.contact.email}
                onChange={(e) => handleContactChange('email', e.target.value)}
                placeholder="email@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                value={formData.contact.phone}
                onChange={(e) => handleContactChange('phone', e.target.value)}
                placeholder="+88 01XXX"
              />
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input
                value={formData.contact.address}
                onChange={(e) => handleContactChange('address', e.target.value)}
                placeholder="Dhaka, Bangladesh"
              />
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="space-y-4">
          <h3 className="font-semibold">Footer Links</h3>
          <div className="p-4 border rounded-lg space-y-4">
            {renderLinkEditor('product', 'প্রোডাক্ট Links')}
          </div>
          <div className="p-4 border rounded-lg space-y-4">
            {renderLinkEditor('company', 'কোম্পানি Links')}
          </div>
          <div className="p-4 border rounded-lg space-y-4">
            {renderLinkEditor('legal', 'আইনি Links')}
          </div>
        </div>

        {/* Social */}
        <div className="space-y-4">
          <h3 className="font-semibold">Social Links</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Facebook</Label>
              <Input
                value={formData.social.facebook}
                onChange={(e) => handleSocialChange('facebook', e.target.value)}
                placeholder="https://facebook.com/..."
              />
            </div>
            <div className="space-y-2">
              <Label>WhatsApp</Label>
              <Input
                value={formData.social.whatsapp}
                onChange={(e) => handleSocialChange('whatsapp', e.target.value)}
                placeholder="https://wa.me/..."
              />
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="space-y-2">
          <Label>Copyright Text (use {'{year}'} for dynamic year)</Label>
          <Input
            value={formData.copyright}
            onChange={(e) => setFormData(prev => ({ ...prev, copyright: e.target.value }))}
            placeholder="© {year} MedFlowx। সর্বস্বত্ব সংরক্ষিত।"
          />
        </div>

        <Button onClick={handleSubmit} disabled={isSaving} className="w-full">
          {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Save Changes
        </Button>
      </TabsContent>
    </Tabs>
  );
}
