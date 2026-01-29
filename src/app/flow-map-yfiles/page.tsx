// Deprecated - Redirect to canonical Flow Map route
// The yFiles Flow Map is now available at /dashboard/environments/flow-map
// This file exists only to handle legacy URLs

import { redirect } from 'next/navigation';

export default function FlowMapYFilesPage() {
  redirect('/dashboard/environments/flow-map');
}
