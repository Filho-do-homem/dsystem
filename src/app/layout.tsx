
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AuthContextProvider } from '@/contexts/AuthContext'; // Import AuthContextProvider

export const metadata: Metadata = {
  title: "D'System",
  description: 'Gerenciamento de estoque para produtos artesanais',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased min-h-screen bg-background text-foreground">
        <AuthContextProvider> {/* Wrap children with AuthContextProvider */}
          {children}
        </AuthContextProvider>
        <Toaster />
      </body>
    </html>
  );
}
