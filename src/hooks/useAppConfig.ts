import { useState, useEffect, useCallback } from 'react';
import { AirtableBase, AirtableTable, AirtableField } from '@/lib/airtable';

// --- Interfaces for our app structure ---

export type CustomFieldType = 
  | 'text' | 'email' | 'number' | 'tel' | 'longText' 
  | 'singleSelect' | 'multiSelect' | 'date' | 'dateTime' 
  | 'file' | 'url' | 'checkbox' | 'password';

export interface CustomFormField {
  id: string;
  label: string;
  type: CustomFieldType;
  placeholder?: string;
  options?: string[]; // For select types
}

export interface AirtableFormField {
  id: string;
  name: string;
  type: AirtableField['type'];
}

export interface ListViewConfig {
  visibleFields: string[];
}

export interface FormViewConfig {
  submissionTarget: 'airtable' | 'webhook';
  webhookUrl?: string;
  airtableFields: AirtableFormField[];
  customFields: CustomFormField[];
}

export interface AppView {
  id: string;
  name: string;
  type: 'list' | 'table' | 'gallery' | 'form';
  config: ListViewConfig | FormViewConfig;
}

export interface AppPage {
  id: string;
  name: string;
  tableId: string;
  tableName: string;
  views: AppView[];
}

export interface AppConfig {
  id: string;
  name: string;
  description?: string;
  airtableConfig: {
    token?: string;
    baseId: string;
    baseName: string;
  };
  pages: AppPage[];
  branding: {
    logo?: string;
    primaryColor?: string;
    secondaryColor?: string;
    appName: string;
    welcomeMessage?: string;
  };
  createdAt: string;
  updatedAt: string;
}

const defaultConfig: Omit<AppConfig, 'id' | 'createdAt' | 'updatedAt'> = {
  name: 'New Client App',
  airtableConfig: { token: '', baseId: '', baseName: '' },
  pages: [],
  branding: { appName: 'Client Portal', primaryColor: '#3b82f6', secondaryColor: '#64748b' },
};

type AppConfigState = { configs: AppConfig[]; loading: boolean; };
let memoryState: AppConfigState = { configs: [], loading: true };
const listeners: Array<(state: AppConfigState) => void> = [];

function dispatch(action: Partial<AppConfigState>) {
    memoryState = { ...memoryState, ...action };
    listeners.forEach(listener => listener(memoryState));
}

try {
    const savedConfigs = localStorage.getItem('app_configs');
    if (savedConfigs) memoryState.configs = JSON.parse(savedConfigs);
} catch (error) {
    console.error('Error loading app configs:', error);
} finally {
    setTimeout(() => dispatch({ loading: false }), 1);
}

export const useAppConfig = () => {
  const [state, setState] = useState<AppConfigState>(memoryState);

  useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) listeners.splice(index, 1);
    };
  }, []);

  const saveAndDispatch = (newConfigs: AppConfig[]) => {
      localStorage.setItem('app_configs', JSON.stringify(newConfigs));
      dispatch({ configs: newConfigs });
  };

  const createConfig = useCallback((name: string, description?: string): AppConfig => {
    const newConfig: AppConfig = {
      ...defaultConfig,
      id: `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      branding: { ...defaultConfig.branding, appName: name },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveAndDispatch([...memoryState.configs, newConfig]);
    return newConfig;
  }, []);

  const updateConfig = useCallback((id: string, updates: Partial<Omit<AppConfig, 'id'>>): boolean => {
    let success = false;
    const newConfigs = memoryState.configs.map(config => {
      if (config.id === id) {
        success = true;
        return { ...config, ...updates, updatedAt: new Date().toISOString() };
      }
      return config;
    });
    if (success) saveAndDispatch(newConfigs);
    return success;
  }, []);

  const deleteConfig = useCallback((id: string): boolean => {
    const newConfigs = memoryState.configs.filter(config => config.id !== id);
    saveAndDispatch(newConfigs);
    return true;
  }, []);

  const getConfig = useCallback((id: string): AppConfig | null => {
    return memoryState.configs.find(config => config.id === id) || null;
  }, [state.configs]);
  
  const addPageToApp = useCallback((appId: string, pageName: string, tableId: string, tableName: string) => {
    const config = getConfig(appId);
    if (!config) return;
    const newPage: AppPage = {
      id: `page_${Date.now()}`,
      name: pageName,
      tableId,
      tableName,
      views: [],
    };
    updateConfig(appId, { pages: [...config.pages, newPage] });
  }, [getConfig, updateConfig]);

  const addViewToPage = useCallback((appId: string, pageId: string, viewName: string, viewType: AppView['type'], tableFields: AirtableField[]) => {
    const config = getConfig(appId);
    if (!config) return;

    let newViewConfig: AppView['config'];
    if (viewType === 'form') {
        newViewConfig = {
            submissionTarget: 'airtable',
            webhookUrl: '',
            airtableFields: tableFields.filter(f => !f.type.includes('formula') && !f.type.includes('lookup')).map(f => ({ id: f.id, name: f.name, type: f.type })),
            customFields: []
        };
    } else {
        newViewConfig = {
            visibleFields: tableFields.slice(0, 5).map(f => f.id)
        };
    }

    const newView: AppView = { 
        id: `view_${Date.now()}`, 
        name: viewName, 
        type: viewType,
        config: newViewConfig
    };
    const updatedPages = config.pages.map(page => 
      page.id === pageId ? { ...page, views: [...page.views, newView] } : page
    );
    updateConfig(appId, { pages: updatedPages });
  }, [getConfig, updateConfig]);

  const updateView = useCallback((appId: string, pageId: string, viewId: string, updates: Partial<AppView>) => {
    const config = getConfig(appId);
    if (!config) return;

    const updatedPages = config.pages.map(page => {
        if (page.id === pageId) {
            const updatedViews = page.views.map(view => 
                view.id === viewId ? { ...view, ...updates } : view
            );
            return { ...page, views: updatedViews };
        }
        return page;
    });
    updateConfig(appId, { pages: updatedPages });
  }, [getConfig, updateConfig]);

  return {
    configs: state.configs,
    loading: state.loading,
    createConfig,
    updateConfig,
    deleteConfig,
    getConfig,
    addPageToApp,
    addViewToPage,
    updateView,
  };
};