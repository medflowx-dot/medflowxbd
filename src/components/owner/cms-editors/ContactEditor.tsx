import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, GripVertical, Eye, Pencil, Save, Loader2 } from 'lucide-react';
import SectionPreview from './SectionPreview';

interface ContactMethod {
  icon: string;
  title: string;
  value: string;
  description: string;
  action: string;
  actionLabel: string;
  color: string;
}

interface Office {
  title: string;
  address: string;
  note: string;
}

interface FormConfig {
  title: string;
  subtitle: string;
  nameLabel: string;
  namePlaceholder: string;
  phoneLabel: string;
  phonePlaceholder: string;
  pharmacyLabel: string;
  pharmacyPlaceholder: string;
  messageLabel: string;
  messagePlaceholder: string;
  submitButtonText: string;
  whatsappButtonText: string;
  successTitle: string;
  successMessage: string;
}

interface ContactContent {
  title: string;
  subtitle: string;
  sectionBadge: string;
  contactTitle: string;
  methods: ContactMethod[];
  office: Office;
  formConfig: FormConfig;
  whatsappNumber: string;
}

interface ContactEditorProps {
  content: Record<string, any>;
  onSave: (content: ContactContent) => Promise<void>;
  isSaving: boolean;
}

const defaultContactMethod: ContactMethod = {
  icon: 'Phone',
  title: 'নতুন যোগাযোগ',
  value: '+880 1XXX-XXXXXX',
  description: 'বিবরণ',
  action: 'tel:+880',
  actionLabel: 'যোগাযোগ করুন',
  color: 'primary',
};

const defaultFormConfig: FormConfig = {
  title: 'মেসেজ পাঠান',
  subtitle: 'ফর্ম পূরণ করুন, আমরা শীঘ্রই যোগাযোগ করব',
  nameLabel: 'আপনার নাম',
  namePlaceholder: 'নাম লিখুন',
  phoneLabel: 'ফোন নম্বর',
  phonePlaceholder: '০১XXXXXXXXX',
  pharmacyLabel: 'ফার্মেসির নাম',
  pharmacyPlaceholder: 'আপনার ফার্মেসির নাম (ঐচ্ছিক)',
  messageLabel: 'মেসেজ',
  messagePlaceholder: 'আপনার প্রশ্ন বা মেসেজ লিখুন...',
  submitButtonText: 'মেসেজ পাঠান',
  whatsappButtonText: 'হোয়াটসঅ্যাপে পাঠান',
  successTitle: 'ধন্যবাদ!',
  successMessage: 'আমরা আপনার মেসেজ পেয়েছি এবং শীঘ্রই যোগাযোগ করব।',
};

