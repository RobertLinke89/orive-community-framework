// Facilitators shown via the legacy facilitator routes.
// Only REAL organisers/trainers from public partner listings (crawledOfferings) – the former demo/sample
// facilitators (emma-berg, marcus-hoffmann, … and the generated ones with random ratings/reviews) were removed
// on 2026-11-09 so that only real profiles appear on orive.co.

export interface Facilitator {
  id: string;
  username?: string;
  name: string;
  avatar: string;
  isVerified: boolean;
  rating: number;
  reviewCount: number;
  views: number;
  tags: string[];
  hourlyRate: string;
  location: string;
  bio?: string;
  professionalTitle?: string;
  source_platform?: string;
  source_url?: string;
  isClaimed?: boolean;
}

import { crawledFacilitators } from './crawledOfferings';

export const facilitators: Facilitator[] = [...crawledFacilitators];

// Helper to get a facilitator by ID or username
export const getFacilitatorById = (id: string): Facilitator | undefined => {
  return facilitators.find(f => f.id === id || f.username === id);
};

// Helper to get facilitators by location (country)
export const getFacilitatorsByCountry = (country: string): Facilitator[] => {
  return facilitators.filter(f => f.location.toLowerCase().includes(country.toLowerCase()));
};

export default facilitators;
