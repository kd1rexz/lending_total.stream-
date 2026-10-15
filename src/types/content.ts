import type { ImageMetadata } from 'astro';

export type Contact = { kind: 'phone' | 'email' | 'messenger'; label: string; href: string };
export type NavItem = { label: string; href: string };
export type Service = {
  id: string;
  title: string;
  description: string;
  tag: string;
  order: number;
  published: boolean;
};
export type CaseStudy = {
  id: string;
  serviceIds: string[];
  title: string;
  eventType: string;
  cover: ImageMetadata;
  coverAlt: string;
  task: string;
  solution: string;
  result: string;
  order: number;
  published: boolean;
  client?: string;
  location?: string;
  date?: string;
  videoUrl?: string;
};
export type ServiceWithExamples = Service & { examples: CaseStudy[] };
export type EditorialItem = { title: string; description: string };
export type TeamProfile = {
  name: string;
  role: string;
  description: string;
  portrait: ImageMetadata;
};
export type FAQItem = { question: string; answer: string };
export type Review = { quote: string; author: string; company: string };
export type TrustItem = {
  name: string;
  logo: ImageMetadata;
  displayWidth: number;
  previewOnly: boolean;
};
export type SiteSettings = {
  name: string;
  description: string;
  contacts: Contact[];
  contentApproved: boolean;
  brandApproved: boolean;
};
export type PageContent = {
  site: SiteSettings;
  navigation: NavItem[];
  services: ServiceWithExamples[];
  cases: CaseStudy[];
  team: TeamProfile;
  reliability: EditorialItem[];
  faq: FAQItem[];
  reviews: Review[];
  clients: TrustItem[];
};
