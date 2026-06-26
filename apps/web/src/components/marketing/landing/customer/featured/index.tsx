import { Button } from "@/components/ui/button";
import DotPattern from "@/components/ui/dot-pattern";
import Safari from "@/components/ui/safari";
import Routes from "@/constants/routes";
import { cn } from "@/lib/utils";
import { Link } from "@onruntime/translations/next";
import React from "react";
import Balancer from "react-wrap-balancer";
import { getTranslation } from "@/lib/translations.server";

const Featured: React.FC = async () => {
  const { t } = await getTranslation("components/marketing/landing/customer/featured");

  return (
    <header className="bg-linear-to-t from-onruntime-magenta/10 to-transparent overflow-hidden">
      <div className="px-4 md:px-0 pt-16 flex flex-col justify-center items-center max-w-5xl mx-auto">
        <div className="relative max-w-xl flex flex-col items-center gap-6">
          <h1 className="font-semibold text-5xl md:text-6xl text-foreground text-center">
            <Balancer>
              {t("title").split("<accent>")[0]}
              <span className="text-onruntime-magenta inline">
                {t("title").split("<accent>")[1]?.split("</accent>")[0]}
              </span>
              {t("title").split("</accent>")[1]}
            </Balancer>
          </h1>

          <p
            className="text-center text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: t("description") }}
          />

          <div className="flex gap-3">
            <Link href={Routes.contact}>
              <Button>{t("cta.book")}</Button>
            </Link>

            <Link href={Routes.projects}>
              <Button variant={"outline"}>{t("cta.work")}</Button>
            </Link>
          </div>

          <DotPattern
            width={30}
            height={30}
            className={cn(
              "z-[-1]",
              "mask-[radial-gradient(300px_circle_at_center,white,transparent)]"
            )}
          />
        </div>

        <Safari
          url="tonightpass.com"
          imageSrc="/static/images/projects/tonightpass/showcase.webp"
          className="relative bottom-[-10px] mt-12 max-h-[510px] size-full rounded-t-md rounded-b-none"
        />
      </div>
    </header>
  );
};

export default Featured;
