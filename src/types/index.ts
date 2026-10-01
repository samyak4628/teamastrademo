export type UserRole = 'restaurant' | 'ngo' | 'volunteer' | 'enterprise';

export interface StatItem {
  value: string;
  label: string;
  subtext?: string;
}

export interface HowItWorksStep {
  number: string;
  title: string;
  description: string;
  iconName: string;
  tag: string;
}

export interface UserGroup {
  id: UserRole;
  title: string;
  badge: string;
  tagline: string;
  description: string;
  features: string[];
  ctaText: string;
}

export interface NGOMarkerData {
  id: string;
  name: string;
  type: string;
  distance: string;
  capacity: string;
  coordinates: { x: number; y: number };
  status: 'available' | 'receiving' | 'urgent';
  verified: boolean;
}

export interface PricingPlan {
  id: string;
  name: string;
  badge?: string;
  priceMonthly: number;
  priceAnnual: number;
  description: string;
  features: string[];
  cta: string;
  popular?: boolean;
}
