import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ORPA",
  description: "Organización para Retirados de la Policía Antioquia",
  icons: {
    icon: "/img/favicon-orpa.webp",
    apple: "/img/favicon-orpa.webp",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/img/favicon-orpa.webp" type="image/webp" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/img/favicon-orpa.webp" />
        <meta name="msapplication-TileImage" content="/img/favicon-orpa.webp" />
        <meta name="msapplication-TileColor" content="#000000" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
