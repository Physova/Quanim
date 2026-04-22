export interface NavLink {
  label: string;
  href: string;
  description?: string;
}

export const NAV_LINKS: NavLink[] = [
  { label: "Home", href: "/", description: "Back to the beginning" },
  { label: "Topics", href: "/topics", description: "Explore physics articles" },
];

export const SOCIAL_LINKS = {
  x: "https://x.com/physova",
};
