import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppConfig } from "@/hooks/useAppConfig";
import { AirtableAPI, AirtableRecord, AirtableTable } from "@/lib/airtable";
import { Sidebar, SidebarProvider, SidebarTrigger, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, FileText, AlertCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ListView from "@/components/DataBlocks/ListView";
import TableView from "@/components/DataBlocks/TableView";
import FormView from "@/components/DataBlocks/FormView";

const AppPreview = () => {
  const { appId } = useParams<{ appId: string }>();
  const navigate = useNavigate();
  const { getConfig, loading: appConfigLoading } = useAppConfig();

  const config = useMemo(() => {
    if (appConfigLoading || !appId) return null;
    return getConfig(appId);
  }, [appId, appConfigLoading, getConfig]);

  const [activePageId, setActivePageId] = useState<string | null>(null);
  const [records, setRecords] = useState<AirtableRecord[]>([]);
  const [tableSchema, setTableSchema] = useState<AirtableTable | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const airtableApi = useMemo(() => {
    if (config?.airtableConfig.token) {
      return new AirtableAPI(config.airtableConfig.token);
    }
    return null;
  }, [config]);

  const activePage = useMemo(() => {
    return config?.pages.find(p => p.id === activePageId) || null;
  }, [config, activePageId]);

  useEffect(() => {
    if (config && config.pages.length > 0 && !activePageId) {
      setActivePageId(config.pages[0].id);
    }
  }, [config, activePageId]);

  const fetchDataForPage = useCallback(async () => {
    if (!airtableApi || !config || !activePage || !config.airtableConfig.baseId) return;

    setIsLoading(true);
    setError(null);
    try {
      const [recordsData, tablesData] = await Promise.all([
        airtableApi.getRecords(config.airtableConfig.baseId, activePage.tableId),
        airtableApi.getBaseTables(config.airtableConfig.baseId)
      ]);
      setRecords(recordsData.records);
      const currentTable = tablesData.find(t => t.id === activePage.tableId);
      setTableSchema(currentTable || null);
    } catch (err) {
      const errorMessage = (err as Error).message;
      setError(`Failed to fetch data: ${errorMessage}. Check your configuration and token permissions.`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [airtableApi, config, activePage]);

  useEffect(() => {
    fetchDataForPage();
  }, [fetchDataForPage]);

  if (appConfigLoading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!config) {
    return <div className="flex h-screen items-center justify-center">App configuration not found.</div>;
  }
  
  const ActivePageComponent = () => {
      if (isLoading) return <div className="flex items-center justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /> <span className="ml-2">Loading Data...</span></div>;
      if (error) return (
        <div className="p-4 text-center text-destructive bg-destructive/10 rounded-lg">
          <AlertCircle className="w-6 h-6 mx-auto mb-2" />
          <p className="font-semibold">An Error Occurred</p>
          <p className="text-sm">{error}</p>
        </div>
      );
      if (!activePage || !tableSchema) return <div className="p-4 text-center text-muted-foreground">Select a page to begin.</div>;
      
      if (activePage.views.length === 0) {
        return <div className="p-4 text-center text-muted-foreground">This page has no views configured. Add a view in the app configuration.</div>;
      }

      return (
        <Tabs defaultValue={activePage.views[0].id} className="w-full">
          <TabsList>
            {activePage.views.map(view => (
              <TabsTrigger key={view.id} value={view.id}>{view.name}</TabsTrigger>
            ))}
          </TabsList>
          {activePage.views.map(view => (
            <TabsContent key={view.id} value={view.id} className="mt-4">
              {view.type === 'list' && <ListView data={records} view={view} tableFields={tableSchema.fields} />}
              {view.type === 'table' && <TableView data={records} fields={tableSchema.fields.map(f => f.name)} />}
              {view.type === 'form' && airtableApi && config && (
                <FormView 
                  airtableApi={airtableApi} 
                  baseId={config.airtableConfig.baseId} 
                  table={tableSchema}
                  view={view}
                  onSuccess={fetchDataForPage}
                />
              )}
              {view.type === 'gallery' && <div className="p-4 text-center">Gallery view coming soon!</div>}
            </TabsContent>
          ))}
        </Tabs>
      )
  };

  return (
    <SidebarProvider>
        <Sidebar>
            <SidebarHeader>
                <h2 className="text-lg font-semibold">{config.branding.appName}</h2>
            </SidebarHeader>
            <SidebarContent>
                <SidebarMenu>
                    {config.pages.map(page => (
                        <SidebarMenuItem key={page.id}>
                            <SidebarMenuButton isActive={page.id === activePageId} onClick={() => setActivePageId(page.id)}>
                                <FileText className="w-4 h-4" />
                                {page.name}
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarContent>
        </Sidebar>
        <main className="flex-1">
            <header className="p-4 border-b flex items-center justify-between">
                <SidebarTrigger />
                <h1 className="text-xl font-semibold">{activePage?.name || "Select a page"}</h1>
                <Button variant="outline" onClick={() => navigate(`/configure/${appId}`)}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Config
                </Button>
            </header>
            <div className="p-4 lg:p-6">
                <ActivePageComponent />
            </div>
        </main>
    </SidebarProvider>
  );
};

export default AppPreview;