'use client';

// TelEnvIQ - Connector Configuration Modal
// Modal for configuring and managing connectors

import { useState } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
} from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Cloud, GitBranch, FileCode } from 'lucide-react';
import K8sConnectorForm from './K8sConnectorForm';
import GitOpsConnectorForm from './GitOpsConnectorForm';
import ManualYamlForm from './ManualYamlForm';

interface ConnectorConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  environmentId: string;
  onSuccess?: () => void;
}

export default function ConnectorConfigModal({
  open,
  onOpenChange,
  environmentId,
  onSuccess,
}: ConnectorConfigModalProps) {
  const [activeTab, setActiveTab] = useState('kubernetes');
  const [, setLoading] = useState(false);

  const handleSuccess = () => {
    onSuccess?.();
    onOpenChange(false);
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-w-2xl">
        <ModalHeader>
          <ModalTitle>Configure Connector</ModalTitle>
          <ModalDescription>
            Connect a data source to discover your environment topology
          </ModalDescription>
        </ModalHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="kubernetes" className="flex items-center gap-2">
              <Cloud className="h-4 w-4" />
              Kubernetes
            </TabsTrigger>
            <TabsTrigger value="gitops" className="flex items-center gap-2">
              <GitBranch className="h-4 w-4" />
              GitOps
            </TabsTrigger>
            <TabsTrigger value="manual" className="flex items-center gap-2">
              <FileCode className="h-4 w-4" />
              Manual YAML
            </TabsTrigger>
          </TabsList>

          <div className="mt-4">
            <TabsContent value="kubernetes">
              <K8sConnectorForm
                environmentId={environmentId}
                onSuccess={handleSuccess}
                onLoadingChange={setLoading}
              />
            </TabsContent>

            <TabsContent value="gitops">
              <GitOpsConnectorForm
                environmentId={environmentId}
                onSuccess={handleSuccess}
                onLoadingChange={setLoading}
              />
            </TabsContent>

            <TabsContent value="manual">
              <ManualYamlForm
                environmentId={environmentId}
                onSuccess={handleSuccess}
                onLoadingChange={setLoading}
              />
            </TabsContent>
          </div>
        </Tabs>

        <ModalFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
