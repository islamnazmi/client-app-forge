import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AirtableRecord, AirtableField } from "@/lib/airtable";
import { AppView, ListViewConfig } from "@/hooks/useAppConfig";

interface ListViewProps {
  data: AirtableRecord[];
  view: AppView;
  tableFields: AirtableField[];
  onRecordClick?: (record: AirtableRecord) => void;
}

const ListView: React.FC<ListViewProps> = ({ data = [], view, tableFields, onRecordClick }) => {
  const config = view.config as ListViewConfig;

  // Helper to get field data (name and value) using the field ID from the config
  const getFieldData = (record: AirtableRecord, fieldId: string) => {
    const fieldSchema = tableFields.find(f => f.id === fieldId);
    if (!fieldSchema) {
      return { name: "Unknown Field", value: "Error" };
    }
    return { name: fieldSchema.name, value: record.fields[fieldSchema.name] };
  }

  if (!tableFields || tableFields.length === 0) {
    return <p className="text-sm text-muted-foreground">Waiting for table fields to be configured...</p>;
  }
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((record) => {
          // Use the first configured visible field as the title, or the first field in the table as a fallback
          const titleFieldId = config.visibleFields?.[0] || tableFields[0]?.id;
          
          // Use the next few visible fields as the body content
          const otherVisibleFieldIds = config.visibleFields?.slice(1, 4) || [];

          return (
            <Card 
              key={record.id} 
              className="shadow-card hover:shadow-elegant transition-all duration-300 hover:scale-105 cursor-pointer"
              onClick={() => onRecordClick?.(record)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium truncate">
                  {String(getFieldData(record, titleFieldId)?.value || 'Untitled Record')}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                {otherVisibleFieldIds.map(fieldId => {
                    const fieldData = getFieldData(record, fieldId);
                    return (
                        <div key={fieldId} className="text-sm text-muted-foreground flex justify-between">
                            <span className="font-medium capitalize">{fieldData.name.replace(/_/g, ' ')}:</span>
                            <span className="truncate ml-2">{String(fieldData.value || '-')}</span>
                        </div>
                    )
                })}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  );
};

export default ListView;