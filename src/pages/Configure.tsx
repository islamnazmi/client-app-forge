import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Database, Save, Plus, FileText, LayoutList, Table, GalleryHorizontal, FormInput, Eye, Settings, LinkIcon, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AirtableAPI, AirtableBase, AirtableTable } from "@/lib/airtable";
import { useAppConfig, AppView } from "@/hooks/useAppConfig";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ViewConfigDialog } from "@/components/ViewConfigDialog";

const Configure = () => {
  const navigate = useNavigate();
  const { appId } = useParams<{ appId: string }>();
  const { toast } = useToast();
  
  const { configs, getConfig, updateConfig, addPageToApp, addViewToPage, loading: appConfigLoading } = useAppConfig();
  
  const config = useMemo(() => {
    if (appConfigLoading || !appId) return null;
    return getConfig(appId);
  }, [appId, configs, appConfigLoading, getConfig]);

  const [airtableToken, setAirtableToken] = useState("");
  const [airtableApi, setAirtableApi] = useState<AirtableAPI | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isAirtableConnected, setIsAirtableConnected] = useState(false);

  const [bases, setBases] = useState<AirtableBase[]>([]);
  const [tables, setTables] = useState<AirtableTable[]>([]);
  const [selectedBaseId, setSelectedBaseId] = useState("");
  const [isLoadingData, setIsLoadingData] = useState(false);
  
  const [isPageDialogOpen, setIsPageDialogOpen] = useState(false);
  const [newPageName, setNewPageName] = useState("");
  const [newPageTableId, setNewPageTableId] = useState("");

  const [isViewConfigOpen, setIsViewConfigOpen] = useState(false);
  const [selectedView, setSelectedView] = useState<{pageId: string, view: AppView} | null>(null);

  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [newViewName, setNewViewName] = useState("");
  const [newViewType, setNewViewType] = useState<AppView['type']>('list');
  const [currentPageId, setCurrentPageId] = useState<string | null>(null);

  useEffect(() => {
    if (config) {
      const token = config.airtableConfig.token || "";
      setAirtableToken(token);
      setSelectedBaseId(config.airtableConfig.baseId || "");
      if (token) {
        const api = new AirtableAPI(token);
        setAirtableApi(api);
        setIsAirtableConnected(true);
      }
    }
  }, [config]);

  useEffect(() => {
    if (isAirtableConnected && airtableApi) loadBases();
  }, [isAirtableConnected, airtableApi]);

  useEffect(() => {
    if (selectedBaseId && airtableApi) loadTables(selectedBaseId);
  }, [selectedBaseId, airtableApi]);

  const handleConnectAirtable = async () => {
    if (!config || !airtableToken.trim()) {
      toast({ title: "Token is required", variant: "destructive" });
      return;
    }
    setIsConnecting(true);
    try {
      const api = new AirtableAPI(airtableToken);
      await api.getBases();
      updateConfig(config.id, { airtableConfig: { ...config.airtableConfig, token: airtableToken, baseId: '', baseName: '' } });
      toast({ title: "Airtable Connected!", description: "You can now select a base." });
    } catch (error) {
      toast({ title: "Connection Failed", description: (error as Error).message, variant: "destructive" });
    } finally {
      setIsConnecting(false);
    }
  };

  const loadBases = async () => {
    if (!airtableApi) return;
    setIsLoadingData(true);
    try {
      setBases(await airtableApi.getBases());
    } catch (error) {
      toast({ title: "Error loading bases", description: (error as Error).message, variant: "destructive" });
    } finally {
      setIsLoadingData(false);
    }
  };

  const loadTables = async (baseId: string) => {
    if (!airtableApi) return;
    setIsLoadingData(true);
    setTables([]);
    try {
      const fetchedTables = await airtableApi.getBaseTables(baseId);
      setTables(fetchedTables);
      const selectedBase = bases.find(b => b.id === baseId);
      if(config && selectedBase) {
        updateConfig(config.id, { airtableConfig: {...config.airtableConfig, baseId: selectedBase.id, baseName: selectedBase.name }})
      }
    } catch (error) {
      toast({ title: "Error loading tables", description: (error as Error).message, variant: "destructive" });
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleCreatePage = () => {
    const selectedTable = tables.find(t => t.id === newPageTableId);
    if (!config || !newPageName.trim() || !newPageTableId || !selectedTable) {
      toast({ title: "Page name and a linked table are required", variant: "destructive" });
      return;
    }
    addPageToApp(config.id, newPageName, newPageTableId, selectedTable.name);
    setNewPageName("");
    setNewPageTableId("");
    setIsPageDialogOpen(false);
    toast({ title: `Page "${newPageName}" created!` });
  };

  const handleAddView = () => {
    const pageTable = tables.find(t => t.id === config?.pages.find(p => p.id === currentPageId)?.tableId);
    if (!config || !currentPageId || !newViewName.trim() || !pageTable) {
        toast({ title: "View name is required", variant: "destructive" });
        return;
    }
    addViewToPage(config.id, currentPageId, newViewName, newViewType, pageTable.fields);
    setNewViewName("");
    setNewViewType("list");
    setIsViewDialogOpen(false);
    setCurrentPageId(null);
    toast({ title: `View "${newViewName}" added!` });
  }
  
  const openViewConfig = (pageId: string, view: AppView) => {
    setSelectedView({ pageId, view });
    setIsViewConfigOpen(true);
  };

  if (appConfigLoading) return <div className="min-h-screen flex items-center justify-center">Loading App...</div>;
  if (!config) return <div className="min-h-screen flex items-center justify-center">App not found. It may have been deleted.</div>;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card shadow-card">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={() => navigate("/")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-xl font-bold">{config.name}</h1>
              <p className="text-sm text-muted-foreground">App Configuration</p>
            </div>
          </div>
          <Button onClick={() => navigate(`/app-preview/${appId}`)}><Eye className="w-4 h-4 mr-2" />Preview App</Button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <Tabs defaultValue="settings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="settings">Settings & Data</TabsTrigger>
            <TabsTrigger value="pages">Pages & Views</TabsTrigger>
          </TabsList>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>App Settings</CardTitle>
                <CardDescription>Connect to Airtable and select your primary data source.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 border rounded-lg space-y-3">
                    <Label htmlFor="token">Airtable Personal Access Token</Label>
                    <div className="flex gap-2">
                        <Input id="token" type="password" value={airtableToken} onChange={(e) => setAirtableToken(e.target.value)} placeholder="pat..."/>
                        <Button onClick={handleConnectAirtable} disabled={isConnecting}>
                            {isConnecting ? <Loader2 className="animate-spin" /> : <LinkIcon className="w-4 h-4" />}
                            <span className="ml-2">{isAirtableConnected ? "Update" : "Connect"}</span>
                        </Button>
                    </div>
                    {isAirtableConnected && <p className="text-sm text-green-600">Successfully connected to Airtable.</p>}
                </div>
                
                {isAirtableConnected && (
                    <div className="p-4 border rounded-lg space-y-3">
                        <Label>Select Base</Label>
                        <select 
                            className="w-full p-2 border rounded-md bg-background" 
                            value={selectedBaseId} 
                            onChange={e => setSelectedBaseId(e.target.value)} 
                            disabled={isLoadingData || bases.length === 0}
                        >
                            <option value="">{isLoadingData ? "Loading Bases..." : "Select a Base"}</option>
                            {bases.map(base => <option key={base.id} value={base.id}>{base.name}</option>)}
                        </select>
                    </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pages">
              <Card>
                 <CardHeader>
                  <CardTitle>App Pages</CardTitle>
                  <CardDescription>Create pages and add views like tables or lists to them. Each page is linked to an Airtable table.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Dialog open={isPageDialogOpen} onOpenChange={setIsPageDialogOpen}>
                        <DialogTrigger asChild>
                            <Button disabled={!selectedBaseId || tables.length === 0}><Plus className="w-4 h-4 mr-2"/>Create Page</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create New Page</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="page-name">Page Name</Label>
                                    <Input id="page-name" value={newPageName} onChange={(e) => setNewPageName(e.target.value)} placeholder="e.g., Projects" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Link to Table</Label>
                                    <Select onValueChange={setNewPageTableId} value={newPageTableId}>
                                        <SelectTrigger><SelectValue placeholder="Select a table for this page" /></SelectTrigger>
                                        <SelectContent>
                                            {tables.map(table => <SelectItem key={table.id} value={table.id}>{table.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={handleCreatePage}>Create Page</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <Accordion type="single" collapsible className="w-full border rounded-lg px-4">
                      {config.pages.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">No pages created yet.</p>
                        ) : config.pages.map(page => (
                        <AccordionItem value={page.id} key={page.id}>
                          <AccordionTrigger className="font-medium hover:no-underline -mx-4 px-4 py-3">
                            <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-primary" />
                                    {page.name}
                                </div>
                                <Badge variant="secondary">{page.tableName}</Badge>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="space-y-4 pt-2 pb-4">
                            <div className="pl-4 border-l-2 border-primary/20 space-y-2">
                              {page.views.length === 0 ? (
                                <p className="text-sm text-muted-foreground italic py-2">No views in this page yet.</p>
                              ) : (
                                <div className="space-y-2">
                                  {page.views.map(view => (
                                    <div key={view.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                                      <div className="flex items-center gap-2 font-medium">
                                        {view.type === 'list' && <LayoutList className="w-4 h-4 text-muted-foreground"/>}
                                        {view.type === 'table' && <Table className="w-4 h-4 text-muted-foreground"/>}
                                        {view.type === 'gallery' && <GalleryHorizontal className="w-4 h-4 text-muted-foreground"/>}
                                        {view.type === 'form' && <FormInput className="w-4 h-4 text-muted-foreground"/>}
                                        <span>{view.name}</span>
                                        <Badge variant="outline">{view.type}</Badge>
                                      </div>
                                      <Button variant="outline" size="sm" onClick={() => openViewConfig(page.id, view)}>Configure</Button>
                                    </div>
                                  ))}
                                </div>
                              )}
                              <Dialog open={isViewDialogOpen && currentPageId === page.id} onOpenChange={(open) => { if(!open) setCurrentPageId(null); setIsViewDialogOpen(open); }}>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm" className="mt-4" onClick={() => setCurrentPageId(page.id)}>
                                    <Plus className="w-4 h-4 mr-2"/>Add View
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Add New View to "{page.name}"</DialogTitle>
                                  </DialogHeader>
                                  <div className="grid gap-4 py-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="view-name">View Name</Label>
                                      <Input id="view-name" value={newViewName} onChange={(e) => setNewViewName(e.target.value)} placeholder="e.g., All Tasks" />
                                    </div>
                                    <div className="space-y-2">
                                      <Label>View Type</Label>
                                      <Select onValueChange={(value: AppView['type']) => setNewViewType(value)} defaultValue={newViewType}>
                                        <SelectTrigger><SelectValue placeholder="Select a view type" /></SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="list">List</SelectItem>
                                          <SelectItem value="table">Table</SelectItem>
                                          <SelectItem value="gallery">Gallery</SelectItem>
                                          <SelectItem value="form">Form</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>
                                  <DialogFooter>
                                    <Button onClick={handleAddView}>Add View</Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )
      </main>
      {selectedView && (
        <ViewConfigDialog
            isOpen={isViewConfigOpen}
            onOpenChange={setIsViewConfigOpen}
            appId={appId!}
            pageId={selectedView.pageId}
            view={selectedView.view}
            tableFields={tables.find(t => t.id === config.pages.find(p => p.id === selectedView.pageId)?.tableId)?.fields || []}
        />
      )}
    </div>
  );
};

export default Configure;