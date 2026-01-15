import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Mail, Edit, Eye, Loader2, Code, Save, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

interface EmailTemplate {
  id: string;
  template_key: string;
  template_name: string;
  subject: string;
  html_content: string;
  placeholders: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function EmailTemplates() {
  const queryClient = useQueryClient();
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [editedSubject, setEditedSubject] = useState('');
  const [editedContent, setEditedContent] = useState('');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');

  // Fetch templates
  const { data: templates, isLoading } = useQuery({
    queryKey: ['email-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('template_name');
      
      if (error) throw error;
      return data as EmailTemplate[];
    },
  });

  // Update template mutation
  const updateTemplate = useMutation({
    mutationFn: async ({ id, subject, html_content, is_active }: { id: string; subject?: string; html_content?: string; is_active?: boolean }) => {
      const updates: Record<string, any> = {};
      if (subject !== undefined) updates.subject = subject;
      if (html_content !== undefined) updates.html_content = html_content;
      if (is_active !== undefined) updates.is_active = is_active;

      const { error } = await supabase
        .from('email_templates')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      toast.success('Template updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update template: ' + error.message);
    },
  });

  const handleSelectTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setEditedSubject(template.subject);
    setEditedContent(template.html_content);
  };

  const handleSave = () => {
    if (!selectedTemplate) return;
    updateTemplate.mutate({
      id: selectedTemplate.id,
      subject: editedSubject,
      html_content: editedContent,
    });
  };

  const handleToggleActive = (template: EmailTemplate) => {
    updateTemplate.mutate({
      id: template.id,
      is_active: !template.is_active,
    });
  };

  const handlePreview = () => {
    // Replace placeholders with sample data for preview
    let html = editedContent;
    const sampleData: Record<string, string> = {
      '{{staff_name}}': 'John Doe',
      '{{email}}': 'john@example.com',
      '{{temp_password}}': 'TempPass123!',
      '{{new_password}}': 'NewPass456!',
      '{{pharmacy_name}}': 'City Pharmacy',
      '{{platform_name}}': 'MedFlowX',
      '{{login_url}}': 'https://medflowxbd.lovable.app/login',
    };
    
    Object.entries(sampleData).forEach(([placeholder, value]) => {
      html = html.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), value);
    });
    
    setPreviewHtml(html);
    setIsPreviewOpen(true);
  };

  const handleReset = () => {
    if (selectedTemplate) {
      setEditedSubject(selectedTemplate.subject);
      setEditedContent(selectedTemplate.html_content);
    }
  };

  const hasChanges = selectedTemplate && (
    editedSubject !== selectedTemplate.subject ||
    editedContent !== selectedTemplate.html_content
  );

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Mail className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Email Templates</h1>
          <p className="text-muted-foreground">Customize email notifications with placeholders</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Template List */}
        <Card className="border-0 shadow-card lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Templates</CardTitle>
            <CardDescription>Select a template to edit</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {templates?.map((template) => (
              <div
                key={template.id}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedTemplate?.id === template.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                }`}
                onClick={() => handleSelectTemplate(template)}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium">{template.template_name}</span>
                  <Badge variant={template.is_active ? 'default' : 'secondary'} className="text-xs">
                    {template.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground truncate">{template.subject}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Template Editor */}
        <Card className="border-0 shadow-card lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">
                  {selectedTemplate ? selectedTemplate.template_name : 'Select a Template'}
                </CardTitle>
                <CardDescription>
                  {selectedTemplate ? `Key: ${selectedTemplate.template_key}` : 'Choose a template from the list'}
                </CardDescription>
              </div>
              {selectedTemplate && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 mr-4">
                    <Label htmlFor="active-toggle" className="text-sm">Active</Label>
                    <Switch
                      id="active-toggle"
                      checked={selectedTemplate.is_active}
                      onCheckedChange={() => handleToggleActive(selectedTemplate)}
                    />
                  </div>
                  <Button variant="outline" size="sm" onClick={handlePreview}>
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleReset} disabled={!hasChanges}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                  <Button size="sm" onClick={handleSave} disabled={!hasChanges || updateTemplate.isPending}>
                    {updateTemplate.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {selectedTemplate ? (
              <Tabs defaultValue="editor" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="editor">
                    <Edit className="h-4 w-4 mr-2" />
                    Editor
                  </TabsTrigger>
                  <TabsTrigger value="placeholders">
                    <Code className="h-4 w-4 mr-2" />
                    Placeholders
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="editor" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject">Email Subject</Label>
                    <Input
                      id="subject"
                      value={editedSubject}
                      onChange={(e) => setEditedSubject(e.target.value)}
                      placeholder="Email subject line..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="content">HTML Content</Label>
                    <Textarea
                      id="content"
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                      className="font-mono text-sm min-h-[400px]"
                      placeholder="HTML email content..."
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="placeholders">
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Use these placeholders in your template. They will be replaced with actual values when sending emails.
                    </p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {selectedTemplate.placeholders?.map((placeholder) => (
                        <div
                          key={placeholder}
                          className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border"
                        >
                          <code className="text-sm font-mono text-primary">{`{{${placeholder}}}`}</code>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="ml-auto h-7 text-xs"
                            onClick={() => {
                              navigator.clipboard.writeText(`{{${placeholder}}}`);
                              toast.success('Copied to clipboard');
                            }}
                          >
                            Copy
                          </Button>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
                      <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">💡 Tips</h4>
                      <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                        <li>• Placeholders are case-sensitive</li>
                        <li>• Use double curly braces: {`{{placeholder}}`}</li>
                        <li>• Test your template using the Preview button</li>
                        <li>• Keep emails mobile-friendly with inline CSS</li>
                      </ul>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Mail className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Select a template from the list to start editing</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Email Preview</DialogTitle>
            <DialogDescription>Preview with sample data</DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[60vh] border rounded-lg">
            <div 
              className="p-4"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
