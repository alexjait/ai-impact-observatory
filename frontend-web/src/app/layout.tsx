import type { Metadata, Viewport } from "next";
import { Manrope, Newsreader } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Impact Observatory",
  description: "Editorial observatory for tracking AI impact on human activities.",
  applicationName: "AI Impact Observatory",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: "#f5f0e8",
};

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
  // Next.js 15 App Router passes searchParams to layouts
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}>;

export default async function RootLayout({ children, searchParams }: RootLayoutProps) {
  const params = searchParams ? await searchParams : {};
  const localeParam = Array.isArray(params["locale"]) ? params["locale"][0] : params["locale"];
  const lang = localeParam === "es" ? "es" : "en";

  return (
    <html
      lang={lang}
      className={`${manrope.variable} ${newsreader.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <div
          aria-hidden="true"
          style={{ display: "none" }}
          dangerouslySetInnerHTML={{
            __html:
              "<!-- Alejandro Jait | LinkedIn: https://www.linkedin.com/in/alejandro-jait/ -->",
          }}
        />
        {children}
      </body>
    </html>
  );
}
