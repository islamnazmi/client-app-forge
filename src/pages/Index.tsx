import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Database, Plus, Settings, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAppConfig } from "@/hooks/useAppConfig";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

const Index = () => {
  const navigate = useNavigate();
  const [newAppName, setNewAppName] = useState("");
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
  const { toast } = useToast();
  const { configs, createConfig, deleteConfig } = useAppConfig();

  const handleCreateApp = () => {
    if (!newAppName.trim()) {
      toast({
        title: "App Name Required",
        description: "Please enter a name for your new app",
        variant: "destructive",
      });
      return;
    }

    const newConfig = createConfig(newAppName);
    setNewAppName("");
    setCreateDialogOpen(false);
    
    toast({
      title: "App Created",
      description: `${newAppName} has been created successfully.`,
    });

    navigate(`/configure/${newConfig.id}`);
  };

  const handleDeleteApp = (configId: string, appName: string) => {
    if (window.confirm(`Are you sure you want to delete "${appName}"? This action cannot be undone.`)) {
      deleteConfig(configId);
      toast({
        title: "App Deleted",
        description: `${appName} has been deleted.`,
      });
    }
  };


  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card shadow-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Database className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Agency Builder</h1>
                <p className="text-sm text-muted-foreground">Your Client Apps Dashboard</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Your Applications</h2>
          <Dialog open={isCreateDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="primary" size="lg">
                <Plus className="w-5 h-5 mr-2" />
                Create New App
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New App</DialogTitle>
                <DialogDescription>
                  Give your new client application a name to get started.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    App Name
                  </Label>
                  <Input
                    id="name"
                    value={newAppName}
                    onChange={(e) => setNewAppName(e.target.value)}
                    className="col-span-3"
                    placeholder="e.g., Acme Corp Dashboard"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreateApp}>Create App</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {configs.length === 0 ? (
            <div className="col-span-full text-center py-20 bg-card rounded-xl border border-dashed">
              <Database className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-medium text-muted-foreground mb-2">No apps yet</h3>
              <p className="text-sm text-muted-foreground mb-4">Click "Create New App" to build your first one.</p>
            </div>
          ) : (
            configs.map((config) => (
            <Card key={config.id} className="shadow-card hover:shadow-elegant transition-all duration-300 flex flex-col">
              <CardHeader>
                <CardTitle>{config.name}</CardTitle>
                <CardDescription>
                  {config.airtableConfig.token ? `Connected to ${config.airtableConfig.baseName || 'Airtable'}` : "Airtable not connected"}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                 <p className="text-sm text-muted-foreground">
                    Last updated: {new Date(config.updatedAt).toLocaleDateString()}
                 </p>
              </CardContent>
              <div className="p-6 pt-0 flex flex-wrap gap-2">
                  <Button 
                    variant="default" 
                    size="sm"
                    className="flex-1"
                    onClick={() => navigate(`/configure/${config.id}`)}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Open
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => handleDeleteApp(config.id, config.name)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
              </div>
            </Card>
          ))
        )}
        </div>
      </main>
    </div>
  );
};

export default Index;