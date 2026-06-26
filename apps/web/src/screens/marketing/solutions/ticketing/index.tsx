import React from "react";
import {
  ArrowRight,
  BarChart3,
  Globe,
  QrCode,
  RotateCcw,
  ShieldCheck,
  Smartphone,
  Ticket,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import DotPattern from "@/components/ui/dot-pattern";
import Safari from "@/components/ui/safari";
import { cn } from "@/lib/utils";
import { getTranslation } from "@/lib/translations.server";
import { GoogleAdsConversionLink } from "@/components/marketing/projects/details/google-ads-conversion";

const CONVERSION_SEND_TO = "AW-16498437714/CRTrCMzs0akbENLciLs9";

// Tonight Pass currently ships /fr and /en flows. Send French visitors to the
// French product and everyone else to the English one.
const tpLocale = (locale?: string) => (locale?.startsWith("fr") ? "fr" : "en");
const createUrl = (locale?: string) =>
  `https://tonightpass.com/${tpLocale(locale)}/new`;
const discoverUrl = (locale?: string) =>
  `https://tonightpass.com/${tpLocale(locale)}/ticketing`;

const HERO_STAT_KEYS = ["setup", "cost", "support"] as const;

const EVENT_TYPE_KEYS = [
  "nightclub",
  "concert",
  "festival",
  "party",
  "afterwork",
  "show",
  "cruise",
  "seminar",
  "conference",
  "trade-show",
  "sport",
  "members-night",
] as const;

const FEATURE_ITEMS: { key: string; icon: LucideIcon }[] = [
  { key: "flexible-tickets", icon: Ticket },
  { key: "qr-control", icon: QrCode },
  { key: "analytics", icon: BarChart3 },
  { key: "payments", icon: ShieldCheck },
  { key: "mobile", icon: Smartphone },
  { key: "refunds", icon: RotateCcw },
];

const STEP_KEYS = ["create", "configure", "sell"] as const;

const FAQ_KEYS = ["fees", "setup-time", "payments", "features", "support"] as const;

interface TicketingScreenProps {
  /** Theme variant slug for message-match landings (e.g. "nightlife"). */
  variant?: string;
  /** Active locale, used to route CTAs to the matching Tonight Pass flow. */
  locale?: string;
}

const TicketingScreen: React.FC<TicketingScreenProps> = async ({
  variant,
  locale,
}) => {
  const { t } = await getTranslation("screens/marketing/solutions/ticketing");

  const CREATE_URL = createUrl(locale);
  const DISCOVER_URL = discoverUrl(locale);

  // Theme-aware accessor: pulls flavored copy from the variant overrides when a
  // variant is set, otherwise falls back to the generic base copy.
  const tv = (key: string) => (variant ? t(`variants.${variant}.${key}`) : t(key));

  return (
    <main className="min-h-screen pt-32 pb-16">
      {/* Hero */}
      <div className="relative flex flex-col items-center justify-center px-4 -mt-32 pt-32 pb-16 min-h-[80vh]">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="font-semibold text-4xl md:text-6xl text-foreground">
            {tv("hero.title")}
          </h1>

          <h2 className="text-xl md:text-2xl text-muted-foreground font-medium">
            {tv("hero.subtitle")}
          </h2>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {tv("hero.description")}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <GoogleAdsConversionLink href={CREATE_URL} sendTo={CONVERSION_SEND_TO}>
              <Button size="lg" className="w-full sm:w-auto">
                {t("hero.buttons.create")}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </GoogleAdsConversionLink>
            <GoogleAdsConversionLink href={DISCOVER_URL} sendTo={CONVERSION_SEND_TO}>
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                {t("hero.buttons.discover")}
                <Globe className="ml-2 w-4 h-4" />
              </Button>
            </GoogleAdsConversionLink>
          </div>

          <div className="grid grid-cols-3 gap-8 pt-12 max-w-md mx-auto text-center">
            {HERO_STAT_KEYS.map((key) => (
              <div key={key}>
                <div className="text-2xl font-bold text-foreground">
                  {t(`hero.stats.${key}.value`)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {t(`hero.stats.${key}.label`)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <DotPattern
          width={30}
          height={30}
          className={cn(
            "absolute z-[-1] inset-0",
            "mask-[radial-gradient(400px_circle_at_center,white,transparent)]"
          )}
        />
      </div>

      <div className="px-4 md:px-0 max-w-5xl mx-auto space-y-24 mt-12">
        {/* Product showcase - attendee facing event page */}
        <section className="space-y-8">
          <div className="max-w-2xl mx-auto text-center space-y-4">
            <h2 className="text-3xl font-semibold text-foreground">
              {t("showcase.title")}
            </h2>
            <p className="text-lg text-muted-foreground">
              {t("showcase.description")}
            </p>
          </div>
          <div className="w-full">
            <Safari
              width={1200}
              height={750}
              url={t("showcase.url")}
              imageSrc="/static/images/solutions/ticketing/event-page.webp"
              className="w-full h-auto"
            />
          </div>
        </section>

        {/* Event types */}
        <section className="space-y-8 text-center">
          <h2 className="text-3xl font-semibold text-foreground">
            {tv("event-types.title")}
          </h2>
          <div className="flex flex-wrap gap-3 justify-center">
            {EVENT_TYPE_KEYS.map((key) => (
              <span
                key={key}
                className="inline-block text-sm px-4 py-2 rounded-full border bg-card text-muted-foreground"
              >
                {t(`event-types.items.${key}`)}
              </span>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="space-y-8">
          <h2 className="text-3xl font-semibold text-foreground text-center">
            {tv("features.title")}
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {FEATURE_ITEMS.map(({ key, icon: Icon }) => (
              <div
                key={key}
                className="flex flex-col gap-4 p-6 rounded-lg border bg-card"
              >
                <div className="p-3 rounded-md bg-onruntime-blue/10 text-onruntime-blue w-fit">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  {t(`features.items.${key}.title`)}
                </h3>
                <p className="text-muted-foreground">
                  {t(`features.items.${key}.description`)}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Organizer dashboard showcase */}
        <section className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-4">
            <h2 className="text-3xl font-semibold text-foreground">
              {t("dashboard.title")}
            </h2>
            <p className="text-lg text-muted-foreground">
              {t("dashboard.description")}
            </p>
          </div>
          <div className="w-full">
            <Safari
              width={1200}
              height={750}
              url={t("dashboard.url")}
              imageSrc="/static/images/solutions/ticketing/organizer-editor.webp"
              className="w-full h-auto"
            />
          </div>
        </section>

        {/* How it works */}
        <section className="space-y-8">
          <h2 className="text-3xl font-semibold text-foreground text-center">
            {tv("steps.title")}
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {STEP_KEYS.map((key, index) => (
              <div
                key={key}
                className="flex flex-col gap-4 p-6 rounded-lg border bg-card"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-onruntime-blue/10 text-onruntime-blue font-semibold">
                  {index + 1}
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  {t(`steps.items.${key}.title`)}
                </h3>
                <p className="text-muted-foreground">
                  {t(`steps.items.${key}.description`)}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="space-y-8">
          <h2 className="text-3xl font-semibold text-foreground text-center">
            {tv("faq.title")}
          </h2>
          <div className="space-y-4 max-w-3xl mx-auto">
            {FAQ_KEYS.map((key) => (
              <div key={key} className="p-6 rounded-lg border bg-card">
                <h3 className="font-semibold text-foreground mb-2">
                  {t(`faq.items.${key}.question`)}
                </h3>
                <p className="text-muted-foreground">
                  {t(`faq.items.${key}.answer`)}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="relative overflow-hidden rounded-lg border bg-card p-8">
          <div className="max-w-3xl mx-auto text-center space-y-6 relative z-10">
            <h2 className="text-2xl md:text-3xl font-semibold text-foreground">
              {tv("final-cta.title")}
            </h2>
            <p className="text-lg text-muted-foreground">
              {tv("final-cta.description")}
            </p>
            <div className="flex justify-center">
              <GoogleAdsConversionLink href={CREATE_URL} sendTo={CONVERSION_SEND_TO}>
                <Button size="lg">
                  {t("final-cta.button")}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </GoogleAdsConversionLink>
            </div>
          </div>

          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-linear-to-l from-onruntime-blue/10 to-transparent" />
        </section>
      </div>
    </main>
  );
};

export default TicketingScreen;
