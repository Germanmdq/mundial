import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.mundialentreamigos.online"),
  title: "Mundial entre Amigos",
  description: "Armá tu predicción del Mundial 2026, competí con amigos y participá por el pozo acumulado.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Mundial entre Amigos",
    description: "Armá tu predicción del Mundial 2026 y participá por el pozo acumulado.",
    url: "https://www.mundialentreamigos.online",
    siteName: "Mundial entre Amigos",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Mundial entre Amigos",
      },
    ],
    locale: "es_AR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mundial entre Amigos",
    description: "Armá tu predicción del Mundial 2026 y participá por el pozo acumulado.",
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
      </head>
      <body className={`${inter.variable} ${manrope.variable} antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
