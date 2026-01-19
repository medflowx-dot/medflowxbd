import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, Loader2, Plus, Trash2, GripVertical, ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQContent {
  title: string;
  subtitle: string;
  faqs: FAQItem[];
}

interface FAQEditorProps {
  content: FAQContent;
  onSave: (content: FAQContent) => Promise<void>;
  isSaving: boolean;
}

export default function FAQEditor({ content, onSave, isSaving }: FAQEditorProps) {
  const [formData, setFormData] = useState<FAQContent>({
    title: '',
    subtitle: '',
    faqs: [],
  });
  const [openItems, setOpenItems] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (content) {
      setFormData({
        title: content.title || '',
        subtitle: content.subtitle || '',
        faqs: content.faqs || [],
      });
    }
  }, [content]);

  const handleChange = (field: keyof FAQContent, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFAQChange = (index: number, field: keyof FAQItem, value: string) => {
    const newFaqs = [...formData.faqs];
    newFaqs[index] = { ...newFaqs[index], [field]: value };
    setFormData(prev => ({ ...prev, faqs: newFaqs }));
  };

  const addFAQ = () => {
    const newIndex = formData.faqs.length;
    setFormData(prev => ({
      ...prev,
      faqs: [...prev.faqs, { question: '', answer: '' }],
    }));
    setOpenItems(prev => ({ ...prev, [newIndex]: true }));
  };

  const removeFAQ = (index: number) => {
    setFormData(prev => ({
      ...prev,
      faqs: prev.faqs.filter((_, i) => i !== index),
    }));
  };

  const toggleItem = (index: number) => {
    setOpenItems(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

  return (
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
              placeholder="Enter FAQ section title..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subtitle">Subtitle</Label>
            <Textarea
              id="subtitle"
              value={formData.subtitle}
              onChange={(e) => handleChange('subtitle', e.target.value)}
              placeholder="Enter FAQ section subtitle..."
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            FAQ Items
            <Button type="button" size="sm" variant="outline" onClick={addFAQ}>
              <Plus className="h-4 w-4 mr-1" />
              Add FAQ
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {formData.faqs.map((faq, index) => (
            <Collapsible key={index} open={openItems[index]} onOpenChange={() => toggleItem(index)}>
              <Card className="bg-muted/50">
                <CardContent className="p-0">
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/80 rounded-t-lg">
                      <div className="flex items-center gap-3">
                        <GripVertical className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium">
                          {faq.question || `FAQ ${index + 1}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFAQ(index);
                          }}
                          className="shrink-0 text-destructive hover:text-destructive h-8 w-8"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        {openItems[index] ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="p-4 pt-0 space-y-4">
                      <div className="space-y-2">
                        <Label>Question</Label>
                        <Input
                          value={faq.question}
                          onChange={(e) => handleFAQChange(index, 'question', e.target.value)}
                          placeholder="Enter the question..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Answer</Label>
                        <Textarea
                          value={faq.answer}
                          onChange={(e) => handleFAQChange(index, 'answer', e.target.value)}
                          placeholder="Enter the answer..."
                          rows={4}
                        />
                      </div>
                    </div>
                  </CollapsibleContent>
                </CardContent>
              </Card>
            </Collapsible>
          ))}
          {formData.faqs.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No FAQs added. Click "Add FAQ" to add one.
            </p>
          )}
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
  );
}
