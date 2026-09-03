import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import { AuroraBackground } from '@/components/AuroraBackground';
import { TopNav } from '@/components/TopNav';
import { AuthProvider } from '@/components/AuthProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'Wasel Blog Studio — AI articles with original imagery',
  description:
    'Generate SEO-optimized long-form articles with original AI imagery, powered by MiniMax.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <AuroraBackground />
        <AuthProvider>
          <TopNav />
          <main>{children}</main>
        </AuthProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: 'rgba(255,255,255,0.9)',
              backdropFilter: 'blur(16px)',
              border: '1px solid #e0efff',
              color: '#0f2540',
              borderRadius: '14px',
              boxShadow: '0 20px 60px -24px rgba(36,112,221,0.35)',
            },
          }}
        />
      </body>
    </html>
  );
}
