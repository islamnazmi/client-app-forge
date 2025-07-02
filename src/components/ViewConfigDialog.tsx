import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAppConfig, AppView, ListViewConfig, FormViewConfig, CustomFormField, CustomFieldType } from "@/hooks/useAppConfig";
import { AirtableField } from '@/lib/airtable';
import { ScrollArea } from './ui/scroll-area';
import { PlusCircle, Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';

interface ViewConfigDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  appId: string;
  pageId: string;
  view: AppView;
  tableFields: AirtableField[];
}

export const ViewConfigDialog: React.FC<ViewConfigDialogProps> = ({ isOpen, onOpenChange, appId, pageId, view, tableFields }) => {
  const { updateView } = useAppConfig();
  const [viewName, setViewName] = useState(view.name);
  const [viewConfig, setViewConfig] = useState<ListViewConfig | FormViewConfig>(view.config);

  useEffect(() => {
    setViewName(view.name);
    setViewConfig(view.config);
  }, [view]);

  const handleSave = () => {
    updateView(appId, pageId, view.id, { name: viewName, config: viewConfig });
    onOpenChange(false);
  };

  const handleAirtableFieldToggle = (fieldId: string, checked: boolean) => {
    const currentConfig = viewConfig as FormViewConfig;
    const field = tableFields.find(f => f.id === fieldId);
    if (!field) return;

    const newFields = checked
      ? [...currentConfig.airtableFields, { id: field.id, name: field.name, type: field.type }]
      : currentConfig.airtableFields.filter(f => f.id !== fieldId);
    
    setViewConfig({ ...currentConfig, airtableFields: newFields });
  };

  const handleSubmissionTargetChange = (value: 'airtable' | 'webhook') => {
    const currentConfig = viewConfig as FormViewConfig;
    setViewConfig({ ...currentConfig, submissionTarget: value });
  };

  const handleWebhookUrlChange = (url: string) => {
    const currentConfig = viewConfig as FormViewConfig;
    setViewConfig({ ...currentConfig, webhookUrl: url });
  };
  
  const handleAddCustomField = () => {
    const currentConfig = viewConfig as FormViewConfig;
    const newField: CustomFormField = {
        id: `custom_${Date.now()}`,
        label: 'New Field',
        type: 'text',
        options: []
    };
    setViewConfig({
        ...currentConfig,
        customFields: [...(currentConfig.customFields || []), newField]
    });
  };

  const handleCustomFieldChange = (fieldId: string, prop: keyof CustomFormField, value: any) => {
    const currentConfig = viewConfig as FormViewConfig;
    const updatedFields = (currentConfig.customFields || []).map(field => 
        field.id === fieldId ? { ...field, [prop]: value } : field
    );
    setViewConfig({ ...currentConfig, customFields: updatedFields });
  };
  
  const handleRemoveCustomField = (fieldId: string) => {
    const currentConfig = viewConfig as FormViewConfig;
    const updatedFields = (currentConfig.customFields || []).filter(field => field.id !== fieldId);
    setViewConfig({ ...currentConfig, customFields: updatedFields });
  };

  const renderFormViewConfig = () => {
    const config = viewConfig as FormViewConfig;
    return (
      <div className="space-y-6">
        <div>
          <Label>Submission Target</Label>
          <RadioGroup value={config.submissionTarget} onValueChange={handleSubmissionTargetChange} className="mt-2">
            <div className="flex items-center space-x-2"><RadioGroupItem value="airtable" id="airtable" /><Label htmlFor="airtable">Submit to Airtable</Label></div>
            <div className="flex items-center space-x-2"><RadioGroupItem value="webhook" id="webhook" /><Label htmlFor="webhook">Send to Webhook</Label></div>
          </RadioGroup>
        </div>
        
        {config.submissionTarget === 'webhook' ? (
            <div className='space-y-4'>
                <div>
                    <Label htmlFor="webhook-url">Webhook URL</Label>
                    <Input id="webhook-url" value={config.webhookUrl || ''} onChange={(e) => handleWebhookUrlChange(e.target.value)} />
                </div>
                <div>
                    <Label>Custom Form Fields</Label>
                    <ScrollArea className="h-48 border rounded-md p-2 mt-2">
                        <div className="space-y-4 p-2">
                            {(config.customFields || []).map(field => (
                                <div key={field.id} className="p-2 border rounded-md space-y-2">
                                    <div className='flex items-center gap-2'>
                                        <Input value={field.label} onChange={(e) => handleCustomFieldChange(field.id, 'label', e.target.value)} placeholder="Field Label"/>
                                        <Button variant="ghost" size="icon" onClick={() => handleRemoveCustomField(field.id)}><Trash2 className="w-4 h-4 text-destructive"/></Button>
                                    </div>
                                    <Select value={field.type} onValueChange={(value: CustomFieldType) => handleCustomFieldChange(field.id, 'type', value)}>
                                        <SelectTrigger><SelectValue/></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="text">Text</SelectItem>
                                            <SelectItem value="email">Email</SelectItem>
                                            <SelectItem value="number">Number</SelectItem>
                                            <SelectItem value="tel">Phone</SelectItem>
                                            <SelectItem value="longText">Long Text</SelectItem>
                                            <SelectItem value="password">Password</SelectItem>
                                            <SelectItem value="singleSelect">Single Select</SelectItem>
                                            <SelectItem value="checkbox">Checkbox</SelectItem>
                                            <SelectItem value="date">Date</SelectItem>
                                            <SelectItem value="dateTime">Date Time</SelectItem>
                                            <SelectItem value="file">File Upload</SelectItem>
                                            <SelectItem value="url">URL</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {(field.type === 'singleSelect' || field.type === 'multiSelect') && (
                                        <div>
                                            <Label className="text-xs">Options (comma-separated)</Label>
                                            <Input 
                                                value={(field.options || []).join(', ')} 
                                                onChange={(e) => handleCustomFieldChange(field.id, 'options', e.target.value.split(',').map(s => s.trim()))}
                                                placeholder="Option 1, Option 2"
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                    <Button variant="outline" size="sm" className="mt-2" onClick={handleAddCustomField}><PlusCircle className="w-4 h-4 mr-2"/>Add Custom Field</Button>
                </div>
            </div>
        ) : (
             <div>
                <Label>Airtable Form Fields</Label>
                 <ScrollArea className="h-64 border rounded-md p-4 mt-2">
                    <div className="space-y-2">
                        {tableFields.filter(f => !f.type.includes('formula') && !f.type.includes('lookup')).map(field => (
                            <div key={field.id} className="flex items-center space-x-2">
                            <Checkbox
                                id={`form-field-${field.id}`}
                                checked={config.airtableFields.some(f => f.id === field.id)}
                                onCheckedChange={(checked) => handleAirtableFieldToggle(field.id, !!checked)}
                            />
                            <Label htmlFor={`form-field-${field.id}`}>{field.name}</Label>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </div>
        )}
      </div>
    );
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Configure View: {view.name}</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div>
            <Label htmlFor="view-name">View Name</Label>
            <Input id="view-name" value={viewName} onChange={(e) => setViewName(e.target.value)} />
          </div>
          {view.type === 'form' ? renderFormViewConfig() : <p>Configuration for {view.type} views coming soon.</p>}
        </div>
        <DialogFooter>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};