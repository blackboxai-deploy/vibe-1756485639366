import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Notion Clone - Productivity App',
  description: 'A modern, block-based productivity app inspired by Notion',
  keywords: ['productivity', 'notes', 'workspace', 'notion', 'editor'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}