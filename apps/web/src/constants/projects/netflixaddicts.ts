import { Project, Tag } from "@/types/project";
import { BookOpen, Code, FileCode, Globe, Lock, Server, Users, Video } from "lucide-react";

export const netflixaddictsProject: Project = {
  id: "netflixaddicts",
  name: "NetflixAddicts",
  tags: [Tag.OPEN_SOURCE],
  iconUrl: "/static/images/projects/netflixaddicts/icon.png",
  showcaseUrl: "/static/images/projects/netflixaddicts/showcase.webp",
  thumbnailUrl: "/static/images/projects/netflixaddicts/thumbnail.webp",
  website: undefined,
  repository: "https://github.com/onRuntime/netflixaddicts-bot",
  startDate: "2019-04",
  status: "archived",

  features: [
    { key: "series-encyclopedia", icon: BookOpen },
    { key: "community-suggestions", icon: Users },
    { key: "private-voice-channels", icon: Lock },
    { key: "audio-playback", icon: Video },
    { key: "showcase-website", icon: Globe },
  ],

  technologies: [
    { key: "typescript", name: "TypeScript", icon: FileCode },
    { key: "discordjs", name: "discord.js", icon: Code },
    { key: "golang", name: "Go", icon: Server },
    { key: "bootstrap", name: "Bootstrap", icon: Globe },
  ],

  metrics: [
    { key: "commands", value: "11" },
    { key: "repositories", value: "6" },
    { key: "lifespan", value: "2" },
  ],

  team: [
    { ref: "jeremy-baudrin", role: "Lead Developer" },
    { ref: "lucas-bodin", role: "Designer" },
    { ref: "ralph", role: "Product Manager" },
  ],

  screenshots: [],

  challenges: [
    "discord-pagination",
    "community-sourced-catalog",
    "voice-channel-lifecycle",
    "scattered-codebases",
  ],

  learnings: [
    "ship-one-surface-first",
    "community-before-product",
    "rewrites-need-a-reason",
    "third-party-brand-limits",
  ],

  futurePlans: [
    "archived-repositories",
  ],
};
