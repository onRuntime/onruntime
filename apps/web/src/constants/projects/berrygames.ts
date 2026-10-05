import { Project, Tag } from "@/types/project";
import { Boxes, Code, Coins, Gamepad2, Globe, Network, Server, Swords, Users } from "lucide-react";

export const berrygamesProject: Project = {
  id: "berrygames",
  name: "BerryGames",
  tags: [Tag.OPEN_SOURCE],
  iconUrl: "/static/images/projects/berrygames/icon.png",
  thumbnailUrl: "/static/images/projects/berrygames/thumbnail.webp",
  website: undefined,
  repository: "https://github.com/onRuntime/berrygames-cloudberry",
  startDate: "2018-09",
  status: "archived",

  features: [
    { key: "minigames", icon: Swords },
    { key: "network-architecture", icon: Network },
    { key: "progression", icon: Coins },
    { key: "ingame-tooling", icon: Gamepad2 },
    { key: "community-site", icon: Globe },
    { key: "friends-system", icon: Users },
  ],

  technologies: [
    { key: "java", name: "Java", icon: Code },
    { key: "spigot", name: "Spigot", icon: Boxes },
    { key: "bungeecord", name: "BungeeCord", icon: Network },
    { key: "symfony", name: "Symfony", icon: Server },
    { key: "xenforo", name: "XenForo", icon: Users },
    { key: "react", name: "React", icon: Code },
  ],

  metrics: [
    { key: "slots", value: "500" },
    { key: "minigames", value: "7" },
    { key: "repositories", value: "9" },
  ],

  team: [
    { ref: "antoine-kingue", role: "Web Developer" },
    { ref: "jeremy-baudrin", role: "Backend Developer" },
    { ref: "arthur-danjou", role: "Gameplay Developer" },
    { ref: "lucas-bodin", role: "Designer" },
  ],

  screenshots: [
    { key: "hub", url: "/static/images/projects/berrygames/screenshots/hub.webp" },
    { key: "skywars", url: "/static/images/projects/berrygames/screenshots/skywars.webp" },
    { key: "bedwars", url: "/static/images/projects/berrygames/screenshots/bedwars.webp" },
    { key: "groundfall", url: "/static/images/projects/berrygames/screenshots/groundfall.webp" },
    { key: "ingame-menus", url: "/static/images/projects/berrygames/screenshots/ingame-menus.webp" },
    { key: "website", url: "/static/images/projects/berrygames/screenshots/website.webp" },
  ],

  challenges: [
    "multi-server-architecture",
    "shared-player-state",
    "game-loop-per-minigame",
    "moderation-at-scale",
    "forum-integration",
  ],

  learnings: [
    "infrastructure-before-content",
    "community-is-the-product",
    "git-hides-the-team",
    "minecraft-as-a-school",
  ],

  futurePlans: [
    "archived-repositories",
  ],
};
