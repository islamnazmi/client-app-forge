import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Database, Settings, Share2 } from "lucide-react";
import ListView from "@/components/DataBlocks/ListView";
import TableView from "@/components/DataBlocks/TableView";

const AppPreview = () => {
  const navigate = useNavigate();
  const [selectedRecord, setSelectedRecord] = useState<any>(null);

  const handleRecordClick = (record: any) => {
    setSelectedRecord(record);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" onClick={() => navigate("/")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-accent rounded-lg flex items-center justify-center">
                  <Database className="w-5 h-5 text-accent-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Acme Corp Dashboard</h1>
                  <p className="text-sm text-muted-foreground">Client Application Preview</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="success">
                Live Preview
              </Badge>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Configure
              </Button>
              <Button variant="primary" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Deploy
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {!selectedRecord ? (
          /* Main Data Views */
          <div className="space-y-8">
            {/* Client App Hero */}
            <div className="text-center py-12 px-6 bg-gradient-secondary rounded-3xl">
              <h2 className="text-3xl font-bold mb-4">Welcome to Acme Corp</h2>
              <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
                Manage your projects, track progress, and collaborate with your team
              </p>
              <div className="flex justify-center space-x-4">
                <Badge variant="outline" className="px-3 py-1">
                  5 Active Projects
                </Badge>
                <Badge variant="outline" className="px-3 py-1">
                  12 Team Members
                </Badge>
                <Badge variant="outline" className="px-3 py-1">
                  98% On Time
                </Badge>
              </div>
            </div>

            {/* Data Block Tabs */}
            <Tabs defaultValue="list" className="space-y-6">
              <div className="flex justify-between items-center">
                <TabsList>
                  <TabsTrigger value="list">List View</TabsTrigger>
                  <TabsTrigger value="table">Table View</TabsTrigger>
                </TabsList>
                <div className="text-sm text-muted-foreground">
                  Connected to Airtable • Last sync: 2 minutes ago
                </div>
              </div>

              <TabsContent value="list">
                <ListView onRecordClick={handleRecordClick} />
              </TabsContent>

              <TabsContent value="table">
                <TableView onRecordClick={handleRecordClick} />
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          /* Record Details View */
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setSelectedRecord(null)}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to List
              </Button>
              <h2 className="text-2xl font-bold">{selectedRecord.Name}</h2>
              <Badge variant="success">
                {selectedRecord.Status}
              </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Project Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Status</label>
                      <Badge variant="success" className="block w-fit mt-1">
                        {selectedRecord.Status}
                      </Badge>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Priority</label>
                      <p className={`font-medium mt-1 ${
                        selectedRecord.Priority === "High" ? "text-destructive" :
                        selectedRecord.Priority === "Medium" ? "text-primary" : "text-success"
                      }`}>
                        {selectedRecord.Priority}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Created</label>
                      <p className="mt-1">{selectedRecord.Created}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Project ID</label>
                      <p className="mt-1 font-mono text-sm">#{selectedRecord.id}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="primary" className="w-full">
                    Update Status
                  </Button>
                  <Button variant="outline" className="w-full">
                    Edit Project
                  </Button>
                  <Button variant="outline" className="w-full">
                    View Timeline
                  </Button>
                  <Button variant="outline" className="w-full">
                    Export Data
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Additional Details */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Project Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  This is a sample project description that would typically be pulled from your Airtable data. 
                  You can customize which fields are displayed and how they're formatted in the Agency Builder configuration.
                </p>
                <div className="mt-6 flex space-x-4">
                  <div className="flex-1">
                    <label className="text-sm font-medium text-muted-foreground">Team Members</label>
                    <div className="flex space-x-2 mt-2">
                      {["JD", "AS", "MK"].map((initials, i) => (
                        <div key={i} className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center text-xs font-medium text-primary-foreground">
                          {initials}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="text-sm font-medium text-muted-foreground">Progress</label>
                    <div className="mt-2">
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div className="bg-gradient-primary h-2 rounded-full" style={{ width: "65%" }}></div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">65% Complete</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppPreview;