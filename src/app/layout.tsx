import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ScannerProvider } from '@/context/ScannerContext';
import { ToastProvider } from '@/context/ToastContext';
import Sidebar from '@/components/Sidebar';
import ToastStack from '@/components/ToastStack';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'AutoForm – Escáner Inteligente de Facturas',
    description: 'Digitaliza facturas y documentos con OCR inteligente. Captura por imagen, PDF o cámara y genera formularios listos para enviar.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="es">
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                <ToastProvider>
                    <ScannerProvider>
                        <div className="flex-col-on-mobile" style={{ display: 'flex', minHeight: '100vh' }}>
                            <div className="hide-on-mobile">
                                <Sidebar />
                            </div>
                            <main style={{ flex: 1, overflow: 'auto', minWidth: 0, paddingBottom: '70px' }} className="p-mobile-sm">
                                {children}
                            </main>
                            <div className="show-on-mobile hide-on-desktop">
                                <Sidebar isMobile />
                            </div>
                        </div>
                        <ToastStack />
                    </ScannerProvider>
                </ToastProvider>
            </body>
        </html>
    );
}
