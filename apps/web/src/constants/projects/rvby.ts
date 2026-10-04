import { Project } from "@/types/project";
import { Code, Gem, Globe, Palette, Server, Shirt, ShoppingBag, Sparkles } from "lucide-react";

export const rvbyProject: Project = {
  id: "rvby",
  name: "RVBY",
  tags: [],
  iconUrl: "/static/images/projects/rvby/icon.png",
  showcaseUrl: "/static/images/projects/rvby/showcase.webp",
  thumbnailUrl: "/static/images/projects/rvby/thumbnail.webp",
  website: undefined,
  repository: "https://github.com/onRuntime/rvby-unique-theme",
  startDate: "2020-05",
  status: "archived",

  features: [
    { key: "brand-identity", icon: Gem },
    { key: "capsule-collection", icon: Shirt },
    { key: "storefront", icon: ShoppingBag },
    { key: "custom-theme", icon: Palette },
    { key: "checkout-flow", icon: Sparkles },
  ],

  technologies: [
    { key: "sylius", name: "Sylius", icon: Server },
    { key: "symfony", name: "Symfony", icon: Code },
    { key: "prestashop", name: "PrestaShop", icon: ShoppingBag },
    { key: "twig", name: "Twig", icon: Code },
    { key: "docker", name: "Docker", icon: Globe },
  ],

  metrics: [
    { key: "templates", value: "207" },
    { key: "platforms", value: "2" },
    { key: "lifespan", value: "6" },
  ],

  team: [
    { ref: "antoine-kingue", role: "Lead Developer" },
    { ref: "lucas-bodin", role: "Designer" },
    { ref: "romain", role: "Designer" },
  ],

  screenshots: [
    { key: "homepage", url: "/static/images/projects/rvby/screenshots/homepage.webp" },
    { key: "collection-artwork", url: "/static/images/projects/rvby/screenshots/collection-artwork.webp" },
    { key: "products", url: "/static/images/projects/rvby/screenshots/products.webp" },
  ],

  challenges: [
    "platform-switch",
    "luxury-positioning",
    "theme-depth",
    "no-inventory",
  ],

  learnings: [
    "pick-the-stack-once",
    "brand-before-storefront",
    "ecommerce-theming-cost",
    "side-project-momentum",
  ],

  futurePlans: [
    "archived-repositories",
  ],
};
