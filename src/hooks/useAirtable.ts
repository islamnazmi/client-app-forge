import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface AirtableBase {
  id: string;
  name: string;
  permissionLevel: string;
}

export interface AirtableTable {
  id: string;
  name: string;
  description?: string;
  fields: AirtableField[];
}

export interface AirtableField {
  id: string;
  name: string;
  type: string;
  options?: any;
}

export interface AirtableRecord {
  id: string;
  createdTime: string;
  fields: Record<string, any>;
}

class AirtableAPI {
  private token: string;
  private baseUrl = 'https://api.airtable.com/v0';

  constructor(token: string) {
    this.token = token;
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  async getBases(): Promise<AirtableBase[]> {
    const response = await this.makeRequest('/meta/bases');
    return response.bases;
  }

  async getBaseTables(baseId: string): Promise<AirtableTable[]> {
    const response = await this.makeRequest(`/meta/bases/${baseId}/tables`);
    return response.tables;
  }

  async getRecords(baseId: string, tableId: string, options: {
    maxRecords?: number;
    sort?: Array<{ field: string; direction: 'asc' | 'desc' }>;
    filterByFormula?: string;
    fields?: string[];
  } = {}): Promise<{ records: AirtableRecord[]; offset?: string }> {
    const params = new URLSearchParams();
    
    if (options.maxRecords) params.append('maxRecords', options.maxRecords.toString());
    if (options.sort) params.append('sort[0][field]', options.sort[0].field);
    if (options.sort) params.append('sort[0][direction]', options.sort[0].direction);
    if (options.filterByFormula) params.append('filterByFormula', options.filterByFormula);
    if (options.fields) {
      options.fields.forEach(field => params.append('fields[]', field));
    }

    const queryString = params.toString();
    const endpoint = `/${baseId}/${tableId}${queryString ? `?${queryString}` : ''}`;
    
    return this.makeRequest(endpoint);
  }

  async createRecord(baseId: string, tableId: string, fields: Record<string, any>): Promise<AirtableRecord> {
    const response = await this.makeRequest(`/${baseId}/${tableId}`, {
      method: 'POST',
      body: JSON.stringify({ fields }),
    });
    return response;
  }

  async updateRecord(baseId: string, tableId: string, recordId: string, fields: Record<string, any>): Promise<AirtableRecord> {
    const response = await this.makeRequest(`/${baseId}/${tableId}/${recordId}`, {
      method: 'PATCH',
      body: JSON.stringify({ fields }),
    });
    return response;
  }

  async deleteRecord(baseId: string, tableId: string, recordId: string): Promise<{ deleted: boolean; id: string }> {
    const response = await this.makeRequest(`/${baseId}/${tableId}/${recordId}`, {
      method: 'DELETE',
    });
    return response;
  }
}

export const useAirtable = () => {
  const [api, setApi] = useState<AirtableAPI | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [token, setToken] = useState<string>('');
  const { toast } = useToast();

  // Load token from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('airtable_token');
    if (savedToken) {
      setToken(savedToken);
      setApi(new AirtableAPI(savedToken));
      setIsConnected(true);
    }
  }, []);

  const connect = async (newToken: string) => {
    try {
      const testApi = new AirtableAPI(newToken);
      // Test the connection by trying to fetch bases
      await testApi.getBases();
      
      // If successful, save the token and set up the API
      localStorage.setItem('airtable_token', newToken);
      setToken(newToken);
      setApi(testApi);
      setIsConnected(true);
      
      toast({
        title: "Connected Successfully",
        description: "Your Airtable workspace is now connected",
      });
      
      return true;
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect to Airtable",
        variant: "destructive",
      });
      return false;
    }
  };

  const disconnect = () => {
    localStorage.removeItem('airtable_token');
    setToken('');
    setApi(null);
    setIsConnected(false);
    
    toast({
      title: "Disconnected",
      description: "Airtable connection has been removed",
    });
  };

  return {
    api,
    isConnected,
    token,
    connect,
    disconnect,
  };
};