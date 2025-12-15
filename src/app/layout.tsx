import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import DirectionProvider from '@/components/DirectionProvider';
import MountedProvider from '@/components/MountedProvider';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'MyMoney',
  description: 'Gestiona tus finanzas de manera sencilla',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='es' suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <DirectionProvider direction='ltr'>
          <MountedProvider>{children}</MountedProvider>
        </DirectionProvider>
      </body>
    </html>
  );
}
