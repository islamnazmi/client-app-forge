import { useToast } from '@/hooks/use-toast';

export interface WebhookTrigger {
  id: string;
  name: string;
  url: string;
  events: string[];
  active: boolean;
}

export interface WebhookPayload {
  event: string;
  timestamp: string;
  data: any;
  appId?: string;
  userId?: string;
}

class WebhookManager {
  private webhooks: Map<string, WebhookTrigger> = new Map();

  addWebhook(webhook: WebhookTrigger) {
    this.webhooks.set(webhook.id, webhook);
  }

  removeWebhook(id: string) {
    this.webhooks.delete(id);
  }

  getWebhooks(): WebhookTrigger[] {
    return Array.from(this.webhooks.values());
  }

  async triggerWebhook(eventType: string, data: any, options: {
    appId?: string;
    userId?: string;
  } = {}) {
    const relevantWebhooks = Array.from(this.webhooks.values()).filter(
      webhook => webhook.active && webhook.events.includes(eventType)
    );

    const payload: WebhookPayload = {
      event: eventType,
      timestamp: new Date().toISOString(),
      data,
      appId: options.appId,
      userId: options.userId,
    };

    const promises = relevantWebhooks.map(async (webhook) => {
      try {
        const response = await fetch(webhook.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Agency-Builder/1.0',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`Webhook ${webhook.name} failed: ${response.status}`);
        }

        return { webhook: webhook.name, success: true };
      } catch (error) {
        console.error(`Webhook ${webhook.name} error:`, error);
        return { 
          webhook: webhook.name, 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        };
      }
    });

    return Promise.all(promises);
  }
}

const webhookManager = new WebhookManager();

export const useWebhooks = () => {
  const { toast } = useToast();

  const addWebhook = (webhook: WebhookTrigger) => {
    webhookManager.addWebhook(webhook);
    toast({
      title: "Webhook Added",
      description: `${webhook.name} webhook has been configured`,
    });
  };

  const removeWebhook = (id: string) => {
    webhookManager.removeWebhook(id);
    toast({
      title: "Webhook Removed",
      description: "Webhook has been deleted",
    });
  };

  const triggerEvent = async (eventType: string, data: any, options?: {
    appId?: string;
    userId?: string;
  }) => {
    const results = await webhookManager.triggerWebhook(eventType, data, options);
    
    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    if (successCount > 0) {
      toast({
        title: `${successCount} Webhook${successCount > 1 ? 's' : ''} Triggered`,
        description: `Event: ${eventType}`,
      });
    }

    if (failCount > 0) {
      toast({
        title: `${failCount} Webhook${failCount > 1 ? 's' : ''} Failed`,
        description: "Check console for details",
        variant: "destructive",
      });
    }

    return results;
  };

  // Common event triggers
  const triggerRecordCreated = (record: any, appId?: string) => 
    triggerEvent('record.created', record, { appId });

  const triggerRecordUpdated = (record: any, appId?: string) => 
    triggerEvent('record.updated', record, { appId });

  const triggerRecordDeleted = (record: any, appId?: string) => 
    triggerEvent('record.deleted', record, { appId });

  const triggerButtonClicked = (buttonId: string, record: any, appId?: string) => 
    triggerEvent('button.clicked', { buttonId, record }, { appId });

  const triggerUserAction = (action: string, data: any, appId?: string, userId?: string) => 
    triggerEvent('user.action', { action, ...data }, { appId, userId });

  return {
    webhooks: webhookManager.getWebhooks(),
    addWebhook,
    removeWebhook,
    triggerEvent,
    triggerRecordCreated,
    triggerRecordUpdated,
    triggerRecordDeleted,
    triggerButtonClicked,
    triggerUserAction,
  };
};