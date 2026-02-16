import { type Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ChipiProvider } from "@chipi-stack/nextjs";

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
  title: "Chipi Pay | Secure Private Escrow",
  description: "Crypto payments app",
};

export default function RootLayout({children}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <ChipiProvider>
        <html lang="en" suppressHydrationWarning>
          <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
            {children}
          </body>
        </html>
      </ChipiProvider>
    </ClerkProvider>
  );
}