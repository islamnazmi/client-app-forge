import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const WebhookRedirect = () => {
  const [searchParams] = useSearchParams();
  const params = Object.fromEntries(searchParams.entries());

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Webhook Response Received</CardTitle>
          <CardDescription>The following data was received from the webhook.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <pre className="p-4 bg-muted rounded-md text-sm overflow-auto">
            {JSON.stringify(params, null, 2)}
          </pre>
          <Link to="/" className="text-primary underline">
            &larr; Back to Dashboard
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default WebhookRedirect;