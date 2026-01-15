import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import DirectionProvider from '@/providers/DirectionProvider';
import MountedProvider from '@/providers/MountedProvider';
import ReduxProvider from '@/Redux/providers/ReduxProvider';
import { ConfirmModalProvider } from '@/components/confirm-modal';

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
  description: 'Gestiona tus finanzas de manera sencilla, mes a mes',
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
        <ReduxProvider>
          <ConfirmModalProvider>
            <DirectionProvider direction='ltr'>
              <MountedProvider>{children}</MountedProvider>
            </DirectionProvider>
          </ConfirmModalProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