export default function ContactEditor({ content, onSave, isSaving }: ContactEditorProps) {
  const [formData, setFormData] = useState<ContactContent>({
    title: content.title || 'আমরা সাহায্য করতে প্রস্তুত',
    subtitle: content.subtitle || 'যেকোনো প্রশ্ন বা সাহায্যের জন্য আমাদের সাথে যোগাযোগ করুন।',
    sectionBadge: content.sectionBadge || 'যোগাযোগ করুন',
    contactTitle: content.contactTitle || 'সরাসরি যোগাযোগ করুন',
    methods: content.methods || [],
    office: content.office || { title: 'অফিস', address: 'ঢাকা, বাংলাদেশ', note: 'অনলাইন সাপোর্ট ২৪/৭' },
    formConfig: content.formConfig || defaultFormConfig,
    whatsappNumber: content.whatsappNumber || '880',
  });

  useEffect(() => {
    if (content) {
      setFormData({
        title: content.title || 'আমরা সাহায্য করতে প্রস্তুত',
        subtitle: content.subtitle || 'যেকোনো প্রশ্ন বা সাহায্যের জন্য আমাদের সাথে যোগাযোগ করুন।',
        sectionBadge: content.sectionBadge || 'যোগাযোগ করুন',
        contactTitle: content.contactTitle || 'সরাসরি যোগাযোগ করুন',
        methods: content.methods || [],
        office: content.office || { title: 'অফিস', address: 'ঢাকা, বাংলাদেশ', note: 'অনলাইন সাপোর্ট ২৪/৭' },
        formConfig: content.formConfig || defaultFormConfig,
        whatsappNumber: content.whatsappNumber || '880',
      });
    }
  }, [content]);

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateMethod = (index: number, field: keyof ContactMethod, value: string) => {
    const newMethods = [...formData.methods];
    newMethods[index] = { ...newMethods[index], [field]: value };
    updateField('methods', newMethods);
  };

  const addMethod = () => {
    updateField('methods', [...formData.methods, { ...defaultContactMethod }]);
  };

  const removeMethod = (index: number) => {
    const newMethods = formData.methods.filter((_: any, i: number) => i !== index);
    updateField('methods', newMethods);
  };

  const updateOffice = (field: keyof Office, value: string) => {
    updateField('office', { ...formData.office, [field]: value });
  };

  const updateFormConfig = (field: keyof FormConfig, value: string) => {
    updateField('formConfig', { ...formData.formConfig, [field]: value });
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
              value={formData.sectionBadge}
              onChange={(e) => updateField('sectionBadge', e.target.value)}
              placeholder="যোগাযোগ করুন"
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
            <Input
              value={formData.subtitle}
              onChange={(e) => updateField('subtitle', e.target.value)}
              placeholder="Section subtitle"
            />
          </div>

          <div className="space-y-2">
            <Label>Contact Section Title</Label>
            <Input
              value={formData.contactTitle}
              onChange={(e) => updateField('contactTitle', e.target.value)}
              placeholder="সরাসরি যোগাযোগ করুন"
            />
          </div>
        </div>

        {/* Contact Methods */}
        <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm">Contact Methods</h4>
            <Button type="button" variant="outline" size="sm" onClick={addMethod}>
              <Plus className="h-4 w-4 mr-1" />
              Add Method
            </Button>
          </div>

          {formData.methods.map((method: ContactMethod, index: number) => (
            <div key={index} className="p-4 border rounded-lg bg-background space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-sm">Method {index + 1}</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeMethod(index)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Icon</Label>
                  <Select
                    value={method.icon}
                    onValueChange={(value) => updateMethod(index, 'icon', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MessageCircle">WhatsApp</SelectItem>
                      <SelectItem value="Phone">Phone</SelectItem>
                      <SelectItem value="Mail">Email</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Color</Label>
                  <Select
                    value={method.color}
                    onValueChange={(value) => updateMethod(index, 'color', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="success">Green (Success)</SelectItem>
                      <SelectItem value="primary">Blue (Primary)</SelectItem>
                      <SelectItem value="secondary">Gray (Secondary)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Title</Label>
                  <Input
                    value={method.title}
                    onChange={(e) => updateMethod(index, 'title', e.target.value)}
                    placeholder="হোয়াটসঅ্যাপ"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Value (Number/Email)</Label>
                  <Input
                    value={method.value}
                    onChange={(e) => updateMethod(index, 'value', e.target.value)}
                    placeholder="+880 1XXX-XXXXXX"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Description</Label>
                  <Input
                    value={method.description}
                    onChange={(e) => updateMethod(index, 'description', e.target.value)}
                    placeholder="সবচেয়ে দ্রুত রেসপন্স"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Action Label</Label>
                  <Input
                    value={method.actionLabel}
                    onChange={(e) => updateMethod(index, 'actionLabel', e.target.value)}
                    placeholder="মেসেজ করুন"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Action URL</Label>
                <Input
                  value={method.action}
                  onChange={(e) => updateMethod(index, 'action', e.target.value)}
                  placeholder="https://wa.me/880..."
                />
              </div>
            </div>
          ))}

          {formData.methods.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No contact methods added. Click "Add Method" to add one.
            </p>
          )}
        </div>

        {/* Office Info */}
        <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
          <h4 className="font-semibold text-sm">Office Information</h4>
          
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              value={formData.office.title}
              onChange={(e) => updateOffice('title', e.target.value)}
              placeholder="অফিস"
            />
          </div>

          <div className="space-y-2">
            <Label>Address</Label>
            <Input
              value={formData.office.address}
              onChange={(e) => updateOffice('address', e.target.value)}
              placeholder="ঢাকা, বাংলাদেশ"
            />
          </div>

          <div className="space-y-2">
            <Label>Note</Label>
            <Input
              value={formData.office.note}
              onChange={(e) => updateOffice('note', e.target.value)}
              placeholder="অনলাইন সাপোর্ট ২৪/৭"
            />
          </div>
        </div>

        {/* Form Configuration */}
        <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
          <h4 className="font-semibold text-sm">Lead Form Configuration</h4>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Form Title</Label>
              <Input
                value={formData.formConfig.title}
                onChange={(e) => updateFormConfig('title', e.target.value)}
                placeholder="মেসেজ পাঠান"
              />
            </div>
            <div className="space-y-2">
              <Label>Form Subtitle</Label>
              <Input
                value={formData.formConfig.subtitle}
                onChange={(e) => updateFormConfig('subtitle', e.target.value)}
                placeholder="ফর্ম পূরণ করুন..."
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Name Label</Label>
              <Input
                value={formData.formConfig.nameLabel}
                onChange={(e) => updateFormConfig('nameLabel', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Name Placeholder</Label>
              <Input
                value={formData.formConfig.namePlaceholder}
                onChange={(e) => updateFormConfig('namePlaceholder', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Phone Label</Label>
              <Input
                value={formData.formConfig.phoneLabel}
                onChange={(e) => updateFormConfig('phoneLabel', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Phone Placeholder</Label>
              <Input
                value={formData.formConfig.phonePlaceholder}
                onChange={(e) => updateFormConfig('phonePlaceholder', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Pharmacy Label</Label>
              <Input
                value={formData.formConfig.pharmacyLabel}
                onChange={(e) => updateFormConfig('pharmacyLabel', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Pharmacy Placeholder</Label>
              <Input
                value={formData.formConfig.pharmacyPlaceholder}
                onChange={(e) => updateFormConfig('pharmacyPlaceholder', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Message Label</Label>
              <Input
                value={formData.formConfig.messageLabel}
                onChange={(e) => updateFormConfig('messageLabel', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Message Placeholder</Label>
              <Input
                value={formData.formConfig.messagePlaceholder}
                onChange={(e) => updateFormConfig('messagePlaceholder', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Submit Button Text</Label>
              <Input
                value={formData.formConfig.submitButtonText}
                onChange={(e) => updateFormConfig('submitButtonText', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>WhatsApp Button Text</Label>
              <Input
                value={formData.formConfig.whatsappButtonText}
                onChange={(e) => updateFormConfig('whatsappButtonText', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Success Title</Label>
              <Input
                value={formData.formConfig.successTitle}
                onChange={(e) => updateFormConfig('successTitle', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Success Message</Label>
              <Input
                value={formData.formConfig.successMessage}
                onChange={(e) => updateFormConfig('successMessage', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>WhatsApp Number (for share)</Label>
            <Input
              value={formData.whatsappNumber}
              onChange={(e) => updateField('whatsappNumber', e.target.value)}
              placeholder="880XXXXXXXXXX"
            />
          </div>
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
        <SectionPreview sectionKey="contact" content={formData} />
      </TabsContent>
    </Tabs>
  );
}
