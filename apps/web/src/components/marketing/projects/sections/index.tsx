"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import Projects from "@/constants/projects";
import { Tag } from "@/types/project";
import ProjectCard from "@/components/marketing/landing/visitor/projects/card";
import Image from "next/image";
import { Link } from "@onruntime/translations/next";
import { useTranslation } from "@onruntime/translations/react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Routes from "@/constants/routes";

const FeaturedProjectCard = ({ project }: { project: (typeof Projects)[number] }) => {
  const { t } = useTranslation("components/marketing/projects/sections");
  const { t: tProject } = useTranslation(`constants/projects/${project.id}`);

  const getTagLabel = (tag: Tag) => {
    if (tag === Tag.FEATURED) return t("tags.featured");
    if (tag === Tag.OPEN_SOURCE) return t("tags.open-source");
    if (tag === Tag.CUSTOMER) return t("tags.customer");
    return tag;
  };

  return (
    <div className="flex flex-col h-full group">
      <Link href={Routes.project(project.id)} className="block">
        <div className="relative aspect-video w-full overflow-hidden rounded-lg mb-4">
          <Image
            src={project.showcaseUrl || project.thumbnailUrl}
            alt={project.name}
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          <div className="absolute bottom-4 left-4 flex gap-2">
            {project.tags.map((tag) => (
              <Badge key={tag}>{getTagLabel(tag)}</Badge>
            ))}
          </div>
        </div>
      </Link>
      <h3 className="text-xl font-medium">{project.name}</h3>
      <p className="mt-2 mb-4 text-muted-foreground line-clamp-3">
        {tProject("description")}
      </p>
      <div className="mt-auto">
        <Link href={Routes.project(project.id)}>
          <Button
            variant="outline"
            className="w-full group-hover:border-onruntime-blue transition-colors"
          >
            {t("featured.view-project")}
            <ArrowRight className="ml-2 h-4 w-4 group-hover:text-onruntime-blue transition-colors" />
          </Button>
        </Link>
      </div>
    </div>
  );
};

export const FeaturedProjects = () => {
  const { t } = useTranslation("components/marketing/projects/sections");

  const featuredProjects = Projects.filter((project) =>
    project.tags.includes(Tag.FEATURED)
  );

  if (featuredProjects.length === 0) return null;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-medium text-foreground">
          {t("featured.title")}
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {featuredProjects.map((project) => (
          <FeaturedProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
};

export const StudioProjects = () => {
  const { t } = useTranslation("components/marketing/projects/sections");

  const studioProjects = Projects.filter(
    (project) =>
      !project.tags.includes(Tag.FEATURED) &&
      !project.tags.includes(Tag.CUSTOMER)
  );

  if (studioProjects.length === 0) return null;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-medium text-foreground">
          {t("studio.title")}
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {studioProjects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
};

export const CustomerProjects = () => {
  const { t } = useTranslation("components/marketing/projects/sections");

  const customerProjects = Projects.filter((project) =>
    project.tags.includes(Tag.CUSTOMER)
  );

  const hasCustomerProjects = customerProjects.length > 0;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-medium text-foreground">
          {t("customer.title")}
        </h2>
        {!hasCustomerProjects && (
          <Badge variant="secondary">{t("customer.coming-soon")}</Badge>
        )}
      </div>

      {hasCustomerProjects ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {customerProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div className="flex justify-center py-12">
          <div className="text-center max-w-lg">
            <p className="text-muted-foreground mb-6">
              {t("customer.empty.description")}
            </p>
            <Link href={Routes.contact}>
              <Button variant="outline">
                {t("customer.empty.button")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
