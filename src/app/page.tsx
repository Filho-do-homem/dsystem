import { redirect } from 'next/navigation';

export default function HomePage() {
  redirect('/dashboard');
  // Ensure a component is returned, even if it's null, if redirect doesn't happen immediately or for static analysis.
  return null; 
}
