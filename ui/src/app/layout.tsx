import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-outfit',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "WPL Fantasy Football",
  description: "Fantasy Football League Application",
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'WPLFF',
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
   <html lang="en" className={outfit.variable}>
    <meta name="apple-mobile-web-app-title" content="WPLFF" />
      <body className={outfit.className}>
        {children}
      </body>
    </html>
  );
}
