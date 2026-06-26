"use client";

import { Link } from "@onruntime/translations/next";
import type React from "react";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, Menu } from "lucide-react";

import { useTranslation } from "@onruntime/translations/react";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import Routes from "@/constants/routes";
import Services from "@/constants/services";
import Projects from "@/constants/projects";
import { getMajorAgencies } from "@/constants/agencies";
import { OnRuntimeWordMark } from "@/logos/components";
import { cn } from "@/lib/utils";
import { ServiceCategoryData, SubService } from "@/types/service";

import Navigation from "./navigation";

// Mobile menu components for projects
const MobileProjectLink: React.FC<{
	project: { id: string; name: string };
	onClose: () => void;
}> = ({ project, onClose }) => {
	return (
		<Link
			href={Routes.project(project.id)}
			className="block text-sm font-medium"
			onClick={onClose}
		>
			{project.name}
		</Link>
	);
};

// Mobile menu components for services
const MobileSubServiceLink: React.FC<{
	categoryId: string;
	subService: SubService;
	onClose: () => void;
}> = ({ categoryId, subService, onClose }) => {
	const { t } = useTranslation(`constants/services/${categoryId}/${subService.id}`);

	return (
		<Link
			href={subService.route}
			className="block text-xs text-muted-foreground hover:text-foreground"
			onClick={onClose}
		>
			{t("name")}
		</Link>
	);
};

const MobileServiceCategory: React.FC<{
	service: ServiceCategoryData;
	onClose: () => void;
}> = ({ service, onClose }) => {
	const { t } = useTranslation(`constants/services/${service.id}`);

	return (
		<div className="space-y-2 pb-3">
			<Link
				href={Routes.service[service.id].root}
				className="block text-sm font-medium"
				onClick={onClose}
			>
				{t("name")}
			</Link>

			<div className="pl-3 space-y-2">
				{service.subServices.map((subService) => (
					<MobileSubServiceLink
						key={subService.id}
						categoryId={service.id}
						subService={subService}
						onClose={onClose}
					/>
				))}
			</div>
		</div>
	);
};

interface SubNavItem {
	title: string;
	path: string;
}

interface DropdownItem {
	title: string;
	path: string;
	items?: SubNavItem[];
}

enum NavItemType {
	Link = "link",
	Services = "services",
	Projects = "projects",
	Dropdown = "dropdown",
}

interface BaseNavItem {
	title: string;
	path: string;
}

type NavItem =
	| (BaseNavItem & { type: NavItemType.Link })
	| (BaseNavItem & { type: NavItemType.Services })
	| (BaseNavItem & { type: NavItemType.Projects })
	| (BaseNavItem & { type: NavItemType.Dropdown; dropdown: DropdownItem[] });

