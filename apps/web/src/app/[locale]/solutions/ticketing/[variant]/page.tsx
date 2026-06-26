import { notFound } from "next/navigation";

import { constructMetadata } from "@/lib/utils/metadata.server";
import { getTranslation } from "@/lib/translations.server";
import TicketingScreen from "@/screens/marketing/solutions/ticketing";

export const TICKETING_VARIANTS = [
  "nightlife",
  "concerts-festivals",
  "business-events",
] as const;

type Variant = (typeof TICKETING_VARIANTS)[number];

type Props = {
  params: Promise<{
    locale: string;
    variant: string;
  }>;
};

const isVariant = (value: string): value is Variant =>
  (TICKETING_VARIANTS as readonly string[]).includes(value);

export function generateStaticParams() {
  return TICKETING_VARIANTS.map((variant) => ({ variant }));
}

export async function generateMetadata({ params }: Props) {
  const { variant } = await params;

  if (!isVariant(variant)) {
    return {};
  }

  const { t } = await getTranslation("app/solutions/ticketing/page");

  return constructMetadata({
    title: t(`variants.${variant}.metadata.title`),
    description: t(`variants.${variant}.metadata.description`),
  });
}

export default async function Page({ params }: Props) {
  const { locale, variant } = await params;

  if (!isVariant(variant)) {
    notFound();
  }

  return <TicketingScreen variant={variant} locale={locale} />;
}
