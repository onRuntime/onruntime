import { constructMetadata } from "@/lib/utils/metadata.server";
import { getTranslation } from "@/lib/translations.server";
import TicketingScreen from "@/screens/marketing/solutions/ticketing";

export async function generateMetadata() {
  const { t } = await getTranslation("app/solutions/ticketing/page");

  return constructMetadata({
    title: t("metadata.title"),
    description: t("metadata.description"),
  });
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <TicketingScreen locale={locale} />;
}
