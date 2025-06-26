import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth/auth-provider"; // Import AuthProvider
import { Toaster } from "@/components/ui/toaster"; // Import Toaster for notifications
import { ChatbotFloating } from "@/components/common/chatbot-floating"; // Import floating chatbot

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StockSim India",
  description:
    "Virtual stock trading for the Indian market with AI predictions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-secondary`}
      >
        <AuthProvider>
          {" "}
          {/* Wrap children with AuthProvider */}
          {children}
          <Toaster /> {/* Add Toaster for notifications */}
          <ChatbotFloating /> {/* Add floating chatbot to all pages */}
        </AuthProvider>
      </body>
    </html>
  );
}
