import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2 } from "lucide-react";

interface ListViewProps {
  data?: any[];
  fields?: string[];
  onRecordClick?: (record: any) => void;
}

const ListView: React.FC<ListViewProps> = ({ 
  data = [], 
  fields = ["Name", "Status", "Created"], 
  onRecordClick 
}) => {
  // Sample data for demo
  const sampleData = data.length > 0 ? data : [
    { id: 1, Name: "Project Alpha", Status: "Active", Created: "2024-01-15", Priority: "High" },
    { id: 2, Name: "Client Portal", Status: "Completed", Created: "2024-01-10", Priority: "Medium" },
    { id: 3, Name: "Dashboard Update", Status: "In Progress", Created: "2024-01-20", Priority: "Low" },
    { id: 4, Name: "Mobile App", Status: "Planning", Created: "2024-01-25", Priority: "High" },
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
      case "completed":
        return "success";
      case "in progress":
        return "default";
      case "planning":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Records</h3>
        <div className="text-sm text-muted-foreground">
          {sampleData.length} records
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sampleData.map((record) => (
          <Card 
            key={record.id} 
            className="shadow-card hover:shadow-elegant transition-all duration-300 hover:scale-105 cursor-pointer"
            onClick={() => onRecordClick?.(record)}
          >
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-base font-medium">
                  {record.Name}
                </CardTitle>
                <Badge variant={getStatusColor(record.Status) as any}>
                  {record.Status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Created</span>
                  <span>{record.Created}</span>
                </div>
                {record.Priority && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Priority</span>
                    <span className={`font-medium ${
                      record.Priority === "High" ? "text-destructive" :
                      record.Priority === "Medium" ? "text-primary" : "text-success"
                    }`}>
                      {record.Priority}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex space-x-2 mt-4">
                <Button variant="outline" size="sm" className="flex-1">
                  <Eye className="w-3 h-3 mr-1" />
                  View
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit className="w-3 h-3 mr-1" />
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ListView;