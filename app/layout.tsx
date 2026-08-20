import type { Metadata } from 'next';
import './globals.css';
import AppShell from '@/components/layout/AppShell';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { AuthGate } from '@/components/auth/AuthGate';

export const metadata: Metadata = {
  title: 'Medical RAG Assistant',
  description: 'Evidence-grounded medical Q&A assistant',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <AuthGate>
            <AppShell>{children}</AppShell>
          </AuthGate>
        </AuthProvider>
      </body>
    </html>
  );
}
