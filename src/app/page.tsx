
"use client"; // Needs to be a client component for redirection

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Always redirect to the dashboard since login is removed
    router.replace('/dashboard');
  }, [router]);

  // Show loading indicator while redirecting
  return (
     <div className="flex items-center justify-center h-screen w-full">
       <Skeleton className="h-24 w-24 rounded-full" />
       <div className="ml-4 space-y-2">
           <Skeleton className="h-6 w-48" />
           <Skeleton className="h-4 w-32" />
       </div>
     </div>
  );
}
