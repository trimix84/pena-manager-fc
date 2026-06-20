import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import UserMenu from "@/components/UserMenu";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Peña Manager FC",
  description: "Gestión de peña de fútbol amateur",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="w-full bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-white font-semibold text-sm hover:text-green-400 transition-colors">
            Peña Manager FC
          </Link>
          <UserMenu />
        </header>
        <main className="flex-1">
          {children}
        </main>
      </body>
    </html>
  );
}