import type { Metadata } from "next";
import { Inter, Electrolize } from "next/font/google";
import { Providers } from "./providers";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";
import "dotenv/config";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const electrolize = Electrolize({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-electrolize",
});

export const metadata: Metadata = {
  title: "BOUTIQUE KAMEGA",
  description:
    "BOUTIQUE KAMEGA - Habillement Mixte. Style, Élégance, Qualité. Vetements, chaussures et accessoires premium à Butembo.",
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.variable} ${electrolize.variable} font-sans`}>
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
