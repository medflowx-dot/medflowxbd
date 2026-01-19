import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Save, Loader2, Plus, Trash2, Eye, Edit3 } from 'lucide-react';
import SectionPreview from './SectionPreview';

interface PricingPlan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta_text: string;
  is_popular: boolean;
}

interface PricingContent {
  title: string;
  subtitle: string;
  plans: PricingPlan[];
}

interface PricingEditorProps {
  content: PricingContent;
  onSave: (content: PricingContent) => Promise<void>;
  isSaving: boolean;
}

export default function PricingEditor({ content, onSave, isSaving }: PricingEditorProps) {
  const [formData, setFormData] = useState<PricingContent>({
    title: '',
    subtitle: '',
    plans: [],
  });
  const [activeTab, setActiveTab] = useState<string>('edit');

  useEffect(() => {
    if (content) {
      setFormData({
        title: content.title || '',
        subtitle: content.subtitle || '',
        plans: content.plans || [],
      });
    }
  }, [content]);

  const handleChange = (field: keyof PricingContent, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePlanChange = (index: number, field: keyof PricingPlan, value: string | boolean | string[]) => {
    const newPlans = [...formData.plans];
    newPlans[index] = { ...newPlans[index], [field]: value };
    setFormData(prev => ({ ...prev, plans: newPlans }));
  };

  const handleFeatureChange = (planIndex: number, featureIndex: number, value: string) => {
    const newPlans = [...formData.plans];
    const newFeatures = [...newPlans[planIndex].features];
    newFeatures[featureIndex] = value;
    newPlans[planIndex] = { ...newPlans[planIndex], features: newFeatures };
    setFormData(prev => ({ ...prev, plans: newPlans }));
  };

  const addFeature = (planIndex: number) => {
    const newPlans = [...formData.plans];
    newPlans[planIndex] = {
      ...newPlans[planIndex],
      features: [...newPlans[planIndex].features, ''],
    };
    setFormData(prev => ({ ...prev, plans: newPlans }));
  };

  const removeFeature = (planIndex: number, featureIndex: number) => {
    const newPlans = [...formData.plans];
    newPlans[planIndex] = {
      ...newPlans[planIndex],
      features: newPlans[planIndex].features.filter((_, i) => i !== featureIndex),
    };
    setFormData(prev => ({ ...prev, plans: newPlans }));
  };

  const addPlan = () => {
    setFormData(prev => ({
      ...prev,
      plans: [
        ...prev.plans,
        {
          name: '',
          price: '',
          period: '/month',
          description: '',
          features: [],
          cta_text: 'Get Started',
          is_popular: false,
        },
      ],
    }));
  };

  const removePlan = (index: number) => {
    setFormData(prev => ({
      ...prev,
      plans: prev.plans.filter((_, i) => i !== index),
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
            <SectionPreview sectionKey="pricing" content={formData} />
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
                  placeholder="Enter pricing section title..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subtitle">Subtitle</Label>
                <Textarea
                  id="subtitle"
                  value={formData.subtitle}
                  onChange={(e) => handleChange('subtitle', e.target.value)}
                  placeholder="Enter pricing section subtitle..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Pricing Plans</h3>
            <Button type="button" size="sm" variant="outline" onClick={addPlan}>
              <Plus className="h-4 w-4 mr-1" />
              Add Plan
            </Button>
          </div>

          {formData.plans.map((plan, planIndex) => (
            <Card key={planIndex} className="border-l-4" style={{ borderLeftColor: plan.is_popular ? 'hsl(var(--primary))' : 'transparent' }}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Plan {planIndex + 1}</CardTitle>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={plan.is_popular}
                        onCheckedChange={(checked) => handlePlanChange(planIndex, 'is_popular', checked)}
                      />
                      <Label className="text-sm text-muted-foreground">Popular</Label>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => removePlan(planIndex)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Plan Name</Label>
                    <Input
                      value={plan.name}
                      onChange={(e) => handlePlanChange(planIndex, 'name', e.target.value)}
                      placeholder="e.g., Pro"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>CTA Text</Label>
                    <Input
                      value={plan.cta_text}
                      onChange={(e) => handlePlanChange(planIndex, 'cta_text', e.target.value)}
                      placeholder="e.g., Get Started"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Price</Label>
                    <Input
                      value={plan.price}
                      onChange={(e) => handlePlanChange(planIndex, 'price', e.target.value)}
                      placeholder="e.g., ৳999"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Period</Label>
                    <Input
                      value={plan.period}
                      onChange={(e) => handlePlanChange(planIndex, 'period', e.target.value)}
                      placeholder="e.g., /month"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={plan.description}
                    onChange={(e) => handlePlanChange(planIndex, 'description', e.target.value)}
                    placeholder="Plan description..."
                    rows={2}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Features</Label>
                    <Button type="button" size="sm" variant="ghost" onClick={() => addFeature(planIndex)}>
                      <Plus className="h-3 w-3 mr-1" />
                      Add Feature
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex gap-2">
                        <Input
                          value={feature}
                          onChange={(e) => handleFeatureChange(planIndex, featureIndex, e.target.value)}
                          placeholder="Feature description..."
                        />
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          onClick={() => removeFeature(planIndex, featureIndex)}
                          className="shrink-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    {plan.features.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-2">
                        No features added
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {formData.plans.length === 0 && (
            <Card>
              <CardContent className="py-8">
                <p className="text-center text-muted-foreground">
                  No pricing plans added. Click "Add Plan" to create one.
                </p>
              </CardContent>
            </Card>
          )}

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
