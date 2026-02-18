import { type Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ChipiProvider } from "@chipi-stack/nextjs";
import { Toaster } from "sonner";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

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
  title: "ZeroPass | Verify once, access anywhere",
  description: "ZeroPass — verify once, access anywhere. KYC and credentials linked to your Chipi wallet.",
};

export default function RootLayout({children}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider afterSignOutUrl="/">
      <ChipiProvider>
        <html lang="en" className="dark" suppressHydrationWarning>
          <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
            {children}
            <Toaster />
            <ReactQueryDevtools initialIsOpen={false} />
          </body>
        </html>
      </ChipiProvider>
    </ClerkProvider>
  );
}