import { Project, Tag } from "@/types/project";
import { BarChart, Building2, Cloud, Code, Database, FileCode, Gift, Globe, Mail, Palette, Quote, Users } from "lucide-react";

export const immobilierBrianconProject: Project = {
  id: "immobilier-briancon",
  name: "Immobilier Briançon",
  tags: [Tag.CUSTOMER],
  iconUrl: "/static/images/projects/immobilier-briancon/icon.png",
  showcaseUrl: "/static/images/projects/immobilier-briancon/showcase.webp",
  thumbnailUrl: "/static/images/projects/immobilier-briancon/thumbnail.webp",
  website: "https://www.immobilier-briancon.com",
  repository: undefined,
  startDate: "2023-09",
  status: "completed",

  features: [
    { key: "property-catalog", icon: Building2 },
    { key: "online-valuation", icon: BarChart },
    { key: "property-alerts", icon: Mail },
    { key: "google-reviews", icon: Quote },
    { key: "referral-program", icon: Gift },
    { key: "team-showcase", icon: Users },
  ],

  technologies: [
    { key: "nextjs", name: "Next.js", icon: Globe },
    { key: "react", name: "React", icon: Code },
    { key: "typescript", name: "TypeScript", icon: FileCode },
    { key: "tailwindcss", name: "Tailwind CSS", icon: Palette },
    { key: "vercel", name: "Vercel", icon: Cloud },
    { key: "la-boite-immo", name: "La Boîte Immo", icon: Database },
  ],

  metrics: [
    { key: "google-reviews", value: "147" },
    { key: "pages", value: "7" },
    { key: "team-size", value: "2" },
  ],

  team: [
    { ref: "jeremy-baudrin", role: "Lead Developer" },
    { ref: "lucas-bodin", role: "Lead Designer" },
  ],

  screenshots: [
    { key: "services", url: "/static/images/projects/immobilier-briancon/screenshots/services.webp" },
    { key: "estimation", url: "/static/images/projects/immobilier-briancon/screenshots/estimation.webp" },
    { key: "reviews", url: "/static/images/projects/immobilier-briancon/screenshots/reviews.webp" },
    { key: "team", url: "/static/images/projects/immobilier-briancon/screenshots/team.webp" },
    { key: "referral", url: "/static/images/projects/immobilier-briancon/screenshots/referral.webp" },
    { key: "contact", url: "/static/images/projects/immobilier-briancon/screenshots/contact.webp" },
  ],

  challenges: [
    "listings-sync",
    "local-seo",
    "valuation-funnel",
    "media-heavy-content",
    "strict-csp",
    "mountain-market-positioning",
  ],

  learnings: [
    "local-seo-wins",
    "third-party-data-dependency",
    "lead-capture-paths",
    "content-ownership",
    "performance-with-media",
  ],

  futurePlans: [
    "client-handover",
    "no-code-migration",
  ],
};
