'use client';

// Nexorium Core - Connector Test Button
// Button to test connector connectivity

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Zap, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface ConnectorTestButtonProps {
  connectorType?: string;
  credentialId?: string;
  onTestComplete?: (success: boolean) => void;
  className?: string;
}

export default function ConnectorTestButton({
  credentialId,
  onTestComplete,
  className,
}: ConnectorTestButtonProps) {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<boolean | null>(null);

  const handleTest = async () => {
    setTesting(true);
    setResult(null);

    try {
      let success = false;

      if (credentialId) {
        // Test specific credential
        const response = await fetch(`/api/connectors/credentials/${credentialId}/test`, {
          method: 'POST',
        });
        const data = await response.json();
        success = data.success && data.data?.connected;
      } else {
        // Generic connectivity test
        // This would be replaced with actual connector test logic
        await new Promise(resolve => setTimeout(resolve, 1000));
        success = true; // Placeholder
      }

      setResult(success);
      onTestComplete?.(success);
    } catch {
      setResult(false);
      onTestComplete?.(false);
    } finally {
      setTesting(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleTest}
      disabled={testing}
      className={className}
    >
      {testing ? (
        <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
      ) : result === true ? (
        <CheckCircle className="h-4 w-4 mr-1.5 text-green-500" />
      ) : result === false ? (
        <XCircle className="h-4 w-4 mr-1.5 text-red-500" />
      ) : (
        <Zap className="h-4 w-4 mr-1.5" />
      )}
      {testing ? 'Testing...' : result === true ? 'Connected' : result === false ? 'Failed' : 'Test Connection'}
    </Button>
  );
}
