import { redirect } from 'next/navigation';

// Nexorium Core - Environments Pillar Index
// Redirects to Flow Map (default view)

export default function EnvironmentsPage() {
  redirect('/dashboard/environments/flow-map');
}
