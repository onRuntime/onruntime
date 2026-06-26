import React from "react";
import { Project, Tag } from "@/types/project";
import DotPattern from "@/components/ui/dot-pattern";
import { cn } from "@/lib/utils";
import Safari from "@/components/ui/safari";
import { Button } from "@/components/ui/button";
import { Link } from "@onruntime/translations/next";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Github,
  Globe,
  Calendar,
  Timer,
  Users,
  Linkedin,
  User,
} from "lucide-react";
import TeamMembers from "@/constants/team-members";
import { siteConfig } from "@/constants/site-config";
import { getTranslation } from "@/lib/translations.server";

import { MemberWebsiteButton } from "@/components/marketing/projects/details/member-website-button";
import { GoogleAdsConversionLink } from "@/components/marketing/projects/details/google-ads-conversion";

interface ProjectPageProps {
  project: Project;
}

const ProjectPage: React.FC<ProjectPageProps> = async ({ project }) => {
  const { t, locale } = await getTranslation("screens/marketing/projects/details");
  const { t: tProject } = await getTranslation(`constants/projects/${project.id}`);

  // Tonight Pass ships /fr and /en flows; route the CTAs to the matching one.
  const tpLocale = locale?.startsWith("fr") ? "fr" : "en";
  const tpCreateUrl = `https://tonightpass.com/${tpLocale}/new`;
  const tpDiscoverUrl = `https://tonightpass.com/${tpLocale}/ticketing`;

  const getTagLabel = (tag: Tag) => {
    if (tag === Tag.FEATURED) return t("tags.featured");
    if (tag === Tag.OPEN_SOURCE) return t("tags.open-source");
    if (tag === Tag.CUSTOMER) return t("tags.customer");
    return tag;
  };

  const getHostname = (url: string | undefined): string => {
    try {
      return new URL(url || siteConfig.url).hostname;
    } catch {
      return "";
    }
  };

  return (
    <main className="min-h-screen pt-32 pb-16">
      {project.id === "tonightpass" ? (
        <div className="relative min-h-screen flex flex-col items-center justify-center px-4 -mt-32 pt-32">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h1 className="font-semibold text-4xl md:text-6xl text-foreground">
              {t("tonightpass.hero.title")}
            </h1>

            <h2 className="text-xl md:text-2xl text-muted-foreground font-medium">
              {t("tonightpass.hero.subtitle")}
            </h2>

            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {t("tonightpass.hero.description")}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <GoogleAdsConversionLink
                href={tpCreateUrl}
                sendTo="AW-16498437714/CRTrCMzs0akbENLciLs9"
              >
                <Button size="lg" className="w-full sm:w-auto">
                  {t("tonightpass.hero.buttons.create")}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </GoogleAdsConversionLink>
              <GoogleAdsConversionLink
                href={tpDiscoverUrl}
                sendTo="AW-16498437714/CRTrCMzs0akbENLciLs9"
              >
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  {t("tonightpass.hero.buttons.discover")}
                  <Globe className="ml-2 w-4 h-4" />
                </Button>
              </GoogleAdsConversionLink>
            </div>

            <div className="grid grid-cols-3 gap-8 pt-12 max-w-md mx-auto text-center">
              <div>
                <div className="text-2xl font-bold text-foreground">
                  {t("tonightpass.hero.stats.setup.value")}
                </div>
                <div className="text-sm text-muted-foreground">
                  {t("tonightpass.hero.stats.setup.label")}
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">
                  {t("tonightpass.hero.stats.cost.value")}
                </div>
                <div className="text-sm text-muted-foreground">
                  {t("tonightpass.hero.stats.cost.label")}
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">
                  {t("tonightpass.hero.stats.support.value")}
                </div>
                <div className="text-sm text-muted-foreground">
                  {t("tonightpass.hero.stats.support.label")}
                </div>
              </div>
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
      ) : null}

      <div className="px-4 md:px-0 max-w-5xl mx-auto space-y-24">
        {project.id !== "tonightpass" && (
          <div className="relative w-full flex flex-col items-center gap-8">
            <div className="max-w-2xl text-center space-y-6">
              <Image
                src={project.iconUrl}
                alt={project.name}
                className="w-16 h-16 rounded-lg mx-auto"
                width={64}
                height={64}
              />

              <div className="flex flex-wrap gap-2 justify-center">
                {project.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {getTagLabel(tag)}
                  </Badge>
                ))}
              </div>

              <h1 className="font-semibold text-4xl md:text-5xl text-foreground">
                {project.name}
              </h1>

              <p className="text-muted-foreground text-lg">
                {tProject("description")}
              </p>

              <div className="flex gap-3 justify-center">
                {project.website && (
                  <Link href={project.website} target="_blank">
                    <Button>
                      {t("buttons.view-project")}
                      <Globe className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                )}

                {project.repository && (
                  <Link href={project.repository} target="_blank">
                    <Button variant="outline">
                      <Github className="mr-2 w-4 h-4" />
                      {t("buttons.source-code")}
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            <DotPattern
              width={30}
              height={30}
              className={cn(
                "absolute z-[-1] inset-0",
                "mask-[radial-gradient(300px_circle_at_center,white,transparent)]"
              )}
            />
          </div>
        )}

        <div className="w-full">
          <Safari
            width={1200}
            height={750}
            imageSrc={project.showcaseUrl}
            url={getHostname(project.website)}
          />
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="flex items-center gap-3 p-6 rounded-lg border bg-card">
            <div className="p-2 rounded-md bg-onruntime-blue/10 text-onruntime-blue">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {t("info.start-date")}
              </p>
              <p className="font-semibold">
                {new Date(project.startDate).toLocaleDateString(
                  locale === "fr" ? "fr-FR" : "en-US",
                  {
                    year: "numeric",
                    month: "long",
                  }
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-6 rounded-lg border bg-card">
            <div className="p-2 rounded-md bg-onruntime-blue/10 text-onruntime-blue">
              <Timer className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("info.status")}</p>
              <p className="font-semibold">{t(`info.statuses.${project.status}`)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-6 rounded-lg border bg-card">
            <div className="p-2 rounded-md bg-onruntime-blue/10 text-onruntime-blue">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("info.team")}</p>
              <p className="font-semibold">
                {project.team.length} {t("info.members")}
              </p>
            </div>
          </div>
        </div>

        {project.id === "tonightpass" && (
          <div className="relative overflow-hidden rounded-lg border bg-card p-8">
            <div className="max-w-3xl mx-auto text-center space-y-6 relative z-10">
              <h2 className="text-2xl md:text-3xl font-semibold text-foreground">
                {t("tonightpass.cta.title")}
              </h2>
              <p className="text-lg text-muted-foreground">
                {t("tonightpass.cta.description")}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <GoogleAdsConversionLink
                  href={tpCreateUrl}
                  sendTo="AW-16498437714/CRTrCMzs0akbENLciLs9"
                >
                  <Button size="lg" className="w-full sm:w-auto">
                    {t("tonightpass.cta.buttons.start")}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </GoogleAdsConversionLink>
                <GoogleAdsConversionLink
                  href={tpDiscoverUrl}
                  sendTo="AW-16498437714/CRTrCMzs0akbENLciLs9"
                >
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    {t("tonightpass.cta.buttons.features")}
                  </Button>
                </GoogleAdsConversionLink>
              </div>
            </div>

            <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-linear-to-l from-onruntime-blue/10 to-transparent" />
          </div>
        )}

        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <h2 className="text-3xl font-semibold text-foreground mb-6">
            {t("sections.about")}
          </h2>
          <div className="text-muted-foreground whitespace-pre-line">
            {tProject("long-description")}
          </div>
        </div>

        {project.metrics && (
          <div className="space-y-8">
            <h2 className="text-3xl font-semibold text-foreground text-center">
              {t("sections.metrics")}
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {project.metrics.map((metric) => (
                <div key={metric.key} className="text-center space-y-2">
                  <p className="text-4xl font-semibold text-foreground">
                    {tProject(`metrics.${metric.key}.value`)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {tProject(`metrics.${metric.key}.label`)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {tProject(`metrics.${metric.key}.description`)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-8">
          <h2 className="text-3xl font-semibold text-foreground text-center">
            {t("sections.features")}
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {project.features.map((feature) => (
              <div
                key={feature.key}
                className="flex flex-col gap-4 p-6 rounded-lg border bg-card"
              >
                {feature.icon && (
                  <div className="p-3 rounded-md bg-onruntime-blue/10 text-onruntime-blue w-fit">
                    <feature.icon className="w-6 h-6" />
                  </div>
                )}
                <h3 className="text-lg font-semibold text-foreground">
                  {tProject(`features.${feature.key}.title`)}
                </h3>
                <p className="text-muted-foreground">
                  {tProject(`features.${feature.key}.description`)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          <h2 className="text-3xl font-semibold text-foreground text-center">
            {t("sections.technologies")}
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {project.technologies.map((tech) => (
              <div
                key={tech.key}
                className="flex items-start gap-4 p-6 rounded-lg border bg-card"
              >
                <div className="p-3 rounded-md bg-onruntime-blue/10 text-onruntime-blue w-fit">
                  <tech.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {tech.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {tProject(`technologies.${tech.key}.description`)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {project.screenshots && project.screenshots.length > 0 && (
          <div className="space-y-8">
            <h2 className="text-3xl font-semibold text-foreground text-center">
              {t("sections.gallery")}
            </h2>
            <div className="grid grid-cols-2 gap-8">
              {project.screenshots.map((screenshot) => (
                <div key={screenshot.key} className="space-y-2">
                  <div className="relative aspect-video rounded-lg overflow-hidden">
                    <Image
                      src={screenshot.url}
                      alt={tProject(`screenshots.${screenshot.key}.caption`)}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    {tProject(`screenshots.${screenshot.key}.caption`)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-8">
          <h2 className="text-3xl font-semibold text-foreground text-center">
            {t("sections.team")}
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            {project.team.map((teamMember, index) => {
              const member = TeamMembers[teamMember.ref];

              return (
                <div
                  key={index}
                  className="flex flex-col items-center gap-4 p-6 rounded-lg border bg-card text-center"
                >
                  <div className="relative w-20 h-20 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                    {member.avatar ? (
                      <Image
                        src={member.avatar}
                        alt={member.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <User className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground">
                      {member.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {teamMember.role}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    {member.github && (
                      <Link
                        href={member.github}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="outline" size="icon">
                          <Github className="w-4 h-4" />
                        </Button>
                      </Link>
                    )}
                    {member.linkedin && (
                      <Link
                        href={member.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="outline" size="icon">
                          <Linkedin className="w-4 h-4" />
                        </Button>
                      </Link>
                    )}
                    {member.website && <MemberWebsiteButton member={member} />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-foreground">
              {t("sections.challenges")}
            </h2>
            <ul className="space-y-4">
              {project.challenges.map((challenge) => (
                <li key={challenge} className="flex items-start gap-4">
                  <div className="p-2 rounded-md bg-onruntime-blue/10 text-onruntime-blue mt-0.5">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                  <p className="text-muted-foreground">
                    {tProject(`challenges.${challenge}`)}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-foreground">
              {t("sections.learnings")}
            </h2>
            <ul className="space-y-4">
              {project.learnings.map((learning) => (
                <li key={learning} className="flex items-start gap-4">
                  <div className="p-2 rounded-md bg-onruntime-blue/10 text-onruntime-blue mt-0.5">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                  <p className="text-muted-foreground">
                    {tProject(`learnings.${learning}`)}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {project.futurePlans && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-foreground">
              {t("sections.future")}
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {project.futurePlans.map((plan) => (
                <div key={plan} className="p-6 rounded-lg border bg-card">
                  <p className="text-muted-foreground">
                    {tProject(`future-plans.${plan}`)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="relative overflow-hidden rounded-lg border bg-card p-8">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              {t("cta.title")}
            </h2>
            <p className="text-muted-foreground mb-6">{t("cta.description")}</p>
            <Link href="/contact">
              <Button>
                {t("cta.button")}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-linear-to-l from-onruntime-blue/10 to-transparent" />
        </div>
      </div>
    </main>
  );
};

export default ProjectPage;
