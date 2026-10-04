import type { Project } from "@/types/project";
import { tonightpassProject } from "./tonightpass";
import { kitchnProject } from "./kitchn";
import { kartrakProject } from "./kartrak";
import { darkThemeForInstagram } from "./dark-theme-instagram";
import { shadowbonusProject } from "./shadowbonus";
import { expatFacilitiesProject } from "./expatfacilities";
import { immobilierBrianconProject } from "./immobilier-briancon";

const Projects: Project[] = [
	tonightpassProject,
	kitchnProject,
	kartrakProject,
	darkThemeForInstagram,
	shadowbonusProject,
	expatFacilitiesProject,
	immobilierBrianconProject
];

export default Projects;
