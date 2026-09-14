import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import ServiceWorkerRegister from "./ServiceWorkerRegister";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ReviewerHub - Free CSE & LTO Exam Reviewer Online",
  description:
    "Free online reviewer for the Philippine Civil Service Exam (CSE) and LTO driving license exam. Practice with randomized questions, category-based drills, and instant feedback.",
  manifest: "/manifest.json",
  keywords: [
    "civil service exam reviewer",
    "CSE reviewer online",
    "LTO exam reviewer",
    "LTO written exam reviewer",
    "free exam practice Philippines",
    "driving license exam reviewer Philippines",
    "CSE professional exam reviewer",
    "CSE subprofessional exam reviewer",
  ],
  openGraph: {
    title: "ReviewerHub - Free CSE & LTO Exam Reviewer",
    description:
      "Practice for the Civil Service Exam and LTO exam with free randomized questions and instant feedback.",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ServiceWorkerRegister />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}