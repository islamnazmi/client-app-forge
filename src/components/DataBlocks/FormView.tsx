import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AirtableAPI, AirtableTable, AirtableField } from '@/lib/airtable';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { AppView, FormViewConfig, CustomFormField, AirtableFormField } from '@/hooks/useAppConfig';
import { Checkbox } from '../ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';

interface FormViewProps {
  airtableApi: AirtableAPI;
  baseId: string;
  table: AirtableTable;
  view: AppView;
  onSuccess?: () => void;
}

const FormView: React.FC<FormViewProps> = ({ airtableApi, baseId, table, view, onSuccess }) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
  const { toast } = useToast();
  const config = view.config as FormViewConfig;

  const handleInputChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    let submissionPayload: Record<string, any> = {};

    if (config.submissionTarget === 'airtable') {
      config.airtableFields.forEach(field => {
        if (formData[field.id] !== undefined) {
          submissionPayload[field.name] = formData[field.id];
        }
      });
    } else {
      config.customFields.forEach(field => {
        if (formData[field.id] !== undefined) {
          submissionPayload[field.label] = formData[field.id];
        }
      });
    }

    try {
      if (config.submissionTarget === 'airtable') {
        await airtableApi.createRecord(baseId, table.id, { fields: submissionPayload });
        toast({ title: "Success!", description: "New record created in Airtable." });
      } else if (config.submissionTarget === 'webhook' && config.webhookUrl) {
        await fetch(config.webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            appId: baseId,
            tableName: table.name,
            formData: submissionPayload,
          }),
        });
        toast({ title: "Success!", description: "Data sent to webhook." });
      }
      setFormData({});
      onSuccess?.();
    } catch (error) {
      toast({ title: "Submission Failed", description: (error as Error).message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const fieldsToRender = config.submissionTarget === 'airtable' ? config.airtableFields : (config.customFields || []);

  const renderField = (fieldConfig: AirtableFormField | CustomFormField) => {
    const isAirtableField = 'name' in fieldConfig;
    
    const fieldId = fieldConfig.id;
    const name = isAirtableField ? (fieldConfig as AirtableFormField).name : (fieldConfig as CustomFormField).label;
    const fieldSchema = isAirtableField ? table.fields.find(f => f.id === fieldConfig.id) : null;
    const type = isAirtableField ? fieldSchema!.type : (fieldConfig as CustomFormField).type;
    const options = isAirtableField ? fieldSchema!.options : (fieldConfig as CustomFormField).options ? { choices: (fieldConfig as CustomFormField).options!.map(opt => ({name: opt}))} : undefined;
    
    const value = formData[fieldId] || '';

    if (type === 'password') {
        return (
            <div className="relative">
                <Input 
                    type={showPassword[fieldId] ? 'text' : 'password'} 
                    id={fieldId} 
                    value={value} 
                    onChange={(e) => handleInputChange(fieldId, e.target.value)} 
                />
                <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                    onClick={() => setShowPassword(prev => ({...prev, [fieldId]: !prev[fieldId]}))}
                >
                    {showPassword[fieldId] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
            </div>
        )
    }

    switch (type) {
      case 'number': case 'currency': case 'percent':
        return <Input type="number" id={fieldId} value={value} onChange={(e) => handleInputChange(fieldId, Number(e.target.value))} />;
      case 'email':
        return <Input type="email" id={fieldId} value={value} onChange={(e) => handleInputChange(fieldId, e.target.value)} />;
      case 'url':
        return <Input type="url" id={fieldId} value={value} onChange={(e) => handleInputChange(fieldId, e.target.value)} />;
      case 'tel':
        return <Input type="tel" id={fieldId} value={value} onChange={(e) => handleInputChange(fieldId, e.target.value)} />;
      case 'multilineText': case 'longText': case 'textarea':
        return <Textarea id={fieldId} value={value} onChange={(e) => handleInputChange(fieldId, e.target.value)} />;
      case 'date':
        return <Input type="date" id={fieldId} value={value} onChange={(e) => handleInputChange(fieldId, e.target.value)} />;
      case 'dateTime':
        return <Input type="datetime-local" id={fieldId} value={value} onChange={(e) => handleInputChange(fieldId, e.target.value)} />;
      case 'checkbox':
        return (
          <div className="flex items-center space-x-2 pt-2">
            <Checkbox id={fieldId} checked={!!value} onCheckedChange={(checked) => handleInputChange(fieldId, checked)} />
            <label htmlFor={fieldId} className="text-sm font-medium leading-none">{name}</label>
          </div>
        );
      case 'singleSelect':
        return (
          <Select onValueChange={(val) => handleInputChange(fieldId, val)} value={value}>
            <SelectTrigger id={fieldId}><SelectValue placeholder={`Select ${name}`} /></SelectTrigger>
            <SelectContent>
              {options?.choices.map((choice: any) => (
                <SelectItem key={choice.id || choice.name} value={choice.name}>{choice.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
       case 'file':
           return <Input type="file" id={fieldId} onChange={(e) => handleInputChange(fieldId, e.target.files ? e.target.files[0] : null)} />;
      default:
        return <Input type="text" id={fieldId} value={value} onChange={(e) => handleInputChange(fieldId, e.target.value)} />;
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>New Entry for {config.submissionTarget === 'airtable' ? table.name : view.name}</CardTitle>
        <CardDescription>Fill out the form to add a new record.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {fieldsToRender.map(field => (
            <div key={field.id} className="space-y-2">
              <Label htmlFor={field.id}>{'label' in field ? field.label : field.name}</Label>
              {renderField(field)}
            </div>
          ))}
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
export default FormView;