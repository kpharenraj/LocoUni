import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ToastProvider } from "@/components/ui/ToastProvider";
import ThemeProvider from "@/components/providers/ThemeProvider";
import { site, siteUrl } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const homeTitle = `${site.name}: Campus guide for new students | Faculty directory, campus map and AI assistant`;
const verificationCode = process.env.GOOGLE_SITE_VERIFICATION;

export const metadata: Metadata = {
  title: {
    default: homeTitle,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  metadataBase: new URL(site.url),
  applicationName: site.name,
  authors: [{ name: site.ownerName }],
  creator: site.ownerName,
  publisher: site.organization,
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: "en_IN",
    url: siteUrl("/"),
    title: homeTitle,
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    title: homeTitle,
    description: site.description,
    images: [siteUrl("/opengraph-image")],
  },
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  category: "education",
  ...(verificationCode ? { verification: { google: verificationCode } } : {}),
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ToastProvider>{children}</ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
