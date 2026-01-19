import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useCMSPages, useCMSSections, useUpdateCMSSection, usePublishCMSPage, CMSSection } from '@/hooks/useOwnerData';
import { Loader2, Globe, Edit, Eye, EyeOff, Save, FileText, Layout, List, HelpCircle, Phone, Image, MessageSquare, BarChart3, DollarSign, Star, Building2 } from 'lucide-react';
import { format } from 'date-fns';
import {
  HeroEditor,
  StatisticsEditor,
  PricingEditor,
  FAQEditor,
  TestimonialsEditor,
  ContactEditor,
  ManufacturersEditor,
  FeaturesEditor,
} from '@/components/owner/cms-editors';

export default function CMSManager() {
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [editingSection, setEditingSection] = useState<CMSSection | null>(null);
  const [editContent, setEditContent] = useState('');

  const { data: pages, isLoading: pagesLoading } = useCMSPages();
  const { data: sections, isLoading: sectionsLoading } = useCMSSections(selectedPageId || pages?.[0]?.id);
  const updateSection = useUpdateCMSSection();
  const publishPage = usePublishCMSPage();

  // Auto-select first page
  const currentPageId = selectedPageId || pages?.[0]?.id;
  const currentPage = pages?.find(p => p.id === currentPageId);

  const handleEditSection = (section: CMSSection) => {
    setEditingSection(section);
    setEditContent(JSON.stringify(section.content, null, 2));
  };

  const handleSaveSection = async () => {
    if (!editingSection) return;
    
    try {
      const content = JSON.parse(editContent);
      await updateSection.mutateAsync({
        sectionId: editingSection.id,
        content,
      });
      setEditingSection(null);
    } catch (e) {
      alert('Invalid JSON format');
    }
  };

  const handleSaveWithContent = async (content: any) => {
    if (!editingSection) return;
    
    await updateSection.mutateAsync({
      sectionId: editingSection.id,
      content,
    });
    setEditingSection(null);
  };

  const handleToggleVisibility = async (section: CMSSection) => {
    await updateSection.mutateAsync({
      sectionId: section.id,
      isVisible: !section.is_visible,
    });
  };

  const handlePublish = async () => {
    if (!currentPageId) return;
    await publishPage.mutateAsync({
      pageId: currentPageId,
      publish: !currentPage?.is_published,
    });
  };

  const getSectionIcon = (sectionType: string) => {
    switch (sectionType) {
      case 'hero':
        return <Layout className="h-4 w-4" />;
      case 'features':
        return <List className="h-4 w-4" />;
      case 'pricing':
        return <DollarSign className="h-4 w-4" />;
      case 'faq':
        return <HelpCircle className="h-4 w-4" />;
      case 'contact':
        return <Phone className="h-4 w-4" />;
      case 'testimonials':
        return <MessageSquare className="h-4 w-4" />;
      case 'statistics':
        return <BarChart3 className="h-4 w-4" />;
      case 'manufacturers':
        return <Building2 className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const hasFormEditor = (sectionKey: string) => {
    return ['hero', 'statistics', 'pricing', 'faq', 'testimonials', 'contact', 'manufacturers', 'features'].includes(sectionKey);
  };

  const renderFormEditor = () => {
    if (!editingSection) return null;

    const sectionKey = editingSection.section_key;
    const content = editingSection.content as any;

    switch (sectionKey) {
      case 'hero':
        return (
          <HeroEditor
            content={content}
            onSave={handleSaveWithContent}
            isSaving={updateSection.isPending}
          />
        );
      case 'statistics':
        return (
          <StatisticsEditor
            content={content}
            onSave={handleSaveWithContent}
            isSaving={updateSection.isPending}
          />
        );
      case 'pricing':
        return (
          <PricingEditor
            content={content}
            onSave={handleSaveWithContent}
            isSaving={updateSection.isPending}
          />
        );
      case 'faq':
        return (
          <FAQEditor
            content={content}
            onSave={handleSaveWithContent}
            isSaving={updateSection.isPending}
          />
        );
      case 'testimonials':
        return (
          <TestimonialsEditor
            content={content}
            onSave={handleSaveWithContent}
            isSaving={updateSection.isPending}
          />
        );
      case 'contact':
        return (
          <ContactEditor
            content={content}
            onSave={handleSaveWithContent}
            isSaving={updateSection.isPending}
          />
        );
      case 'manufacturers':
        return (
          <ManufacturersEditor
            content={content}
            onSave={handleSaveWithContent}
            isSaving={updateSection.isPending}
          />
        );
      case 'features':
        return (
          <FeaturesEditor
            content={content}
            onSave={handleSaveWithContent}
            isSaving={updateSection.isPending}
          />
        );
      default:
        return null;
    }
  };

  if (pagesLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Globe className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">CMS Manager</h1>
            <p className="text-muted-foreground">Manage marketing website content</p>
          </div>
        </div>
        {currentPage && (
          <Button 
            variant={currentPage.is_published ? 'outline' : 'default'}
            onClick={handlePublish}
            disabled={publishPage.isPending}
          >
            {publishPage.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {currentPage.is_published ? (
              <>
                <EyeOff className="h-4 w-4 mr-2" />
                Unpublish
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Publish
              </>
            )}
          </Button>
        )}
      </div>

      {/* Page Selector */}
      <Card className="border-0 shadow-card">
        <CardHeader>
          <CardTitle>Pages</CardTitle>
          <CardDescription>Select a page to edit its content</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {pages?.map((page) => (
              <Button
                key={page.id}
                variant={currentPageId === page.id ? 'default' : 'outline'}
                onClick={() => setSelectedPageId(page.id)}
                className="gap-2"
              >
                <FileText className="h-4 w-4" />
                {page.page_title}
                {page.is_published ? (
                  <Badge variant="outline" className="ml-1 border-green-500 text-green-600">Live</Badge>
                ) : (
                  <Badge variant="outline" className="ml-1">Draft</Badge>
                )}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Page Info */}
      {currentPage && (
        <Card className="border-0 shadow-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{currentPage.page_title}</CardTitle>
                <CardDescription>
                  /{currentPage.page_slug} • Version {currentPage.version}
                  {currentPage.published_at && ` • Published ${format(new Date(currentPage.published_at), 'dd MMM yyyy HH:mm')}`}
                </CardDescription>
              </div>
              <Badge variant={currentPage.is_published ? 'default' : 'secondary'}>
                {currentPage.is_published ? 'Published' : 'Draft'}
              </Badge>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Sections */}
      <Card className="border-0 shadow-card">
        <CardHeader>
          <CardTitle>Page Sections</CardTitle>
          <CardDescription>Edit content sections on this page</CardDescription>
        </CardHeader>
        <CardContent>
          {sectionsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-4">
              {sections?.map((section) => (
                <div 
                  key={section.id} 
                  className={`p-4 rounded-lg border ${section.is_visible ? 'bg-card' : 'bg-muted/50 opacity-60'}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getSectionIcon(section.section_type)}
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium capitalize">{section.section_key.replace(/_/g, ' ')}</p>
                          {hasFormEditor(section.section_key) && (
                            <Badge variant="secondary" className="text-xs">Form Editor</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground capitalize">{section.section_type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2 mr-4">
                        <Switch 
                          checked={section.is_visible}
                          onCheckedChange={() => handleToggleVisibility(section)}
                        />
                        <span className="text-sm text-muted-foreground">
                          {section.is_visible ? 'Visible' : 'Hidden'}
                        </span>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => handleEditSection(section)}>
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                  
                  {/* Content Preview */}
                  <div className="mt-3 p-3 bg-muted/50 rounded text-sm">
                    <pre className="whitespace-pre-wrap text-muted-foreground overflow-hidden max-h-24">
                      {JSON.stringify(section.content, null, 2).slice(0, 200)}
                      {JSON.stringify(section.content, null, 2).length > 200 && '...'}
                    </pre>
                  </div>
                </div>
              ))}

              {sections?.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No sections found for this page
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Section Dialog */}
      <Dialog open={!!editingSection} onOpenChange={() => setEditingSection(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="capitalize">
              Edit {editingSection?.section_key.replace(/_/g, ' ')}
            </DialogTitle>
            <DialogDescription>
              {hasFormEditor(editingSection?.section_key || '') 
                ? 'Use the form below to edit this section content'
                : 'Edit the JSON content for this section'}
            </DialogDescription>
          </DialogHeader>
          
          {editingSection && hasFormEditor(editingSection.section_key) ? (
            <div className="py-4">
              {renderFormEditor()}
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Content (JSON)</Label>
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="font-mono text-sm min-h-[300px]"
                    placeholder="Enter valid JSON..."
                  />
                  <p className="text-xs text-muted-foreground">
                    Edit the JSON content. Make sure to maintain valid JSON format.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditingSection(null)}>Cancel</Button>
                <Button onClick={handleSaveSection} disabled={updateSection.isPending}>
                  {updateSection.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
