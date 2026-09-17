import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { ThemeProvider } from '@/context/ThemeContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const themeInitScript = `
(function () {
  try {
    var stored = localStorage.getItem('shopspace_theme');
    var dark = stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (dark) document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`;

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

export const metadata: Metadata = {
  title: 'ShopSpace — Marketplace',
  description: 'Shop new, used, and refurbished finds from trusted sellers.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="flex min-h-screen flex-col font-sans">
        <ThemeProvider>
        <LanguageProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
              <Toaster
                position="bottom-center"
                toastOptions={{
                  style: {
                    background: '#1C1B19',
                    color: '#FAF9F6',
                    fontSize: '14px',
                    borderRadius: '999px',
                    padding: '10px 18px',
                  },
                }}
              />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
        </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
