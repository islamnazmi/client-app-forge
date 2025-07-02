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

export class AirtableAPI {
  private token: string;
  private baseUrl = 'https://api.airtable.com/v0';

  constructor(token: string) {
    if (!token) {
      throw new Error("Airtable token is required.");
    }
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

  async createRecord(baseId: string, tableId: string, data: { fields: Record<string, any> }): Promise<AirtableRecord> {
    const response = await this.makeRequest(`/${baseId}/${tableId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response;
  }
}