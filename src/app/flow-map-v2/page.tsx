// Deprecated - Redirect to canonical Flow Map route
// The yFiles Flow Map is now available at /dashboard/environments/flow-map
// This file exists only to handle legacy URLs
// Date: 2026-01-28

import { redirect } from 'next/navigation';

export default function FlowMapV2Page() {
  redirect('/dashboard/environments/flow-map');
}
