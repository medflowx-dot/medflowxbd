import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, Loader2, Plus, Trash2, Star, User, Eye, Edit3 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ImagePicker from './ImagePicker';
import SectionPreview from './SectionPreview';

interface Testimonial {
  name: string;
  role: string;
  pharmacy: string;
  quote: string;
  rating: number;
  avatar?: string;
}

interface TestimonialsContent {
  title: string;
  subtitle: string;
  testimonials: Testimonial[];
}

interface TestimonialsEditorProps {
  content: TestimonialsContent;
  onSave: (content: TestimonialsContent) => Promise<void>;
  isSaving: boolean;
}

export default function TestimonialsEditor({ content, onSave, isSaving }: TestimonialsEditorProps) {
  const [formData, setFormData] = useState<TestimonialsContent>({
    title: '',
    subtitle: '',
    testimonials: [],
  });
  const [activeTab, setActiveTab] = useState<string>('edit');

  useEffect(() => {
    if (content) {
      setFormData({
        title: content.title || '',
        subtitle: content.subtitle || '',
        testimonials: content.testimonials || [],
      });
    }
  }, [content]);

  const handleChange = (field: keyof TestimonialsContent, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTestimonialChange = (index: number, field: keyof Testimonial, value: string | number) => {
    const newTestimonials = [...formData.testimonials];
    newTestimonials[index] = { ...newTestimonials[index], [field]: value };
    setFormData(prev => ({ ...prev, testimonials: newTestimonials }));
  };

  const addTestimonial = () => {
    setFormData(prev => ({
      ...prev,
      testimonials: [
        ...prev.testimonials,
        { name: '', role: '', pharmacy: '', quote: '', rating: 5 },
      ],
    }));
  };

  const removeTestimonial = (index: number) => {
    setFormData(prev => ({
      ...prev,
      testimonials: prev.testimonials.filter((_, i) => i !== index),
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
            <SectionPreview sectionKey="testimonials" content={formData} />
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
                  placeholder="Enter testimonials section title..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subtitle">Subtitle</Label>
                <Textarea
                  id="subtitle"
                  value={formData.subtitle}
                  onChange={(e) => handleChange('subtitle', e.target.value)}
                  placeholder="Enter testimonials section subtitle..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                Testimonials
                <Button type="button" size="sm" variant="outline" onClick={addTestimonial}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Testimonial
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.testimonials.map((testimonial, index) => (
                <Card key={index} className="bg-muted/50">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{testimonial.name || 'New Testimonial'}</p>
                          <p className="text-sm text-muted-foreground">{testimonial.role || 'Role'}</p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => removeTestimonial(index)}
                        className="shrink-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Name</Label>
                          <Input
                            value={testimonial.name}
                            onChange={(e) => handleTestimonialChange(index, 'name', e.target.value)}
                            placeholder="Customer name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Role</Label>
                          <Input
                            value={testimonial.role}
                            onChange={(e) => handleTestimonialChange(index, 'role', e.target.value)}
                            placeholder="e.g., Pharmacy Owner"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Pharmacy/Company</Label>
                          <Input
                            value={testimonial.pharmacy}
                            onChange={(e) => handleTestimonialChange(index, 'pharmacy', e.target.value)}
                            placeholder="Pharmacy or company name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Rating</Label>
                          <Select
                            value={testimonial.rating.toString()}
                            onValueChange={(value) => handleTestimonialChange(index, 'rating', parseInt(value))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select rating" />
                            </SelectTrigger>
                            <SelectContent>
                              {[5, 4, 3, 2, 1].map(rating => (
                                <SelectItem key={rating} value={rating.toString()}>
                                  <div className="flex items-center gap-1">
                                    {Array.from({ length: rating }).map((_, i) => (
                                      <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                    ))}
                                    <span className="ml-1">({rating})</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Quote</Label>
                        <Textarea
                          value={testimonial.quote}
                          onChange={(e) => handleTestimonialChange(index, 'quote', e.target.value)}
                          placeholder="Customer testimonial quote..."
                          rows={3}
                        />
                      </div>

                      <ImagePicker
                        label="Avatar Image (Optional)"
                        value={testimonial.avatar || ''}
                        onChange={(url) => handleTestimonialChange(index, 'avatar', url)}
                        placeholder="Select or enter avatar URL"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
              {formData.testimonials.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No testimonials added. Click "Add Testimonial" to add one.
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
      </TabsContent>
    </Tabs>
  );
}
