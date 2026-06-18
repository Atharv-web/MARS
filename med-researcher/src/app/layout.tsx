import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";

// Self-hosted from @fontsource (.woff2 committed under ./fonts) so the build
// never reaches out to Google Fonts — works fully offline.
const manrope = localFont({
  variable: "--font-manrope",
  display: "swap",
  src: [
    { path: "./fonts/manrope-latin-300-normal.woff2", weight: "300", style: "normal" },
    { path: "./fonts/manrope-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/manrope-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "./fonts/manrope-latin-600-normal.woff2", weight: "600", style: "normal" },
  ],
});

const cormorant = localFont({
  variable: "--font-cormorant",
  display: "swap",
  src: [
    { path: "./fonts/cormorant-garamond-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "./fonts/cormorant-garamond-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "./fonts/cormorant-garamond-latin-700-normal.woff2", weight: "700", style: "normal" },
  ],
});

export const metadata: Metadata = {
  title: "MARS — Model Agnostic Research System",
  description:
    "MARS fires multiple search intelligence systems in parallel — Perplexity, Tavily, Serper Dev, and more — then synthesises the result into a single, cited, readable report.",
  openGraph: {
    title: "MARS — Model Agnostic Research System",
    description:
      "Research that thinks in parallel. Ask a question, get a cited report.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MARS — Model Agnostic Research System",
    description: "Research that thinks in parallel.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Apply the saved theme before paint to avoid a dark→light flash. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(localStorage.getItem('mars-theme')==='light')document.documentElement.classList.add('theme-light')}catch(e){}",
          }}
        />
      </head>
      <body className={`${manrope.variable} ${cormorant.variable} antialiased`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}