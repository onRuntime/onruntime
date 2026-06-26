import { Button } from "@/components/ui/button";
import DotPattern from "@/components/ui/dot-pattern";
import { cn } from "@/lib/utils";
import Image from "next/image";
import React from "react";
import Partners from "./partners";
import { OnRuntimeWordMark } from "@/logos/components";
import Balancer from "react-wrap-balancer";
import Routes from "@/constants/routes";
import { Link } from "@onruntime/translations/next";
import { getTranslation } from "@/lib/translations.server";

const Featured: React.FC = async () => {
  const { t } = await getTranslation("components/marketing/landing/visitor/featured");

  return (
    <header className="bg-linear-to-t from-onruntime-blue/10 to-transparent">
      <div className="px-4 md:px-0 py-16 flex flex-col justify-center items-center max-w-5xl mx-auto">
        <div className="relative max-w-xl flex flex-col items-center gap-6">
          <h1 className="font-semibold text-5xl md:text-6xl text-foreground text-center">
            <Balancer>
              {t("title").split("<accent>")[0]}
              <span className="text-onruntime-blue inline">
                {t("title").split("<accent>")[1]?.split("</accent>")[0]}
              </span>
              {t("title").split("</accent>")[1]}
            </Balancer>
          </h1>

          <p className="text-center">
            <Balancer>
              {t("description")}
            </Balancer>
          </p>

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

        <div className="relative mt-12 rounded-sm overflow-hidden">
          <Image
            src={"/static/images/onruntime-team.jpg"}
            alt={t("image-alt")}
            width={1024}
            height={510}
            className="z-[-1] max-h-[510px] object-cover"
            priority
            sizes="100vw"
          />

          <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent flex flex-col justify-end items-center p-5 md:p-10 gap-5">
            <Image
              className="hidden md:block self-start"
              src={"/static/images/quotes.png"}
              alt={t("quote-alt")}
              width={46}
              height={43}
            />

            <p className="hidden md:block text-white leading-5">
              <Balancer>
                {t("testimonial")}
              </Balancer>
            </p>

            <OnRuntimeWordMark fill="white" height={24} className="self-end h-6" />
          </div>
        </div>

        <Partners />
      </div>
    </header>
  );
};

export default Featured;
