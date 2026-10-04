import { LucideIcon } from "lucide-react";
import TeamMembers from "@/constants/team-members";

export enum Tag {
  FEATURED = "featured",
  OPEN_SOURCE = "open-source",
  CUSTOMER = "customer",
}

export interface Technology {
  key: string;
  name: string;
  icon: LucideIcon;
}

export interface Feature {
  key: string;
  icon?: LucideIcon;
  image?: string;
}

export interface Metric {
  key: string;
  value: string;
}

export interface ProjectTeamMember {
  ref: keyof typeof TeamMembers;
  role: string;
}

export interface Testimonial {
  key: string;
  author: {
    name: string;
    image: string;
  };
}

export interface Screenshot {
  key: string;
  url: string;
}

export interface Resource {
  key: string;
  type: "article" | "video" | "documentation";
  url: string;
}

export interface Project {
  id: string;
  name: string;
  tags: Tag[];
  iconUrl: string;
  showcaseUrl?: string;
  thumbnailUrl: string;

  website?: string;
  repository?: string;
  startDate: string;
  status: "active" | "completed" | "archived";

  features: Feature[];
  technologies: Technology[];
  metrics: Metric[];

  team: ProjectTeamMember[];
  testimonials?: Testimonial[];

  screenshots: Screenshot[];

  challenges: string[];
  learnings: string[];
  futurePlans?: string[];

  resources?: Resource[];
}
