
import { redirect } from 'next/navigation';

export default function HomePage() {
  // This page will effectively try to load the dashboard.
  // The (app) layout will then check for authentication.
  // If not authenticated, (app) layout redirects to /login.
  // If authenticated, dashboard loads.
  // The login page itself handles redirecting to dashboard if already authenticated.
  redirect('/dashboard'); 
  return null; 
}
