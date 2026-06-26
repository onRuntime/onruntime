import "reflect-metadata";
import "@fontsource/cal-sans";
import "@/styles/globals.css";

import type { ReactNode } from "react";
import Script from "next/script";
import { Figtree } from "next/font/google";
import { Provider } from "react-wrap-balancer";

import { cn } from "@/lib/utils/cn";
import { localeCodes } from "@/lib/translations";
import Navbar from "@/components/marketing/navbar";
import Footer from "@/components/layout/footer/footer";
import { Toaster } from "@/components/ui/toaster";
import { OrganizationSchema } from "@/components/json-ld/organization-schema";
import { ConditionalLayout } from "@/components/layout/conditional-layout";

import { Providers } from "./providers";

export const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
});

export async function generateStaticParams() {
  return localeCodes.map((locale) => ({ locale }));
}

type LayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: LayoutProps) {
  const { locale } = await params;

  return (
    <html
      lang={locale}
      className={cn(figtree.variable)}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body
        className={
          "flex flex-col min-h-screen items-center bg-muted text-sm md:text-lg"
        }
      >
        <OrganizationSchema />

        <Providers locale={locale}>
          <Provider>
            <ConditionalLayout hideOnDocs>
              <Navbar />
            </ConditionalLayout>

            {children}

            <ConditionalLayout hideOnDocs>
              <Footer />
            </ConditionalLayout>
          </Provider>
        </Providers>

        <Toaster />
      </body>

      {process.env.NODE_ENV !== "development" && (
        <>
          {/* Umami Analytics */}
          <Script
            defer
            src="https://cloud.umami.is/script.js"
            data-website-id="a1dcf9f4-44a8-4deb-afeb-cf8465c41f72"
          />

          {/* Google Analytics */}
          <Script
            defer
            async
            src="https://www.googletagmanager.com/gtag/js?id=G-SGGDZ43QL4"
          />
          <Script
            id="google-analytics"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'G-SGGDZ43QL4');
              `,
            }}
          />

          {/* Google Ads Conversion Tracking */}
          <Script
            async
            src="https://www.googletagmanager.com/gtag/js?id=AW-16498437714"
          />
          <Script
            id="google-ads"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'AW-16498437714');
              `,
            }}
          />
        </>
      )}
    </html>
  );
}
