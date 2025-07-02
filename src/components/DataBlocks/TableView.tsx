import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AirtableRecord } from "@/lib/airtable";

interface TableViewProps {
  data: AirtableRecord[];
  fields: string[];
  onRecordClick?: (record: AirtableRecord) => void;
}

const TableView: React.FC<TableViewProps> = ({ 
  data = [], 
  fields = [],
  onRecordClick 
}) => {
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const sortedData = [...data].sort((a, b) => {
    if (!sortField) return 0;
    
    const aValue = a.fields[sortField];
    const bValue = b.fields[sortField];

    if (aValue === bValue) return 0;
    if (aValue === undefined || aValue === null) return 1;
    if (bValue === undefined || bValue === null) return -1;

    if (sortDirection === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const displayFields = fields.slice(0, 5); // Limit to first 5 fields for now

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle>Data Table</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {displayFields.map((field) => (
                  <TableHead key={field}>{field}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map((record) => (
                <TableRow 
                  key={record.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => onRecordClick?.(record)}
                >
                  {displayFields.map(field => (
                    <TableCell key={`${record.id}-${field}`}>
                      {String(record.fields[field] ?? '')}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default TableView;
