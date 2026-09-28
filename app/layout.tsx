import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
  variable: "--font-mono",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#08090b",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://pylsrun.github.io/pylsrun"),
  title: {
    default: "PylsRun — Systems Programming for Python, Written in C++",
    template: "%s | PylsRun",
  },
  description:
    "PylsRun is a systems-programming library for Python with a C++ native extension underneath: raw pointers and pointer arithmetic, manual allocation, compiler-verified struct/union layouts, SIMD with runtime CPU dispatch, real inline-assembly JIT execution, native ABI calls, atomics, and native concurrency primitives.",
  keywords: [
    "pylsrun",
    "python systems programming",
    "python c++ extension",
    "python simd",
    "python jit assembly",
    "python pointers",
    "ctypes alternative",
    "cffi alternative",
    "python struct layout",
    "python atomics",
    "python native abi",
    "python low level",
  ],
  authors: [
    { name: "PylsRun contributors", url: "https://github.com/pylsrun/pylsrun" },
  ],
  creator: "PylsRun contributors",
  publisher: "PylsRun",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "PylsRun — Systems Programming for Python, Written in C++",
    description:
      "Raw pointers, compiler-verified structs, SIMD, JIT execution, native ABI calls, atomics, and concurrency — a real systems-programming toolkit for Python.",
    url: "https://pylsrun.github.io/pylsrun",
    siteName: "PylsRun",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PylsRun — Systems Programming for Python, Written in C++",
    description:
      "Raw pointers, compiler-verified structs, SIMD, JIT execution, native ABI calls, atomics, and concurrency for Python.",
    creator: "@pylsrun",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: { url: "/apple-icon.png", sizes: "180x180" },
  },
  manifest: "/manifest.json",
  category: "technology",
  classification: "Software Development",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`dark ${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-w-[320px] bg-[#08090b] font-sans text-[#e8edf2] antialiased">
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
