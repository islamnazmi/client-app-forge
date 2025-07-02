import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Database, Save, Zap, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAirtable, AirtableBase, AirtableTable } from "@/hooks/useAirtable";
import { useAppConfig } from "@/hooks/useAppConfig";
import { useWebhooks } from "@/hooks/useWebhooks";

const Configure = () => {
  const navigate = useNavigate();
  const { appId } = useParams<{ appId: string }>();
  const { toast } = useToast();
  
  // State
  const [bases, setBases] = useState<AirtableBase[]>([]);
  const [tables, setTables] = useState<AirtableTable[]>([]);
  const [selectedBase, setSelectedBase] = useState<AirtableBase | null>(null);
  const [selectedTable, setSelectedTable] = useState<AirtableTable | null>(null);
  const [loading, setLoading] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhookName, setWebhookName] = useState("");
  
  // Hooks
  const { api, isConnected } = useAirtable();
  const { getConfig, updateConfig, setAirtableConfig } = useAppConfig();
  const { addWebhook } = useWebhooks();
  
  const config = appId ? getConfig(appId) : null;

  useEffect(() => {
    if (!isConnected || !api) {
      toast({
        title: "Connection Required",
        description: "Please connect to Airtable first",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    if (!config) {
      toast({
        title: "App Not Found",
        description: "The requested app configuration was not found",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    loadBases();
  }, [isConnected, api, config]);

  const loadBases = async () => {
    if (!api) return;
    
    setLoading(true);
    try {
      const fetchedBases = await api.getBases();
      setBases(fetchedBases);
      
      // If config has a base selected, find and set it
      if (config?.airtableConfig.baseId) {
        const currentBase = fetchedBases.find(base => base.id === config.airtableConfig.baseId);
        if (currentBase) {
          setSelectedBase(currentBase);
          await loadTables(currentBase.id);
        }
      }
    } catch (error) {
      toast({
        title: "Error Loading Bases",
        description: error instanceof Error ? error.message : "Failed to load Airtable bases",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadTables = async (baseId: string) => {
    if (!api) return;
    
    setLoading(true);
    try {
      const fetchedTables = await api.getBaseTables(baseId);
      setTables(fetchedTables);
      
      // If config has a table selected, find and set it
      if (config?.airtableConfig.tableId) {
        const currentTable = fetchedTables.find(table => table.id === config.airtableConfig.tableId);
        if (currentTable) {
          setSelectedTable(currentTable);
        }
      }
    } catch (error) {
      toast({
        title: "Error Loading Tables",
        description: error instanceof Error ? error.message : "Failed to load Airtable tables",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBaseSelect = async (baseId: string) => {
    const base = bases.find(b => b.id === baseId);
    if (!base) return;
    
    setSelectedBase(base);
    setSelectedTable(null);
    setTables([]);
    
    await loadTables(baseId);
  };

  const handleTableSelect = (tableId: string) => {
    const table = tables.find(t => t.id === tableId);
    if (!table) return;
    
    setSelectedTable(table);
  };

  const handleSaveConfiguration = () => {
    if (!config || !selectedBase || !selectedTable) {
      toast({
        title: "Incomplete Configuration",
        description: "Please select both a base and table",
        variant: "destructive",
      });
      return;
    }

    const success = setAirtableConfig(config.id, selectedBase, selectedTable);
    
    if (success) {
      toast({
        title: "Configuration Saved",
        description: "App configuration has been updated successfully",
      });
    }
  };

  const handleAddWebhook = () => {
    if (!webhookUrl.trim() || !webhookName.trim()) {
      toast({
        title: "Webhook Details Required",
        description: "Please enter both webhook name and URL",
        variant: "destructive",
      });
      return;
    }

    addWebhook({
      id: `webhook_${Date.now()}`,
      name: webhookName,
      url: webhookUrl,
      events: ['record.created', 'record.updated', 'record.deleted'],
      active: true,
    });

    setWebhookName("");
    setWebhookUrl("");
  };

  const handleUpdateDisplaySettings = (updates: any) => {
    if (!config) return;
    
    updateConfig(config.id, {
      displayConfig: {
        ...config.displayConfig,
        ...updates,
      },
    });

    toast({
      title: "Settings Updated",
      description: "Display settings have been saved",
    });
  };

  if (!config) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

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
                <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <Database className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Configure: {config.name}</h1>
                  <p className="text-sm text-muted-foreground">Set up data sources and display options</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant={selectedBase && selectedTable ? "success" : "outline"}>
                {selectedBase && selectedTable ? "Configured" : "Setup Required"}
              </Badge>
              <Button 
                variant="primary" 
                size="sm"
                onClick={handleSaveConfiguration}
                disabled={!selectedBase || !selectedTable}
              >
                <Save className="w-4 h-4 mr-2" />
                Save Configuration
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <Tabs defaultValue="datasource" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="datasource">Data Source</TabsTrigger>
            <TabsTrigger value="display">Display Settings</TabsTrigger>
            <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
            <TabsTrigger value="branding">Branding</TabsTrigger>
          </TabsList>

          <TabsContent value="datasource" className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Airtable Connection</CardTitle>
                <CardDescription>
                  Select the base and table that will power this client app
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label>Airtable Base</Label>
                    <select 
                      className="w-full p-3 border rounded-lg bg-background"
                      value={selectedBase?.id || ""}
                      onChange={(e) => handleBaseSelect(e.target.value)}
                      disabled={loading}
                    >
                      <option value="">Select a base...</option>
                      {bases.map((base) => (
                        <option key={base.id} value={base.id}>
                          {base.name}
                        </option>
                      ))}
                    </select>
                    {selectedBase && (
                      <p className="text-sm text-muted-foreground">
                        Permission: {selectedBase.permissionLevel}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <Label>Table</Label>
                    <select 
                      className="w-full p-3 border rounded-lg bg-background"
                      value={selectedTable?.id || ""}
                      onChange={(e) => handleTableSelect(e.target.value)}
                      disabled={loading || !selectedBase}
                    >
                      <option value="">Select a table...</option>
                      {tables.map((table) => (
                        <option key={table.id} value={table.id}>
                          {table.name}
                        </option>
                      ))}
                    </select>
                    {selectedTable && (
                      <p className="text-sm text-muted-foreground">
                        {selectedTable.fields.length} fields available
                      </p>
                    )}
                  </div>
                </div>

                {selectedTable && (
                  <div className="space-y-3">
                    <Label>Available Fields</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                      {selectedTable.fields.map((field) => (
                        <Badge key={field.id} variant="outline" className="justify-start">
                          {field.name} ({field.type})
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="display" className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Display Settings</CardTitle>
                <CardDescription>
                  Configure how data is displayed in your client app
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label>Default View Type</Label>
                    <select 
                      className="w-full p-3 border rounded-lg bg-background"
                      value={config.displayConfig.viewType}
                      onChange={(e) => handleUpdateDisplaySettings({ viewType: e.target.value })}
                    >
                      <option value="list">List View</option>
                      <option value="table">Table View</option>
                      <option value="both">Both Views</option>
                    </select>
                  </div>
                  
                  <div className="space-y-3">
                    <Label>Records Per Page</Label>
                    <Input
                      type="number"
                      min="5"
                      max="100"
                      value={config.displayConfig.recordsPerPage}
                      onChange={(e) => handleUpdateDisplaySettings({ recordsPerPage: parseInt(e.target.value) || 20 })}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Features</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { key: 'enableSearch', label: 'Search' },
                      { key: 'enableFilters', label: 'Filters' },
                      { key: 'enableExport', label: 'Export' },
                      { key: 'enableRecordDetails', label: 'Record Details' },
                    ].map(({ key, label }) => (
                      <label key={key} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={config.features[key as keyof typeof config.features] as boolean}
                          onChange={(e) => updateConfig(config.id, {
                            features: {
                              ...config.features,
                              [key]: e.target.checked,
                            },
                          })}
                          className="rounded"
                        />
                        <span className="text-sm">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="webhooks" className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>n8n Webhook Integration</CardTitle>
                <CardDescription>
                  Configure webhooks to trigger n8n workflows when data changes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Webhook Name</Label>
                    <Input
                      placeholder="e.g., Client Data Sync"
                      value={webhookName}
                      onChange={(e) => setWebhookName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>n8n Webhook URL</Label>
                    <Input
                      placeholder="https://your-n8n.com/webhook/..."
                      value={webhookUrl}
                      onChange={(e) => setWebhookUrl(e.target.value)}
                    />
                  </div>
                </div>
                
                <Button onClick={handleAddWebhook} variant="primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Webhook
                </Button>

                <div className="space-y-3">
                  <Label>Webhook Events</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[
                      { event: 'record.created', label: 'Record Created', description: 'When a new record is added' },
                      { event: 'record.updated', label: 'Record Updated', description: 'When a record is modified' },
                      { event: 'record.deleted', label: 'Record Deleted', description: 'When a record is removed' },
                    ].map(({ event, label, description }) => (
                      <Card key={event} className="p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <Zap className="w-4 h-4 text-primary" />
                          <span className="font-medium text-sm">{label}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{description}</p>
                      </Card>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="branding" className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>App Branding</CardTitle>
                <CardDescription>
                  Customize the appearance and branding of your client app
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label>App Name</Label>
                    <Input
                      value={config.branding.appName}
                      onChange={(e) => updateConfig(config.id, {
                        branding: {
                          ...config.branding,
                          appName: e.target.value,
                        },
                      })}
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <Label>Primary Color</Label>
                    <Input
                      type="color"
                      value={config.branding.primaryColor}
                      onChange={(e) => updateConfig(config.id, {
                        branding: {
                          ...config.branding,
                          primaryColor: e.target.value,
                        },
                      })}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Welcome Message</Label>
                  <Input
                    placeholder="Welcome to your dashboard..."
                    value={config.branding.welcomeMessage || ""}
                    onChange={(e) => updateConfig(config.id, {
                      branding: {
                        ...config.branding,
                        welcomeMessage: e.target.value,
                      },
                    })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Configure;