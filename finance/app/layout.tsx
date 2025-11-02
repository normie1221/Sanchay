import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { 
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton
} from '@clerk/nextjs';
import "./globals.css";
import Sidebar from '@/components/Sidebar';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Finance Manager - Smart Personal Finance Assistant",
  description: "AI-powered personal finance manager with expense tracking, budget planning, and fraud detection",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-br from-blue-50 via-white to-cyan-50`}
        >
          <Sidebar />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}

