import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import SectionPreview from './SectionPreview';

interface NavLink {
  href: string;
  label: string;
}

interface NavbarContent {
  brand: {
    name: string;
    highlight: string;
  };
  links: NavLink[];
  cta: {
    login: { text: string; link: string };
    signup: { text: string; link: string };
  };
}

interface NavbarEditorProps {
  content: any;
  onSave: (content: NavbarContent) => Promise<void>;
  isSaving: boolean;
}

export function NavbarEditor({ content, onSave, isSaving }: NavbarEditorProps) {
  const [formData, setFormData] = useState<NavbarContent>({
    brand: { name: 'Med', highlight: 'Flow' },
    links: [],
    cta: {
      login: { text: 'লগইন', link: '/login' },
      signup: { text: 'ফ্রি ট্রায়াল শুরু করুন', link: '/signup' },
    },
  });
  const [activeTab, setActiveTab] = useState('edit');

  useEffect(() => {
    if (content) {
      setFormData({
        brand: content.brand || { name: 'Med', highlight: 'Flow' },
        links: content.links || [
          { href: '#features', label: 'সুবিধাসমূহ' },
          { href: '#how-it-works', label: 'কিভাবে কাজ করে' },
          { href: '#pricing', label: 'প্যাকেজ' },
          { href: '#faq', label: 'জিজ্ঞাসা' },
          { href: '#contact', label: 'যোগাযোগ' },
        ],
        cta: content.cta || {
          login: { text: 'লগইন', link: '/login' },
          signup: { text: 'ফ্রি ট্রায়াল শুরু করুন', link: '/signup' },
        },
      });
    }
  }, [content]);

  const handleBrandChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      brand: { ...prev.brand, [field]: value },
    }));
  };

  const handleLinkChange = (index: number, field: keyof NavLink, value: string) => {
    const newLinks = [...formData.links];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setFormData(prev => ({ ...prev, links: newLinks }));
  };

  const addLink = () => {
    setFormData(prev => ({
      ...prev,
      links: [...prev.links, { href: '#', label: '' }],
    }));
  };

  const removeLink = (index: number) => {
    setFormData(prev => ({
      ...prev,
      links: prev.links.filter((_, i) => i !== index),
    }));
  };

  const handleCTAChange = (button: 'login' | 'signup', field: 'text' | 'link', value: string) => {
    setFormData(prev => ({
      ...prev,
      cta: {
        ...prev.cta,
        [button]: { ...prev.cta[button], [field]: value },
      },
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
        <SectionPreview sectionKey="navbar" content={formData} />
        <Button onClick={handleSubmit} disabled={isSaving} className="w-full">
          {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Save Changes
        </Button>
      </TabsContent>

      <TabsContent value="edit" className="space-y-6">
        {/* Brand */}
        <div className="space-y-4">
          <h3 className="font-semibold">Brand Name</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Name Part</Label>
              <Input
                value={formData.brand.name}
                onChange={(e) => handleBrandChange('name', e.target.value)}
                placeholder="Med"
              />
            </div>
            <div className="space-y-2">
              <Label>Highlight Part (colored)</Label>
              <Input
                value={formData.brand.highlight}
                onChange={(e) => handleBrandChange('highlight', e.target.value)}
                placeholder="Flow"
              />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Preview: {formData.brand.name}<span className="text-primary">{formData.brand.highlight}</span>x
          </p>
        </div>

        {/* Navigation Links */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Navigation Links</h3>
            <Button size="sm" variant="outline" onClick={addLink}>
              <Plus className="h-4 w-4 mr-1" />
              Add Link
            </Button>
          </div>

          {formData.links.map((link, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={link.label}
                onChange={(e) => handleLinkChange(index, 'label', e.target.value)}
                placeholder="Link label"
                className="flex-1"
              />
              <Input
                value={link.href}
                onChange={(e) => handleLinkChange(index, 'href', e.target.value)}
                placeholder="#section-id"
                className="flex-1"
              />
              <Button size="icon" variant="ghost" onClick={() => removeLink(index)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="space-y-4">
          <h3 className="font-semibold">CTA Buttons</h3>
          <div className="p-4 border rounded-lg space-y-3">
            <span className="text-sm font-medium">Login Button</span>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Text</Label>
                <Input
                  value={formData.cta.login.text}
                  onChange={(e) => handleCTAChange('login', 'text', e.target.value)}
                  placeholder="লগইন"
                />
              </div>
              <div className="space-y-2">
                <Label>Link</Label>
                <Input
                  value={formData.cta.login.link}
                  onChange={(e) => handleCTAChange('login', 'link', e.target.value)}
                  placeholder="/login"
                />
              </div>
            </div>
          </div>
          <div className="p-4 border rounded-lg space-y-3">
            <span className="text-sm font-medium">Signup Button</span>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Text</Label>
                <Input
                  value={formData.cta.signup.text}
                  onChange={(e) => handleCTAChange('signup', 'text', e.target.value)}
                  placeholder="ফ্রি ট্রায়াল শুরু করুন"
                />
              </div>
              <div className="space-y-2">
                <Label>Link</Label>
                <Input
                  value={formData.cta.signup.link}
                  onChange={(e) => handleCTAChange('signup', 'link', e.target.value)}
                  placeholder="/signup"
                />
              </div>
            </div>
          </div>
        </div>

        <Button onClick={handleSubmit} disabled={isSaving} className="w-full">
          {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Save Changes
        </Button>
      </TabsContent>
    </Tabs>
  );
}
