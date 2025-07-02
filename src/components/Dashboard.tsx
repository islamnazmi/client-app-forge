import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Database, Settings, Plus, Table, List, Eye, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const navigate = useNavigate();
  const [airtableToken, setAirtableToken] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();

  const handleConnect = () => {
    if (!airtableToken.trim()) {
      toast({
        title: "Token Required",
        description: "Please enter your Airtable Personal Access Token",
        variant: "destructive",
      });
      return;
    }
    
    setIsConnected(true);
    toast({
      title: "Connected Successfully",
      description: "Your Airtable workspace is now connected",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Database className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Agency Builder</h1>
                <p className="text-sm text-muted-foreground">Build client web apps with Airtable</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {isConnected && (
                <Badge variant="success" className="bg-success text-success-foreground">
                  <Database className="w-3 h-3 mr-1" />
                  Connected
                </Badge>
              )}
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {!isConnected ? (
          /* Connection Setup */
          <div className="max-w-2xl mx-auto">
            <Card className="shadow-elegant">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-primary rounded-2xl mx-auto mb-4 flex items-center justify-center">
                  <Database className="w-8 h-8 text-primary-foreground" />
                </div>
                <CardTitle className="text-2xl">Connect Your Airtable</CardTitle>
                <CardDescription>
                  Enter your Personal Access Token to start building client applications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="token">Personal Access Token</Label>
                  <Input
                    id="token"
                    type="password"
                    placeholder="pat14c9c..."
                    value={airtableToken}
                    onChange={(e) => setAirtableToken(e.target.value)}
                    className="font-mono"
                  />
                  <p className="text-sm text-muted-foreground">
                    Get your token from{" "}
                    <a href="https://airtable.com/create/tokens" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      Airtable Developer Hub
                    </a>
                  </p>
                </div>
                <Button 
                  onClick={handleConnect} 
                  className="w-full" 
                  size="lg"
                  variant="primary"
                >
                  Connect Airtable
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Main Dashboard */
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="text-center py-12 px-6 bg-gradient-hero rounded-3xl text-primary-foreground">
              <h2 className="text-4xl font-bold mb-4">Build Amazing Client Apps</h2>
              <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
                Create beautiful, responsive web applications for your clients using their Airtable data
              </p>
              <Button variant="secondary" size="lg" className="bg-card text-card-foreground hover:bg-secondary">
                <Plus className="w-5 h-5 mr-2" />
                Create New App
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="shadow-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Client Apps</p>
                      <p className="text-3xl font-bold">3</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-accent rounded-2xl flex items-center justify-center">
                      <Database className="w-6 h-6 text-accent-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="shadow-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Data Sources</p>
                      <p className="text-3xl font-bold">8</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-secondary rounded-2xl flex items-center justify-center">
                      <Table className="w-6 h-6 text-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="shadow-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Automations</p>
                      <p className="text-3xl font-bold">12</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-primary rounded-2xl flex items-center justify-center">
                      <Zap className="w-6 h-6 text-primary-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="apps" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="apps">Client Apps</TabsTrigger>
                <TabsTrigger value="blocks">Data Blocks</TabsTrigger>
                <TabsTrigger value="config">Configuration</TabsTrigger>
                <TabsTrigger value="integrations">Integrations</TabsTrigger>
              </TabsList>

              <TabsContent value="apps" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-bold">Client Applications</h3>
                  <Button variant="primary">
                    <Plus className="w-4 h-4 mr-2" />
                    New App
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Sample client apps */}
                  {["Acme Corp Dashboard", "Sales Pipeline", "Inventory Manager"].map((appName, i) => (
                    <Card key={i} className="shadow-card hover:shadow-elegant transition-all duration-300 hover:scale-105">
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          {appName}
                          <Badge variant="outline">Active</Badge>
                        </CardTitle>
                        <CardDescription>
                          Client web application connected to Airtable
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => navigate("/app-preview")}>
                            <Eye className="w-4 h-4 mr-1" />
                            Preview
                          </Button>
                          <Button variant="outline" size="sm">
                            <Settings className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="blocks" className="space-y-6">
                <h3 className="text-2xl font-bold">Available Data Blocks</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { name: "List View", icon: List, description: "Display records in card/grid format" },
                    { name: "Table View", icon: Table, description: "Show data in sortable table format" },
                    { name: "Record Details", icon: Eye, description: "Detailed view of individual records" }
                  ].map((block, i) => (
                    <Card key={i} className="shadow-card hover:shadow-elegant transition-all duration-300">
                      <CardHeader>
                        <div className="w-12 h-12 bg-gradient-accent rounded-2xl flex items-center justify-center mb-4">
                          <block.icon className="w-6 h-6 text-accent-foreground" />
                        </div>
                        <CardTitle>{block.name}</CardTitle>
                        <CardDescription>{block.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button variant="outline" className="w-full">
                          Configure Block
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="config" className="space-y-6">
                <h3 className="text-2xl font-bold">Configuration</h3>
                <Card className="shadow-card">
                  <CardHeader>
                    <CardTitle>App Configuration</CardTitle>
                    <CardDescription>
                      Configure data sources, filters, and display options
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Airtable Base</Label>
                        <select className="w-full p-2 border rounded-md bg-background">
                          <option>Select a base...</option>
                          <option>Client Database</option>
                          <option>Project Tracker</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label>Table</Label>
                        <select className="w-full p-2 border rounded-md bg-background">
                          <option>Select a table...</option>
                          <option>Clients</option>
                          <option>Projects</option>
                        </select>
                      </div>
                    </div>
                    <Button variant="primary">Save Configuration</Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="integrations" className="space-y-6">
                <h3 className="text-2xl font-bold">Integrations</h3>
                <Card className="shadow-card">
                  <CardHeader>
                    <CardTitle>n8n Automation</CardTitle>
                    <CardDescription>
                      Connect workflows for automated actions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-primary rounded-2xl flex items-center justify-center">
                        <Zap className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Workflow Automation</p>
                        <p className="text-sm text-muted-foreground">Trigger n8n workflows on data changes</p>
                      </div>
                      <Button variant="outline">Configure</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;