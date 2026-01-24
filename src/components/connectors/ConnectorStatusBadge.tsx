'use client';

// TelEnvIQ - Connector Status Badge
// Display connector test status

import { memo } from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, HelpCircle } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';

interface ConnectorStatusBadgeProps {
  lastTestedAt?: Date | string | null;
  lastTestSuccess?: boolean | null;
  className?: string;
}

function ConnectorStatusBadge({
  lastTestedAt,
  lastTestSuccess,
  className,
}: ConnectorStatusBadgeProps) {
  if (!lastTestedAt) {
    return (
      <Badge variant="outline" className={className}>
        <HelpCircle className="h-3 w-3 mr-1" />
        Not tested
      </Badge>
    );
  }

  const testedDate = typeof lastTestedAt === 'string' ? new Date(lastTestedAt) : lastTestedAt;
  const timeAgo = formatRelativeTime(testedDate);

  if (lastTestSuccess) {
    return (
      <Badge variant="outline" className={`text-green-600 border-green-300 ${className}`}>
        <CheckCircle className="h-3 w-3 mr-1" />
        Connected {timeAgo}
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className={`text-red-600 border-red-300 ${className}`}>
      <XCircle className="h-3 w-3 mr-1" />
      Failed {timeAgo}
    </Badge>
  );
}

export default memo(ConnectorStatusBadge);
