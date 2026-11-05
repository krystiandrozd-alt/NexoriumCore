import { redirect } from 'next/navigation';

// Nexorium Core - Environments Pillar Index
// Demo branch: redirects to the Environments overview, because the default
// Flow Map view needs the yFiles package (see src/app/dashboard/environments/flow-map).

export default function EnvironmentsPage() {
  redirect('/dashboard/environments/overview');
}
