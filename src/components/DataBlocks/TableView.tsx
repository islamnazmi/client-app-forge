import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUp, ArrowDown, Search, Filter } from "lucide-react";

interface TableViewProps {
  data?: any[];
  fields?: string[];
  onRecordClick?: (record: any) => void;
}

const TableView: React.FC<TableViewProps> = ({ 
  data = [], 
  fields = ["Name", "Status", "Created", "Priority"], 
  onRecordClick 
}) => {
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [searchTerm, setSearchTerm] = useState("");

  // Sample data for demo
  const sampleData = data.length > 0 ? data : [
    { id: 1, Name: "Project Alpha", Status: "Active", Created: "2024-01-15", Priority: "High" },
    { id: 2, Name: "Client Portal", Status: "Completed", Created: "2024-01-10", Priority: "Medium" },
    { id: 3, Name: "Dashboard Update", Status: "In Progress", Created: "2024-01-20", Priority: "Low" },
    { id: 4, Name: "Mobile App", Status: "Planning", Created: "2024-01-25", Priority: "High" },
    { id: 5, Name: "API Integration", Status: "Active", Created: "2024-01-12", Priority: "Medium" },
  ];

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredAndSortedData = sampleData
    .filter(record => 
      record.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.Status.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (!sortField) return 0;
      
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

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

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "text-destructive";
      case "medium":
        return "text-primary";
      case "low":
        return "text-success";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Data Table</CardTitle>
          <div className="flex space-x-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search records..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {fields.map((field) => (
                  <TableHead 
                    key={field}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleSort(field)}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{field}</span>
                      {sortField === field && (
                        sortDirection === "asc" ? 
                          <ArrowUp className="w-4 h-4" /> : 
                          <ArrowDown className="w-4 h-4" />
                      )}
                    </div>
                  </TableHead>
                ))}
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedData.map((record) => (
                <TableRow 
                  key={record.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => onRecordClick?.(record)}
                >
                  <TableCell className="font-medium">{record.Name}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(record.Status) as any}>
                      {record.Status}
                    </Badge>
                  </TableCell>
                  <TableCell>{record.Created}</TableCell>
                  <TableCell>
                    <span className={`font-medium ${getPriorityColor(record.Priority)}`}>
                      {record.Priority}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">
            Showing {filteredAndSortedData.length} of {sampleData.length} records
          </p>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled>
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TableView;