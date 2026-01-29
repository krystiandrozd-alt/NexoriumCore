// Nexorium Core - Root Page Redirect
// Redirects to landing page (handled by route groups)

import { redirect } from 'next/navigation';

export default function RootPage() {
  // The (landing) route group handles the root path
  // This redirect is a fallback
  redirect('/dashboard');
}
