import { useState, useEffect } from 'react';
import { AirtableBase, AirtableTable } from './useAirtable';

export interface AppConfig {
  id: string;
  name: string;
  description?: string;
  airtableConfig: {
    baseId: string;
    baseName: string;
    tableId: string;
    tableName: string;
    fields: string[];
  };
  displayConfig: {
    viewType: 'list' | 'table' | 'both';
    fieldsToShow: string[];
    sortField?: string;
    sortDirection?: 'asc' | 'desc';
    filterFormula?: string;
    recordsPerPage: number;
  };
  branding: {
    logo?: string;
    primaryColor?: string;
    secondaryColor?: string;
    appName: string;
    welcomeMessage?: string;
  };
  features: {
    enableSearch: boolean;
    enableFilters: boolean;
    enableExport: boolean;
    enableRecordDetails: boolean;
    customActions: Array<{
      id: string;
      label: string;
      webhookUrl?: string;
      buttonStyle: 'primary' | 'secondary' | 'outline';
    }>;
  };
  webhooks: {
    onRecordCreate?: string;
    onRecordUpdate?: string;
    onRecordDelete?: string;
    onUserAction?: string;
  };
  createdAt: string;
  updatedAt: string;
}

const defaultConfig: Omit<AppConfig, 'id' | 'createdAt' | 'updatedAt'> = {
  name: 'New Client App',
  airtableConfig: {
    baseId: '',
    baseName: '',
    tableId: '',
    tableName: '',
    fields: [],
  },
  displayConfig: {
    viewType: 'both',
    fieldsToShow: [],
    recordsPerPage: 20,
  },
  branding: {
    appName: 'Client Portal',
    primaryColor: '#3b82f6',
    secondaryColor: '#64748b',
  },
  features: {
    enableSearch: true,
    enableFilters: true,
    enableExport: false,
    enableRecordDetails: true,
    customActions: [],
  },
  webhooks: {},
};

export const useAppConfig = () => {
  const [configs, setConfigs] = useState<AppConfig[]>([]);
  const [activeConfig, setActiveConfig] = useState<AppConfig | null>(null);

  // Load configs from localStorage on mount
  useEffect(() => {
    const savedConfigs = localStorage.getItem('app_configs');
    if (savedConfigs) {
      try {
        const parsedConfigs = JSON.parse(savedConfigs);
        setConfigs(parsedConfigs);
      } catch (error) {
        console.error('Error loading app configs:', error);
      }
    }
  }, []);

  // Save configs to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('app_configs', JSON.stringify(configs));
  }, [configs]);

  const createConfig = (name: string, description?: string): AppConfig => {
    const newConfig: AppConfig = {
      ...defaultConfig,
      id: `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setConfigs(prev => [...prev, newConfig]);
    return newConfig;
  };

  const updateConfig = (id: string, updates: Partial<AppConfig>): boolean => {
    setConfigs(prev => prev.map(config => 
      config.id === id 
        ? { ...config, ...updates, updatedAt: new Date().toISOString() }
        : config
    ));

    // Update active config if it's the one being updated
    if (activeConfig?.id === id) {
      setActiveConfig(prev => prev ? { ...prev, ...updates, updatedAt: new Date().toISOString() } : null);
    }

    return true;
  };

  const deleteConfig = (id: string): boolean => {
    setConfigs(prev => prev.filter(config => config.id !== id));
    
    // Clear active config if it's the one being deleted
    if (activeConfig?.id === id) {
      setActiveConfig(null);
    }

    return true;
  };

  const getConfig = (id: string): AppConfig | null => {
    return configs.find(config => config.id === id) || null;
  };

  const setAirtableConfig = (id: string, base: AirtableBase, table: AirtableTable) => {
    const updates: Partial<AppConfig> = {
      airtableConfig: {
        baseId: base.id,
        baseName: base.name,
        tableId: table.id,
        tableName: table.name,
        fields: table.fields.map(field => field.id),
      },
      displayConfig: {
        ...configs.find(c => c.id === id)?.displayConfig || defaultConfig.displayConfig,
        fieldsToShow: table.fields.slice(0, 5).map(field => field.id), // Show first 5 fields by default
      },
    };

    return updateConfig(id, updates);
  };

  const duplicateConfig = (id: string, newName: string): AppConfig | null => {
    const originalConfig = getConfig(id);
    if (!originalConfig) return null;

    const duplicatedConfig: AppConfig = {
      ...originalConfig,
      id: `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: newName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setConfigs(prev => [...prev, duplicatedConfig]);
    return duplicatedConfig;
  };

  return {
    configs,
    activeConfig,
    setActiveConfig,
    createConfig,
    updateConfig,
    deleteConfig,
    getConfig,
    setAirtableConfig,
    duplicateConfig,
  };
};