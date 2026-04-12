import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import { SearchModalProvider } from "@/components/search-modal-context";
import { ThemeProvider } from "@/components/theme-provider";
import { ToolsSearchModal } from "@/components/tools-search-modal";
import { SITE_DESCRIPTION } from "@/lib/site";
import "./globals.css";

const themeInitScript = `
(function(){
  try {
    var k='tools-library-theme';
    var t=localStorage.getItem(k);
    var dark=false;
    if(t==='dark') dark=true;
    else if(t==='light') dark=false;
    else dark=window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.classList.toggle('dark',dark);
  } catch(e) {}
})();
`;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Tools Library",
  description: SITE_DESCRIPTION,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
        />
      </head>
      <body className="min-h-full bg-neutral-50 text-neutral-900 antialiased dark:bg-neutral-950 dark:text-neutral-100">
        <ThemeProvider>
          <SearchModalProvider>
            {children}
            <ToolsSearchModal />
          </SearchModalProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