const Navbar: React.FC = () => {
	const { t } = useTranslation("layout/navbar");
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const [expandedSection, setExpandedSection] = useState<string | null>(null);

	const navRef = useRef<HTMLDivElement>(null);

	const [navWidth, setNavWidth] = useState<number | undefined>(undefined);

	const majorAgencies = getMajorAgencies(5);

	const navItems: NavItem[] = [
		{
			type: NavItemType.Services,
			title: t("links.services"),
			path: Routes.services,
		},
		{
			type: NavItemType.Projects,
			title: t("links.projects"),
			path: Routes.projects,
		},
		{
			type: NavItemType.Dropdown,
			title: t("links.agencies"),
			path: Routes.agency.root,
			dropdown: [
				{
					title: t("agencies.all"),
					path: Routes.agency.root,
				},
				...majorAgencies.map((agency) => ({
					title: t("agencies.agency", { name: agency.name }),
					path: Routes.agency.city(agency.id),
				})),
			],
		},
		{
			type: NavItemType.Link,
			title: t("links.npo"),
			path: Routes.npo,
		},
		{
			type: NavItemType.Link,
			title: t("links.docs"),
			path: Routes.docs,
		},
	];

	useEffect(() => {
		if (!navRef.current) return;

		const resizeObserver = new ResizeObserver((entries) => {
			for (const entry of entries) {
				const { width } = entry.contentRect;
				setNavWidth(width);
			}
		});

		resizeObserver.observe(navRef.current);

		return () => {
			resizeObserver.disconnect();
		};
	}, []);

	useEffect(() => {
		if (navWidth && navWidth >= 768 && mobileMenuOpen) {
			setMobileMenuOpen(false);
			setExpandedSection(null);
		}
	}, [navWidth, mobileMenuOpen]);

	const toggleMobileMenu = () => {
		setMobileMenuOpen(!mobileMenuOpen);
		setExpandedSection(null);
	};

	const toggleSection = (section: string) => {
		setExpandedSection(expandedSection === section ? null : section);
	};

	const closeMenu = () => {
		setMobileMenuOpen(false);
		setExpandedSection(null);
	};

	return (
		<nav
			className="px-4 z-50 fixed w-full max-w-5xl left-1/2 -translate-x-1/2 mt-4"
			ref={navRef}
		>
			<div
				className={
					"flex flex-col bg-background/50 rounded-lg shadow-2xs backdrop-blur-2xl transition-all duration-300"
				}
			>
				<div className="flex justify-between items-center p-2.5">
					<Link href={Routes.landing.visitor} onClick={closeMenu}>
						<OnRuntimeWordMark className="h-6" height={24} />
					</Link>

					<Navigation />

					<div className="flex gap-2">
						<ThemeToggle />

						<Link href={Routes.contact} aria-label={t("links.contact")} passHref>
							<Button className="hidden md:inline-flex" variant="outline">
								{t("links.contact")}
							</Button>
						</Link>

						<Button
							onClick={toggleMobileMenu}
							className="inline-flex md:hidden"
							variant="outline"
							aria-expanded={mobileMenuOpen}
							aria-label="Toggle menu"
						>
							<Menu className="h-5 w-5" />
							<span className="sr-only">Menu</span>
						</Button>
					</div>
				</div>

				{mobileMenuOpen && (
					<div className="px-3 flex flex-col space-y-4 md:hidden max-h-[calc(100vh-100px)] overflow-y-auto pb-4">
						{navItems.map((item) => (
							<div key={item.title} className="border-t border-border pt-3">
								{item.type === NavItemType.Services ? (
									<div className="space-y-3">
										<button
											onClick={() => toggleSection(item.title)}
											className="flex w-full justify-between items-center text-base font-medium"
											aria-expanded={expandedSection === item.title}
										>
											{item.title}
											<ChevronDown
												className={cn(
													"h-4 w-4 transition-transform",
													expandedSection === item.title ? "rotate-180" : "",
												)}
											/>
										</button>

										{expandedSection === item.title && (
											<div className="pl-4 space-y-4 pt-2 overflow-y-auto">
												{Services.map((service) => (
													<MobileServiceCategory
														key={service.id}
														service={service}
														onClose={closeMenu}
													/>
												))}
											</div>
										)}
									</div>
								) : item.type === NavItemType.Projects ? (
									<div className="space-y-3">
										<button
											onClick={() => toggleSection(item.title)}
											className="flex w-full justify-between items-center text-base font-medium"
											aria-expanded={expandedSection === item.title}
										>
											{item.title}
											<ChevronDown
												className={cn(
													"h-4 w-4 transition-transform",
													expandedSection === item.title ? "rotate-180" : "",
												)}
											/>
										</button>

										{expandedSection === item.title && (
											<div className="pl-4 space-y-4 pt-2 overflow-y-auto">
												{Projects.slice(0, 5).map((project) => (
													<MobileProjectLink
														key={project.id}
														project={project}
														onClose={closeMenu}
													/>
												))}
											</div>
										)}
									</div>
								) : item.type === NavItemType.Dropdown ? (
									<div className="space-y-3">
										<button
											onClick={() => toggleSection(item.title)}
											className="flex w-full justify-between items-center text-base font-medium"
											aria-expanded={expandedSection === item.title}
										>
											{item.title}
											<ChevronDown
												className={cn(
													"h-4 w-4 transition-transform",
													expandedSection === item.title ? "rotate-180" : "",
												)}
											/>
										</button>

										{expandedSection === item.title && (
											<div className="pl-4 space-y-4 pt-2 overflow-y-auto">
												{item.dropdown.map((dropdown) => (
													<div key={dropdown.title} className="space-y-2 pb-3">
														<Link
															href={dropdown.path}
															className="block text-sm font-medium"
															onClick={closeMenu}
														>
															{dropdown.title}
														</Link>

														{dropdown.items && (
															<div className="pl-3 space-y-2">
																{dropdown.items.map((subItem) => (
																	<Link
																		key={subItem.title}
																		href={subItem.path}
																		className="block text-xs text-muted-foreground hover:text-foreground"
																		onClick={closeMenu}
																	>
																		{subItem.title}
																	</Link>
																))}
															</div>
														)}
													</div>
												))}
											</div>
										)}
									</div>
								) : (
									<Link
										href={item.path}
										className="block text-base font-medium"
										onClick={closeMenu}
									>
										{item.title}
									</Link>
								)}
							</div>
						))}

						<Link
							href={Routes.contact}
							className="block pt-4 pb-2"
							onClick={closeMenu}
						>
							<Button className="w-full">{t("links.contact")}</Button>
						</Link>
					</div>
				)}
			</div>
		</nav>
	);
};

export default Navbar;
