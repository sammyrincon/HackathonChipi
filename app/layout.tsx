import { type Metadata } from "next";
import { Playfair_Display, Lora, Inter, JetBrains_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ChipiProvider } from "@chipi-stack/nextjs";
import { Toaster } from "sonner";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-headline",
  subsets: ["latin"],
});

const lora = Lora({
  variable: "--font-body",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-ui",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
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
        <html lang="en" suppressHydrationWarning>
          <body className={`${playfair.variable} ${lora.variable} ${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
            {children}
            <Toaster />
            <ReactQueryDevtools initialIsOpen={false} />
          </body>
        </html>
      </ChipiProvider>
    </ClerkProvider>
  );
}