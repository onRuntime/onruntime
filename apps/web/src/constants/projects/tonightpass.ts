import { Project, Tag } from "@/types/project";
import { Code, Compass, Database, Server, Shield, Ticket } from "lucide-react";

export const tonightpassProject: Project = {
  id: "tonightpass",
  name: "Tonight Pass",
  tags: [Tag.FEATURED],
  iconUrl: "/static/images/projects/tonightpass/icon.svg",
  showcaseUrl: "/static/images/projects/tonightpass/showcase.webp",
  thumbnailUrl: "/static/images/projects/tonightpass/thumbnail.webp",
  website: "https://tonightpass.com",
  repository: undefined,
  startDate: "2021-04",
  status: "active",

  features: [
    { key: "ticketing", icon: Ticket },
    { key: "recommendations", icon: Compass },
    { key: "e-tickets", icon: Shield },
  ],

  technologies: [
    { key: "react", name: "React & React Native", icon: Code },
    { key: "nestjs", name: "Nest.js", icon: Server },
    { key: "mongodb", name: "MongoDB", icon: Database },
  ],

  metrics: [
    { key: "time-saved", value: "45min" },
    { key: "coverage", value: "100%" },
    { key: "ease", value: "1-clic" },
  ],

  team: [
    { ref: "antoine-kingue", role: "Product Manager" },
    { ref: "killian-mendy", role: "Product Manager" },
    { ref: "jeremy-baudrin", role: "Lead Developer" },
    { ref: "lucas-bodin", role: "Lead Designer" },
    { ref: "maeva-leclerc", role: "Lead Marketing" },
    { ref: "mareh-mannaa", role: "Marketing" },
    { ref: "alois-gradelet", role: "Community Manager" },
    { ref: "ines-munoz", role: "Community Manager" },
    { ref: "maceo-vaz-da-mota", role: "Designer" },
    { ref: "younes-bessa", role: "Developer" },
    { ref: "alexis-lecourt", role: "Developer" },
    { ref: "oumaima-haddar", role: "Developer" },
    { ref: "alexis-mouchon", role: "Developer" },
    { ref: "amel-tolba", role: "Developer" },
    { ref: "ines-ferreira", role: "Developer" },
    { ref: "jeremy-cailly", role: "Developer" },
    { ref: "asma-derragui", role: "Developer" },
    { ref: "louis-lazare", role: "Developer" },
  ],

  screenshots: [],

  challenges: [
    "ticketing-experience",
    "recommendation-system",
    "scalable-infrastructure",
    "traffic-peaks",
  ],

  learnings: [
    "booking-simplicity",
    "event-type-interface",
    "database-management",
    "speed-reliability-balance",
  ],

  futurePlans: [
    "venue-kiosks",
    "recruitment-platform",
    "venue-rental",
    "supplier-network",
    "organizer-tools",
    "recommendation-improvement",
  ],
};
