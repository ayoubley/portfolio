import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  title: "Ayoub Bensadek | Designer & Digital Strategist",
  description:
    "Professional designer with 7+ years of experience in digital design, UI/UX, branding, and domain investing. Transforming ideas into premium digital experiences.",
  keywords: [
    "Ayoub Bensadek",
    "UI/UX Designer",
    "Digital Design",
    "Branding",
    "Domain Investing",
    "Digital Strategy",
    "Web Design",
    "Portfolio",
  ],
  openGraph: {
    title: "Ayoub Bensadek | Designer & Digital Strategist",
    description:
      "Professional designer with 7+ years of experience. Transforming ideas into premium digital experiences.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ayoub Bensadek | Designer & Digital Strategist",
    description:
      "Professional designer with 7+ years of experience. Transforming ideas into premium digital experiences.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
    >
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
